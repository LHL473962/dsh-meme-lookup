import type { AgentCapabilities } from '../../../adapter/ports/channel-capabilities.js';
import type { AgentEvent } from '../../../agent/events.js';
import type { AgentSession } from '../../../agent/session.js';
import { type ChannelActionDelegates } from '../action-readiness.js';
import { type InputConvergence } from '../input-actions.js';
import { type ChannelOwner } from '../owner.js';
import { type ChannelLaunchOptions } from '../state.js';
import type { ChannelState } from '../types.js';
import { type BindingFeedHooks } from './binding-feed.js';
import { type CompletionCatalog } from './files.js';
import { type CoreHost } from './host.js';
import type { ChannelHost } from '../channel-host.js';
import { type NewSessionOpener, type ResumeSessionOpener } from './session-switch.js';
/**
 * What an extension contributes (every member optional; `extend` merges, a
 * later call wins per member, `delegates` merge by action name).
 */
export interface ChannelExtension {
    /** The object a parked decision's staleness is judged by (default: the
     *  session object; DSH: its agent, which rebinds keep across wrappers). */
    conversationKey?(session: AgentSession): object;
    /** Flush deferred projection work before a frame wake; true = the
     *  renderer-visible data changed (DSH: the subagent stream batcher). */
    flushDeferred?(): boolean;
    /** Restore folded rows from the backend's durable history. Its presence
     *  enables folding past the transcript window; absent, the session's
     *  `transcript` capability does (folding only the rows it can restore),
     *  and without either nothing folds. */
    loadOlder?(): number;
    /** The extension projects subagents and background jobs itself (DSH, from
     *  its host services): the core's event-driven activity projection stays
     *  inert and its controls are the extension's. */
    readonly ownsActivity?: boolean;
    /** The extension serves the trajectory surface itself (DSH: the raw
     *  session history is the source): the core's AgentEvent fold stays inert
     *  and its accessors are replaced by the extension's. */
    readonly ownsTrajectory?: boolean;
    /** Whether the local disk stands in for a missing host `fs` service
     *  (default true; the DSH workspace may be remote, so DSH says false). */
    localFs?: boolean;
    /** Rows of extension projections that `/clear` drops with the transcript. */
    dropRows?(): void;
    /** Move a used session to the front of the `/resume` MRU. */
    touchSession?(sessionId: string): void;
    /** Record a resolved git branch against the bound session. */
    noteBranch?(branch: string): void;
    /** Argument catalogs for slash completion. */
    completions?: CompletionCatalog;
    /** What the bound agent's composition mounts (`ChannelUi.capabilities()`;
     *  DSH: resolved from its live services, `../capabilities.ts`). Absent, the
     *  core describes the session from its typed capabilities. */
    agentCapabilities?(): AgentCapabilities;
    /** Hooks into every bind (core/binding-feed.ts). */
    bind?: BindingFeedHooks;
    /** How `/new` opens a fresh session (default: `options.openSession`). */
    newSession?: NewSessionOpener;
    /** How the core `/resume` reopens a persisted session (default:
     *  `options.openSession`; DSH serves `/resume` itself). */
    resumeSession?: ResumeSessionOpener;
    /** Actions served on top of the core's. */
    delegates?: Partial<ChannelActionDelegates>;
    /** Runtime starts around the core's host subscriptions, before the bind. */
    start?: {
        before?(): void;
        after?(): void;
    };
}
/** The core as an extension sees it. */
export type CoreChannel = ReturnType<typeof createCoreChannel>;
export declare function createCoreChannel(ctx: ChannelHost, initialSession: AgentSession, options: ChannelLaunchOptions, owner: ChannelOwner): {
    state: ChannelState;
    owner: {
        current: () => boolean;
        assertActive: () => void;
        readonly cleanupCount: number;
        signal: AbortSignal;
        bind(check: () => boolean): void;
        own(cleanup: () => void): () => void;
        dispose(): void;
    };
    binding: {
        readonly session: AgentSession;
        readonly agent: import("@deepseek-ai/dsh-agent").Agent | undefined;
        readonly handle: import("@deepseek-ai/dsh-agent").AgentHandle | undefined;
        readonly generation: number;
        capture(): import("../binding.js").BindingCapture;
        isCurrent(capture: import("../binding.js").BindingCapture): boolean;
        prepare(capture: import("../binding.js").BindingCapture, create: () => Promise<AgentSession>): Promise<AgentSession>;
        abandon(candidate: AgentSession): Promise<void>;
        releaseOwned(): void;
        waitForDisposal(sessionId: string): Promise<void>;
        adopt: <T>(candidate: AgentSession, capture: import("../binding.js").BindingCapture, tail: (previous: import("../binding.js").BindingCommit, disposition: (next: "dispose" | "park") => void) => T) => T;
        switchTo: <T>(next: AgentSession, tail: (previous: import("../binding.js").BindingCommit, disposition: (next: "dispose" | "park") => void) => T) => T;
        bind(): number;
        subscribe(dispose: () => void): void;
        clearSubscriptions: (afterEach?: () => void) => unknown;
    };
    rowIds: {
        value: number;
    };
    host: CoreHost;
    notify: (text: string, options?: {
        color?: import("../types.js").NotificationItem["color"];
        timeoutMs?: number;
    }) => () => void;
    unavailable: (name: string) => void;
    bookkeeping: {
        warning: {
            value: boolean;
        };
        resetContextWarning: () => void;
        checkContextWarning: () => void;
        trackPending: (message: {
            id: string;
            text: string;
            images?: readonly import("../types.js").ComposerImageRef[];
        }, placement: import("../types.js").PendingMessage["placement"]) => void;
        untrackPending: (messageId: string) => void;
    };
    composer: import("../composer-images.js").ComposerImages;
    input: {
        dispatchUserText: (text: string, placement: import("../types.js").PendingMessage["placement"], images?: readonly import("../types.js").ComposerImageRef[], attach?: import("@deepseek-ai/dsh-llm").UserMessage) => void;
        activity: () => {
            readonly dispatched: number;
            readonly unsettled: boolean;
            readonly parked?: string;
        };
        deliverUserText: (text: string, placement: import("../types.js").PendingMessage["placement"], images?: readonly import("../types.js").ComposerImageRef[], attach?: import("@deepseek-ai/dsh-llm").UserMessage) => void;
        claimAttachments: (messages: readonly import("@deepseek-ai/dsh-llm").UserMessage[]) => import("@deepseek-ai/dsh-llm").UserMessage[];
        retireAttachment: (messageId: string) => void;
        withDecisionPending: <T>(name: string, pending: Promise<T>, origin?: import("../input-delivery.js").UserTextOrigin) => Promise<T>;
        clearStagedImages: () => void;
        stageImage: (input: import("../types.js").StagedImageInput) => Promise<string>;
        stagedImages: () => ReadonlyMap<string, import("../types.js").ChannelImageBlock["attachment"]>;
        composer: import("../composer-images.js").ComposerImages;
    };
    inputConvergence: InputConvergence;
    feed: {
        projector: {
            apply: (events: readonly AgentEvent[], meta: import("../../../agent/events.js").AgentEventMeta) => void;
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
            route: (batch: readonly AgentEvent[], meta: import("../../../agent/events.js").AgentEventMeta, current: () => boolean) => void;
            reconcileRetiredProjection: (status: "idle" | "disposed") => void;
            turnStarts: () => number;
            turnEnds: () => number;
        };
        liveTurnEnds: () => number;
        bind(seed?: readonly AgentEvent[]): void;
        resetProjection: () => void;
        configureProjection(update: Partial<Pick<import("../../../channel/projection.js").ChannelProjectionDeps, "jobs" | "pricingWindow">>): void;
    };
    sessionSwitch: {
        sessionSwitchVetoed: (kind: import("./session-switch.js").SessionSwitchKind, targetSessionId?: string) => Promise<boolean>;
        notifySessionSwitched: (kind: import("./session-switch.js").SessionSwitchedKind, sessionId: string, previousSessionId: string) => void;
        newSession: (target?: import("./session-switch.js").NewSessionTarget) => Promise<boolean>;
        resumeSession: (sessionId: string, kind?: "resume" | "rewind") => Promise<import("../types.js").ResumeResult>;
    };
    local: {
        loadOlder(): number;
        clear(): void;
        pushLocal(title: string, lines: readonly string[], options?: {
            readonly lineLimit?: number;
            readonly preserveWhitespace?: boolean;
        }): void;
        setActivityFrames: (name: string) => boolean;
        runLocalCommand(command: string, includeInContext: boolean): Promise<void>;
    };
    files: {
        fallbackFs: () => import("../types.js").MentionFs | undefined;
        listFileCandidates: (query: string, options?: {
            signal?: AbortSignal;
            topK?: number;
        }) => Promise<readonly import("../../../utils/fileSuggestions.js").FileCandidate[]>;
        listFiles: () => Promise<readonly string[]>;
        commandCompletions(catalog: CompletionCatalog): ChannelState["commandCompletions"];
    };
    reports: {
        doctorInfo: () => string[];
        exportSession: () => string | null;
    };
    resetIdeSelection: () => void;
    refreshGitBranch: () => void;
    /** Merge an extension's contributions (before `start`, or in the adoption window). */
    extend(next: ChannelExtension): void;
    /** Register (before `start`) the adoption-window hook (see `adoptHook`). */
    extendOnAdopt(hook: (session: AgentSession) => void): void;
    /** Install the actions, start the runtime, bind the session. */
    start(): ChannelState;
};
//# sourceMappingURL=compose.d.ts.map