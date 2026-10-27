/**
 * The managed plugin dialog (`ctx.tuiDialogs`) — one panel rendering the
 * store's current snapshot in the chat chrome (the slot approval/question
 * panels occupy). Three kinds share one component:
 *
 * - `select`  — focus list (↑/↓, windowed), Enter settles the option id
 * - `confirm` — two rows (confirm/cancel), Enter settles the boolean
 * - `input`   — single-line text edit, Enter settles the text
 *
 * Esc (and Ctrl+C) always cancels — the plugin's promise resolves with the
 * cancelled value. The panel owns the keyboard through its own useInput,
 * the same contract as ApprovalPanel/AskUserQuestionPanel: Chat's global
 * handler early-returns while a snapshot is pending.
 *
 * Two input-pipeline rules shape every handler below:
 *
 * - BATCHED KEYS: a terminal delivers one stdin chunk as several key events
 *   inside a single React batch (Down+Enter arrives together), so state
 *   queued by the first event is NOT visible to the second. Every piece of
 *   editing state the handlers act on (focus, value, cursor) therefore
 *   lives in a ref mutated SYNCHRONOUSLY per event; the useState mirror
 *   only exists to re-render.
 * - CODE POINTS: cursor movement and deletion step over whole code points
 *   (`[...s]` iteration, same contract as the transcript search box), so an
 *   emoji can never be split into a lone surrogate.
 *
 * All text arrives pre-sanitized from TuiDialogRuntime (control chars
 * stripped, cell-width capped); the panel still renders everything through
 * ListItem's single-line truncation.
 */
import React from 'react';
import { type TuiDialogAnswer, type TuiDialogSnapshot } from '../dsh-adapter/dialogs.js';
export type ExtensionDialogProps = {
    /** The pending dialog (TuiDialogStore snapshot; `key` remounts per dialog). */
    readonly dialog: TuiDialogSnapshot;
    readonly onDecide: (value: TuiDialogAnswer) => void;
    readonly onCancel: () => void;
};
export declare function ExtensionDialog({ dialog, onDecide, onCancel }: ExtensionDialogProps): React.ReactNode;
//# sourceMappingURL=ExtensionDialog.d.ts.map