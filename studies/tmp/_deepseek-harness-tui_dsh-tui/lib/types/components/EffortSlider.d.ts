import React from 'react';
import type { EffortOption } from '../dsh-adapter/channel.js';
/**
 * Reasoning-effort slider (`/effort`): a rheostat row of the live route's
 * adapter-owned levels in adapter order, ←/→ moving focus (each move applies
 * immediately through `channel.setEffort` — the slider IS the control; Enter
 * or Esc just closes it). The current level carries `✓`; the focused level's
 * description renders below the row.
 */
export declare function EffortSlider({ options, focusIndex, currentId, levelsFallback, onPick, }: {
    options: readonly EffortOption[];
    focusIndex: number;
    currentId: string | undefined;
    /** True when the ladder is the CLI-standard compatibility offer (the
     *  model row declares no tiers of its own): the note says so — the
     *  levels are applied exactly like a model's own list either way. */
    levelsFallback?: boolean;
    /** Mouse pick (fullscreen): click a tier = move there and live-apply —
     *  the same semantics as the ←/→ keys (the slider IS the control). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=EffortSlider.d.ts.map