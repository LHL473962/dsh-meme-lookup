import { transcriptImages } from './images.js';
import { arr, num, rec, str } from './narrow.js';
import { COMMAND_TAG, createClaudeTranslator, INTERRUPT_ECHO, LOCAL_COMMAND_TAG, userText } from './translate.js';
/** The tool names the CLI uses for a subagent launch (current, legacy). */
const AGENT_TOOLS = new Set(['Agent', 'Task']);
const BASH_OUTPUT_TAG = /^<bash-(stdout|stderr)>/u;
const BASH_INPUT = /^<bash-input>([\s\S]*?)<\/bash-input>/u;
const TASK_NOTIFICATION = /^<task-notification>/u;
/** A background subagent's launch acknowledgement (not its end). */
const ASYNC_LAUNCH = /^Async agent launched/u;
/** Nested subagent transcripts followed at most this deep (a corrupted
 *  store cannot recurse without bound). */
const MAX_NESTING = 8;
/** `/name args` of a recorded slash-command echo. */
function commandLine(text) {
    const name = /<command-name>([\s\S]*?)<\/command-name>/u.exec(text)?.[1]?.trim();
    if (name === undefined || name === '')
        return undefined;
    const args = /<command-args>([\s\S]*?)<\/command-args>/u.exec(text)?.[1]?.trim() ?? '';
    const slash = name.startsWith('/') ? name : `/${name}`;
    return args === '' ? slash : `${slash} ${args}`;
}
function classifyUser(message) {
    const content = rec(message.message)?.content;
    if (arr(content).some(block => rec(block)?.type === 'tool_result'))
        return { kind: 'results' };
    const raw = userText(content) ?? '';
    const text = raw.trim();
    if (message.isCompactSummary === true)
        return { kind: 'summary', text };
    if (message.is_meta === true || message.isMeta === true)
        return { kind: 'hidden', why: 'meta' };
    // An image-only prompt is a prompt (its row shows the images).
    if (text === '' && arr(content).some(block => rec(block)?.type === 'image'))
        return { kind: 'prompt', text: '', queued: message.isQueuedCommand === true };
    if (text === '')
        return { kind: 'hidden', why: 'empty' };
    if (text.startsWith(INTERRUPT_ECHO))
        return { kind: 'interrupt' };
    const origin = str(rec(message.origin)?.kind);
    if ((origin !== undefined && origin !== 'human') || TASK_NOTIFICATION.test(text))
        return { kind: 'notification' };
    if (LOCAL_COMMAND_TAG.test(text))
        return { kind: 'hidden', why: 'local output' };
    // Command output sent on to the model: its own turn (the translator shows
    // it as its output row, never a bubble).
    if (BASH_OUTPUT_TAG.test(text))
        return { kind: 'prompt', text: raw, queued: false };
    if (COMMAND_TAG.test(text)) {
        const line = commandLine(text);
        // `/compact` never shows its own row (live hides it too); its summary
        // is the compaction's row.
        if (line === undefined || line === '/compact' || line.startsWith('/compact '))
            return { kind: 'hidden', why: 'command echo' };
        return { kind: 'prompt', text: line, queued: message.isQueuedCommand === true };
    }
    const bash = BASH_INPUT.exec(text);
    if (bash !== null)
        return { kind: 'prompt', text: `!${bash[1].trim()}`, queued: false };
    return { kind: 'prompt', text: raw, queued: message.isQueuedCommand === true };
}
/** The report inside a foreground subagent's hand-back result (the frame
 *  stripped, the indentation removed). */
function handBackReport(text) {
    const marker = text.indexOf('The report follows:');
    let body = marker === -1 ? text : text.slice(marker + 'The report follows:'.length);
    body = body.replace(/\n?agentId: [\s\S]*$/u, '').replace(/<usage>[\s\S]*?<\/usage>/gu, '');
    return body.split('\n').map(line => line.replace(/^ {2}/u, '')).join('\n').trim();
}
/** `<usage>subagent_tokens: N …</usage>` of a hand-back result. */
function handBackUsage(text) {
    const usage = /<usage>([\s\S]*?)<\/usage>/u.exec(text)?.[1];
    if (usage === undefined)
        return undefined;
    const field = (name) => {
        const value = Number(new RegExp(`${name}:\\s*(\\d+)`, 'u').exec(usage)?.[1]);
        return Number.isFinite(value) ? value : undefined;
    };
    const total = field('subagent_tokens') ?? field('total_tokens');
    const toolUses = field('tool_uses');
    const durationMs = field('duration_ms');
    return total === undefined && toolUses === undefined ? undefined : { ...(total === undefined ? {} : { total }), ...(toolUses === undefined ? {} : { toolUses }), ...(durationMs === undefined ? {} : { durationMs }) };
}
/** What a foreground subagent's recorded result says about its end. */
function resultOutcome(block) {
    const text = userText(block.content) ?? (typeof block.content === 'string' ? block.content : '');
    if (block.is_error === true)
        return { status: 'failed', ...(text === '' ? {} : { summary: text }) };
    if (text.startsWith(INTERRUPT_ECHO))
        return { status: 'cancelled' };
    const usage = handBackUsage(text);
    const summary = handBackReport(text);
    return { status: 'completed', ...(summary === '' ? {} : { summary }), ...(usage === undefined ? {} : { usage }) };
}
/** A `<task-notification>` prompt's fields. */
function notificationOf(text) {
    const tag = (name) => new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'u').exec(text)?.[1]?.trim();
    const taskId = tag('task-id');
    const callId = tag('tool-use-id');
    const status = tag('status');
    const summary = tag('summary') ?? tag('result');
    return { ...(taskId === undefined ? {} : { taskId }), ...(callId === undefined ? {} : { callId }), ...(status === undefined ? {} : { status }), ...(summary === undefined ? {} : { summary }) };
}
/** Replay one transcript chain. */
export function replayClaudeTranscript(messages, options) {
    const debug = options.debug ?? (() => undefined);
    let clock = 0;
    const translator = createClaudeTranslator({ cwd: options.cwd, userRows: 'lifecycle', now: () => clock, debug });
    const out = [];
    /** The open turn saw `[Request interrupted …]`: it closes as aborted. */
    let interrupted = false;
    let model;
    /** API message ids whose thinking count was already replayed. */
    const counted = new Set();
    /** Subagents launched by a call whose end has not been replayed yet. */
    const launched = new Map();
    /** Subagent transcripts already attached to a delegation (a healed child
     *  must not attach twice; the same transcript is reachable under both its
     *  delegating call id and its own agent id). */
    const claimed = new Set();
    /** Every transcript once, by its own agent id (the map also keys them by
     *  their delegating call). */
    const uniqueTranscripts = [];
    for (const transcript of options.subagents?.values() ?? []) {
        if (uniqueTranscripts.some(seen => seen.agentId === transcript.agentId))
            continue;
        uniqueTranscripts.push(transcript);
    }
    /** Recorded hand-back results name the child they return (`agentId: <id>` —
     *  the same line handBackReport strips): an exact, falsifiable attribution
     *  channel for a child whose own metadata never recorded the call id. */
    const childOfResult = new Map();
    const indexHandBackIds = (source) => {
        for (const raw of source) {
            const message = rec(raw);
            if (message === undefined || message.type !== 'user')
                continue;
            for (const block of arr(rec(message.message)?.content).map(rec)) {
                if (block?.type !== 'tool_result')
                    continue;
                const callId = str(block.tool_use_id);
                if (callId === undefined)
                    continue;
                const text = userText(block.content) ?? (typeof block.content === 'string' ? block.content : '');
                const child = /(?:^|\n)agentId: ([^\s\n]+)/u.exec(text)?.[1];
                if (child !== undefined)
                    childOfResult.set(callId, child);
            }
        }
    };
    indexHandBackIds(messages);
    for (const transcript of uniqueTranscripts)
        indexHandBackIds(transcript.messages);
    /** The unclaimed transcript of an exact child id, if the store kept it. */
    const unclaimedByAgentId = (agentId) => {
        if (claimed.has(agentId))
            return undefined;
        return uniqueTranscripts.find(seen => seen.agentId === agentId);
    };
    const unclaimedCandidatesOf = (delegatorId) => uniqueTranscripts.filter(seen => !claimed.has(seen.agentId) && (delegatorId === undefined ? seen.parentAgentId == null : seen.parentAgentId === delegatorId));
    const promptOfTranscript = (transcript) => {
        const firstUser = transcript.messages.map(rec).find(message => message?.type === 'user');
        return userText(rec(firstUser?.message)?.content);
    };
    const childForPrompt = (delegatorId, prompt) => {
        if (prompt === undefined)
            return undefined;
        const matches = unclaimedCandidatesOf(delegatorId).filter(transcript => promptOfTranscript(transcript) === prompt);
        return matches.length === 1 ? matches[0] : undefined;
    };
    const closeTurn = () => {
        if (!translator.turnOpen) {
            interrupted = false;
            return;
        }
        out.push(...translator.forceCloseTurn(interrupted ? { kind: 'aborted' } : { kind: 'completed' }));
        interrupted = false;
    };
    const endSubagent = (callId, outcome) => {
        const agent = launched.get(callId);
        if (agent === undefined)
            return;
        launched.delete(callId);
        out.push({
            type: 'subagent.end',
            agentId: agent.agentId,
            status: outcome.status,
            ...(outcome.summary === undefined ? {} : { summary: outcome.summary }),
            ...(outcome.usage === undefined ? {} : { usage: outcome.usage }),
            time: clock,
        });
    };
    const assistant = (message) => {
        const body = rec(message.message);
        const id = str(body?.id);
        const messageModel = str(body?.model);
        if (messageModel !== undefined && messageModel !== '' && messageModel !== '<synthetic>')
            model = messageModel;
        out.push(...translator.translate({ type: 'assistant', message: body, uuid: message.uuid, parent_tool_use_id: null }));
        const blocks = arr(body?.content).map(rec);
        // The count row the live `thinking_tokens` estimate produces, from the
        // API's own count (once per API message: every block entry repeats it).
        if (id !== undefined && !counted.has(id) && blocks.some(block => block?.type === 'thinking' && (str(block.thinking) ?? '') === '')) {
            counted.add(id);
            const thinking = num(rec(rec(body?.usage)?.output_tokens_details)?.thinking_tokens);
            if (thinking !== undefined && thinking > 0)
                out.push(...translator.translate({ type: 'system', subtype: 'thinking_tokens', estimated_tokens: thinking }));
        }
        delegations(blocks, 0, undefined);
    };
    /**
     * The `Agent` calls among some assistant blocks (of the main chain, or of
     * a subagent's own transcript — a nested delegation): each one launched a
     * subagent (the translator pre-created it from the call); when the
     * session kept that subagent's transcript, its own id completes it and its
     * messages follow as its lane. `delegatorId` is the agent whose transcript
     * the calls sit in (undefined = the main chain) — a transcript whose call
     * attribution is missing requires a matching child prompt.
     */
    const delegations = (blocks, depth, delegatorId) => {
        for (const block of blocks) {
            if (block?.type !== 'tool_use')
                continue;
            const callId = str(block.id);
            const name = str(block.name);
            if (callId === undefined || name === undefined || !AGENT_TOOLS.has(name) || launched.has(callId))
                continue;
            const input = rec(block.input);
            const background = input?.run_in_background === true;
            const byCall = depth < MAX_NESTING ? options.subagents?.get(callId) : undefined;
            let transcript = byCall !== undefined && !claimed.has(byCall.agentId) ? byCall : undefined;
            let via = transcript !== undefined ? 'call id' : undefined;
            if (transcript === undefined && depth < MAX_NESTING) {
                // The recorded hand-back names the child.
                const named = childOfResult.get(callId);
                transcript = named === undefined ? undefined : unclaimedByAgentId(named);
                if (transcript !== undefined)
                    via = 'hand-back agent id';
                else {
                    // The prompt must match the transcript and identify one child.
                    transcript = childForPrompt(delegatorId, str(input?.prompt));
                    if (transcript !== undefined)
                        via = 'unique prompt match';
                }
            }
            if (via !== undefined && transcript !== byCall)
                debug(`claude replay: subagent transcript attached by ${via}`);
            launched.set(callId, { agentId: transcript?.agentId ?? callId, background });
            if (transcript === undefined)
                continue;
            claimed.add(transcript.agentId);
            // The recorded parent_agent_id wins; else the transcript the
            // delegating call sits in (undefined = the main chain). depth is
            // always emitted: a main-chain delegation is a depth-1 spawn, and the
            // roster treats depth 1 as a main-loop child (parents are never
            // inferred from a deeper depth).
            const parentAgentId = transcript.parentAgentId ?? delegatorId;
            out.push({
                type: 'subagent.start',
                agentId: transcript.agentId,
                parentCallId: callId,
                description: str(input?.description) ?? '',
                ...(str(input?.subagent_type) === undefined ? {} : { kind: str(input?.subagent_type) }),
                background,
                depth: depth + 1,
                ...(parentAgentId === undefined ? {} : { parentAgentId }),
                time: clock,
            });
            lane(callId, transcript, depth + 1);
        }
    };
    /** A subagent's own messages, as the live lane delivered them; the
     *  subagents IT delegated to end from its own results. */
    const lane = (callId, transcript, depth) => {
        for (const raw of transcript.messages) {
            const message = rec(raw);
            if (message === undefined || (message.type !== 'assistant' && message.type !== 'user'))
                continue;
            const time = Date.parse(str(message.timestamp) ?? '');
            if (Number.isFinite(time))
                clock = time;
            out.push(...translator.translate({ ...message, parent_tool_use_id: callId }));
            const content = arr(rec(message.message)?.content).map(rec);
            if (message.type === 'assistant') {
                delegations(content, depth, transcript.agentId);
                continue;
            }
            const structured = rec(message.tool_use_result ?? message.toolUseResult);
            for (const block of content)
                endFromResult(block, structured);
        }
    };
    /** A recorded tool result that ends the subagent its call launched (a
     *  background one's result only acknowledges the launch). */
    const endFromResult = (block, structured) => {
        if (block?.type !== 'tool_result')
            return;
        const callId = str(block.tool_use_id);
        const agent = callId === undefined ? undefined : launched.get(callId);
        if (callId === undefined || agent === undefined)
            return;
        const text = userText(block.content) ?? (typeof block.content === 'string' ? block.content : '');
        if (agent.background || ASYNC_LAUNCH.test(text) || structured?.status === 'async_launched' || structured?.isAsync === true) {
            agent.background = true;
            return;
        }
        endSubagent(callId, resultOutcome(block));
    };
    const user = (message) => {
        const uuid = str(message.uuid) ?? `replay-${translator.seqNumber + 1}`;
        const kind = classifyUser(message);
        switch (kind.kind) {
            case 'results': {
                // The raw transcript file keeps the structured result the read API
                // drops (richer cards when "load earlier" replays it).
                const structured = message.tool_use_result ?? message.toolUseResult;
                out.push(...translator.translate({ type: 'user', uuid, message: message.message, parent_tool_use_id: null, ...(structured === undefined ? {} : { tool_use_result: structured }) }));
                // A background subagent's result only acknowledges the launch; its
                // end is the notification naming it.
                for (const raw of arr(rec(message.message)?.content))
                    endFromResult(rec(raw), rec(structured));
                return;
            }
            case 'summary':
                closeTurn();
                out.push(...translator.translate({ type: 'system', subtype: 'compact_boundary', compact_metadata: {} }));
                out.push(...translator.translate({ type: 'user', uuid, isSynthetic: true, message: { role: 'user', content: kind.text }, parent_tool_use_id: null }));
                return;
            case 'prompt':
                // A prompt folded into a running turn joins it; any other prompt
                // starts the next turn.
                if (!kind.queued)
                    closeTurn();
                // Images sent with it: lazy facades over the base64 the transcript
                // holds (nothing decoded until shown).
                translator.registerInput(uuid, kind.text, 'turn', transcriptImages(rec(message.message)?.content, uuid));
                out.push(...translator.translate({ type: 'command_lifecycle', command_uuid: uuid, state: 'started' }));
                return;
            case 'interrupt':
                interrupted = true;
                return;
            case 'notification': {
                // The notification a background subagent's end was reported with.
                const notice = notificationOf(userText(rec(message.message)?.content) ?? '');
                const callId = notice.callId !== undefined && launched.has(notice.callId)
                    ? notice.callId
                    : [...launched].find(([, agent]) => agent.agentId === notice.taskId)?.[0];
                if (callId !== undefined) {
                    const status = notice.status === 'completed' ? 'completed' : notice.status === 'failed' ? 'failed' : notice.status === 'stopped' || notice.status === 'killed' ? 'cancelled' : 'unknown';
                    endSubagent(callId, { status, ...(notice.summary === undefined ? {} : { summary: notice.summary }) });
                }
                closeTurn();
                out.push(...translator.openNotificationTurn());
                return;
            }
            case 'hidden':
                debug(`claude replay: ${kind.why} user message not projected`);
                return;
            default: {
                const unknown = kind;
                return unknown;
            }
        }
    };
    // A chain that begins at a compaction (the boundary entry, then the
    // summary) has older history on disk.
    const first = rec(messages[0]);
    const second = rec(messages[1]);
    const compactedFrom = first?.isCompactSummary === true
        ? str(first.uuid)
        : first?.type === 'system' && second?.isCompactSummary === true ? str(first.uuid) : undefined;
    for (const raw of messages) {
        const message = rec(raw);
        if (message === undefined)
            continue;
        const time = Date.parse(str(message.timestamp) ?? '');
        if (Number.isFinite(time))
            clock = time;
        // Subagent traffic never interleaves with the main transcript.
        if ((message.parent_tool_use_id !== undefined && message.parent_tool_use_id !== null) || message.isSidechain === true)
            continue;
        switch (message.type) {
            case 'assistant':
                assistant(message);
                break;
            case 'user':
                user(message);
                break;
            default:
                // System entries reach the read API without their subtype; the one
                // that matters (a compact boundary) is replayed from the summary
                // that follows it.
                break;
        }
    }
    closeTurn();
    // No recorded end (a nested delegation included): the CLI that ran it is
    // gone, its state is unknown.
    for (const callId of [...launched.keys()])
        endSubagent(callId, { status: 'unknown' });
    if (options.title !== undefined && options.title !== '')
        out.push({ type: 'session.title', title: options.title, source: 'auto' });
    if (model !== undefined)
        out.push({ type: 'model.changed', model, source: 'resume' });
    const tasks = translator.taskSeeds();
    return {
        events: out,
        start: { turn: translator.turnNumber, seq: translator.seqNumber, ...(model === undefined ? {} : { model }) },
        ...(tasks.length === 0 ? {} : { tasks }),
        ...(compactedFrom === undefined ? {} : { compactedFrom }),
    };
}
export function replayClaudeSubagentLane(agentId, messages, options) {
    const debug = options.debug ?? (() => undefined);
    let clock = 0;
    let seq = 0;
    const translator = createClaudeTranslator({ cwd: options.cwd, userRows: 'lifecycle', now: () => clock, debug });
    const events = [];
    const uuids = [];
    let parentAgentId = null;
    const nextSeq = () => { seq += 1; return seq; };
    for (const raw of messages) {
        const message = rec(raw);
        if (message === undefined || (message.type !== 'assistant' && message.type !== 'user'))
            continue;
        const uuid = str(message.uuid);
        if (uuid !== undefined)
            uuids.push(uuid);
        if (typeof message.parent_agent_id === 'string')
            parentAgentId = message.parent_agent_id;
        const time = Date.parse(str(message.timestamp) ?? '');
        if (Number.isFinite(time))
            clock = time;
        if (message.type === 'assistant') {
            const body = rec(message.message);
            const blocks = arr(body?.content).map(rec);
            // Count/signature-only thinking (the API returns signatures, not
            // bodies, unless summaries are enabled) becomes a marker block the
            // transcript view renders as an honest "body unavailable" row.
            if (blocks.some(block => block?.type === 'thinking' && (str(block?.thinking) ?? '') === '')) {
                const tokens = num(rec(rec(body?.usage)?.output_tokens_details)?.thinking_tokens);
                events.push({
                    type: 'assistant.message',
                    seq: nextSeq(),
                    anchor: str(body?.id) ?? uuid ?? `lane-${seq}`,
                    attemptId: str(body?.id) ?? uuid ?? `lane-${seq}`,
                    time: clock,
                    blocks: [tokens !== undefined && tokens > 0 ? { type: 'reasoning-tokens', text: String(tokens) } : { type: 'reasoning-signature', text: '' }],
                    canonical: false,
                    parentCallId: agentId,
                });
            }
        }
        events.push(...translator.translate({ ...message, parent_tool_use_id: agentId }));
    }
    return { events, parentAgentId, uuids };
}
/**
 * The uuid of the chain entry right before `anchor` — where a conversation
 * rewind cuts (`forkSession({upToMessageId})` keeps it, inclusive). Undefined
 * when `anchor` is not in the chain or is its first entry (nothing precedes
 * it: there is no conversation to rewind to).
 */
export function rewindCutPoint(messages, anchor) {
    const index = messages.findIndex(message => rec(message)?.uuid === anchor);
    if (index <= 0)
        return undefined;
    return str(rec(messages[index - 1])?.uuid);
}
/** The trailing exchanges of a chain, for the browser's preview (newest last). */
export function previewEntries(messages, limit) {
    const entries = [];
    /** The API message the last assistant entry came from (one entry per
     *  block on disk: their text joins into one exchange). */
    let lastAssistantId;
    for (const raw of messages) {
        const message = rec(raw);
        if (message === undefined || (message.parent_tool_use_id !== undefined && message.parent_tool_use_id !== null))
            continue;
        const at = Date.parse(str(message.timestamp) ?? '');
        const time = Number.isFinite(at) ? at : undefined;
        if (message.type === 'user') {
            const kind = classifyUser(message);
            if (kind.kind !== 'prompt')
                continue;
            entries.push({ role: 'user', text: kind.text.trim(), at: time });
            lastAssistantId = undefined;
            continue;
        }
        if (message.type !== 'assistant')
            continue;
        const body = rec(message.message);
        const text = arr(body?.content).flatMap(block => rec(block)?.type === 'text' ? [str(rec(block)?.text) ?? ''] : []).join('').trim();
        if (text === '')
            continue;
        const id = str(body?.id);
        const last = entries.at(-1);
        if (last !== undefined && last.role === 'assistant' && id !== undefined && id === lastAssistantId)
            last.text = `${last.text}\n${text}`;
        else
            entries.push({ role: 'assistant', text, at: time });
        lastAssistantId = id;
    }
    return entries.slice(-limit);
}
