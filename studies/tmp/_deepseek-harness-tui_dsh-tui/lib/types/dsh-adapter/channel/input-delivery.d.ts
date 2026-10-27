import { type UserMessage } from '@deepseek-ai/dsh-llm';
import type { AgentSession } from '../../agent/session.js';
import { type ComposerImages } from './composer-images.js';
import type { ChannelHost } from './channel-host.js';
import type { LocalImageStore } from './core/local-images.js';
import type { ChannelOwner } from './owner.js';
import type { AttachedContext, ChannelSelection, SelectionAttachment } from '../../adapter/ports/channel-view.js';
import type { ChannelImageBlock, ChannelState, ComposerImageRef, MentionAttachments, MentionFs, PendingMessage, StagedImageInput } from './types.js';
/** One submission's enqueue-time world: the session it was typed in, the
 *  services that resolve its references, and the capabilities live then. */
export interface UserTextOrigin {
    readonly session: AgentSession;
    readonly agentId: string;
    readonly generation: number;
    readonly cwd: string;
    /** Where `@` mentions resolve: the session's current directory, the same
     *  one the model-facing fs tools use (the project stays `cwd`). */
    readonly workingDirectory: string;
    readonly fs: MentionFs | undefined;
    readonly attachments: MentionAttachments | undefined;
    /** The in-memory image store when the session takes images itself: the
     *  staged references resolve to its facades for `submit`. */
    readonly localImages?: LocalImageStore;
    readonly stagedImages: ReadonlyMap<string, ChannelImageBlock['attachment']>;
    /** Live editor selection AT ENQUEUE (undefined = none). Captured here so a
     *  selection made while the FIFO or mention expansion parks the delivery
     *  can never attach to this message. */
    readonly selection: ChannelSelection | undefined;
    /** "Send to Chat" contexts AT ENQUEUE, already taken off the channel (see
     *  `consumeAttachedContexts`): the same one-shot rule as the selection, and
     *  the reason a chip can never ride along with a second submission. */
    readonly attachedContexts: readonly AttachedContext[];
}
/** Input FIFO, staged attachments and decision notice timers share one lifetime. */
export declare function createInputDelivery(ctx: ChannelHost, owner: ChannelOwner, binding: {
    readonly session: AgentSession;
}, state: () => Pick<ChannelState, 'cwd' | 'workingDirectory' | 'agentId' | 'agentBindingGeneration'>, notify: ChannelState['notify'], trackPending: (message: {
    id: string;
    text: string;
    images?: readonly ComposerImageRef[];
}, placement: PendingMessage['placement']) => void, untrackPending: (id: string) => void, composer: ComposerImages, selection: () => ChannelSelection | undefined, rememberSelection: (messageId: string, info: SelectionAttachment) => void, 
/** The fs surface to use when the host mounts no `fs` service (a non-DSH
 *  composition reads the local disk); absent = no fallback. */
fallbackFs?: () => MentionFs | undefined, 
/** The in-memory image store of a session that takes images itself (the
 *  `images` capability); absent / undefined = the DSH attachments service. */
localImages?: () => LocalImageStore | undefined, 
/**
 * Take-and-clear the staged "Send to Chat" contexts for the submission being
 * enqueued (side-panel §6.7). Optional so a bare embedder/fixture that owns
 * only the decision seam stays constructible; with it absent the origin
 * simply carries no contexts.
 */
consumeAttachedContexts?: () => readonly AttachedContext[]): {
    dispatchUserText: (text: string, placement: PendingMessage["placement"], images?: readonly ComposerImageRef[], attach?: UserMessage) => void;
    /** Inputs dispatched so far, and whether any is still in the FIFO (a
     *  parked decision, an `@` read, an IDE-selection read). */
    activity: () => {
        readonly dispatched: number;
        readonly unsettled: boolean;
        readonly parked?: string;
    };
    deliverUserText: (text: string, placement: PendingMessage["placement"], images?: readonly ComposerImageRef[], attach?: UserMessage) => void;
    claimAttachments: (messages: readonly UserMessage[]) => UserMessage[];
    retireAttachment: (messageId: string) => void;
    withDecisionPending: <T>(name: string, pending: Promise<T>, origin?: UserTextOrigin) => Promise<T>;
    clearStagedImages: () => void;
    stageImage: (input: StagedImageInput) => Promise<string>;
    stagedImages: () => ReadonlyMap<string, ChannelImageBlock["attachment"]>;
    composer: ComposerImages;
};
//# sourceMappingURL=input-delivery.d.ts.map