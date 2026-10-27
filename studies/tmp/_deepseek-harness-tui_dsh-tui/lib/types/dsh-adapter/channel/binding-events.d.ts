import type { Agent, AssistantStreamFrame } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import type { ChannelProjection } from '../../channel/projection.js';
import { type BindingScope } from './core/binding-feed.js';
import type { InputConvergence } from './input-actions.js';
import type { DshChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import type { createModelSelection } from './model-selection.js';
import type { ChannelState } from './types.js';
/**
 * Foreground transcript listeners capture a binding generation: the bound
 * `AgentSession`'s event batches feed the shared projector, and the DSH
 * specialists read the raw main-session events through `native.dsh`. Child
 * (subagent) event listeners instead span the Channel owner, keeping parked
 * reducers current across rebinds. Both paths own registrations incrementally
 * and fence retained callbacks; only the projector presents the foreground
 * transcript.
 */
export declare function createBindingEvents(ctx: Context, deps: {
    owner: ChannelOwner;
    binding: DshChannelBinding;
    state: ChannelState;
    /** Read the activity projection's current value for a freshly bound session.
     *  A projection value only arrives when it changes, so a resumed or
     *  reattached session needs this read to show its line before the next event.
     *  The line's semantics live in the working-activity plugin: this app folds
     *  nothing itself and forwards no events. */
    seedActivity?(session: unknown): void;
    /** Read the context-occupancy projection's current value for a freshly bound
     *  session, for the same reason (and with the same plumbing) as
     *  `seedActivity`: the value only arrives when it changes, so a resumed
     *  session needs one baseline read to show its occupancy before the next
     *  request reports usage. */
    seedContextOccupancy?(session: unknown): void;
    seedTeam?(session: unknown): void;
    inputConvergence: InputConvergence;
    modelSelection: ReturnType<typeof createModelSelection>;
    modelActions: {
        applyPreferredEffort(preserveSessionEffort?: boolean): Promise<void>;
    };
    modeActions: {
        refreshMode(): void;
        onSessionEvent(session: unknown, event: unknown): void;
        /** Seed an untouched session with the persisted permission preference
         *  (permissionPrefs.ts); fire-and-forget on bind, never rejects. */
        applyRememberedPermission(): Promise<void>;
    };
    projector: ChannelProjection;
    subagents: {
        onSessionEvent(session: unknown, event: unknown): boolean;
        onStreamFrame?(agent: unknown, frame: AssistantStreamFrame): boolean;
        onStart(info: {
            id: string;
            runId?: string;
            provider: string;
            local?: boolean;
        }, parent: object | null): void;
        onEnd(info: {
            id: string;
            runId?: string;
            stopReason: string;
            lastAssistantMessage?: unknown[];
        }, parent: object | null): void;
        forget?(agent: Agent): void;
    };
    /** The job projection's own raw-event half: it times the card hold a tool
     *  call puts on the job it registers (see channel/job-projection.ts). */
    jobs?: {
        onSessionEvent(event: unknown): void;
    };
    agentView: {
        schedule(): void;
    };
    messageObserver?: {
        publish(session: unknown, event: unknown): void;
    };
    /** Seed the upstream auto-retry policy (upstream-retry.ts) for the
     *  provider route this session actually uses; fire-and-forget on bind,
     *  never rejects, never blocks. Optional for direct/embed constructors
     *  that bring no settings seam. */
    seedUpstreamRetry?(provider: string | undefined): void;
    /** Drop a pre-step attachment registered by this channel for one message id
     *  (input-delivery's `retireAttachment`); see the discard hook below.
     *  Optional for direct/embed constructors that never emit inbox discards;
     *  channel.ts always wires it. */
    retireAttachment?(messageId: string): void;
    /** The session's current directory moved (DSH `working-directory/change`),
     *  called once the projector has folded the move. Directory-scoped views
     *  (skill commands, loaded context) re-read against it. */
    onWorkingDirectoryChange?(): void;
}): {
    bind: (seed?: readonly import("../../agent/events.js").AgentEvent[]) => void;
    hooks: {
        ownsSessionFacts: true;
        onGeneration(): void;
        onBind({ capture, current, register }: BindingScope): void;
    };
};
export { createSessionBatchRouter } from './core/binding-feed.js';
//# sourceMappingURL=binding-events.d.ts.map