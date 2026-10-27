import { claudeText } from '../text.js';
import { replayClaudeSubagentLane } from '../replay.js';
import { readTaskOutputTail, taskOutputRoots } from '../task-output.js';
/** The subagent transcript's newest page (messages); older windows of the
 *  same size load on demand. */
const SUBAGENT_TRANSCRIPT_PAGE = 400;
export function sessionTaskCapabilities(context) {
    const { deps, translator } = context;
    /** Stop a task (subagent or job) by the id the channel knows it by. */
    const stopTask = async (id) => {
        const taskId = translator.taskIdOf(id);
        const query = context.run.query;
        if (taskId === undefined || typeof query.stopTask !== 'function' || context.disposing)
            return false;
        await query.stopTask(taskId);
        return true;
    };
    /**
     * The child transcript source: the subagent's own messages, read from the store and replayed through the
     *  same translator the live lane uses. Absent when this session has no
     *  store read API (tests, a store-less open); a read that fails rejects
     *  and the transcript view says unavailable — an unreadable transcript is
     *  never presented as an empty one.
     */
    function subagentHistory() {
        const read = deps.store?.getSubagentMessages;
        if (read === undefined)
            return {};
        return {
            async history(agentId, window) {
                const laneOf = (messages, hasOlder, skippedFromStart) => {
                    const lane = replayClaudeSubagentLane(agentId, messages, { cwd: deps.cwd, debug: message => deps.host.debug(message) });
                    return { events: lane.events, parentAgentId: lane.parentAgentId, uuids: lane.uuids, hasOlder, skippedFromStart };
                };
                if (window !== undefined) {
                    // An older slice: [skipFromStart - count, skipFromStart) of the disk
                    // transcript (the SDK paginates by offset from the start). An empty
                    // window reads nothing and leaves the cursor where it was.
                    const skip = Math.max(0, window.skipFromStart);
                    const count = Math.max(0, Math.min(window.count, skip));
                    if (count === 0)
                        return laneOf([], skip > 0, skip);
                    const slice = await read(context.currentSessionId, agentId, { dir: deps.cwd, offset: skip - count, limit: count });
                    return laneOf(slice, skip - count > 0, skip - slice.length);
                }
                // The newest page: one full read (bounded below), the tail kept.
                const all = await read(context.currentSessionId, agentId, { dir: deps.cwd });
                if (all.length <= SUBAGENT_TRANSCRIPT_PAGE)
                    return laneOf(all, false, 0);
                return laneOf(all.slice(all.length - SUBAGENT_TRANSCRIPT_PAGE), true, all.length - SUBAGENT_TRANSCRIPT_PAGE);
            },
        };
    }
    return {
        // A subagent or background job is stopped by its task id (`stopTask`;
        // the CLI reports the stop as its notification).
        subagents: {
            interrupt: agentId => stopTask(agentId),
            ...subagentHistory(),
            messaging: 'parent-mediated',
        },
        tasks: {
            stop: taskId => stopTask(taskId),
            readOutput: taskId => {
                const file = translator.outputFileOf(taskId);
                if (file === undefined)
                    return Promise.reject(new Error(claudeText('claude-task-output-unknown', { id: taskId })));
                try {
                    return Promise.resolve(readTaskOutputTail(file, taskId, taskOutputRoots(context.authPlan.env)));
                }
                catch (error) {
                    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
                }
            },
        },
    };
}
