import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import type { AgentSession } from '../../agent/session.js';
import type { ChannelOwner } from './owner.js';
export interface BindingCapture {
    readonly session: AgentSession;
    /** DSH convenience: the captured session's agent; undefined off DSH. */
    readonly agent: Agent | undefined;
    readonly generation: number;
}
export interface BindingCommit {
    readonly session: AgentSession;
    readonly agent: Agent | undefined;
    readonly handle: AgentHandle | undefined;
    readonly generation: number;
}
type PreviousDisposition = 'dispose' | 'park';
/**
 * Sole writer of the attached session identity and binding generation.
 *
 * The cell holds an `AgentSession` of any backend and every identity rule
 * below is decided on that session object (plus the generation, which every
 * adoption advances). `agent`/`handle` are DSH convenience views of
 * `capabilities.native.dsh` for the DSH specialists (`undefined` on a
 * non-DSH session); a DSH session's lifetime is still keyed by its handle, so
 * two wrappers of one owned agent close it once. A prepared session remains
 * owned by this cell until its synchronous adoption tail returns. The tail
 * is deliberately callback-shaped: it cannot leave a committed identity
 * waiting for a microtask watchdog to infer whether setup completed, and a
 * throw always revokes the transaction immediately.
 */
export declare function createChannelBinding(initial: AgentSession, owner: ChannelOwner): {
    readonly session: AgentSession;
    /** DSH convenience: `capabilities.native.dsh.agent` of the bound session;
     *  undefined when the bound session is not a DSH session. */
    readonly agent: Agent | undefined;
    /** DSH convenience: the bound session's lifetime handle, if it owns one. */
    readonly handle: AgentHandle | undefined;
    readonly generation: number;
    capture(): BindingCapture;
    isCurrent(capture: BindingCapture): boolean;
    /**
     * Create a candidate without giving it authority over the live binding.
     *
     * When the capture went stale the candidate is closed and the rejection
     * WAITS for that close. The caller's `abandon(handle)` can no longer see the
     * handle — it was never in `pending` — so waiting here is the only way the
     * handle is known to have stopped writing before the caller gives its
     * ledger reservation back.
     */
    prepare(capture: BindingCapture, create: () => Promise<AgentSession>): Promise<AgentSession>;
    /**
     * Dispose an uncommitted candidate exactly once and WAIT for the close.
     *
     * Waiting is the point: callers use this on the path where they are about
     * to give a cross-process ledger reservation back, and that reservation may
     * only be released once the handle has actually stopped writing. A live
     * handle that this cell never owned is inert here.
     */
    abandon(candidate: AgentSession): Promise<void>;
    /**
     * Close the bound session at channel release when this cell owns its
     * lifetime: any session that is not a DSH session (a backend session no
     * host registry disposes; for the Claude backend, its CLI child). A DSH
     * session's lifetime belongs to its handle's owner, never to the UI
     * release. Deferred one microtask, so release itself never awaits or
     * throws; idempotent with every other close of the same session.
     */
    releaseOwned(): void;
    /** A registry may retain an agent while its async handle close drains. */
    waitForDisposal(sessionId: string): Promise<void>;
    /** Perform one explicit synchronous prepared-handle adoption transaction. */
    adopt: <T>(candidate: AgentSession, capture: BindingCapture, tail: (previous: BindingCommit, disposition: (next: PreviousDisposition) => void) => T) => T;
    /** Perform one explicit synchronous already-live-session adoption transaction. */
    switchTo: <T>(next: AgentSession, tail: (previous: BindingCommit, disposition: (next: PreviousDisposition) => void) => T) => T;
    bind(): number;
    subscribe(dispose: () => void): void;
    clearSubscriptions: (afterEach?: () => void) => unknown;
};
export type ChannelBinding = ReturnType<typeof createChannelBinding>;
/** A capture taken through the DSH view: its agent is always present. */
export interface DshBindingCapture extends BindingCapture {
    readonly agent: Agent;
}
/** A commit seen through the DSH view: the replaced session's agent. */
export interface DshBindingCommit extends BindingCommit {
    readonly agent: Agent;
}
type Disposition = (next: PreviousDisposition) => void;
/**
 * The binding as the DSH specialists see it: `agent` (and every capture's
 * agent) is the bound DSH agent. The specialists attach only when the bound
 * session is a DSH session, so reading `agent` through this view on a
 * non-DSH binding is a wiring bug and throws loudly instead of handing a
 * specialist `undefined`.
 */
export type DshChannelBinding = Omit<ChannelBinding, 'agent' | 'capture' | 'adopt' | 'switchTo'> & {
    readonly agent: Agent;
    capture(): DshBindingCapture;
    adopt<T>(candidate: AgentSession, capture: BindingCapture, tail: (previous: DshBindingCommit, disposition: Disposition) => T): T;
    switchTo<T>(next: AgentSession, tail: (previous: DshBindingCommit, disposition: Disposition) => T): T;
};
/** Wrap a binding for the DSH specialists (a live view, not a snapshot). */
export declare function dshChannelBinding(binding: ChannelBinding): DshChannelBinding;
export {};
//# sourceMappingURL=binding.d.ts.map