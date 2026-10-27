import React from 'react';
import type { ToolRow } from '../../dsh-adapter/channel.js';
import type { ToolBackground } from '../../tuiDisplayPrefs.js';
import type { Theme } from '../../theme.js';
import type { ClickEvent } from '../../ink/events/click-event.js';
type Props = {
    tool: ToolRow;
    /** Adds the top margin between messages. */
    marginTopOnTurn: boolean;
    /** Ctrl+O verbose: show full args/result instead of previews. */
    verbose: boolean;
    /** Message-selection mode highlight. */
    isSelected?: boolean;
    /** Row expanded on its own (persistent hover-grey background). */
    isExpanded?: boolean;
    /**
     * Mouse click (fullscreen): toggles the row's expansion — same action as
     * clicking other transcript rows. Also makes the localized ctrl+o expand
     * hint (lines-folded-expand) actionable with the mouse.
     */
    onClick?(event: ClickEvent): void;
    /**
     * Trajectory pointer, rendered as one more `⎿` line under a failed call.
     *
     * It appears on the NEWEST unseen failure only, so a session with a dozen
     * failed calls still shows exactly one pointer — the moment of failure is
     * where the trajectory is worth mentioning, and mentioning it twelve times
     * is worth less than mentioning it once.
     */
    footnote?: string;
    /** Diff presentation preference; `auto` picks by terminal width. */
    diffLayout?: 'auto' | 'split' | 'unified';
    /** Background treatment for the ordinary, unselected tool card surface. */
    toolBackground?: ToolBackground;
    /**
     * Click-to-act (fullscreen): opens the file-action menu for the tool's
     * file path. When provided, the path in the card header (and diff path
     * rows) renders underlined and clickable; the click stops propagation so
     * the row's own fold-toggle does not fire.
     */
    onOpenFile?: (path: string) => void;
    /**
     * Terminal-card header folding (settings `dsh-tui.foldTerminalCommand`):
     * collapsed cards keep the command title's first source line plus a
     * `+N lines` hint; verbose/expanded cards render the full title.
     */
    foldTerminalCommand?: boolean;
    /**
     * Smooth streaming reveal (settings `dsh-tui.smoothStreaming`): the card
     * BODY (diff hunks / write content — model-authored prose, not tool
     * output) paints through an even ~30fps line reveal when it first appears,
     * instead of one jarring block. Only the pending CALL view animates; the
     * settled result view paints complete (real output is progress, not
     * prose), and so do replayed cards.
     */
    smoothReveal?: boolean;
    /** Live-arrived row (channel `fresh`): gates reveal participation —
     *  replayed cards must paint complete. */
    fresh?: boolean;
    /** Reveal version supplied by MessageList to avoid one store subscriber per card. */
    revealVersion?: number;
    /** The transcript window cap folded this row's source: full args/result
     *  payloads were dropped (the session log retains them) and only previews
     *  remain — the expanded card says so instead of passing the preview off
     *  as the full text. */
    sourceFolded?: boolean;
    /** Fullscreen layout: a running card shows more live output lines
     *  (`tool.liveOutput`: 8 instead of 5; the whole retained tail when
     *  verbose/expanded). */
    fullscreen?: boolean;
};
export declare function toolNameColor(raw: string, category?: 'mutate' | 'exec' | 'other'): keyof Theme;
/**
 * Tool-call card: `● Edit /path` header with a blinking status dot, then the
 * structured body under a `  ⎿  ` gutter — diff hunks in red/green, terminal
 * output, read content — instead of the raw result dump. The channel captures
 * the structured views per call.
 */
export declare function AssistantToolUseMessage({ tool, marginTopOnTurn, verbose, isSelected, isExpanded, onClick, footnote, diffLayout, toolBackground, onOpenFile, foldTerminalCommand, smoothReveal, fresh, revealVersion, sourceFolded, fullscreen, }: Props): React.ReactNode;
export {};
//# sourceMappingURL=AssistantToolUseMessage.d.ts.map