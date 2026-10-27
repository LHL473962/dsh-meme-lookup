/**
 * Mermaid fences → Unicode box-drawing art through `lovely-mermaid`.
 *
 * The engine is pure TypeScript: no browser, no SVG, no image protocol. It
 * lays a diagram out at whatever width it needs and reports that width;
 * fitting it to the viewport (or falling back to the fenced source) is the
 * component's decision. Parsing is best-effort by design, so a streaming
 * prefix keeps drawing instead of flipping between art and source.
 *
 * Like cli-highlight the module loads lazily on the first mermaid fence —
 * most sessions never pay for it.
 */
import type { MermaidArt } from 'lovely-mermaid';
import type { Theme } from '../theme.js';
export type { MermaidArt } from 'lovely-mermaid';
/** The lovely-mermaid surface dsh-tui consumes. */
export type MermaidEngine = Pick<typeof import('lovely-mermaid'), 'render'>;
/**
 * Return the shared engine load promise, starting the lazy load on first call.
 * @returns A promise of the engine, or null when the dynamic import fails.
 */
export declare function getMermaidEnginePromise(): Promise<MermaidEngine | null>;
/**
 * Synchronous view of the load: the engine once loaded, null after a failed
 * import, undefined while pending. Lets a mounting component draw the
 * diagram on its first render instead of flashing the source first.
 */
export declare function peekMermaidEngine(): MermaidEngine | null | undefined;
/** Whether a fence info string names mermaid (`mermaid`, `Mermaid`, `mermaid title=…`). */
export declare function isMermaidLang(lang: string | undefined): boolean;
/**
 * Lay out a mermaid source. `null` follows the engine's contract (blank,
 * unsupported diagram type, nothing parsed) and additionally covers the
 * source-length guard and any engine exception — a third-party parser
 * failing on model output must degrade to the fenced source, never take
 * the transcript down.
 */
export declare function renderMermaid(engine: MermaidEngine, source: string): MermaidArt | null;
/**
 * Paint the art's rows with the active theme, one string per row.
 * `styled[i]` joined is exactly `plain[i]`, so widths are unchanged.
 */
export declare function paintMermaidArt(art: MermaidArt, theme: Theme): string[];
//# sourceMappingURL=mermaid.d.ts.map