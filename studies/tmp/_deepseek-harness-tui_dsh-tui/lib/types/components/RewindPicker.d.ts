import React from 'react';
import type { ChatRow } from '../dsh-adapter/channel.js';
import type { TuiRewindMode } from '../dsh-adapter/extension-events.js';
/**
 * Double-Esc rewind picker (double-tap Esc rewinds the selected message and/or
 * conversation to a previous point in time: lists the user's past messages
 * newest-first; selecting one and confirming rewinds the conversation to
 * that point (the message comes back into the input for re-editing).
 *
 * The confirm pane has two shapes: the plain one (Enter rewinds), and —
 * when a plugin answered the tui/rewind-prompt decision with extra modes —
 * a choice list whose option zero is always the built-in conversation-only
 * rewind, followed by the plugin's modes (e.g. "also restore files").
 */
export declare function RewindPicker({ rows, focusIndex, confirmRow, modes, modeIndex, busy, onPickRow, onConfirm, onPickMode, }: {
    rows: readonly ChatRow[];
    focusIndex: number;
    confirmRow: ChatRow | null;
    /** Plugin-offered rewind modes (tui/rewind-prompt); null = plain confirm. */
    modes?: readonly TuiRewindMode[] | null;
    /** Focused option in the modes list (0 = conversation-only). */
    modeIndex?: number;
    /** True while the plugin decision is in flight. */
    busy?: boolean;
    /**
     * Mouse pick on a list row (fullscreen): sets focus only — rewind is a
     * high-risk invisible-confirm operation, so stepping into the confirm
     * state stays an explicit keyboard Enter.
     */
    onPickRow?: (index: number) => void;
    /** Mouse click on the plain confirm row: executes the rewind directly —
     *  the confirm pane itself is the explicit confirmation layer. */
    onConfirm?: () => void;
    /** Mouse pick on a modes-list option: executes that mode directly. */
    onPickMode?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=RewindPicker.d.ts.map