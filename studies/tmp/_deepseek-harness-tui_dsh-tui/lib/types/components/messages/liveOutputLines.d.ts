/** Live lines a running card shows inline. */
export declare const LIVE_OUTPUT_LINES_INLINE = 5;
/** Live lines a running card shows in fullscreen. */
export declare const LIVE_OUTPUT_LINES_FULLSCREEN = 8;
/** How many live lines a card shows: the whole retained tail when
 *  verbose (Ctrl+O / expanded), else 5 inline and 8 in fullscreen. */
export declare function liveOutputMaxLines(verbose: boolean, fullscreen: boolean): number;
/** What the card renders of a live tail. */
export interface LiveOutputView {
    /** Older lines not shown (dropped by the tail bound, or retained but
     *  above the shown window). */
    readonly omitted: number;
    /** The newest lines, oldest first, each one terminal row. */
    readonly lines: readonly string[];
}
/** One raw output line as the card may paint it (uncut). */
export declare function cleanOutputLine(raw: string): string;
/** Cut a clean line to `width` cells, marking a cut with `…`. */
export declare function fitOutputLine(line: string, width: number): string;
/**
 * Rows the live block of a card paints (the omitted header plus the shown
 * lines): the card's height input for the transcript's layout signature.
 * Scans back at most `maxLines + 1` line breaks, so it stays cheap per
 * frame however long the tail is.
 */
export declare function liveOutputRows(text: string | undefined, dropped: number, maxLines: number): number;
/**
 * The newest `maxLines` lines of a tail, cleaned and fitted to `width`
 * cells, with the count of older lines (`dropped` = lines the tail bound
 * already discarded).
 */
export declare function liveOutputView(text: string, dropped: number, maxLines: number, width: number): LiveOutputView;
//# sourceMappingURL=liveOutputLines.d.ts.map