/**
 * Small, shared glyphs used by the terminal UI. Keep this module limited to
 * symbols with active consumers so each visual mark has one clear meaning.
 */
/** Activity bullet: ring on macOS, solid dot elsewhere. */
export declare const BLACK_CIRCLE: string;
/** Prompt pointer, a bold right chevron (`❯`). */
export declare const POINTER = "\u276F";
/** Success checkmark (`✓`). */
export declare const TICK = "\u2713";
/** Settled tool-status dot (`•`). */
export declare const BULLET = "\u2022";
/** Failed tool status (`✗`). */
export declare const MULTIPLICATION_X = "\u2717";
/** Direction markers used by the token counter and navigation affordances. */
export declare const UP_ARROW = "\u2191";
export declare const DOWN_ARROW = "\u2193";
/**
 * Thinking frames share a two-column footprint with the settled anchor. The
 * leading space prevents the label from shifting when the stream settles.
 */
export declare const THINKING_SPINNER_FRAMES: string[];
export declare const THINKING_SPINNER_INTERVAL_MS = 80;
/** Settled marker shown after a reasoning block stops streaming. */
export declare const THINKING_SETTLED_MARKER = "\u2693";
//# sourceMappingURL=figures.d.ts.map