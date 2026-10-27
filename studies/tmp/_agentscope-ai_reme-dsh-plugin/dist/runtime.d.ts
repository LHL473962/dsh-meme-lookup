import type { LoggerLike, ReMeClientLike, ReMeMessage } from "./reme/types.js";
import type { DshSession, ReMeConfig, SessionEvent } from "./types.js";
import type { ReMeRuntimeSnapshot } from "./runtime-status.js";
interface PendingTurn {
    messages: ReMeMessage[];
    day: string;
}
interface SessionState {
    session: DshSession;
    sessionId: string;
    activeTurn: unknown;
    activeMessages: ReMeMessage[];
    pendingTurns: PendingTurn[];
    unconfirmedTurns: number;
    writes: Promise<void>;
    requestController: AbortController;
}
export declare class ReMeRuntime {
    readonly client: ReMeClientLike;
    readonly logger: LoggerLike;
    readonly states: Map<string, SessionState>;
    private readonly configSource;
    private dreamTimer;
    private dreamScheduleGeneration;
    private dreamTask;
    private dreamController;
    private started;
    private stopping;
    private taskSequence;
    private readonly recentTasks;
    private nextDreamAt;
    private dreamLastStartedAt;
    private dreamLastFinishedAt;
    private dreamLastResult;
    private dreamLastError;
    constructor(client: ReMeClientLike, config: ReMeConfig | (() => ReMeConfig), logger?: LoggerLike);
    stateFor(session: DshSession): SessionState;
    capture(session: DshSession, event: SessionEvent): void;
    private scheduleAutoMemory;
    start(): void;
    /** Apply a changed settings snapshot to pending batching and dream scheduling. */
    reconfigure(): void;
    private scheduleDream;
    runDream(): Promise<void>;
    dispose(session: DshSession): Promise<void>;
    disposeAll(): Promise<void>;
    /** Return a content-free snapshot for the local DSH status page. */
    snapshot(): ReMeRuntimeSnapshot;
    private withinShutdownBudget;
    private log;
}
export {};
//# sourceMappingURL=runtime.d.ts.map