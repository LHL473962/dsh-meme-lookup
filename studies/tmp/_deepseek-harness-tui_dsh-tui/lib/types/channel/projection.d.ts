/**
 * The shared reducer (docs/agent-backend-design.md): Agent Domain events in,
 * `ChannelState` mutations out, for every backend and for durable replay and
 * the live stream alike. Decoding a backend's native events is not done here:
 * a translator (`src/dsh-adapter/backend/translate.ts` for DSH) produces the
 * `AgentEvent`s; this module only folds them.
 *
 * The DSH projection goldens (`scripts/fixtures/dsh/*.golden.json`) pin its
 * behaviour: attempt start/discard/revive, `seq` idempotency, legacy
 * overlapping-prefix delta merge, thinking preview/full folding, TPS
 * turn/step accounting, token/cost bucketing, compaction context reset,
 * goal/todo/preset/title/colour, question/subagent card suppression and the
 * plugin renderer seam. The order of wall-clock reads is part of that
 * contract (the goldens pin `startedAt`/`durationMs` with a stepping clock).
 */
import type { ChannelUi } from '../adapter/ports/channel-ui.js';
import type { ChatRow, SelectionAttachment, TodoPanelItem } from '../adapter/ports/channel-view.js';
import type { AgentEvent, AgentEventMeta, ContentBlockView } from '../agent/events.js';
import { type PricingWindow } from './usage.js';
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};
/** The channel state slice the projector writes. */
export interface ProjectionState extends Mutable<Pick<ChannelUi, 'thinkingFold' | 'activeToolCount' | 'spinnerMode' | 'goal' | 'contextSegments' | 'tokens' | 'mainCost' | 'model' | 'lastUsage' | 'turnUsage' | 'turnOutcome' | 'lastUserText' | 'responseChars' | 'tps' | 'cancelPending' | 'working' | 'compaction' | 'turnStart' | 'contextWindow' | 'reasoningEffort' | 'sessionTitle' | 'agentPreset' | 'sessionColor' | 'costReport' | 'workingDirectory'>> {
    rows: ChatRow[];
    tpsSamples: {
        tps: number;
        at: number;
    }[];
    todos: TodoPanelItem[];
}
/** Plugin custom-entry renderer (tuiRenderers seam), structurally. */
export interface ProjectionRenderer {
    render(type: string, data: unknown): {
        readonly title?: string;
        readonly lines: readonly unknown[];
    } | undefined;
}
/** Everything the projector needs from its channel. */
export interface ChannelProjectionDeps {
    rowIds: {
        value: number;
    };
    /** Display name of the bound backend; absent keeps the legacy DSH wording. */
    backendLabel?: () => string | undefined;
    resetContextWarning(): void;
    checkContextWarning(): void;
    notify: ChannelUi['notify'];
    /** Background-job registry feed (DSH `jobs` service mirror). */
    jobs: {
        onOutputSeen(id: string, text: string, at?: number): void;
        onStarted(id: string, command: string): void;
    };
    /**
     * The backend-neutral subagent / background-task projection
     * (`./activity.ts`): every `subagent.*` / `task.*` / `tasks.snapshot` event
     * and every child-lane event (`parentCallId` set) is handed to it in stream
     * order, so its transcript cards land where the delegation happened. Child-
     * lane events never reach the main transcript. Absent (a DSH composition,
     * whose specialists own these facts) = nothing is forwarded.
     */
    activity?: {
        apply(event: AgentEvent, replaying: boolean): void;
    };
    /**
     * The core's trajectory fold: every event in stream order, child-lane
     * ones included (their subagent lifecycle still maps onto the parent's
     * ledger), feeds the neutral raw-event source behind `traceEvents()`.
     * Absent (a DSH composition, whose raw history is the source) = nothing
     * is forwarded.
     */
    trajectory?: {
        observe(event: AgentEvent, replaying: boolean): void;
    };
    inputConvergence: {
        cancelInFlight: boolean;
    };
    renderer?: ProjectionRenderer;
    /** What a submitted message's IDE selection attached (keyed by the message
     *  id the durable event carries), for the user row's indicator line. */
    selectionAttached(messageId: string): SelectionAttachment | undefined;
    /**
     * Rate window a usage at `time` bills under. Injected by the backend that
     * owns the pricing policy (DSH: the DeepSeek peak hours); absent → every
     * usage lands in the `idle` bucket.
     */
    pricingWindow?: (time: number) => PricingWindow;
}
/** Joined, trimmed text of every `text` block (what a bubble or card body shows). */
export declare function textOfBlocks(blocks: readonly ContentBlockView[] | undefined): string;
/** Create the shared projector over one channel state. */
export declare function createChannelProjection(state: ProjectionState, deps: ChannelProjectionDeps): {
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
export type ChannelProjection = ReturnType<typeof createChannelProjection>;
export {};
//# sourceMappingURL=projection.d.ts.map