/**
 * Session switching every composition shares: the `tui/session-switch` veto,
 * the fire-and-forget `tui/session-switched` notice, `/new` and the generic
 * `/resume`. Each is one prepare-then-adopt transaction over the binding,
 * with the backend's way of opening the session injected. The DSH extension
 * injects its create path (preset, route, mount reservation, workspace
 * attach) and keeps its own `/resume`, which parks sessions in this process;
 * any other backend opens through `ChannelLaunchOptions.openSession`.
 *
 * `/new` and `/resume` refuse while a turn runs, and re-check after the open.
 * A backend handshake can take long (the Claude CLI: up to a minute), and a
 * prompt the user sent to the current session meanwhile must not be torn
 * down by the adoption that disposes it, so the candidate is abandoned
 * instead.
 *
 * `/resume` reads the target's durable history before the synchronous
 * adoption and paints it inside the adoption, ahead of the subscription, so
 * nothing the live session emits can land before its history. The
 * cross-process mount ledger is claimed under the backend-qualified key
 * (`claude:<id>`) for the whole attempt, like a DSH disk resume: a session
 * another TUI process drives is refused.
 */
import type { AgentEvent } from '../../../agent/events.js';
import type { AgentSession } from '../../../agent/session.js';
import { reserveMount } from '../../../sessionMounts.js';
import type { ChannelHost } from '../channel-host.js';
import type { ChannelCapabilities } from '../../../adapter/ports/channel-view.js';
import type { ChannelBinding } from '../binding.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelLaunchOptions } from '../state.js';
import type { ChannelState, ResumeResult } from '../types.js';
export type SessionSwitchKind = 'new' | 'resume' | 'agent-view';
export type SessionSwitchedKind = 'new' | 'resume' | 'rewind' | 'fork' | 'agent-view' | 'background';
/** A guarded workspace handoff (`/workspace`); never on `ChannelUi.newSession()`. */
export interface NewSessionTarget {
    readonly cwd: string;
    readonly displayCwd?: string;
}
/** One `/new` attempt as the backend opens it. */
export interface NewSessionPlan {
    /** Claim whatever the attempt must hold before the session exists (DSH:
     *  the cross-process mount ledger). Runs once, after planning. */
    reserve?(): Promise<void>;
    /** Open the fresh session; runs inside the binding's `prepare`. */
    open(cwd: string): Promise<AgentSession>;
    /** Ownership work between preparation and adoption (DSH: workspace
     *  attachment); may notify, must not throw. */
    attach?(candidate: AgentSession, current: () => boolean): Promise<void>;
    /** The backend's half of the synchronous adoption tail: reset and bind
     *  the candidate. Returns the id the session-switched notice names. */
    adopt(candidate: AgentSession): string;
    /** Exactly once on every exit after `reserve`: keep (commit) or release
     *  what the plan holds. */
    finish?(committed: boolean): void;
}
/** How a backend opens a fresh session for `/new`. */
export interface NewSessionOpener {
    /**
     * What happens to an input still in the channel's FIFO when `/new` adopts
     * (a parked `tui/input` decision, an `@` or IDE read). `true`: it is
     * stale-dropped with a notice and never delivered (DSH, pinned by
     * verify-session-reset-hygiene scenario 8). Absent: the input belongs to
     * the session it was typed in, so `/new` is abandoned instead (a backend
     * handshake can take a minute).
     */
    readonly dropsParkedInputs?: boolean;
    /** Synchronous gate before anything else (throws to refuse). */
    assertAllowed?(): void;
    /** Whether a session can be opened at all; notifies when not. */
    available(): boolean;
    /** Everything between the veto and the open. `undefined` stops quietly
     *  (the binding moved on); a throw becomes the `new-session-failed` notice. */
    plan(target: {
        readonly cwd: string;
    }, current: () => boolean): Promise<NewSessionPlan | undefined>;
}
/** One `/resume` attempt (or a rewind's adoption of its fork) as the
 *  backend opens it. */
export interface ResumeSessionPlan {
    /** Claim the session before it opens (the cross-process mount ledger);
     *  a returned result refuses the resume. Runs once, after the veto. */
    reserve?(): Promise<ResumeResult | undefined>;
    /** Open the session and read its durable history; runs inside the
     *  binding's `prepare`. */
    open(): Promise<AgentSession>;
    /** The backend's half of the synchronous adoption tail (paints the history
     *  read by `open`, then binds). Returns the id the switched notice names. */
    adopt(candidate: AgentSession): string;
    /** Exactly once on every exit after `reserve`: keep or release. */
    finish?(committed: boolean): void;
}
/** How a backend reopens a persisted session (`/resume`, a rewind's fork). */
export interface ResumeSessionOpener {
    plan(target: {
        readonly sessionId: string;
    }): ResumeSessionPlan;
}
export declare function createSessionSwitch(ctx: Pick<ChannelHost, 'logger' | 'dispatchDecision' | 'dispatchNotification'>, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<ChannelBinding, 'session' | 'capture' | 'isCurrent' | 'prepare' | 'abandon' | 'adopt'>;
    state: () => Pick<ChannelState, 'agentId' | 'cwd' | 'displayCwd' | 'working' | 'pending'>;
    notify: ChannelState['notify'];
    withDecisionPending<T>(name: string, pending: Promise<T>): Promise<T>;
    /** What a parked decision's staleness is judged by: the same conversation
     *  across rebinds (default: the session object itself). */
    conversationKey(session: AgentSession): object;
    describeWorkspace(cwd: string): {
        description?: string;
    };
    resetIdeSelection(): void;
    clearStagedImages(): void;
    opener(): NewSessionOpener | undefined;
    /**
     * Monotonic activity of the bound session, compared across the open:
     * inputs dispatched (the input FIFO and `!!`), whether one is still on its
     * way, and live turns started.
     */
    activity(): {
        readonly inputs: number;
        readonly unsettled: boolean;
        readonly turnStarts: number;
        readonly parked?: string;
    };
    /** How `/resume` reopens a persisted session (undefined = unavailable). */
    resumeOpener?(): ResumeSessionOpener | undefined;
    unavailable(name: string): void;
}): {
    sessionSwitchVetoed: (kind: SessionSwitchKind, targetSessionId?: string) => Promise<boolean>;
    notifySessionSwitched: (kind: SessionSwitchedKind, sessionId: string, previousSessionId: string) => void;
    newSession: (target?: NewSessionTarget) => Promise<boolean>;
    resumeSession: (sessionId: string, kind?: "resume" | "rewind") => Promise<ResumeResult>;
};
export type SessionSwitch = ReturnType<typeof createSessionSwitch>;
/** The mount ledger as the core uses it (injectable for regressions). */
export interface SessionMountLedger {
    reserve(key: string): ReturnType<typeof reserveMount>;
    /** Announce a freshly created session (a refusal costs announcement only). */
    announce(key: string): void;
    release(key: string): void;
}
/** The process-wide ledger (`~/.dsh-tui/session-mounts.json`). */
export declare const SESSION_MOUNT_LEDGER: SessionMountLedger;
/**
 * `/new` and `/resume` for a session served by the core alone: the backend's
 * own `open`, the session's history read ahead of the adoption, then the
 * common projection reset, the new session's identity, capability snapshot
 * and command list, the history painted and the bind. The mount ledger holds
 * the backend-qualified key of the bound session (`claude:<id>`): a resume
 * claims it for the whole attempt and refuses one another TUI process holds;
 * a create announces its fresh id; the replaced session's claim is released.
 */
export declare function createBackendOpener(deps: {
    open: NonNullable<ChannelLaunchOptions['openSession']>;
    state: ChannelState;
    rowIds: {
        value: number;
    };
    resetProjection(): void;
    /** Forget the replaced session's subagents and background jobs, and
     *  rebuild the subagent control for the candidate (its capabilities). */
    resetActivity?(candidate: AgentSession): void;
    snapshotOf(session: AgentSession): ChannelCapabilities;
    /** Forget the replaced session's backend commands and reports. */
    resetControls(): void;
    bind(seed: readonly AgentEvent[]): void;
    /** Runs before the bind (core/compose.ts `attachOnAdopt`). */
    attach?(candidate: AgentSession): void;
    /** The bound session (its backend-qualified reference is the ledger key). */
    bound(): AgentSession;
    mounts: SessionMountLedger;
    touch?(sessionId: string): void;
    notify: ChannelState['notify'];
}): {
    create: NewSessionOpener;
    resume: ResumeSessionOpener;
};
//# sourceMappingURL=session-switch.d.ts.map