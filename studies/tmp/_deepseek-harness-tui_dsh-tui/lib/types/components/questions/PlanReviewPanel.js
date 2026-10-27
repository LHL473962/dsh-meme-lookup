import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * The plan-review panel — exit-plan-mode decision card
 * for the DSH user-interaction seam. plan-mode's `exit_plan_mode` tool asks
 * through `ctx.userQuestions` with `intent: { kind: 'plan-review',
 * approve }`: the plan markdown arrives in `detail`, the approve/decline
 * choices in `options` (labels verbatim — the protocol answers with the
 * asker's own labels).
 *
 * Protocol-exact answer mapping (dsh-plan-mode):
 * - Approve: `{ selected: [intent.approve] }` — custom MUST be absent, or
 *   plan-mode treats it as keep-planning-with-feedback. An asker may name
 *   further approving options (`intent.approveAlso`, e.g. Claude's "approve,
 *   but keep asking for edits"): they follow the same clean-answer rule.
 * - Keep planning / feedback: `{ selected: [declineLabel], custom? }` where
 *   declineLabel is `intent.decline` when the asker names it, else the first
 *   option that does not approve (dsh-plan-mode names none).
 * - Esc / Ctrl+C: the store rejects with ASK_CANCELLED, which plan-mode
 *   reads as "the user dismissed the review to speak instead".
 *
 * Paste works on the feedback row like the composer: Ctrl+V/Alt+V (the
 * keymap `paste` binding) reads the system clipboard, and a bracketed
 * paste inserts its chunk — newlines/control chars flatten to spaces, and
 * pasted content NEVER picks an option or approves (a pasted digit or a
 * chunk of line breaks is text, not a quick-pick or an Enter). Editing
 * state (value + caret) lives in refs mutated synchronously per event —
 * one stdin chunk is one React batch, and the clipboard read resolves
 * asynchronously — with the caret counting code points so an emoji can
 * never be split by ←/→/⌫/Del (same contract as the plugin InputDialog).
 */
import React from 'react';
import { t } from '../../i18n.js';
import { Box, Text, useInput, ScrollBox, useTerminalSize } from '../../ui.js';
import { useDeclaredCursor, useNativeCursor } from '../../ink/hooks/use-declared-cursor.js';
import { Divider } from '../design-system/Divider.js';
import { Markdown } from '../Markdown.js';
import { POINTER } from '../../terminal-utils/figures.js';
import { isPlainReturnInput } from '../../utils/modifiers.js';
import { actionMatches, comboDisplay, primaryComboString } from '../../utils/keymap.js';
import { flattenPasteInline } from '../../dsh-adapter/sanitize.js';
import { readClipboard } from '../../utils/clipboard.js';
const PENCIL = '✎';
/**
 * Paste cap for the feedback field, in code points — twin constant of
 * AskUserQuestionPanel's ANSWER_PASTE_MAX_POINTS (same input contract):
 * typing is naturally bounded, but a stray Ctrl+V of a file/log must not
 * inflate the feedback row or ship a megabyte `custom`. Generous on
 * purpose; the inline error names the bound.
 */
const ANSWER_PASTE_MAX_POINTS = 8000;
export function PlanReviewPanel({ question, onAnswer, onCancel, readClipboardOverride, }) {
    const options = question.options ?? [];
    const approveLabel = question.intent?.approve ?? options[0]?.label;
    const approveAlso = question.intent?.approveAlso ?? [];
    const approves = (label) => label !== undefined && (label === approveLabel || approveAlso.includes(label));
    const declineLabel = question.intent?.decline ?? options.find(option => !approves(option.label))?.label;
    /** Rows: the asker's options plus the feedback input row at the tail. */
    const rowCount = options.length + 1;
    const [focusIndex, setFocusIndex] = React.useState(0);
    const [feedback, setFeedback] = React.useState('');
    const [cursor, setCursor] = React.useState(0);
    const [error, setError] = React.useState(null);
    // Synchronous source of truth for the handlers (see the module header):
    // one stdin chunk is one React batch, and the clipboard read resolves
    // asynchronously — the state mirrors exist only to re-render.
    const textRef = React.useRef('');
    const cursorRef = React.useRef(0);
    /** Single choke point for every text/caret mutation: refs first, then the
     *  state mirrors so the render sees the committed value. */
    const applyFeedback = (nextText, nextCursor) => {
        textRef.current = nextText;
        cursorRef.current = nextCursor;
        setFeedback(nextText);
        setCursor(nextCursor);
    };
    /** True while the component is mounted (async clipboard continuation
     *  guard: the panel can unmount when the user answers first). */
    const mountedRef = React.useRef(true);
    React.useEffect(() => () => { mountedRef.current = false; }, []);
    /** True while a clipboard read is in flight (ignore repeat Ctrl+V). */
    const pasteBusyRef = React.useRef(false);
    const clipboardReader = readClipboardOverride ?? readClipboard;
    const { rows: terminalRows } = useTerminalSize();
    // Chat chrome (status line) + panel scaffolding (divider, question,
    // spacings, hint) consume twelve rows before the plan body — same
    // constant as AskUserQuestionPanel. Option/feedback/error rows are
    // charged on top so a long markdown detail cannot push them off-screen.
    // A definite `height` (not just maxHeight) is required: otherwise the
    // ScrollBox grows with the markdown and scrollBy is a no-op.
    const optionRows = options.reduce((sum, option) => sum + (option.description === undefined ? 1 : 2), 0) + 1 /* extra gap on the focused option */ + 1; /* feedback row */
    const reservedRows = 12 + optionRows + (error === null ? 0 : 2);
    // Floor at zero, not four: on a short terminal the decision rows fill the
    // budget and no plan-body rows remain. Forcing four here would re-inflate
    // the panel past the viewport and push the controls off-screen again — the
    // exact regression this panel exists to prevent. When nothing remains, the
    // body viewport is omitted entirely (a zero-height ScrollBox is neither
    // readable nor a useful wheel target).
    const detailMax = Math.max(0, terminalRows - reservedRows);
    const detailScrollRef = React.useRef(null);
    const inputFocused = focusIndex === options.length;
    // Park the native terminal cursor on the feedback caret so IME preedit
    // (pinyin) renders inline at the input instead of the screen's bottom row
    // (same mechanism as AskUserQuestionPanel / PromptInput). Always active —
    // typing on an option row also lands in the feedback buffer. The ref rides
    // on the caret Text itself (all visual variants): its nodeCache rect IS
    // the caret cell, so (0, 0) stays exact under wrapping without a
    // layout-affecting wrapper Box.
    const nativeCursor = useNativeCursor();
    const caretRef = useDeclaredCursor({ line: 0, column: 0, active: true, visible: nativeCursor && inputFocused });
    const moveFocus = (delta) => {
        setFocusIndex(index => (index + delta + rowCount) % rowCount);
        setError(null);
    };
    /** Typing anywhere appends to the feedback buffer and focuses the input
     *  row — plan review has no "attach" semantics: approve must be clean. */
    const appendFeedback = (text) => {
        applyFeedback(textRef.current + text, cursorRef.current + [...text].length);
        setFocusIndex(options.length);
        setError(null);
    };
    const backspaceFeedback = () => {
        const points = [...textRef.current];
        const at = cursorRef.current;
        if (at <= 0)
            return;
        points.splice(at - 1, 1);
        applyFeedback(points.join(''), at - 1);
    };
    /**
     * Paste-path entry shared by both transports (bracketed-paste chunk and
     * the async clipboard read). Newlines/control chars flatten to spaces; a
     * chunk with nothing visible inserts nothing, and one past the cap is
     * refused (never truncated). Where the text lands mirrors plain typing:
     * at the caret while the feedback row is focused, otherwise appended at
     * the tail with the input row focused (typing on an option row behaves
     * exactly that way). NEVER a quick-pick or submit.
     * @returns 'ok' | 'empty' (nothing visible to insert) | 'too-long'
     */
    const insertPastedFeedback = (raw, atCaret) => {
        const text = flattenPasteInline(raw);
        if (text.trim() === '')
            return 'empty';
        if ([...text].length > ANSWER_PASTE_MAX_POINTS)
            return 'too-long';
        const points = [...textRef.current];
        const at = atCaret ? cursorRef.current : points.length;
        points.splice(at, 0, ...text);
        applyFeedback(points.join(''), at + [...text].length);
        if (!atCaret)
            setFocusIndex(options.length);
        return 'ok';
    };
    /** Inline error for an over-cap paste (shared by both transports). */
    const pasteTooLongError = () => t('question-paste-too-long', { n: ANSWER_PASTE_MAX_POINTS });
    /** Ctrl+V/Alt+V arm: read the system clipboard and insert its text. */
    const pasteFromClipboard = () => {
        if (pasteBusyRef.current)
            return;
        pasteBusyRef.current = true;
        // Capture which landing the keypress asked for (typing on an option
        // row appends + focuses); the read resolves later, after the user may
        // have moved focus or typed (the refs make either safe).
        const atCaret = inputFocused;
        void clipboardReader()
            .then(content => {
            if (!mountedRef.current)
                return;
            if (content === null || content.kind === 'unavailable') {
                setError(t(content === null ? 'input-clipboard-empty' : 'input-clipboard-unavailable'));
                return;
            }
            if (content.kind !== 'text') {
                // File/image offers have no text form in a feedback field.
                setError(t('question-paste-not-text'));
                return;
            }
            if (content.text === '') {
                setError(t('input-clipboard-empty'));
                return;
            }
            const result = insertPastedFeedback(content.text, atCaret);
            setError(result === 'too-long' ? pasteTooLongError() : null);
        })
            .catch(() => {
            if (mountedRef.current)
                setError(t('input-clipboard-read-failed'));
        })
            .finally(() => {
            pasteBusyRef.current = false;
        });
    };
    /** The decline answer: the other option's label when the asker named one,
     *  else an empty selection (plan-mode reads any non-approve as decline). */
    const declineSelected = () => declineLabel !== undefined ? [declineLabel] : [];
    /** Enter on an option row. Approve with feedback in the buffer is an
     *  error — the protocol would silently read it as keep-planning. */
    const submitOption = (index) => {
        const label = options[index]?.label;
        if (label === undefined)
            return;
        const text = textRef.current.trim();
        if (approves(label) && text !== '') {
            setError(t('plan-review-approve-needs-empty'));
            return;
        }
        if (approves(label)) {
            onAnswer({ selected: [label] });
            return;
        }
        onAnswer({ selected: [label], ...(text !== '' ? { custom: text } : {}) });
    };
    /** Enter on the feedback row: text routes to keep-planning-with-feedback;
     *  empty is a plain keep-planning. */
    const submitFeedback = () => {
        const text = textRef.current.trim();
        onAnswer({ selected: declineSelected(), ...(text !== '' ? { custom: text } : {}) });
    };
    useInput((input, key, event) => {
        // Steal the wheel while this panel is mounted so Chat's fallback cannot
        // scroll the transcript. Position-first already hits the ScrollBox when
        // the pointer is over it; this covers the option/hint rows and any
        // dispatchWheelAt miss. Up/Down stay on the decision rows.
        if (key.wheelUp || key.wheelDown) {
            detailScrollRef.current?.scrollBy(key.wheelUp ? -3 : 3);
            event.stopImmediatePropagation();
            return;
        }
        if (key.escape || (key.ctrl && input === 'c')) {
            onCancel();
            return;
        }
        // ── Paste ─────────────────────────────────────────────────────────
        // A bracketed paste arrives as ONE chunk flagged isPasted. Where it
        // lands mirrors plain typing: at the caret on the feedback row, else
        // appended at the tail with the feedback row focused. It NEVER picks
        // an option — a pasted digit or an all-line-breaks chunk is text, not
        // a quick-pick or an Enter press (isPlainReturnInput refuses pastes).
        if (key.isPasted === true) {
            if (input !== '') {
                const result = insertPastedFeedback(input, inputFocused);
                setError(result === 'too-long' ? pasteTooLongError() : null);
            }
            return;
        }
        // Clipboard paste (default Ctrl+V / Alt+V — the keymap `paste`
        // binding, remappable in /settings): raw mode hands the key to the
        // app, so the clipboard is read here (mirrors the composer's arm).
        if (actionMatches('paste', input, key)) {
            pasteFromClipboard();
            return;
        }
        if (inputFocused) {
            if (key.upArrow) {
                moveFocus(-1);
                return;
            }
            if (key.downArrow) {
                moveFocus(1);
                return;
            }
            if (isPlainReturnInput(input, key)) {
                submitFeedback();
                return;
            }
            if (key.backspace) {
                backspaceFeedback();
                return;
            }
            if (key.delete) {
                const points = [...textRef.current];
                const at = cursorRef.current;
                if (at < points.length) {
                    points.splice(at, 1);
                    applyFeedback(points.join(''), at);
                }
                return;
            }
            if (key.leftArrow) {
                applyFeedback(textRef.current, Math.max(0, cursorRef.current - 1));
                return;
            }
            if (key.rightArrow) {
                applyFeedback(textRef.current, Math.min([...textRef.current].length, cursorRef.current + 1));
                return;
            }
            if (key.home) {
                applyFeedback(textRef.current, 0);
                return;
            }
            if (key.end) {
                applyFeedback(textRef.current, [...textRef.current].length);
                return;
            }
            if (!key.ctrl && !key.meta && input) {
                // Ordinary typing at the live caret (a text run may carry several
                // characters in one event — e.g. an unbracketed terminal paste).
                const points = [...textRef.current];
                const at = cursorRef.current;
                points.splice(at, 0, ...input);
                applyFeedback(points.join(''), at + [...input].length);
                setError(null);
            }
            return;
        }
        // An option row.
        if (key.upArrow) {
            moveFocus(-1);
            return;
        }
        if (key.downArrow) {
            moveFocus(1);
            return;
        }
        if (isPlainReturnInput(input, key)) {
            submitOption(focusIndex);
            return;
        }
        if (key.backspace) {
            if (textRef.current !== '')
                backspaceFeedback();
            return;
        }
        if (!key.ctrl && !key.meta && input) {
            // Number quick-pick submits the option outright — but only with an
            // empty buffer; with feedback pending, digits are feedback chars.
            const digit = /^[1-9]$/.test(input) ? Number(input) : 0;
            if (textRef.current === '' && digit >= 1 && digit <= options.length) {
                submitOption(digit - 1);
                return;
            }
            appendFeedback(input);
        }
    }, { isActive: true });
    // The caret counts code points (see the module header), so the caret
    // char and the visual split index into the point array — never raw
    // UTF-16 offsets, which could land inside a surrogate pair.
    const feedbackPoints = [...feedback];
    const cursorChar = cursor < feedbackPoints.length ? feedbackPoints[cursor] : ' ';
    /** Mouse: click a decision row = focus it + submit (same as Enter). */
    const [hoverIndex, setHoverIndex] = React.useState(-1);
    const clickOption = (index) => {
        setFocusIndex(index);
        submitOption(index);
    };
    /** Mouse: click the feedback row to focus it. */
    const focusFeedbackRow = () => {
        setFocusIndex(options.length);
        setError(null);
    };
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 2, paddingRight: 2, width: "100%", children: [_jsx(Divider, { color: "permission", title: ` ${question.header ?? t('plan-review-fallback-header')} ` }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, wrap: "wrap", children: question.question }), question.detail !== undefined && detailMax > 0 && (_jsx(Box, { flexDirection: "column", marginTop: 1, height: detailMax, flexShrink: 0, children: _jsx(ScrollBox, { ref: detailScrollRef, flexDirection: "column", flexGrow: 1, height: detailMax, children: _jsx(Markdown, { children: question.detail }) }) }))] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [options.map((option, index) => {
                        const focused = index === focusIndex;
                        const isApprove = approves(option.label);
                        return (_jsxs(Box, { flexDirection: "row", marginTop: focused ? 1 : 0, onClick: () => clickOption(index), onMouseEnter: () => setHoverIndex(index), onMouseLeave: () => setHoverIndex(current => (current === index ? -1 : current)), backgroundColor: hoverIndex === index && !focused ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Box, { width: 1, flexShrink: 0, children: _jsx(Text, { color: focused ? 'accent' : undefined, bold: focused, children: focused ? POINTER : ' ' }) }), _jsxs(Box, { flexDirection: "column", marginLeft: 1, children: [_jsxs(Text, { bold: focused, color: focused || isApprove ? 'accent' : undefined, wrap: "wrap", children: [index + 1, ". ", option.label] }), option.description !== undefined && (_jsx(Text, { dimColor: true, wrap: "wrap", children: option.description }))] })] }, option.label));
                    }), _jsxs(Box, { flexDirection: "row", marginTop: inputFocused ? 1 : 0, onClick: focusFeedbackRow, onMouseEnter: () => setHoverIndex(options.length), onMouseLeave: () => setHoverIndex(current => (current === options.length ? -1 : current)), backgroundColor: hoverIndex === options.length && !inputFocused ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Box, { width: 1, flexShrink: 0, children: _jsx(Text, { color: inputFocused ? 'accent' : undefined, bold: inputFocused, children: inputFocused ? POINTER : ' ' }) }), _jsx(Box, { width: 1, flexShrink: 0, children: _jsx(Text, { color: inputFocused ? 'accent' : 'suggestion', children: PENCIL }) }), _jsx(Box, { flexDirection: "row", marginLeft: 1, children: feedback === '' && !inputFocused ? (_jsxs(_Fragment, { children: [_jsx(Text, { ref: caretRef, children: ' ' }), _jsx(Text, { dimColor: true, children: t('plan-review-feedback-placeholder') })] })) : (_jsxs(_Fragment, { children: [_jsx(Text, { wrap: "wrap", children: feedbackPoints.slice(0, cursor).join('') }), inputFocused
                                            ? _jsx(Text, { ref: caretRef, inverse: !nativeCursor, children: cursorChar })
                                            : _jsx(Text, { ref: caretRef, children: "\u258F" }), _jsx(Text, { wrap: "wrap", children: feedbackPoints.slice(inputFocused ? cursor + 1 : cursor).join('') })] })) })] })] }), error !== null && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "error", children: error }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: t('plan-review-hint', { paste: comboDisplay(primaryComboString('paste')) }) }) })] }));
}
