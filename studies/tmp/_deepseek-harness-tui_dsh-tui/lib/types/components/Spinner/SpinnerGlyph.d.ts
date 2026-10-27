import React from 'react';
import { type Theme } from '../../theme.js';
type Props = {
    frame: number;
    messageColor: keyof Theme;
    stalledIntensity?: number;
    reducedMotion?: boolean;
    time?: number;
};
/**
 * The animated breathing glyph. Its fixed two-column slot keeps the message
 * aligned while it pulses and while reduced-motion mode is active.
 */
export declare function SpinnerGlyph({ frame, messageColor, stalledIntensity, reducedMotion, time, }: Props): React.ReactNode;
export {};
//# sourceMappingURL=SpinnerGlyph.d.ts.map