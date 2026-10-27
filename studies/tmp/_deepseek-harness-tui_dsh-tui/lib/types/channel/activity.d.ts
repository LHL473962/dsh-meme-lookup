import type { ChannelUi } from '../adapter/ports/channel-ui.js';
import type { AgentMessageView, BackgroundJobState, ChatRow, SubagentState } from '../adapter/ports/channel-view.js';
import type { AgentEvent, AgentEventOf } from '../agent/events.js';
/** Output tail lines kept per job (the card shows 3, the panel the rest). */
export declare const ACTIVITY_TAIL_LINES = 30;
/** The output tail of a watched live job is re-read at most this often. */
export declare const ACTIVITY_TAIL_INTERVAL_MS = 1000;
/** The longest subagent output line kept (characters; an ellipsis marks the cut). */
export declare const MAX_OUTPUT_LINE_CHARS = 400;
/** The child-lane event kinds (they carry the delegating call's id). */
export type LaneEvent = AgentEventOf<'assistant.attempt.start' | 'assistant.delta' | 'assistant.message' | 'tool.call' | 'tool.result' | 'tool.progress' | 'tool.output'>;
/** The subagent lane an event belongs to (`parentCallId`), if it is a child-lane event. */
export declare function laneOf(event: AgentEvent): string | undefined;
/** The state slice this projection writes. */
export interface ActivityState {
    rows: ChatRow[];
    subagents: readonly SubagentState[];
    backgroundJobs: readonly BackgroundJobState[];
}
/** Timer seam (tests inject a manual one). */
export interface ActivityTimer {
    set(callback: () => void, ms: number): unknown;
    clear(handle: unknown): void;
}
export interface ActivityDeps {
    rowIds: {
        value: number;
    };
    /** Settlement toasts (absent = silent, e.g. a scratch projection). */
    notify?: ChannelUi['notify'];
    /** Publish an asynchronous change (an output tail read). */
    emit?(): void;
    /** Read a job's output tail; undefined when the backend cannot. */
    readOutput?(taskId: string): Promise<string> | undefined;
    now?(): number;
    timer?: ActivityTimer;
}
/** Create the projection over one channel state. */
export declare function createActivityProjection(getState: () => ActivityState, deps: ActivityDeps): {
    apply: (event: AgentEvent, replay: boolean) => void;
    reset: () => void;
    dropRows: () => void;
    watchOutput: (id: string) => (() => void);
    dispose(): void;
    /** The subagent a lane or id names, for control requests. */
    subagent(id: string): SubagentState | undefined;
    job(id: string): BackgroundJobState | undefined;
    agentMessages(): readonly AgentMessageView[];
    /** `/agents`: one line per tracked subagent. */
    listLines(): string[];
};
export type ActivityProjection = ReturnType<typeof createActivityProjection>;
//# sourceMappingURL=activity.d.ts.map