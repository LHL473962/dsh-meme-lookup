import React from 'react';
/**
 * `/tips` usage-tips panel (inline-pane form like the local pickers and the
 * /btw panel): grouped one-line tips on shortcuts, commands, workflow,
 * display, and gotchas. Owns the keyboard while open — every key it sees is
 * consumed here.
 *
 * The panel is a static list (no paging): the ScrollBox keeps it bounded,
 * and tips are intentionally one-liners so the whole pool stays scannable.
 */
export declare function TipsPanel({ onClose }: {
    onClose: () => void;
}): React.ReactNode;
//# sourceMappingURL=TipsPanel.d.ts.map