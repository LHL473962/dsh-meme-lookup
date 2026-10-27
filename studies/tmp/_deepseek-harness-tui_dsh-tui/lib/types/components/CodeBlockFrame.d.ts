import React from 'react';
import type { Tokens } from 'marked';
import type { CliHighlight } from '../terminal-utils/cliHighlight.js';
/**
 * Which frame engine renders code fences. `typed` is the default;
 * `DSH_TUI_CODE_FRAME=hybrid` selects the component layout.
 */
export declare function codeFrameEngine(): 'typed' | 'hybrid';
type Props = {
    token: Tokens.Code;
    highlight: CliHighlight | null;
    /** Dim the body (thinking blocks); decorations stay theme-muted. */
    dimColor?: boolean;
    /** Override terminal width (useful for testing). */
    forceWidth?: number;
};
export declare function CodeBlockFrame({ token, highlight, dimColor, forceWidth }: Props): React.ReactNode;
export {};
//# sourceMappingURL=CodeBlockFrame.d.ts.map