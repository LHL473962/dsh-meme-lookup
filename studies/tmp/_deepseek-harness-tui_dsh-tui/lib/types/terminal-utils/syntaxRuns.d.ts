import type { CliHighlight } from './cliHighlight.js';
import type { Theme } from '../theme.js';
export type SyntaxRun = {
    readonly text: string;
    readonly color?: string;
};
export type SyntaxLines = readonly (readonly SyntaxRun[])[];
type SyntaxTheme = Theme | Record<string, (text: string) => string>;
/** Parse ANSI once, preserving active syntax colors over embedded newlines. */
export declare function parseAnsiRuns(text: string): SyntaxRun[];
export declare function splitRunsToLines(runs: readonly SyntaxRun[]): SyntaxLines;
/** Highlight complete text, then split it; unsupported or failed languages are plain. */
export declare function highlightLines(text: string, language: string | undefined, highlighter: CliHighlight | null, theme: SyntaxTheme | undefined, themeSig: string): SyntaxLines | undefined;
export declare function syntaxThemeSignature(theme: Theme): string;
export {};
//# sourceMappingURL=syntaxRuns.d.ts.map