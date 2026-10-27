import type { AttachedContext } from '../../adapter/ports/channel-view.js';
import type { MentionExpansion } from './types.js';
/** What a panel hands to {@link AttachedContextRegistry.attach}: the staged
 *  projection minus the fields the channel derives itself (id/chars/truncated). */
export type AttachedContextInput = Pick<AttachedContext, 'source' | 'sourceId' | 'title' | 'content'>;
/**
 * Cell the registry writes through — the live ChannelState. The list is
 * REPLACED on every change (never mutated in place), which is both what the
 * projection wants (a fresh array per revision) and what the port's readonly
 * element type allows the channel state to hold.
 */
export interface AttachedContextHolder {
    attachedContexts: readonly AttachedContext[];
}
/**
 * Build one model-facing block, shaped like the selection channel's
 * `<attached-file …>`: escaped attributes, one body, the close tag. The
 * attribute values reuse `escapeSnippetAttr` — a title or source id carrying
 * `"`/`&`/`<`/`>` must not break out of the attribute or smuggle markup
 * into the model-facing block.
 */
export declare function buildAttachedContextBlock(context: AttachedContext): string;
/**
 * Append every staged context as its own block, in stage order (the order the
 * chips render in), after the typed text and every other attachment. The caller
 * passes the ENQUEUE-time snapshot: a panel that stages something while the
 * delivery FIFO is parked can never ride along with a message it was not typed
 * for. Returns how many blocks were appended (telemetry/assertions).
 */
export declare function appendAttachedContextBlocks(blocks: MentionExpansion['blocks'], contexts: readonly AttachedContext[]): number;
/** The ChannelState-facing surface (projection writes + the two actions). */
export interface AttachedContextRegistry {
    /** Stage (or re-stage) one panel context; see the REPLACE note below. */
    attach(input: AttachedContextInput): void;
    /** Drop one staged context by id (unknown id = no-op, no emit). */
    detach(id: string): void;
    /**
     * Take-and-clear in one step: the submission that captured the snapshot owns
     * exactly those contexts. Splitting snapshot/clear would let a second
     * submission — or a queued skill command — capture chips the first one
     * already spent (the draft takes the same "spent at submit" semantics).
     */
    consume(): readonly AttachedContext[];
}
/**
 * Registry behind `ChannelUi.attachedContexts` / `attachContext` /
 * `detachContext`. It owns no state of its own: every entry lives in the
 * channel state's array, so the session-scoped reset that clears the other
 * projections (`resetSessionProjection`) clears this one by assignment.
 *
 * Duplicate `sourceId` + `title` REPLACES the existing entry (keeping its id
 * and position) instead of stacking a second chip: a panel row re-sent after it
 * changed — or sent twice by a double 's' keypress — is the same attachment, and
 * a stable id keeps chip keys and any future detach-by-sender valid across the
 * update. Distinct titles under one id stay separate chips.
 */
export declare function createAttachedContextRegistry(holder: () => AttachedContextHolder, emit: () => void): AttachedContextRegistry;
//# sourceMappingURL=attached-context.d.ts.map