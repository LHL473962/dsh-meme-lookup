import { codexText } from '../text.js';
import { arr, rec, str } from '../narrow.js';
import { failureHint } from './notices.js';
import { TOOL_ITEM_TYPES, toolCallOf, toolResultOf } from './presentation.js';
import { addUsage } from './usage.js';
import { displayQuestionReply, parseQuestionReply } from './question-reply.js';
import { itemImages, transcriptImages, dataUrlImageFacade } from '../session/images.js';
/** Anchors remembered (one per user message; the oldest go first). */
const MAX_ANCHORS = 4000;
/** A `!!cmd` output the channel sends on to the model. */
const BASH_OUTPUT = /^<bash-stdout>\n?([\s\S]*?)\n?<\/bash-stdout>$/u;
export function createItemContext(options) {
    let seq = options.start?.seq ?? 0;
    const clock = options.now ?? Date.now;
    return {
        cwd: options.cwd,
        debug: options.debug ?? (() => undefined),
        now: () => clock(),
        nextSeq: () => ++seq,
        get seq() { return seq; },
        model: options.model ?? '',
        turn: options.start?.turn ?? 0,
        turnOpen: false,
        turnId: '',
        step: 0,
        stepOpen: false,
        attempt: undefined,
        openTools: new Map(),
        anchorTurns: new Map(),
        compactRequested: false,
        compactionSeen: false,
        turnUsage: undefined,
        words: { declined: codexText('codex-declined'), failed: codexText('codex-tool-failed') },
    };
}
/** Open a turn (no-op when one is open). */
export function openTurn(ctx, out, origin, time, userMessageId) {
    if (ctx.turnOpen)
        return;
    ctx.turnOpen = true;
    ctx.turn += 1;
    ctx.step = 0;
    ctx.stepOpen = false;
    ctx.turnUsage = undefined;
    ctx.compactionSeen = false;
    out.push({ type: 'turn.start', turn: ctx.turn, origin, time, ...(userMessageId === undefined ? {} : { userMessageId }) });
}
export function closeStep(ctx, out) {
    if (!ctx.stepOpen)
        return;
    ctx.stepOpen = false;
    out.push({ type: 'step.end', turn: ctx.turn, step: ctx.step });
}
/** A step for a tool that no reply opened (a turn's first item is a tool). */
export function ensureStep(ctx, out) {
    if (ctx.stepOpen)
        return;
    ctx.step += 1;
    ctx.stepOpen = true;
    out.push({ type: 'step.start', turn: ctx.turn, step: ctx.step });
}
/** The open attempt, or a new one in a new step. */
export function ensureAttempt(ctx, out, firstTokenTime) {
    if (ctx.attempt !== undefined)
        return ctx.attempt;
    closeStep(ctx, out);
    ctx.step += 1;
    ctx.stepOpen = true;
    out.push({ type: 'step.start', turn: ctx.turn, step: ctx.step });
    const id = `${ctx.turnId === '' ? `turn-${ctx.turn}` : ctx.turnId}#${ctx.step}`;
    out.push({ type: 'assistant.attempt.start', attemptId: id, turn: ctx.turn, step: ctx.step, ...(ctx.model === '' ? {} : { model: ctx.model }), ...(firstTokenTime === undefined ? {} : { firstTokenTime }) });
    ctx.attempt = { id, step: ctx.step, reasoning: '', text: '', streamedReasoning: '', streamedText: '', rawReasoning: new Set(), summarized: new Set() };
    return ctx.attempt;
}
/** Settle the open attempt as one canonical assistant message. */
export function settleAttempt(ctx, out, time, interrupted = false) {
    const open = ctx.attempt;
    if (open === undefined)
        return;
    ctx.attempt = undefined;
    // A completed item's text is the record; a reply cut short keeps what
    // streamed (an interrupted item never completes, F11).
    const reasoning = open.reasoning !== '' ? open.reasoning : open.streamedReasoning;
    const replyText = open.text !== '' ? open.text : open.streamedText;
    const blocks = [];
    if (reasoning !== '')
        blocks.push({ type: 'reasoning', text: reasoning });
    if (replyText !== '')
        blocks.push({ type: 'text', text: replyText });
    out.push({
        type: 'assistant.message',
        seq: ctx.nextSeq(),
        anchor: open.id,
        turn: ctx.turn,
        step: open.step,
        attemptId: open.id,
        time,
        ...(ctx.model === '' ? {} : { model: ctx.model }),
        blocks,
        ...(interrupted ? { interrupted: true } : {}),
        canonical: true,
    });
    out.push({ type: 'assistant.attempt.end', attemptId: open.id, outcome: 'committed' });
}
/**
 * Close the open turn: settle the reply, end the still-open tools as
 * interrupted, close the step, `turn.end`, then the failure's hint. A turn
 * that produced no item opens first (a turn that failed at once).
 */
export function closeTurn(ctx, out, reason, time) {
    if (!ctx.turnOpen)
        openTurn(ctx, out, 'system', time);
    const interrupted = reason.kind === 'interrupted' || reason.kind === 'aborted';
    settleAttempt(ctx, out, time, interrupted);
    for (const [callId] of ctx.openTools) {
        out.push({ type: 'tool.result', seq: ctx.nextSeq(), turn: ctx.turn, step: ctx.step, callId, isError: true, time, content: [], text: '', errorText: interrupted ? codexText('codex-interrupted') : codexText('codex-tool-unfinished') });
    }
    ctx.openTools.clear();
    closeStep(ctx, out);
    ctx.turnOpen = false;
    out.push({ type: 'turn.end', turn: ctx.turn, reason, time, ...(ctx.turnUsage === undefined ? {} : { usage: ctx.turnUsage }) });
    ctx.turnUsage = undefined;
    ctx.compactRequested = false;
    const hint = failureHint(reason);
    if (hint !== undefined)
        out.push(hint);
}
/** Meter one model call without manufacturing or changing a message.
 *
 * `attribution` names the turn the WIRE notification carried: a straggler
 * usage for an already-closed turn (arriving after a newer turn opened) is
 * booked under ITS turn and never folded into the live turn's ledger. */
export function reportUsage(ctx, out, usage, time, attribution) {
    // The usage event is always emitted: metering arriving after the turn
    // closed still books the session totals and refreshes the context reading.
    // The turn ledger `turn.end` embeds is topped up only while the turn is
    // open — a late report must not leak into the next turn's end usage.
    // The one exception is a stream that has opened no turn yet: the usage
    // notification then is the context snapshot a resume announces (its
    // occupancy already travels as context.capacity / context.usage), not a
    // model call of this stream, and a usage event must cite a turn that this
    // stream really opened.
    if (ctx.turn === 0)
        return;
    const turn = attribution?.turn ?? ctx.turn;
    const stale = attribution?.stale === true || turn !== ctx.turn;
    if (!stale && ctx.turnOpen)
        ctx.turnUsage = addUsage(ctx.turnUsage, usage);
    out.push({ type: 'usage', seq: ctx.nextSeq(), turn, step: stale ? 1 : Math.max(1, ctx.step), usage, time, ...(ctx.model === '' ? {} : { model: ctx.model }) });
}
/** The user-facing text and the model-facing blocks of a user message. */
function userContent(content) {
    const blocks = [];
    const texts = [];
    const references = [];
    for (const raw of arr(content)) {
        const input = rec(raw);
        const type = str(input?.type);
        if (input === undefined || type === undefined)
            continue;
        switch (type) {
            case 'text': {
                const value = str(input.text) ?? '';
                const replies = parseQuestionReply(value);
                texts.push(replies === undefined ? value : displayQuestionReply(replies));
                blocks.push({ type: 'text', text: value });
                break;
            }
            case 'mention':
                references.push(`@${str(input.path) ?? str(input.name) ?? ''}`);
                blocks.push({ type: 'mention' });
                break;
            case 'skill':
                references.push(`$${str(input.name) ?? ''}`);
                blocks.push({ type: 'skill' });
                break;
            default:
                blocks.push({ type });
                break;
        }
    }
    // The first text input is what the user typed; later ones are what the
    // channel attached (expanded mentions, selections).
    return { text: texts[0] ?? references.join(' '), blocks };
}
/** The origin a turn's first item gives it. */
function originOf(item) {
    const type = str(item.type);
    if (type === 'userMessage')
        return 'user';
    if (type === 'commandExecution' && str(item.source) === 'userShell')
        return 'user';
    return 'system';
}
/** Forget the oldest anchors beyond the bound. */
function rememberAnchor(ctx, anchor) {
    ctx.anchorTurns.set(anchor, ctx.turnId);
    if (ctx.anchorTurns.size > MAX_ANCHORS)
        ctx.anchorTurns.delete(ctx.anchorTurns.keys().next().value);
}
/** One item's events for one phase (see the module comment). */
export function itemEvents(item, phase, ctx, time) {
    const out = [];
    const type = str(item.type);
    const id = str(item.id) ?? '';
    if (type === undefined)
        return out;
    if (!ctx.turnOpen) {
        const clientId = type === 'userMessage' ? str(item.clientId) : undefined;
        openTurn(ctx, out, originOf(item), time, type === 'userMessage' ? (clientId ?? id) : undefined);
    }
    switch (type) {
        case 'userMessage': {
            if (phase !== 'started')
                return out;
            const { text, blocks } = userContent(item.content);
            const images = transcriptImages(item.content, id, ctx.cwd);
            const clientId = str(item.clientId);
            rememberAnchor(ctx, id);
            const output = BASH_OUTPUT.exec(text);
            out.push({
                type: 'user.message',
                id: clientId ?? id,
                anchor: id,
                seq: ctx.nextSeq(),
                turn: ctx.turn,
                time,
                source: output === null ? 'user' : 'command-output',
                text: output === null ? text : output[1].trim(),
                blocks,
                ...(images.length === 0 ? {} : { images }),
            });
            return out;
        }
        case 'hookPrompt': {
            if (phase !== 'started')
                return out;
            const text = arr(item.fragments).map(fragment => str(rec(fragment)?.text) ?? '').join('\n');
            out.push({ type: 'user.message', id, anchor: id, seq: ctx.nextSeq(), turn: ctx.turn, time, source: 'injected', label: 'hook', text, blocks: [{ type: 'text', text }] });
            return out;
        }
        case 'reasoning': {
            // The output item starts before its visible summary. Its generation
            // time belongs to outputTokens, which includes the hidden reasoning.
            const attempt = ensureAttempt(ctx, out, phase === 'started' ? time : undefined);
            if (phase === 'completed') {
                const summary = arr(item.summary).filter((part) => typeof part === 'string');
                const content = arr(item.content).filter((part) => typeof part === 'string');
                const reasoning = (summary.length > 0 ? summary : content).join('\n\n');
                if (reasoning !== '')
                    attempt.reasoning = attempt.reasoning === '' ? reasoning : `${attempt.reasoning}\n\n${reasoning}`;
            }
            return out;
        }
        case 'agentMessage':
        case 'plan': {
            const attempt = ensureAttempt(ctx, out, phase === 'started' ? time : undefined);
            if (phase === 'completed') {
                attempt.text = str(item.text) ?? '';
                settleAttempt(ctx, out, time);
            }
            return out;
        }
        case 'contextCompaction': {
            settleAttempt(ctx, out, time);
            if (phase === 'started') {
                ctx.compactionSeen = true;
                out.push({ type: 'compaction.start', trigger: ctx.compactRequested ? 'manual' : 'auto', cancellable: false, time });
            }
            else {
                out.push({ type: 'compaction.end', ok: true, contextReplaced: true, time });
            }
            return out;
        }
        case 'subAgentActivity': {
            if (phase !== 'started')
                return out;
            settleAttempt(ctx, out, time);
            const agentId = str(item.agentThreadId);
            if (agentId === undefined)
                return out;
            const path = (str(item.agentPath) ?? '').split('/').filter(Boolean);
            switch (str(item.kind)) {
                case 'started':
                    out.push({ type: 'subagent.start', agentId, parentCallId: id, description: path.at(-1) ?? agentId, background: false, depth: Math.max(1, path.length - 1), time });
                    break;
                case 'interacted':
                    out.push({ type: 'subagent.progress', agentId });
                    break;
                case 'interrupted':
                    out.push({ type: 'subagent.end', agentId, status: 'cancelled', time });
                    break;
                case 'completed':
                    out.push({ type: 'subagent.end', agentId, status: 'completed', time });
                    break;
                default:
                    break;
            }
            return out;
        }
        case 'enteredReviewMode': {
            if (phase !== 'started')
                return out;
            settleAttempt(ctx, out, time);
            out.push({ type: 'notice', level: 'info', key: `review:${id}`, text: codexText('codex-review-start', { review: str(item.review) ?? '' }) });
            return out;
        }
        case 'exitedReviewMode': {
            if (phase !== 'completed')
                return out;
            settleAttempt(ctx, out, time);
            const attempt = ensureAttempt(ctx, out);
            attempt.text = str(item.review) ?? '';
            settleAttempt(ctx, out, time);
            return out;
        }
        default:
            break;
    }
    if (TOOL_ITEM_TYPES.has(type)) {
        const startCall = () => {
            settleAttempt(ctx, out, time);
            ensureStep(ctx, out);
            const call = toolCallOf(item, ctx.cwd);
            if (call === undefined)
                return;
            ctx.openTools.set(id, { name: call.name, startedAt: time });
            out.push({ type: 'tool.call', seq: ctx.nextSeq(), turn: ctx.turn, step: ctx.step, callId: id, name: call.name, argsJson: call.argsJson, ...(call.presentation === undefined ? {} : { presentation: call.presentation }), time });
        };
        if (phase === 'started') {
            if (!ctx.openTools.has(id))
                startCall();
            return out;
        }
        // A completion whose start was never seen still gets its call first.
        if (!ctx.openTools.has(id))
            startCall();
        ctx.openTools.delete(id);
        const result = toolResultOf(item, ctx.cwd, ctx.words);
        const images = itemImages(item, id, ctx.cwd);
        if (type === 'mcpToolCall')
            arr(rec(item.result)?.content).forEach((raw, index) => {
                const block = rec(raw);
                if (block?.type !== 'image')
                    return;
                const data = str(block.data);
                const mime = str(block.mimeType);
                if (data === undefined || mime === undefined)
                    return;
                const image = dataUrlImageFacade(`${id}#${index}`, `data:${mime};base64,${data}`);
                if (image !== undefined)
                    images.push(image);
            });
        out.push({
            type: 'tool.result',
            seq: ctx.nextSeq(),
            turn: ctx.turn,
            step: ctx.step,
            callId: id,
            isError: result.isError,
            time,
            content: result.content,
            text: result.text,
            ...(images.length === 0 ? {} : { images }), ...(result.errorText === undefined ? {} : { errorText: result.errorText }),
            ...(result.structured === undefined ? {} : { structured: result.structured }),
            ...(result.presentation === undefined ? {} : { presentation: result.presentation }),
        });
        return out;
    }
    // An item type this backend does not render: the plugin renderer seam
    // (a registered renderer may show it; by default nothing does).
    if (phase === 'completed') {
        ctx.debug(`codex: no mapping for item type ${type}`);
        out.push({ type: 'custom', nativeType: `codex/${type}`, data: item });
    }
    return out;
}
