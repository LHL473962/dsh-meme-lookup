import React from 'react';
import { type ScrollBoxHandle } from '../ui.js';
import { type TimelineTurn } from '../ink/timeline-rail.js';
/**
 * Timeline rail: the fullscreen transcript's turn navigator — a 2-column
 * gutter REPLACING the classic scrollbar (Grok Build's timeline sidebar,
 * ported to the dsh Ink tree).
 *
 *  - one tick per user turn; tick position encodes conversation order,
 *    not scroll proportion (a long answer must not skew the timeline);
 *  - the tick of the turn owning the viewport top row (the turn being
 *    read — same anchor the sticky prompt header pins) renders as `━━`;
 *    hovering a tick widens it to `──` and pops a preview card left of
 *    the rail; idle ticks are a short dim ` ─`;
 *  - ▲ / ▾ step between turns by STRICT geometry (nearest prompt above /
 *    below the viewport top — never `active ± 1`, which can name a turn
 *    no scroll reaches), so a dim chevron is always a guaranteed no-op;
 *  - clicking a tick (or chevron) jumps by content coordinate — the
 *    prompt's measured top — no element seek, no force-mount race;
 *  - more turns than rows: the window slides around the active tick, and
 *    pins to the tail while at the bottom (never excluding active);
 *  - hidden below 60 terminal columns, under 2 turns, under 3 viewport
 *    rows, or when the content fits (inline mode keeps the terminal's
 *    native scrollback).
 *
 * The whole 2-column width is the hit target; the rail is fenced with
 * NoSelect so click-drag text selection never picks up its glyphs, and
 * the wheel scrolls the transcript (the rail has no scroll of its own).
 */
export declare function TimelineRail({ handle, turns, activeId, upId, downId, terminalWidth, hoverEnabled, onRevealTurn, }: {
    handle: ScrollBoxHandle | null;
    /** Turns in conversation order (MessageList's measured snapshot). */
    turns: ReadonlyArray<TimelineTurn>;
    /** Turn owning the viewport top row (rail highlight target). */
    activeId: number | null;
    /** ▲ target: nearest turn strictly above the viewport top. */
    upId: number | null;
    /** ▼ target: nearest turn below the viewport top that a scroll can
     *  still bring to the top row. */
    downId: number | null;
    terminalWidth: number;
    /** False while a modal overlay owns the screen — suppress the hover
     *  card (the rail itself stays, but stops narrating). */
    hoverEnabled: boolean;
    /**
     * Reveal-and-seek for FOLDED turns (older than the recent-rows window):
     * Chat expands the fold (showAll) and seeks through the force-mount
     * path — the row's top is unknown until it mounts, so the coordinate
     * jump below does not apply to it.
     */
    onRevealTurn: (rowId: number) => void;
}): React.ReactNode;
//# sourceMappingURL=TimelineRail.d.ts.map