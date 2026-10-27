/**
 * CompanionPanel derives mood, interaction animations and bubbles from the
 * channel state. The companion stays at the bottom while status and activity
 * occupy the space above it. A local visible-only tick advances frames and
 * expires temporary reactions; dragging keeps the skin in normal document flow.
 */
import React from 'react';
import type { PanelProps } from '../types.js';
export declare function CompanionPanel({ width, height, focused, visible }: PanelProps): React.ReactNode;
export declare const COMPANION_SKIN_DEFAULT: string;
//# sourceMappingURL=CompanionPanel.d.ts.map