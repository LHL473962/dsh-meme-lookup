import type { AgentEvent } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import { type RpcClock } from '../rpc/client.js';
import type { CodexHub } from '../rpc/hub.js';
export declare const CODEX_TASK_POLL_MS = 2000;
export declare const CODEX_TASK_OUTPUT_BYTES: number;
export declare function createCodexTasks(deps: {
    readonly hub: Pick<CodexHub, 'call'>;
    threadId(): string;
    emit(events: readonly AgentEvent[]): void;
    readonly now?: () => number;
    readonly clock?: RpcClock;
    debug?(message: string): void;
}): {
    readonly capability: {
        stop(taskId: string): Promise<boolean>;
        readOutput?(taskId: string): Promise<string>;
    } | undefined;
    initialize: () => Promise<void>;
    refresh: () => Promise<void>;
    notification(method: string, params: Rec): boolean;
    reset(): void;
    close(): void;
};
//# sourceMappingURL=tasks.d.ts.map