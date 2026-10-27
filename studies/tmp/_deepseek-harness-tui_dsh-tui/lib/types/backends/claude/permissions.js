import { claudeText } from './text.js';
import { displayPath } from './tools.js';
import { errorText, rec, str } from './narrow.js';
/** The model-facing refusal. */
export const REJECT_MESSAGE = 'User refused permission to run tool';
/** The model-facing answer to a cancelled `AskUserQuestion`. */
export const QUESTION_CANCEL_MESSAGE = 'User cancelled the question';
/** The model-facing answer to a plan sent back for more planning. */
export const PLAN_KEEP_PLANNING_MESSAGE = 'The user wants to keep planning and did not approve the plan';
/** The model-facing answer to a dismissed plan review. */
export const PLAN_DISMISSED_MESSAGE = 'The user dismissed the plan review';
/** What a withdrawn prompt resolves with (the CLI records its own refusal). */
export const WITHDRAWN_MESSAGE = 'The permission prompt was withdrawn';
/** What a prompt still open at dispose resolves with. */
export const CLOSED_MESSAGE = 'The session closed before the user answered';
/** One line naming what the tool would do. */
export function promptCommand(toolName, input, cwd) {
    const path = str(input.file_path) ?? str(input.notebook_path) ?? str(input.path);
    switch (toolName) {
        case 'Bash':
        case 'PowerShell':
            return str(input.command);
        case 'Read':
        case 'Write':
        case 'Edit':
        case 'MultiEdit':
        case 'NotebookEdit':
            return path === undefined ? undefined : displayPath(path, cwd);
        case 'WebFetch':
            return str(input.url);
        case 'WebSearch':
            return str(input.query);
        case 'Glob':
        case 'Grep': {
            const pattern = str(input.pattern);
            return pattern === undefined ? undefined : path === undefined ? pattern : `${pattern} · ${displayPath(path, cwd)}`;
        }
        default: {
            const json = JSON.stringify(input);
            if (json === undefined || json === '{}')
                return undefined;
            return json.length <= 300 ? json : `${json.slice(0, 300)}…`;
        }
    }
}
/** `Tool(content)` as a permission rule is written. */
const ruleText = (rule) => rule.ruleContent === undefined || rule.ruleContent === '' ? rule.toolName : `${rule.toolName}(${rule.ruleContent})`;
/**
 * The allow-always label: what the CLI's suggestions would remember, in the
 * user's words. Undefined when no suggestion has a known shape (the generic
 * label stands in).
 */
export function alwaysLabel(suggestions, cwd) {
    const parts = suggestions.flatMap((suggestion) => {
        switch (suggestion.type) {
            case 'addRules': {
                if (suggestion.behavior !== 'allow' || suggestion.rules.length === 0)
                    return [];
                const rules = suggestion.rules.map(ruleText).join(', ');
                const key = suggestion.destination === 'session' || suggestion.destination === 'cliArg'
                    ? 'claude-always-rules-session'
                    : suggestion.destination === 'userSettings' ? 'claude-always-rules-user' : 'claude-always-rules-project';
                return [claudeText(key, { rules })];
            }
            case 'setMode':
                return [suggestion.mode === 'acceptEdits' ? claudeText('claude-always-accept-edits') : claudeText('claude-always-mode', { mode: suggestion.mode })];
            case 'addDirectories':
                return suggestion.directories.length === 0 ? [] : [claudeText('claude-always-directories', { dirs: suggestion.directories.map(dir => displayPath(dir, cwd)).join(', ') })];
            default:
                return [];
        }
    });
    return parts.length === 0 ? undefined : parts.join('; ');
}
/** The structured questions of an `AskUserQuestion` input (none = unreadable). */
function questionsOf(input) {
    const list = Array.isArray(input.questions) ? input.questions : [];
    return list.flatMap((raw) => {
        const item = rec(raw);
        const question = str(item?.question);
        if (item === undefined || question === undefined || question.trim() === '')
            return [];
        const options = (Array.isArray(item.options) ? item.options : []).flatMap(option => {
            const value = rec(option);
            const label = str(value?.label);
            return label === undefined || label === '' ? [] : [{ label, ...(str(value?.description) === undefined ? {} : { description: str(value?.description) }) }];
        });
        return [{
                question,
                ...(str(item.header) === undefined ? {} : { header: str(item.header) }),
                options,
                ...(item.multiSelect === true ? { multiSelect: true } : {}),
            }];
    });
}
/** Create the bridge for one session. */
export function createClaudePermissionBridge(deps) {
    const pending = new Map();
    const changed = () => {
        try {
            deps.onPendingChange?.(pending.size);
        }
        catch (error) {
            deps.debug(`claude: pending-change listener failed (${errorText(error)})`);
        }
    };
    /** Settle one prompt: resolve its callbacks, tell the channel, once. */
    const settle = (entry, result, outcome) => {
        if (pending.get(entry.requestId) !== entry)
            return;
        pending.delete(entry.requestId);
        for (const detach of entry.detachers.splice(0))
            detach();
        for (const resolve of entry.resolvers.splice(0))
            resolve(result);
        deps.emit([entry.kind === 'permission'
                ? { type: 'permission.settled', requestId: entry.requestId, outcome }
                : { type: 'question.settled', requestId: entry.requestId }]);
        changed();
    };
    const deny = (entry, message, extra = {}) => ({
        behavior: 'deny',
        message,
        toolUseID: entry.toolUseID,
        ...(extra.interrupt === true ? { interrupt: true } : {}),
        ...(extra.classify === false ? {} : { decisionClassification: 'user_reject' }),
    });
    const allow = (entry, input, updatedPermissions, permanent = false) => ({
        behavior: 'allow',
        updatedInput: input,
        ...(updatedPermissions === undefined ? {} : { updatedPermissions }),
        toolUseID: entry.toolUseID,
        ...(permanent ? { decisionClassification: 'user_permanent' } : {}),
    });
    const canUseTool = (toolName, input, options) => new Promise(resolve => {
        try {
            const requestId = options.requestId;
            if (deps.closing()) {
                resolve(deny(options, CLOSED_MESSAGE));
                return;
            }
            // Any delivered signal aborting cancels the shared prompt (rule 1);
            // every listener is detached on settle.
            const onAbort = () => {
                const entry = pending.get(requestId);
                if (entry !== undefined)
                    settle(entry, deny(entry, WITHDRAWN_MESSAGE, { classify: false }), 'cancelled');
            };
            const listen = (signal) => {
                signal.addEventListener('abort', onAbort, { once: true });
                return () => { signal.removeEventListener('abort', onAbort); };
            };
            // The SDK may redeliver a request (reinitialize after a transport
            // gap): the second callback waits for the same answer, and its signal
            // counts like the first's (already aborted, or aborted later, it
            // withdraws the whole group).
            const existing = pending.get(requestId);
            if (existing !== undefined) {
                existing.resolvers.push(resolve);
                if (options.signal.aborted) {
                    settle(existing, deny(existing, WITHDRAWN_MESSAGE, { classify: false }), 'cancelled');
                    return;
                }
                existing.detachers.push(listen(options.signal));
                return;
            }
            if (options.signal.aborted) {
                resolve(deny(options, WITHDRAWN_MESSAGE, { classify: false }));
                return;
            }
            const suggestions = options.suggestions ?? [];
            const kind = toolName === 'AskUserQuestion' ? 'question' : toolName === 'ExitPlanMode' ? 'plan' : 'permission';
            const base = { requestId, toolUseID: options.toolUseID, input, suggestions, resolvers: [resolve], detachers: [] };
            let entry;
            let event;
            if (kind === 'question') {
                const questions = questionsOf(input);
                if (questions.length === 0) {
                    resolve(deny(options, claudeText('claude-question-unreadable'), { classify: false }));
                    return;
                }
                entry = { ...base, kind, questions };
                event = {
                    type: 'question.request',
                    request: { requestId, callId: options.toolUseID, ...(options.agentID === undefined ? {} : { agentId: options.agentID }), questions },
                };
            }
            else if (kind === 'plan') {
                const plan = { accept: claudeText('claude-plan-accept-edits'), manual: claudeText('claude-plan-manual'), keep: claudeText('claude-plan-keep') };
                const detail = str(input.plan);
                const questions = [{
                        question: claudeText('claude-plan-review-question'),
                        header: claudeText('claude-plan-review-header'),
                        ...(detail === undefined ? {} : { detail }),
                        options: [
                            { label: plan.accept, description: claudeText('claude-plan-accept-edits-desc') },
                            { label: plan.manual, description: claudeText('claude-plan-manual-desc') },
                            { label: plan.keep, description: claudeText('claude-plan-keep-desc') },
                        ],
                        intent: { kind: 'plan-review', approve: plan.accept, approveAlso: [plan.manual], decline: plan.keep },
                    }];
                entry = { ...base, kind, questions, plan };
                event = { type: 'question.request', request: { requestId, callId: options.toolUseID, ...(options.agentID === undefined ? {} : { agentId: options.agentID }), questions } };
            }
            else {
                const alwaysAllowed = suggestions.length > 0 && options.suppressAlwaysAllowRule !== true && options.matchedAskRule === undefined;
                const label = alwaysAllowed ? alwaysLabel(suggestions, deps.cwd) : undefined;
                const choices = [
                    { id: 'allow-once', kind: 'allow-once' },
                    ...(alwaysAllowed ? [{ id: 'allow-always', kind: 'allow-always', ...(label === undefined ? {} : { label }) }] : []),
                    { id: 'reject', kind: 'reject' },
                ];
                const command = promptCommand(toolName, input, deps.cwd);
                const view = {
                    requestId,
                    toolName,
                    callId: options.toolUseID,
                    input,
                    options: choices,
                    feedback: true,
                    ...(options.displayName === undefined ? {} : { displayName: options.displayName }),
                    ...(options.title === undefined ? {} : { title: options.title }),
                    ...(options.description === undefined ? {} : { description: options.description }),
                    ...(options.decisionReason === undefined ? {} : { reason: options.decisionReason }),
                    ...(command === undefined ? {} : { command }),
                    ...(options.blockedPath === undefined ? {} : { blockedPath: displayPath(options.blockedPath, deps.cwd) }),
                    ...(options.agentID === undefined ? {} : { agentId: options.agentID }),
                    ...(options.defaultToNo === true ? { defaultToNo: true } : {}),
                    ...(options.suppressAlwaysAllowRule === true ? { suppressAlwaysAllow: true } : {}),
                    ...(options.matchedAskRule === undefined ? {} : { matchedAskRule: { ...options.matchedAskRule } }),
                    ...(options.mcpServer === undefined ? {} : { mcpServer: { ...options.mcpServer } }),
                };
                entry = { ...base, kind, view };
                event = { type: 'permission.request', request: view };
            }
            pending.set(requestId, entry);
            entry.detachers.push(listen(options.signal));
            deps.emit([event]);
            changed();
        }
        catch (error) {
            // Rule 6: a prompt this bridge cannot present is refused, never a hang.
            deps.debug(`claude: permission prompt failed (${errorText(error)})`);
            resolve(deny(options, REJECT_MESSAGE, { classify: false }));
        }
    });
    /** The user decided a tool prompt. */
    const respond = (requestId, decision) => {
        const entry = pending.get(requestId);
        if (entry === undefined)
            return;
        if (entry.kind !== 'permission') {
            deps.debug(`claude: ${requestId} is a ${entry.kind} prompt, not a permission`);
            return;
        }
        const offered = (kind) => entry.view?.options.some(option => option.kind === kind) ?? false;
        switch (decision.kind) {
            case 'allow-once':
                settle(entry, allow(entry, entry.input), 'allow-once');
                return;
            case 'allow-always':
                // Fail closed: an allow-always the prompt never offered is a refusal.
                if (!offered('allow-always')) {
                    settle(entry, deny(entry, REJECT_MESSAGE), 'rejected');
                    return;
                }
                settle(entry, allow(entry, entry.input, [...entry.suggestions], true), 'allow-always');
                return;
            case 'reject': {
                const reason = decision.message?.trim() ?? '';
                settle(entry, deny(entry, reason === '' ? REJECT_MESSAGE : `${REJECT_MESSAGE}. The user said: ${reason}`), 'rejected');
                return;
            }
            default: {
                const unknown = decision;
                void unknown;
            }
        }
    };
    /** The user answered a question (or a plan review). */
    const respondQuestion = (requestId, answers) => {
        const entry = pending.get(requestId);
        if (entry === undefined || entry.questions === undefined)
            return;
        if (entry.kind === 'plan' && entry.plan !== undefined) {
            const answer = answers.answers[0];
            const pick = answer?.selected[0];
            const feedback = answer?.custom?.trim() ?? '';
            if ((pick === entry.plan.accept || pick === entry.plan.manual) && feedback === '') {
                const mode = pick === entry.plan.accept ? 'acceptEdits' : 'default';
                settle(entry, allow(entry, entry.input, [{ type: 'setMode', mode, destination: 'session' }]), 'allow-once');
                return;
            }
            settle(entry, deny(entry, feedback === '' ? PLAN_KEEP_PLANNING_MESSAGE : `${PLAN_KEEP_PLANNING_MESSAGE}. The user said: ${feedback}`, { interrupt: true }), 'rejected');
            return;
        }
        const map = {};
        entry.questions.forEach((question, index) => {
            const answer = answers.answers[index];
            if (answer === undefined)
                return;
            const parts = [...answer.selected, ...(answer.custom === undefined || answer.custom.trim() === '' ? [] : [answer.custom.trim()])];
            if (parts.length > 0)
                map[question.question] = parts.join(', ');
        });
        settle(entry, allow(entry, { ...entry.input, answers: map }), 'allow-once');
    };
    /** The user dismissed a question (or a plan review). */
    const cancelQuestion = (requestId) => {
        const entry = pending.get(requestId);
        if (entry === undefined || entry.kind === 'permission')
            return;
        settle(entry, deny(entry, entry.kind === 'plan' ? PLAN_DISMISSED_MESSAGE : QUESTION_CANCEL_MESSAGE, { interrupt: true }), 'rejected');
    };
    return {
        canUseTool,
        respond,
        respondQuestion,
        cancelQuestion,
        /** Every parked tool prompt, in park order. */
        pendingViews() {
            return [...pending.values()].flatMap(entry => entry.view === undefined ? [] : [entry.view]);
        },
        get size() { return pending.size; },
        /** Withdraw everything (dispose, switch, a forced turn close). */
        settleAll(message = CLOSED_MESSAGE) {
            for (const entry of [...pending.values()])
                settle(entry, deny(entry, message, { classify: false }), 'cancelled');
        },
    };
}
