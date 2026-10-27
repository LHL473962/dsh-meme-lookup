/** Reveal tick cadence — ~30fps, matching oh-my-pi's controller. */
export declare const REVEAL_FRAME_MS: number;
/** Minimum units (code units or lines) advanced per tick while work remains. */
export declare const REVEAL_MIN_STEP = 3;
/** Catch-up bound: the reveal settles any backlog within this many frames. */
export declare const REVEAL_CATCHUP_FRAMES = 8;
/** Adaptive per-frame step for a backlog (exported for tests). */
export declare function revealStep(backlog: number): number;
/** Subscribe to reveal-frame wakeups (MessageList + tool cards). */
export declare function subscribeReveal(listener: () => void): () => void;
/** Snapshot for useSyncExternalStore; bumps once per advancing tick. */
export declare function getRevealVersion(): number;
/** Force-complete (and forget) a cursor: expanded card, replaced view, … */
export declare function snapReveal(key: string): void;
export type RevealReadOptions = {
    /** Master switch (settings `dsh-tui.smoothStreaming`); false = full text. */
    enabled: boolean;
    /**
     * Whether this content arrived "just now" (live streaming row, freshly
     * settled row, live-created tool card). The FIRST read with active=true
     * creates the cursor at zero — that is what turns a one-shot
     * non-streaming delivery into a smooth paint. Reading with active=false
     * (history / replayed content) never creates one: replaying a transcript
     * must not typewrite every row. `active` only matters for cursor creation;
     * settling mid-reveal deliberately keeps revealing (the "non-streaming
     * becomes streaming" contract).
     */
    active: boolean;
};
/**
 * Revealed length of `text` for `key` — the cursor logic of
 * {@link revealTextOf} without the slice allocation (layout signatures read
 * this every render for every visible row).
 */
export declare function revealLengthOf(key: string, text: string, options: RevealReadOptions): number;
/**
 * Revealed prefix of `text` for `key`. Monotonic appends (streaming deltas)
 * keep the cursor; a non-prefix replacement (rewind, folded preview
 * truncation) snaps to the new text — never animate across a discontinuity
 * the reader did not witness as streaming. Feed the result into the
 * streaming renderer (StreamingMarkdown); the monotonic prefix it receives
 * keeps its stable-prefix memoization fully effective.
 */
export declare function revealTextOf(key: string, text: string, options: RevealReadOptions): string;
/**
 * Revealed unit count for `key` over `total` units (tool-card body lines,
 * split-diff rows). A SMALLER total always snaps (content that shrank is a
 * replacement, not an append); growth keeps the cursor. Callers own the
 * append-vs-replace decision for growing totals (pass a fresh key or call
 * {@link snapReveal} when the content behind the same key is replaced).
 */
export declare function revealLinesOf(key: string, total: number, options: RevealReadOptions): number;
/** Clear every cursor/listener/timer (verify scripts between cases). */
export declare function resetRevealForTest(): void;
/** Whether the shared scheduler currently runs (refcount assertions). */
export declare function isRevealTimerRunning(): boolean;
//# sourceMappingURL=smoothReveal.d.ts.map