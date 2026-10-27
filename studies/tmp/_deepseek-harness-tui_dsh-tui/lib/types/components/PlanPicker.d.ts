import React from 'react';
/**
 * `/plan` on/off picker. The command itself is registered by dsh-plan-mode
 * on the harness side; bare `/plan` opens this picker (with the current
 * state marked) and Enter dispatches `/plan` or `/plan off` through the
 * same external-command path a hand-typed argument takes.
 */
export declare function PlanPicker({ focusIndex, currentOn, onPick, }: {
    focusIndex: number;
    currentOn: boolean;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=PlanPicker.d.ts.map