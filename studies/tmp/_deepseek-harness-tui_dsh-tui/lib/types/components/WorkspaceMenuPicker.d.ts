import React from 'react';
/**
 * Bare `/workspace` action menu: the built-in subcommands (resume / rename /
 * open) plus any dynamically registered workspace extensions. Enter runs the
 * focused action through the same paths a hand-typed subcommand takes;
 * actions needing free text (rename/open) fall back to their usage notice.
 */
export declare function WorkspaceMenuPicker({ options, focusIndex, onPick, }: {
    options: readonly {
        id: string;
        label: string;
        description: string;
    }[];
    focusIndex: number;
    /** Mouse pick (fullscreen): reports the clicked row's index — Chat
     *  applies it with the same code path as the keyboard Enter. */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=WorkspaceMenuPicker.d.ts.map