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
export const renderWork = {
    formatToken: 0,
    codeHighlight: 0,
    wrapCompute: 0,
    measureCompute: 0,
};
export function resetRenderWork() {
    renderWork.formatToken = 0;
    renderWork.codeHighlight = 0;
    renderWork.wrapCompute = 0;
    renderWork.measureCompute = 0;
}
/**
 * Per-source format attribution. Only populated while enabled: the map
 * pins every formatted source string in memory, which is fine for a test
 * fixture and unacceptable as an always-on cost.
 */
export const formatSourceCounts = new Map();
let trackSources = false;
export function setTrackFormatSources(enabled) {
    trackSources = enabled;
    if (!enabled)
        formatSourceCounts.clear();
}
/** Count one markdown dispatch, optionally attributing it to its source. */
export function noteFormatToken(raw) {
    renderWork.formatToken++;
    if (trackSources)
        formatSourceCounts.set(raw, (formatSourceCounts.get(raw) ?? 0) + 1);
}
/** Count one real syntax-highlight invocation. */
export function noteCodeHighlight() {
    renderWork.codeHighlight++;
}
/** Count one real text wrap computation (not served from cache). */
export function noteWrapCompute() {
    renderWork.wrapCompute++;
}
/** Count one text measurement beyond the per-node cache. */
export function noteMeasureCompute() {
    renderWork.measureCompute++;
}
