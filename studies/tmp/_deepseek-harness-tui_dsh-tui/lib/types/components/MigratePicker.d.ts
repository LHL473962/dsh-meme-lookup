import React from 'react';
import type { MigratePickerRow } from '../dsh-adapter/migrate/picker.js';
/**
 * `/migrate` source picker (multi-select, PRD revision): each row shows a
 * checkbox, the scannable file count, and a recent-activity badge. Keys
 * (Chat owns the logic): space toggles the focused source, `a` selects
 * all/none, Enter proceeds to the confirmation layer with the checked set
 * (the focused row when nothing is checked), Esc closes. While the rows are
 * still being collected it says so — the scan takes a moment on real stores
 * and "no sources available" would be a lie in that window.
 */
export declare function MigratePicker({ rows, focusIndex, checked, loading, onPick, }: {
    rows: readonly MigratePickerRow[];
    focusIndex: number;
    /** Checked agent ids (multi-select state lives in Chat). */
    checked: ReadonlySet<string>;
    /** Rows still loading: render the scanning line, not the empty state. */
    loading?: boolean;
    /** Mouse pick (fullscreen): toggle the clicked row's checked state. */
    onPick?: (index: number) => void;
}): React.ReactNode;
/**
 * The second confirmation layer (PRD #2): one line per checked source with
 * its scannable count and the repeat-safe note. Keys (Chat): Enter imports,
 * `d` dry-runs, Esc returns to the picker with the checked set preserved.
 */
export declare function MigrateConfirm({ rows, }: {
    rows: readonly MigratePickerRow[];
}): React.ReactNode;
//# sourceMappingURL=MigratePicker.d.ts.map