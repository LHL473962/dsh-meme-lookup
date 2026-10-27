import React from 'react';
import type { PermissionPresetOption } from '../dsh-adapter/channel.js';
/**
 * `/permission` sandbox-preset picker. The command itself is registered by
 * the harness side (dsh-sandbox-policy / dsh-base permission-presets row);
 * bare `/permission` opens this picker and Enter dispatches
 * `/permission <preset>` through the same external-command path a hand-typed
 * argument takes. The roster comes from the adapter snapshot so host plugins
 * can contribute additional preset identities without UI changes.
 *
 * DSH's experimental `auto` preset is tagged EXP, and picking it first shows
 * a session-scoped risk confirmation (`confirming`); Chat owns the keys.
 */
export declare function PermissionsPicker({ options, focusIndex, currentValue, cwd, confirming, onPick, onConfirm, onCancelConfirm, }: {
    options: readonly PermissionPresetOption[];
    focusIndex: number;
    currentValue: string | undefined;
    cwd: string;
    /** Show the Auto review risk confirmation instead of the list. */
    confirming?: boolean;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
    /** Mouse confirm / back on the risk confirmation (fullscreen); the
     *  keyboard path stays Enter / Esc in Chat. */
    onConfirm?: () => void;
    onCancelConfirm?: () => void;
}): React.ReactNode;
//# sourceMappingURL=PermissionsPicker.d.ts.map