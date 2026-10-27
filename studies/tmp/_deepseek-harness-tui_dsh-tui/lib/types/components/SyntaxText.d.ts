import React from 'react';
import type { Color } from '../ink/styles.js';
type Props = {
    readonly text: string;
    readonly language?: string;
    /** Complete payload used for lexing; text is the visible line. */
    readonly sourceText?: string;
    readonly lineIndex?: number;
    readonly color?: Color;
    readonly dimColor?: boolean;
};
/** Async nested Text renderer. Lexes the complete payload before splitting. */
export declare function SyntaxText({ text, language, sourceText, lineIndex, color, dimColor }: Props): React.ReactNode;
export {};
//# sourceMappingURL=SyntaxText.d.ts.map