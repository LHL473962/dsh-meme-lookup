import { codexText } from '../text.js';
import { num, rec, str } from '../narrow.js';
import { CLIENT, NOTIFY } from '../protocol/index.js';
import { rpcCode, RPC_ERROR } from '../rpc/client.js';
/** Pure mapping of the native goal snapshot (shared by get, set and notices). */
export function codexGoalEvent(raw, operation = 'update') {
    if (raw === null)
        return { type: 'goal.change', operation: 'clear' };
    const goal = rec(raw);
    const threadId = str(goal?.threadId);
    const objective = str(goal?.objective);
    const status = str(goal?.status);
    if (goal === undefined || threadId === undefined || objective === undefined || status === undefined)
        return undefined;
    const phase = status === 'usageLimited' || status === 'budgetLimited' ? 'blocked' : status;
    if (phase !== 'active' && phase !== 'paused' && phase !== 'blocked' && phase !== 'complete')
        return undefined;
    return {
        type: 'goal.change', operation,
        goal: {
            id: 'codex-goal:' + threadId + ':' + String(goal.createdAt),
            revision: num(goal.updatedAt) ?? 0,
            objective, phase, maxGoalRounds: 0,
            ...(phase !== 'blocked' ? {} : { blockedReason: { code: status, message: codexText(status === 'usageLimited' ? 'codex-goal-usage-limited' : status === 'budgetLimited' ? 'codex-goal-budget-limited' : 'codex-goal-blocked') } }),
            budget: { tokensUsed: num(goal.tokensUsed) ?? 0, tokenBudget: num(goal.tokenBudget) ?? null, timeUsedSeconds: num(goal.timeUsedSeconds) ?? 0 },
        },
    };
}
export function createCodexGoals(deps) {
    let generation = 0;
    let closed = false;
    let enabled = true;
    let signature;
    const publish = (raw, operation) => {
        const event = codexGoalEvent(raw, operation);
        if (event === undefined)
            return;
        const next = JSON.stringify(event.goal ?? null);
        if (next === signature)
            return;
        signature = next;
        deps.emit([event]);
    };
    const update = async (params, operation) => {
        const root = deps.threadId();
        const epoch = generation;
        const response = rec(await deps.hub.call(CLIENT.threadGoalSet, { threadId: root, ...params }));
        if (!closed && epoch === generation && root === deps.threadId())
            publish(response?.goal, operation);
    };
    const capability = {
        set: (objective, options) => update({ objective, status: 'active', ...(options?.tokenBudget === undefined ? {} : { tokenBudget: options.tokenBudget }) }, 'set'),
        pause: () => update({ status: 'paused' }, 'pause'),
        resume: () => update({ status: 'active' }, 'resume'),
        async clear() {
            const root = deps.threadId();
            const epoch = generation;
            await deps.hub.call(CLIENT.threadGoalClear, { threadId: root });
            if (!closed && epoch === generation && root === deps.threadId())
                publish(null);
        },
    };
    return {
        get capability() { return enabled && !closed ? capability : undefined; },
        async initialize() {
            if (closed || !enabled)
                return;
            const root = deps.threadId();
            const epoch = generation;
            try {
                const response = rec(await deps.hub.call(CLIENT.threadGoalGet, { threadId: root }));
                if (!closed && epoch === generation && root === deps.threadId())
                    publish(response?.goal);
            }
            catch (error) {
                if (closed || epoch !== generation || root !== deps.threadId())
                    return;
                if (rpcCode(error) === RPC_ERROR.methodNotFound || rpcCode(error) === RPC_ERROR.invalidParams) {
                    if (enabled)
                        deps.emit([{ type: 'notice', level: 'warning', key: 'codex-goals-unsupported', text: codexText('codex-goals-unsupported') }]);
                    enabled = false;
                }
                else
                    deps.debug?.('codex: initial goal unavailable (' + (error instanceof Error ? error.message : String(error)) + ')');
            }
        },
        notification(method, params) {
            if (method !== NOTIFY.threadGoalUpdated && method !== NOTIFY.threadGoalCleared)
                return false;
            if (!closed && str(params.threadId) === deps.threadId())
                publish(method === NOTIFY.threadGoalCleared ? null : params.goal);
            return true;
        },
        reset() { generation += 1; signature = undefined; },
        close() { closed = true; generation += 1; },
    };
}
