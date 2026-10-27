/**
 * The channel half of the human-in-the-loop bridge: a non-DSH session
 * announces its prompts as events, this module parks them in the stores the
 * TUI renders and routes the user's answers back through the session's typed
 * capabilities.
 *
 *   permission.request  → PermissionStore.park  → panel → permissions.respond
 *   permission.settled  → PermissionStore.withdraw (the backend took it back)
 *   question.request    → QuestionStore.ask     → panel → questions.respond / cancel
 *   question.settled    → abort that ask (the backend took it back)
 *
 * A prompt the backend withdrew is never answered again; a session that
 * leaves the binding withdraws everything it parked (`release`).
 *
 * Backend-neutral (`verify:boundary`): stores and capabilities only.
 */
import type { SessionCapabilities } from '../agent/capabilities.js';
import type { AgentEvent } from '../agent/events.js';
import type { PermissionStore } from './permissions.js';
import type { QuestionStoreLike } from './questions.js';
export interface InteractionBridgeDeps {
    readonly permissions: PermissionStore;
    readonly questions: QuestionStoreLike;
    debug(message: string): void;
}
/** The bound session as the bridge sees it. */
export interface InteractionSession {
    readonly sessionId: string;
    readonly capabilities: Pick<SessionCapabilities, 'permissions' | 'questions'>;
}
/** Attach one session: its events in, its answers out. */
export declare function attachInteraction(deps: InteractionBridgeDeps, session: InteractionSession): {
    /** Feed one batch of the bound session's events. */
    apply(batch: readonly AgentEvent[]): void;
    /** The session left the binding (or the channel released): withdraw all. */
    release(): void;
};
//# sourceMappingURL=interaction.d.ts.map