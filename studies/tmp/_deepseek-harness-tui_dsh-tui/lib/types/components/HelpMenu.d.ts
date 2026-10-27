import React from 'react';
import { type ScrollBoxHandle } from '../ui.js';
import type { LocalCommand } from '../commands.js';
/**
 * The `?` help menu with a three-column shortcut layout, trimmed to the keys
 * dsh-tui actually binds.
 * The command column lists the merged slash-command surface: built-in
 * commands plus plugin-registered ones from the DSH registry (plan/goal/…).
 * Skill entries (user-invocable skills merged for `/` completion, issue
 * #86) are hidden — a skills directory can hold dozens of entries and the
 * menu is for chrome commands. Modifier labels always read ctrl+ (see
 * modLabel): Ctrl works in every terminal, ⌘ is only a macOS alias.
 */
export declare function HelpMenu({ commands, viewportHeight, viewportWidth, scrollRef, onCommandPick, }: {
    commands: readonly LocalCommand[];
    /** Fixed viewport supplied by the prompt overlay; unset for standalone renders. */
    viewportHeight?: number;
    /** Terminal width used to collapse the three-column layout when necessary. */
    viewportWidth?: number;
    /** PromptInput owns keyboard routing and drives this scroll viewport. */
    scrollRef?: React.Ref<ScrollBoxHandle>;
    /**
     * Mouse pick on a command row (fullscreen): fills `/<name> ` into the
     * prompt — the Tab-completion's mouse equivalent. Absent for standalone
     * renders (i18n verifier): rows render exactly as before.
     */
    onCommandPick?: (name: string) => void;
}): React.ReactNode;
//# sourceMappingURL=HelpMenu.d.ts.map