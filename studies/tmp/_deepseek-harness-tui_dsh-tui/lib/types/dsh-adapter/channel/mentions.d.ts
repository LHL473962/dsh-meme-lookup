import type { ServiceLookup } from './channel-host.js';
import type { MentionAttachments, MentionExpansion, MentionFs, MentionImageBlock, MentionImageMediaType, ResolvedMention } from './types.js';
/** One attached file's contribution is capped so an absent-minded `@` of a
 *  huge file cannot blow the context window. */
export declare const MENTION_MAX_FILE_CHARS = 50000;
/** Total budget across all attachments in one message. */
export declare const MENTION_MAX_TOTAL_CHARS = 200000;
/** A directory mention contributes a shallow listing, capped at this many
 *  entries. */
export declare const MENTION_MAX_DIR_ENTRIES = 200;
/** The leaf's fs service in the shape mention expansion needs; undefined
 *  when the plugin is not mounted (mentions then stay literal text). */
export declare function mentionFs(ctx: ServiceLookup): MentionFs | undefined;
export declare function mentionAttachments(ctx: ServiceLookup): MentionAttachments | undefined;
export declare const MENTION_IMAGE_MEDIA_TYPES: Readonly<Record<string, MentionImageMediaType>>;
export declare function mentionImageMediaType(path: string): MentionImageMediaType | undefined;
/** Resolve+stat one candidate path; undefined when it throws OR stats
 * absent — both are a miss for strip-first mention resolution (issue #359). */
export declare function tryResolveMention(fs: MentionFs, absolute: string): Promise<ResolvedMention | undefined>;
/**
 * Expand a submitted text's `@` mentions (issue #15) into model-facing
 * attachment blocks: supported image files become durable image blocks,
 * other files contribute capped text, and directories contribute a shallow
 * listing. Reads always go through the active fs service, so provider-owned
 * workspaces keep their routing semantics. The typed text stays first and
 * verbatim. Best-effort failures degrade to `missing`, never a failed send.
 */
export declare function expandMentions(fs: MentionFs | undefined, cwd: string, text: string, attachments?: MentionAttachments, stagedImages?: ReadonlyMap<string, MentionImageBlock['attachment']>): Promise<MentionExpansion>;
//# sourceMappingURL=mentions.d.ts.map