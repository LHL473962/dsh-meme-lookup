/**
 * A channel's transcript feed, for any backend: the shared projector, the
 * session-batch router that is its only writer, and the bind that follows
 * the bound session.
 *
 * `bind(seed?)` advances the binding generation, resets input convergence,
 * links the session's prompts to the stores Chat renders, and subscribes the
 * router to the captured session. By default it also paints the session's
 * durable history and seeds the session-level facts from the session's
 * capabilities. The history is the `seed` the caller read before the
 * adoption (a resume reads `history()` ahead of the synchronous adopt). It
 * is painted synchronously before the subscription, so no live event can
 * land ahead of it. Without a seed the history is read once,
 * asynchronously, and dropped if live rows painted first. An extension that
 * owns those facts and replays its seed synchronously itself (DSH) sets
 * `ownsSessionFacts`, and adds its raw per-binding listeners through
 * `onBind`.
 */
import type { ChannelHostLogger } from '../channel-host.js';
import type { AgentEvent, AgentEventMeta, AgentEventOf } from '../../../agent/events.js';
import type { AgentSession } from '../../../agent/session.js';
import { type ChannelProjection, type ChannelProjectionDeps } from '../../../channel/projection.js';
import type { BindingCapture, ChannelBinding } from '../binding.js';
import type { InputConvergence } from '../input-actions.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelLaunchOptions } from '../state.js';
import { createTaskCompletion } from '../task-completion.js';
import type { ChannelState } from '../types.js';
import type { SessionControls } from './session-controls.js';
/** What one bind hands an extension's per-binding listeners. */
export interface BindingScope {
    readonly capture: BindingCapture;
    /** Owner live and the binding still the captured one (ABA-safe). */
    current(): boolean;
    /** Own a listener for this binding period (released on the next adoption). */
    register<T extends () => void>(dispose: T): T;
}
/** Extension points of the feed (all optional; see the module comment). */
export interface BindingFeedHooks {
    /** Right after the generation advances (DSH: owner-level child listeners). */
    onGeneration?(): void;
    /** After input convergence resets, before the session subscription. */
    onBind?(scope: BindingScope): void;
    /** After the bind returned (outside its rollback). */
    afterBind?(): void;
    /** The extension maintains the session-level facts and replays its seed
     *  synchronously: no history repaint, no capability observer. */
    readonly ownsSessionFacts?: boolean;
    /** Forget the bound session's translator state with the projector's. */
    resetTranslation?(): void;
    /** A live transaction observes its own progress across foreground rebinds. */
    ownsCompactionProgress?(): boolean;
}
/**
 * The one session-batch writer path, shared by every channel composition:
 * binding-generation fence over the whole batch, session status and
 * pending-queue bookkeeping, compaction-progress gating, then the shared
 * projector and the renderer wake the backend asked for.
 */
export declare function createSessionBatchRouter(deps: {
    state: ChannelState;
    projector: ChannelProjection;
    inputConvergence: InputConvergence;
    /** Drop channel-side context attached to a discarded input (DSH pre-step
     *  attachments); absent where nothing is ever attached. */
    retireAttachment?(messageId: string): void;
    /** The backend reset the conversation in place (`session.reset`, live):
     *  the events before it in the batch are projected first, those after it
     *  land on the cleared view. Absent = the event is projected (ignored). */
    onReset?(event: AgentEventOf<'session.reset'>): void;
    ownsCompactionProgress?(): boolean;
    warn(message: string): void;
    taskCompletion?: ReturnType<typeof createTaskCompletion>;
}): {
    route: (batch: readonly AgentEvent[], meta: AgentEventMeta, current: () => boolean) => void;
    reconcileRetiredProjection: (status: "idle" | "disposed") => void;
    turnStarts: () => number;
    turnEnds: () => number;
};
/**
 * The bind that follows the bound session: shared by the channel feed below
 * and the DSH binding-events owner (which direct regressions drive alone).
 */
export declare function createSessionBinder(deps: {
    owner: ChannelOwner;
    binding: Pick<ChannelBinding, 'bind' | 'capture' | 'isCurrent' | 'subscribe'>;
    state: Pick<ChannelState, 'agentBindingGeneration' | 'status'>;
    inputConvergence: InputConvergence;
    route(batch: readonly AgentEvent[], meta: AgentEventMeta, current: () => boolean): void;
    hooks(): BindingFeedHooks;
    /** Forget the core's trajectory fold before the seed replay paints (a
     * session swap starts an empty raw-event log, exactly like the rows). */
    resetTrajectory?(): void;
    /** The stores a session's prompts park in (`ChannelLaunchOptions.interaction`). */
    interaction?: ChannelLaunchOptions['interaction'];
    /** The session-level facts kept unless the extension owns them. */
    facts?: {
        observe(batch: readonly AgentEvent[], session: AgentSession, current: () => boolean): void;
        /** Paint the history read ahead of the bind (before the subscription). */
        replay(history: readonly AgentEvent[]): void;
        /** After the subscription: `replayed` = the history was already painted. */
        seed(capture: BindingCapture, current: () => boolean, replayed: boolean): void;
    };
}): {
    bind: (seed?: readonly AgentEvent[]) => void;
};
export declare function createBindingFeed(ctx: {
    readonly logger: ChannelHostLogger;
}, deps: {
    owner: ChannelOwner;
    binding: ChannelBinding;
    state: ChannelState;
    options: Pick<ChannelLaunchOptions, 'interaction' | 'onTaskComplete'>;
    inputConvergence: InputConvergence;
    /** The projector's channel-side dependencies; `jobs` and `pricingWindow`
     *  stay writable until the channel starts (`configureProjection`). */
    projection: Omit<ChannelProjectionDeps, 'inputConvergence'>;
    retireAttachment(messageId: string): void;
    controls: SessionControls;
    hooks(): BindingFeedHooks;
    /** A live `session.reset` (see createSessionBatchRouter). */
    onReset?(event: AgentEventOf<'session.reset'>): void;
    /** Passed to the binder: resets the core trajectory fold per bind. */
    resetTrajectory?(): void;
}): {
    projector: {
        apply: (events: readonly AgentEvent[], meta: AgentEventMeta) => void;
        reset: () => void;
        settleStreaming: () => void;
        updateSpinnerMode: () => void;
        contextUsage: () => {
            readonly type: "context.usage";
            readonly used: number;
            readonly max?: number;
            readonly categories?: readonly {
                readonly name: string;
                readonly tokens: number;
                readonly kind: string;
            }[];
        } | undefined;
    };
    router: {
        route: (batch: readonly AgentEvent[], meta: AgentEventMeta, current: () => boolean) => void;
        reconcileRetiredProjection: (status: "idle" | "disposed") => void;
        turnStarts: () => number;
        turnEnds: () => number;
    };
    liveTurnEnds: () => number;
    bind(seed?: readonly AgentEvent[]): void;
    resetProjection: () => void;
    /** Install the backend's job-registry feed and pricing policy (before start). */
    configureProjection(update: Partial<Pick<ChannelProjectionDeps, "jobs" | "pricingWindow">>): void;
};
export type BindingFeed = ReturnType<typeof createBindingFeed>;
//# sourceMappingURL=binding-feed.d.ts.map