import React from 'react';
import { type Theme } from '../../theme.js';
import type { SpinnerMode } from './spinnerMode.js';
type Props = {
    message: string;
    mode: SpinnerMode;
    messageColor: keyof Theme;
    glimmerIndex: number;
    flashOpacity: number;
    shimmerColor: keyof Theme;
    stalledIntensity?: number;
};
/** The status message with a grapheme-safe, theme-aware moving highlight. */
export declare function GlimmerMessage({ message, mode, messageColor, glimmerIndex, flashOpacity, shimmerColor, stalledIntensity, }: Props): React.ReactNode;
export {};
//# sourceMappingURL=GlimmerMessage.d.ts.map