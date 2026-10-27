/**
 * DSH backend session: one `Agent` (plus the `AgentHandle` that owns its
 * lifetime, when this process created or resumed it) presented as an
 * `AgentSession`. Each session has its own `createDshTranslator` instance, so
 * translator state (frame fence, open calls) lives as long as the session.
 * Inbox, status and compaction-stream bus events become `pending.changed`,
 * `session.status` and `compaction.progress`.
 *
 * DSH features that have no typed capability yet reach the agent through
 * `capabilities.native.dsh` (only `src/dsh-adapter/**` may read it).
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { AgentEvent } from '../../agent/events.js';
import type { AgentSession } from '../../agent/session.js';
import { type DshTranslator } from './translate.js';
declare module '../../agent/capabilities.js' {
    interface DshNative {
        /** The live DSH agent this session drives. */
        readonly agent: Agent;
        /** The lifetime handle, when this session owns the agent's lifetime;
         *  absent for a borrowed registry agent (agent-view attachment). */
        readonly handle: AgentHandle | undefined;
        /** The plugin context the session's listeners are installed on. */
        readonly ctx: Context;
        /** Raw durable events of the main session, in arrival order. Raw
         *  listeners registered before `subscribe` run before the projector sees
         *  the same event. */
        subscribeRaw(listener: (event: SessionEvent) => void): () => void;
        /** The durable session log snapshot (`/trace`, fold restore, seeds). */
        rawHistory(): readonly SessionEvent[];
        /**
         * Synchronously translate a durable replay seed with this session's
         * translator. The channel's adoption transactions replay inside a
         * synchronous tail, which the async `history()` cannot serve.
         */
        translateReplay(events: readonly SessionEvent[]): readonly AgentEvent[];
        /** Forget the translator's per-session state (paired with a projector reset). */
        resetTranslation(): void;
        /** The dsh-tools presenters, scoped to this session's agent. */
        readonly presentCallView: DshTranslator['presentCallView'];
        readonly presentResultView: DshTranslator['presentResultView'];
    }
}
/** What a DSH session wraps: an owned handle, or an agent plus the handle
 *  this process holds for it (`undefined` = a borrowed registry agent). */
export type DshSessionTarget = AgentHandle | {
    readonly agent: Agent;
    readonly handle: AgentHandle | undefined;
};
/** Whether a value is an `AgentSession` rather than a raw DSH agent. */
export declare function isAgentSession(value: unknown): value is AgentSession;
/**
 * Wrap a DSH agent (and the handle that owns it, if any) as an
 * `AgentSession`. Creating the wrapper acquires nothing: listeners exist only
 * while `subscribe`/`subscribeRaw` subscriptions are live, and only `dispose()`
 * releases the handle.
 */
export declare function createDshSession(ctx: Context, target: DshSessionTarget): AgentSession;
/** The lifetime handle of a DSH session this process created or resumed;
 *  throws when the session borrows its agent (or is not a DSH session). */
export declare function dshHandleOf(session: AgentSession): AgentHandle;
//# sourceMappingURL=session.d.ts.map