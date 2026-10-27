import { markChannelReadDirty } from '../../adapter/channel/read-view.js';
/**
 * Reset the projection facts shared by every foreground session adoption.
 * Target-specific route, cwd, preset, loaded-context and status fields stay
 * with the caller: not every adoption has the same semantics for those.
 */
export function resetSessionProjection(state, rowIds, resetProjector, resetSubagents, resetJobs) {
    resetProjector();
    rowIds.value = 0;
    state.rows.length = 0;
    markChannelReadDirty(state.rows);
    resetSubagents();
    resetJobs();
    state.todos = [];
    state.pending = [];
    state.goal = undefined;
    state.sessionTitle = '';
    state.sessionColor = '';
    state.workingDirectory = undefined;
    state.tokens = {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        peak: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        idle: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    };
    // 会话级费用累计与 tokens 同生命周期：换会话/换模型/rewind 一律清零后
    // 由 replay 重建（模型切换的 replay 会按 request/header 还原各请求模型）。
    state.mainCost = {};
    state.subagentCost = [];
    state.responseChars = 0;
    state.activeToolCount = 0;
    state.lastUserText = '';
    state.working = false;
    // Progress belongs to the old foreground. A parked manual transaction is
    // still live and restores its own row when that agent is bound again.
    state.compaction = undefined;
    state.cancelPending = false;
    state.spinnerMode = 'requesting';
    state.tps = undefined;
    state.tpsSamples = [];
    state.lastUsage = undefined;
    // The last turn's ledger belongs to the old session just as much.
    state.turnUsage = undefined;
    // So does the turn's terminal state: replaying the target session
    // re-populates it from that session's own last turn.end.
    state.turnOutcome = undefined;
    // A backend-reported cost belongs to the session that reported it.
    state.costReport = undefined;
    state.attachedContexts = [];
    state.contextSegments = {
        system: 0,
        prompt: 0,
        assistant: 0,
        thinking: 0,
        tools: 0,
    };
}
