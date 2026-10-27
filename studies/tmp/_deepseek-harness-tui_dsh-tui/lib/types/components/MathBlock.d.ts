import React from 'react';
import { type MathToken } from '../terminal-utils/math.js';
type Props = {
    token: MathToken;
    dimColor: boolean;
    /** Override terminal width (useful for testing). */
    forceWidth?: number;
};
export declare function MathBlock({ token, dimColor, forceWidth }: Props): React.ReactNode;
/** A theme color as `#rrggbb`, or undefined for ANSI names the image cannot match. */
export declare function themeInkHex(color: string): string | undefined;
export {};
//# sourceMappingURL=MathBlock.d.ts.map