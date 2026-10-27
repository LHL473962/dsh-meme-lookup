import React from 'react';
import type { Tokens } from 'marked';
import type { CliHighlight } from '../terminal-utils/cliHighlight.js';
type Props = {
    token: Tokens.Code;
    highlight: CliHighlight | null;
    dimColor: boolean;
    /** Override terminal width (useful for testing). */
    forceWidth?: number;
};
export declare function MermaidDiagram({ token, highlight, dimColor, forceWidth }: Props): React.ReactNode;
export {};
//# sourceMappingURL=MermaidDiagram.d.ts.map