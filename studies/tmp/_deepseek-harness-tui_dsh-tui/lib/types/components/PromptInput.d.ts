import React from 'react';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
import type { ComposerImageRef } from '../dsh-adapter/channel.js';
import type { TranscriptImage } from '../dsh-adapter/transcript-images.js';
import { type PromptDraftCache } from './promptDraftCache.js';
export { sanitizeEditableText, sanitizePastedText } from '../utils/inputPaste.js';
/** Capabilities referenced by `text`, in first occurrence order. A raw token
 * restored from disk/history has no sidecar entry and therefore stays inert. */
export declare function composerImageRefsForText(text: string, stagedByToken: ReadonlyMap<string, string>): ComposerImageRef[];
/**
 * Live composer handle for Chat's global key rules and external draft actions.
 * Chat listens first, so delegated editing actions stay with their state owner.
 * Populated after each commit; null while unmounted or suspended.
 */
export interface PromptController {
    hasText(): boolean;
    /** The draft text, for a caller that must not lose it (see {@link PromptDraftCache}). */
    text(): string;
    /** Current capability-backed draft images in token order, without reads. */
    previewImages?(): readonly {
        image: TranscriptImage;
        title: string;
    }[];
    clear(): void;
    /**
     * Append `text` at the end of the input (external injection channel; see
     * dsh-adapter/inject-channel.ts). Unlike `fillText`, which replaces the
     * whole value, this accumulates — matching OpenCode's `tui.prompt.append`
     * so repeated editor sends build one prompt. Returns the resulting value.
     */
    append(text: string): string;
    /**
     * Copy the active mouse selection to the system clipboard (OSC 52 + the
     * native fallback) and KEEP the selection for further editing. Returns
     * true when a selection existed and consumed the key; Chat's Ctrl+C
     * branch calls this first, before its clear/exit semantics.
     */
    consumeSelectionCopy(): boolean;
    /** Consume a local overlay/editor Esc before Chat's working-turn interrupt. */
    consumeEscape(): boolean;
    /** Toggle vim editing mode (`/vim`); returns the new state (true = on). */
    toggleVim(): boolean;
    /** True while vim mode is on (either submode). Esc belongs to vim then —
     *  Chat's working-turn Esc interrupt must yield in BOTH submodes. */
    vimActive(): boolean;
}
/**
 * Owner-held slot for the composer draft, so a screen that unmounts the
 * prompt (every early return in Chat) does not discard what the user typed.
 *
 * The composer writes ONE complete snapshot as it unmounts and consumes it on
 * the way back; the shape and the reasoning live in `promptDraftCache.ts`.
 */
export interface PromptInputProps {
    channel: Channel;
    /** Keep the draft mounted while another prompt-slot panel owns the UI. */
    suspended?: boolean;
    /**
     * 原生终端光标（IME 预编辑/读屏锚点）的让位：侧栏持有键盘焦点时传
     * false——主输入框停驻硬件光标会让输入法的临时拼音浮在主聊天框，即使
     * 按键已经路由进面板。聚焦的面板自己的输入组件（如 btw 的 composer）
     * 会接管声明。默认 true（无侧栏/焦点在聊天时行为不变）。
     */
    cursorParking?: boolean;
    /**
     * Host judgement "this notice needs no toast" — the pet panel says it with
     * its speech bubble instead while it is the active panel. Evaluated during
     * render (not via an effect-written ledger) so toast and bubble swap in
     * the same commit without a one-frame flash. Errors are never suppressed.
     */
    toastSuppressed?: (item: Channel['notifications'][number]) => boolean;
    /**
     * Owner-held slot for the unsent draft.
     *
     * The prompt owns its text in local state, and several screens REPLACE the
     * conversation (the session screen, the session tree, settings, the jobs and
     * subagent panels, the trajectory scene) — early returns that unmount this
     * component and would take a half-written prompt down with it. Chat owns the
     * slot, so the text, its caret AND its image bindings survive that unmount
     * and come back when the composer does. The owner also drops it on a session
     * change, so a draft can never leak into a different conversation.
     *
     * Nothing is written from render: a commit-time assignment would run before
     * the restore effect has read the slot and overwrite the draft with the
     * empty first value.
     */
    draftCache?: PromptDraftCache;
    /**
     * The input can take keys: draft adoption has run and the listener above is
     * live. Fires on mount when already unsuspended, and again whenever
     * `suspended` lifts — a caller replaying keys captured during a screen swap
     * must hold its queue until then, because a replay emitted while suspended
     * is dropped by `isActive: !suspended` with nothing left to retry it.
     */
    onInputReady?: () => void;
    /** Whether the `?` help menu is open (state lives in the Chat screen). */
    helpOpen: boolean;
    onToggleHelp(): void;
    /**
     * Execute a slash command (built-in or plugin-registered) with its raw
     * argument text; returns false when the input should be sent to the model.
     */
    onRunCommand(name: string, rawInput: string, images: readonly ComposerImageRef[]): boolean | Promise<boolean>;
    /** Message-selection mode (Shift+↑): the input ignores keys while active. */
    selectionActive: boolean;
    /**
     * External fill from the ctrl+r history dialog: when this prop changes to
     * a non-null string, the input replaces its value and moves the caret to
     * the end. The caller clears it via onFillConsumed once consumed.
     */
    fillText?: string | null;
    onFillConsumed?(): void;
    /** Double-tap Esc with an empty input: open the rewind picker. */
    onRewindRequest?(): void;
    /**
     * ← on an EMPTY prompt opens the session manager. DSH backgrounds the
     * session first; other backends keep it attached. With text, ← moves the caret.
     */
    onBackgroundRequest?(): void;
    /**
     * Open the session screen (the one `/resume`, `/agentview` and `/home`
     * share) from the `⌂` entry at the head of the input row.
     *
     * Optional on purpose: the entry is rendered ONLY when this is provided, so
     * hosts that mount the prompt without a session screen — and the layout
     * regressions that pin this row's column budget — keep exactly the row they
     * had before.
     */
    onOpenSessions?(): void;
    /**
     * 当前内核的**短品牌名**（选择器目录里那一行的 `manifest.shortLabel`，宿主经
     * Chat 透传）：只用在「这条命令当前后端不支持」的提示里，与内核选择器、落地页
     * 铭牌同一份来源（P0 D2——界面里不再有 id→名字表）。
     *
     * 不复用 `channel.backendCapabilities.backendLabel`：那是**会话后端自己的全名**
     * （后端 `descriptor.label`，如 "Claude Agent"），而这里是宿主词表给内核起的短名
     * （"Claude"）；两者在真机上恰好都可用，但短名才是选择器那一屏的用词。缺席 =
     * 退回原样 backendId（不猜品牌名）。
     */
    backendLabel?: string;
    /**
     * Background sessions waiting on the user (agent view "needs input" rows
     * excluding this session); the prompt footer shows the
     * "← N agents" hint when provided (hidden when undefined).
     */
    backgroundAgentsNeedingInput?: number;
    /** Filled with the live controller each render (see PromptController). */
    controllerRef?: React.RefObject<PromptController | null>;
    /**
     * The staged image the caret is on — at a token's start, where the whole
     * token inverts — or undefined once it leaves; reported whenever that changes (`'caret'`),
     * and again on every click on a token (`'click'`, even when unchanged) so
     * the caller can re-show a preview the user dismissed. `title` is the
     * token without brackets (`Image #2`). Reported as undefined while the
     * prompt is suspended and on unmount.
     */
    onCaretImage?(image: TranscriptImage | undefined, title: string | undefined, reason: 'caret' | 'click'): void;
    /**
     * True while the caller shows the caret-driven preview. Esc then goes to
     * `onDismissCaretPreview` after help and before ordinary editing (the
     * "close the image preview" rung). Chat can delegate through the prompt
     * controller; the prompt remains active under a caret preview.
     */
    caretPreviewOpen?: boolean;
    onDismissCaretPreview?(): void;
    /**
     * Clock seam for the draft undo's 700ms idle coalescing. Defaults to
     * `Date.now`; the regression harness passes a hand-advanced clock so the idle
     * rule is exercised without a wall-clock sleep (which would be flaky).
     */
    now?: () => number;
}
/**
 * dsh-TUI prompt input: rounded border box (top+bottom borders
 * only), `❯ ` prompt char (dimmed while a turn is working), the text with a
 * native cursor at the editing position, and above it the slash-command /
 * file-completion suggestion card (SuggestionCard: rounded panel with the
 * selected row behind a `❯` pointer in the theme's `suggestion` color).
 *
 * Empty input: a caret on a reserved blank cell and nothing else — no
 * placeholder text, so the terminal-painted IME preedit (pinyin) at the
 * parked cursor can never be overlaid on anything.
 *
 * Multi-line: Shift+Enter inserts a newline; ↑/↓ move between lines while
 * the input spans multiple lines (history/command selection otherwise); the
 * visible window scrolls to keep the caret row on screen past
 * MAX_VISIBLE_LINES. Enter submits, backspace/delete edit, ←/→ move the
 * cursor, Tab completes the selected command, Ctrl+G opens the draft in the
 * external editor ($VISUAL/$EDITOR), Escape clears (or closes the help
 * menu), `?` toggles the help menu. Windows ConPTY pipelines deliver
 * whole lines with the Enter key lost: a trailing CR/LF in the input marks
 * a complete line to submit.
 *
 * Enter submits immediately even while the model is streaming — as a STEER
 * (Codex/pi semantics): the message is injected at the next step boundary
 * of the running turn and the agent continues without aborting; Tab instead
 * queues the message for after the turn (followup). Both appear in a
 * pending preview above the input until delivered. Alt+Up pulls the last
 * pending message back for editing; Esc (with pending messages while
 * working) interrupts the turn and delivers them right away; Ctrl+Enter
 * aborts the turn and sends the current input immediately.
 */
export declare function PromptInput({ channel, toastSuppressed, suspended, cursorParking, draftCache, onInputReady, helpOpen, onToggleHelp, onRunCommand, selectionActive, fillText, onFillConsumed, onRewindRequest, onBackgroundRequest, onOpenSessions, backendLabel, backgroundAgentsNeedingInput, controllerRef, onCaretImage, caretPreviewOpen, onDismissCaretPreview, now, }: PromptInputProps): React.JSX.Element | null;
//# sourceMappingURL=PromptInput.d.ts.map