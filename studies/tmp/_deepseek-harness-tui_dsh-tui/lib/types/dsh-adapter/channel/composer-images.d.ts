import type { ServiceLookup } from './channel-host.js';
import type { LocalImageStore } from './core/local-images.js';
import type { ChannelOwner } from './owner.js';
import type { ChannelImageBlock, MentionAttachments, ComposerImageRef, StagedImageAdjustment, StagedImageHandle, StagedImageInput, TranscriptImage } from './types.js';
/** Every visible composer placeholder token, in source order. */
export declare const COMPOSER_IMAGE_TOKEN: RegExp;
/** One whole placeholder token; the distinction matters because a mention
 *  reference needs an `@` prefix while an image token must stay verbatim. */
export declare const COMPOSER_IMAGE_TOKEN_EXACT: RegExp;
export declare const formatMissingReference: (reference: string) => string;
/** Resolve only capabilities explicitly carried by this draft, in first
 *  textual-occurrence order. The visible token is presentation, never
 *  identity: raw history/rewind text has no stageId and therefore resolves
 *  to nothing even if a later draft happens to display the same number. */
export declare function orderedComposerImages<T>(text: string, refs: readonly ComposerImageRef[], staged: ReadonlyMap<string, T>): Map<string, T>;
/** The FIRST placeholder in `text` that resolved to no live capability: an
 *  evicted (FIFO cap) or foreign draft's token would otherwise ship as plain
 *  text with no image attached. Callers warn once and deliver unchanged. */
export declare function firstStaleComposerToken(text: string, ordered: ReadonlyMap<string, unknown>): string | undefined;
export interface ComposerImageLimits {
    readonly maxImageBytes: number;
    readonly maxImagesPerMessage: number;
    /** Per-side intrinsic pixel cap mirrored from the upstream store so the
     *  ingress gate can resample before staging (issue #938). */
    readonly maxImageDimension: number;
    /** Total-pixel cap ditto. */
    readonly maxImagePixels: number;
}
/** The composer's staged-image capability store plus its draft-binding rules. */
export interface ComposerImages {
    /** Current composer generation. Async paste continuations capture this
     *  before I/O and must not mutate a different session's draft. */
    stagedImageGeneration(): number;
    /** Validate and persist an image, returning the historical scene-facing
     *  `[Image #N]` token accepted by submit/steer/registry commands. */
    stageImage(input: StagedImageInput): Promise<string>;
    /** Draft-safe composer companion: bind persistence to one session epoch
     *  and return an opaque capability whose visible label belongs to Prompt. */
    stageComposerImage(input: StagedImageInput, generation: number): Promise<StagedImageHandle>;
    hasStagedImage(stageId: string): boolean;
    discardStagedImage(stageId: string): void;
    stagedImage(stageId: string): TranscriptImage | undefined;
    stagedImageLimits(): ComposerImageLimits | undefined;
    /** Revoke every capability of the session being replaced and bump the
     *  generation so in-flight saves cannot register into the new one. */
    clearStagedImages(): void;
    /** Immutable view of the live capabilities (stageId → durable reference). */
    snapshot(): ReadonlyMap<string, ChannelImageBlock['attachment']>;
    /** Add scene-era token bindings only when the caller did not supply an
     *  explicit draft capability for that visible token. */
    includeLegacyImageRefs(text: string, images: readonly ComposerImageRef[]): readonly ComposerImageRef[];
    /** Enqueue-time capture: legacy bindings merged, one object per ref. */
    captureDraftImages(text: string, images: readonly ComposerImageRef[]): readonly ComposerImageRef[];
}
/** A controlled admission refusal, safe to expose alongside a failed mention. */
export declare class ImageAdmissionError extends Error {
}
/** Shared paste/mention admission; the returned attachment is the store's truth. */
export declare function saveAdmittedImage(attachments: MentionAttachments, input: StagedImageInput): Promise<{
    attachment: ChannelImageBlock['attachment'];
    adjustment?: StagedImageAdjustment;
}>;
/**
 * Owns the editable-composer image capabilities: the session epoch, the
 * capability map, its preview facades and the `[Image #N]` compatibility
 * bindings minted by the public scene `stageImage()` API.
 */
export declare function createComposerImages(ctx: ServiceLookup, owner: ChannelOwner, deps: {
    generation(): number;
    /** An empty startup id adopts its first real session without losing the draft. */
    sessionId?(): string;
    /** The in-memory store of a session that takes images itself (a
     *  backend with the `images` capability); undefined = the DSH
     *  attachments service. */
    localImages?(): LocalImageStore | undefined;
}): ComposerImages;
//# sourceMappingURL=composer-images.d.ts.map