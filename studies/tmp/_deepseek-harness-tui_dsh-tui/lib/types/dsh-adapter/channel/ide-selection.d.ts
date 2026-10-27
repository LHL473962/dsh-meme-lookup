import type { ChannelSelection, SelectionAttachment } from '../../adapter/ports/channel-view.js';
import type { MentionExpansion, MentionFs } from './types.js';
/**
 * Escape a path for reuse inside a quoted `<attached-file path="…">` attribute:
 * POSIX filenames are legal with `"`, `&`, `<`, `>` — a raw interpolated path
 * could break out of the attribute or smuggle markup into the model-facing
 * block. `&` first so the replacements themselves are not re-escaped.
 */
export declare function escapeSnippetAttr(value: string): string;
/**
 * Build the `<attached-file path="…" selection>` block for an IDE selection:
 * coordinates arrive 0-based inclusive from the extension and convert to
 * sliceLines' 1-based; an endLine past EOF clamps to the last line (the model
 * receives every remaining line), while a startLine past EOF yields undefined
 * — the caller silently skips instead of attaching an empty or stale block.
 * An empty selection is rejected here too so the guard cannot be bypassed.
 */
export declare function buildSelectionBlock(selection: ChannelSelection, content: string): {
    text: string;
    lines: number;
} | undefined;
/**
 * Append the selection's attached-file block to a message's content. Returns
 * what was attached ({lines, path}) or undefined when there is nothing to
 * attach — no selection, or an unresolvable/unreadable file. The caller
 * passes the ENQUEUE-time snapshot (and its fs handle) so a selection made
 * after submit can never attach to the wrong message.
 *
 * Protocol 2 carries the editor buffer's own `text` (unsaved edits
 * included): when present it is attached VERBATIM and the filesystem is not
 * touched — reading the disk copy would hand the model a version the user
 * never saw (maintainer review round 3). The disk read remains only as the
 * protocol-1 fallback.
 */
export declare function attachIdeSelection(blocks: MentionExpansion['blocks'], cwd: string, selection: ChannelSelection | undefined, fs: MentionFs | undefined): Promise<SelectionAttachment | undefined>;
export { replaySelectionAttachment } from '../../channel/selection-record.js';
/**
 * Bounded map from a submitted message id → what its selection attached.
 * The delivery path remembers at submit; the transcript projection reads it
 * when the durable `user/message` event lands (the event carries the same
 * message id) to stamp the row's indicator. FIFO-capped like the other
 * row-keyed caches — ids grow monotonically and a miss only loses the
 * indicator, never the attachment itself.
 */
export declare function createSelectionAttachments(): {
    remember(messageId: string, info: SelectionAttachment): void;
    take(messageId: string): SelectionAttachment | undefined;
};
//# sourceMappingURL=ide-selection.d.ts.map