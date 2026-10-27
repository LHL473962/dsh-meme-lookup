/**
 * Render-work counters: plain integer increments on the markdown and text
 * hot paths, cheap enough to leave on. verify-markdown-codebox-performance
 * reads them to assert that sealed blocks cause no work per streaming
 * frame.
 *
 * - formatToken: markdown token dispatches (lexer token to ANSI).
 * - codeHighlight: cli-highlight calls from formatCodeBody.
 * - wrapCompute: text wraps not served by the wrap cache.
 * - measureCompute: text measurements not served by dom.ts' node cache.
 */
export type RenderWorkCounters = {
    formatToken: number;
    codeHighlight: number;
    wrapCompute: number;
    measureCompute: number;
};
export declare const renderWork: RenderWorkCounters;
export declare function resetRenderWork(): void;
/**
 * Per-source format attribution. Only populated while enabled: the map
 * pins every formatted source string in memory, which is fine for a test
 * fixture and unacceptable as an always-on cost.
 */
export declare const formatSourceCounts: Map<string, number>;
export declare function setTrackFormatSources(enabled: boolean): void;
/** Count one markdown dispatch, optionally attributing it to its source. */
export declare function noteFormatToken(raw: string): void;
/** Count one real syntax-highlight invocation. */
export declare function noteCodeHighlight(): void;
/** Count one real text wrap computation (not served from cache). */
export declare function noteWrapCompute(): void;
/** Count one text measurement beyond the per-node cache. */
export declare function noteMeasureCompute(): void;
//# sourceMappingURL=render-stats.d.ts.map