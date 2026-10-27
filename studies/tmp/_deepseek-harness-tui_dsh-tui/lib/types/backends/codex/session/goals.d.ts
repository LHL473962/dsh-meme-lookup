import type { AgentEvent, AgentEventOf } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { CodexHub } from '../rpc/hub.js';
/** Pure mapping of the native goal snapshot (shared by get, set and notices). */
export declare function codexGoalEvent(raw: unknown, operation?: string): AgentEventOf<'goal.change'> | undefined;
export declare function createCodexGoals(deps: {
    readonly hub: Pick<CodexHub, 'call'>;
    threadId(): string;
    emit(events: readonly AgentEvent[]): void;
    debug?(message: string): void;
}): {
    readonly capability: {
        set(objective: string, options?: {
            readonly tokenBudget?: number;
        }): Promise<void>;
        pause(): Promise<void>;
        resume(): Promise<void>;
        clear(): Promise<void>;
    } | undefined;
    initialize(): Promise<void>;
    notification(method: string, params: Rec): boolean;
    reset(): void;
    close(): void;
};
//# sourceMappingURL=goals.d.ts.map