export type FrameCause = 'react-commit' | 'animation' | 'scroll' | 'scroll-drain' | 'overlay-shrink' | 'measure' | 'resize' | 'reanchor' | 'immediate';
export declare const GEOMETRY_TRACE_ENABLED: boolean;
export type ScrollGeometryNote = {
    sticky: boolean;
    shrunk: boolean;
    grew: boolean;
    atBottom: boolean;
    /** scrollTop captured before at-bottom follow (the user's logical view). */
    scrollTopBeforeFollow: number;
    /** scrollTop after pendingScrollDelta drain, before clamps. */
    cur: number;
    /** scrollTop written back to the DOM node (post follow/drain, pre virtual clamp). */
    scrollTop: number;
    /** What actually gets painted this frame (post cMin/cMax virtual clamp). */
    renderScrollTop: number;
    scrollHeight: number;
    prevScrollHeight: number;
    innerHeight: number;
    maxScroll: number;
    prevMaxScroll: number;
    clampMin: number | null;
    clampMax: number | null;
};
export type ListGeometryNote = {
    start: number;
    end: number;
    topPad: number;
    bottomPad: number;
    /** Estimated total content height from cached row heights. */
    total: number;
    base: number;
    sticky: boolean;
    pending: number;
    viewport: number;
    termRows: number;
    columns: number;
    rowCount: number;
};
/** Tag the origin of the next painted frame. First note in the window wins. */
export declare function noteFrameCause(cause: FrameCause): void;
/** Renderer-side note, one per ScrollBox encountered during the paint. */
export declare function noteScrollGeometry(note: ScrollGeometryNote): void;
/** React-side note from MessageList's virtualization pass (latest wins). */
export declare function noteListGeometry(note: ListGeometryNote): void;
/** Scalar forensics (PromptInput content rows, …). Latest wins. */
export declare function noteAuxNumber(key: string, value: number): void;
/** Paint begins: just tag the frame id — inter-frame notes belong to it. */
export declare function beginGeometryFrame(frame: number): void;
/** Paint ends: flush one JSON line and reset the inter-frame window. */
export declare function endGeometryFrame(durationMs: number): void;
//# sourceMappingURL=geometry-trace.d.ts.map