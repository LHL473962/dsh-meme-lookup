import type { PermissionDecision, QuestionAnswers } from '../../../agent/capabilities.js';
import type { AgentEvent, PermissionRequestView } from '../../../agent/events.js';
import { type RpcClock } from '../rpc/client.js';
import type { HubServerRequest } from '../rpc/hub.js';
export interface ApprovalBridgeDeps {
    readonly cwd: string;
    /** The session's own thread: a request from another thread (a subagent
     *  routed here) is shown with that thread as its agent. */
    readonly threadId?: string;
    emit(events: readonly AgentEvent[]): void;
    debug(message: string): void;
    /** Run a rejection's reason as the next turn. */
    enqueueFollowup(id: string, text: string): void;
    /** Interrupt the running turn (a cancelled question). */
    interruptTurn(): void;
    readonly clock?: RpcClock;
}
/** An execpolicy prefix as the official client renders it (`bash -lc`
 *  stripped, tokens space-joined); undefined when it spans lines. */
export declare function prefixLabel(amendment: readonly string[]): string | undefined;
export declare function createApprovalBridge(deps: ApprovalBridgeDeps): {
    onRequest: (request: HubServerRequest) => void;
    respond: (requestId: string, decision: PermissionDecision) => void;
    respondQuestion: (requestId: string, answers: QuestionAnswers) => void;
    cancelQuestion: (requestId: string) => void;
    withdrawAll: () => void;
    /** `serverRequest/resolved`: the server is done with a request. */
    resolved(requestId: unknown): void;
    /** An item finished: an answered prompt about it is over. */
    itemCompleted(itemId: string): void;
    /** A turn ended: no prompt OF THIS THREAD can still be answered. A
     *  subagent's background request parked here outlives it (the server still
     *  awaits that answer; it settles via resolved/itemCompleted/dispose). */
    turnEnded(): void;
    pendingViews(): readonly PermissionRequestView[];
    readonly size: number;
};
export type ApprovalBridge = ReturnType<typeof createApprovalBridge>;
//# sourceMappingURL=approvals.d.ts.map