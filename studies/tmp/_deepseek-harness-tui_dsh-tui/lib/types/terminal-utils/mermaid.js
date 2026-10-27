import { colorize } from '../ink/colorize.js';
/**
 * Sources above this length skip the engine: the layout has its own node
 * and edge caps, but the parser still walks every character, and a fence
 * this long is a paste, not a diagram.
 */
const MERMAID_SOURCE_LIMIT = 20_000;
let enginePromise;
let loadedEngine;
async function loadMermaidEngine() {
    try {
        const mod = await import('lovely-mermaid');
        return { render: mod.render };
    }
    catch {
        return null;
    }
}
/**
 * Return the shared engine load promise, starting the lazy load on first call.
 * @returns A promise of the engine, or null when the dynamic import fails.
 */
export function getMermaidEnginePromise() {
    enginePromise ??= loadMermaidEngine().then(engine => {
        loadedEngine = engine;
        return engine;
    });
    return enginePromise;
}
/**
 * Synchronous view of the load: the engine once loaded, null after a failed
 * import, undefined while pending. Lets a mounting component draw the
 * diagram on its first render instead of flashing the source first.
 */
export function peekMermaidEngine() {
    return loadedEngine;
}
/** Whether a fence info string names mermaid (`mermaid`, `Mermaid`, `mermaid title=…`). */
export function isMermaidLang(lang) {
    return lang?.trim().split(/\s+/, 1)[0]?.toLowerCase() === 'mermaid';
}
/**
 * Lay out a mermaid source. `null` follows the engine's contract (blank,
 * unsupported diagram type, nothing parsed) and additionally covers the
 * source-length guard and any engine exception — a third-party parser
 * failing on model output must degrade to the fenced source, never take
 * the transcript down.
 */
export function renderMermaid(engine, source) {
    if (source.length > MERMAID_SOURCE_LIMIT)
        return null;
    try {
        return engine.render(source);
    }
    catch {
        return null;
    }
}
/**
 * Theme key per semantic role. `text` (node labels) is deliberately left
 * unpainted so it inherits the enclosing Text's color — body color in a
 * reply, the dim color inside a folded thinking block.
 */
const ROLE_COLOR = Object.freeze({
    border: 'subtle',
    text: undefined,
    edge: 'permission',
    edgeLabel: 'inactive',
    title: 'subtle',
    none: undefined,
});
/**
 * Paint the art's rows with the active theme, one string per row.
 * `styled[i]` joined is exactly `plain[i]`, so widths are unchanged.
 */
export function paintMermaidArt(art, theme) {
    return art.styled.map(row => row
        .map(span => {
        const key = ROLE_COLOR[span.role];
        return key === undefined ? span.text : colorize(span.text, theme[key], 'foreground');
    })
        .join(''));
}
