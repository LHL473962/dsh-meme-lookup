import type { Theme } from '../theme.js';
/** highlight.js token classes -> theme syntax tokens. `default` catches
 *  every unmapped class so cli-highlight's own yellow never leaks through
 *  (issue #250, P2-6). */
export declare const SYNTAX_CLASS_TO_TOKEN: Record<string, string>;
/** chalk style for one raw theme value. Accepts every form the theme
 *  loader documents: #rgb, #rrggbb, #rrggbbaa (alpha stripped), rgb() with
 *  or without spaces, ansi256(n), ansi:name (issue #250, P2-5). */
export declare function chalkFromToken(token: string): (text: string) => string;
/** Build the cli-highlight `theme` option from an active theme palette. */
export declare function buildSyntaxTheme(theme: Theme): Record<string, (text: string) => string>;
//# sourceMappingURL=syntaxTheme.d.ts.map