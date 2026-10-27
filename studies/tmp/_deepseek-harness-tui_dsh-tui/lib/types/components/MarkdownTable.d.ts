import React from 'react';
import type { Tokens } from 'marked';
import type { CliHighlight } from '../terminal-utils/cliHighlight.js';
type Props = {
    token: Tokens.Table;
    highlight: CliHighlight | null;
    /** Override terminal width (useful for testing). */
    forceWidth?: number;
};
/** Render a markdown table with ANSI-aware cells and a narrow-terminal fallback. */
export declare function MarkdownTable({ token, highlight, forceWidth }: Props): React.ReactNode;
export {};
//# sourceMappingURL=MarkdownTable.d.ts.map