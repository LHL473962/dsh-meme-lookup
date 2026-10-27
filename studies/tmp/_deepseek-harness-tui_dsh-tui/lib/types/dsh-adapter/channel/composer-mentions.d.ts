import type { MentionAttachments, MentionExpansion, MentionFs, MentionImageBlock } from './types.js';
/**
 * Expand a submitted text's `@` mentions (issue #15) into model-facing
 * attachment blocks: supported image files become durable image blocks,
 * other files contribute capped text, and directories contribute a shallow
 * listing. Reads always go through the active fs service, so provider-owned
 * workspaces keep their routing semantics. The typed text stays first and
 * verbatim. Best-effort failures degrade to `missing`, never a failed send.
 *
 * Staged composer images (`[Image #N]`) share ONE admission queue with
 * `@image` files: the earliest reference in the user's text wins both the
 * per-message count and byte budgets, and image blocks preserve that order.
 */
export declare function expandComposerMentions(fs: MentionFs | undefined, cwd: string, text: string, attachments?: MentionAttachments, stagedImages?: ReadonlyMap<string, MentionImageBlock['attachment']>): Promise<MentionExpansion>;
//# sourceMappingURL=composer-mentions.d.ts.map