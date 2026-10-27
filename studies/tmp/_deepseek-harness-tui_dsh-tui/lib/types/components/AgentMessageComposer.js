import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, InputCaret, useInput } from '../ui.js';
import { t } from '../i18n.js';
import { isPlainReturnInput } from '../utils/modifiers.js';
import { agentMessageStateColor, agentMessageStateText, agentMessageViaText } from './messages/TranscriptLeaves.js';
/** The control's stable failure reason → the notice word. */
const NOTICE_OF_REASON = {
    unavailable: 'agent-message-unavailable',
    'target-ambiguous': 'agent-message-target-ambiguous',
    'not-resumable': 'agent-message-target-not-resumable',
    'parent-unavailable': 'agent-message-parent-unavailable',
    unauthorized: 'agent-message-unauthorized',
    'delivery-unavailable': 'agent-message-delivery-unavailable',
    cancelled: 'agent-message-parent-interrupted',
    failed: 'agent-message-dispatch-failed',
};
/** Caret steps over whole code points, so an emoji is never split. */
export function previousCodePoint(text, caret) {
    if (caret <= 0)
        return 0;
    const low = text.charCodeAt(caret - 1);
    const high = caret >= 2 ? text.charCodeAt(caret - 2) : 0;
    return low >= 0xdc00 && low <= 0xdfff && high >= 0xd800 && high <= 0xdbff ? caret - 2 : caret - 1;
}
export function nextCodePoint(text, caret) {
    if (caret >= text.length)
        return text.length;
    return (text.codePointAt(caret) ?? 0) > 0xffff ? caret + 2 : caret + 1;
}
/**
 * The user→child send box. It owns its own draft (never the parent's
 * PromptInput, dock or queue) and submits only through the channel's
 * AgentMessageControl (Claude: relayed by the parent; DSH: a direct prompt
 * to a continuable child). A failure keeps the draft and says why.
 */
export function AgentMessageComposer({ target, control, messages, focused, onFocusChange, keyHandlerRef }) {
    // The draft lives in a ref as well as in state: keys can arrive faster
    // than React re-renders, and a handler reading a render-time copy would
    // overwrite the previous keystroke (or submit twice on a double Enter).
    const draftRef = React.useRef({ text: '', caret: 0 });
    const [draft, setDraftState] = React.useState(draftRef.current);
    const setDraft = (next) => {
        draftRef.current = next;
        setDraftState(next);
    };
    const { text, caret } = draft;
    const sendingRef = React.useRef(false);
    const [sending, setSending] = React.useState(false);
    const [sent, setSent] = React.useState(null);
    const [notice, setNotice] = React.useState(null);
    // The display name: the unique name, the stable id when ambiguous, or the
    // short id when the backend reports no name at all.
    const shownName = target.ambiguous === true ? target.agentId.slice(0, 8) : target.name ?? target.agentId.slice(0, 8);
    const canSubmit = target.name !== undefined && !sending;
    // Later channel facts about our newest intent advance the status line.
    const latestIntentState = React.useMemo(() => {
        if (sent === null)
            return undefined;
        const advance = [...messages].reverse().find(message => message.intentId === sent.intentId);
        return advance?.state ?? sent.state;
    }, [messages, sent]);
    const submit = (delivery) => {
        const submitted = draftRef.current.text;
        if (target.name === undefined || sendingRef.current || submitted.trim() === '')
            return;
        sendingRef.current = true;
        setSending(true);
        setNotice(null);
        const settle = () => {
            sendingRef.current = false;
            setSending(false);
        };
        control.submit({
            targetId: target.agentId,
            targetName: target.name,
            text: submitted,
            delivery,
        }).then(outcome => {
            settle();
            if (outcome.ok) {
                // The channel mints the intent id; the receipt state is a FACT the
                // transport stated (an accepted inbox is 'queued', never more).
                // Text typed while the submit was in flight stays in the box.
                if (draftRef.current.text === submitted)
                    setDraft({ text: '', caret: 0 });
                setSent({ intentId: outcome.intentId, text: submitted, state: outcome.state });
                return;
            }
            // Failure keeps the draft verbatim; the notice names the stable
            // reason, never a raw provider error.
            setNotice({ key: NOTICE_OF_REASON[outcome.reason], failure: true });
        }, () => {
            settle();
            setNotice({ key: 'agent-message-dispatch-failed', failure: true });
        });
    };
    const handleKey = (input, key) => {
        // Esc: the editor layer consumes it first — hand focus back to the scene
        // with the draft retained (the next Esc leaves the Agent View).
        if (key.escape === true) {
            onFocusChange(false);
            return true;
        }
        const returnKey = key.return === true || key.return_ === true;
        if (isPlainReturnInput(input, { ...key, return: returnKey })) {
            submit('queue');
            return true;
        }
        // Ctrl+Enter steers ONLY under an explicit capability; Claude mediation
        // keeps the followup placement (never interruptAndDeliver).
        if (returnKey && key.ctrl === true) {
            submit(control.steer === true ? 'steer' : 'queue');
            return true;
        }
        const current = draftRef.current;
        if (key.backspace === true || key.delete === true) {
            if (current.caret > 0) {
                const at = previousCodePoint(current.text, current.caret);
                setDraft({ text: current.text.slice(0, at) + current.text.slice(current.caret), caret: at });
            }
            return true;
        }
        if (key.leftArrow === true) {
            setDraft({ ...current, caret: previousCodePoint(current.text, current.caret) });
            return true;
        }
        if (key.rightArrow === true) {
            setDraft({ ...current, caret: nextCodePoint(current.text, current.caret) });
            return true;
        }
        if (key.home === true || (key.ctrl === true && input === 'a')) {
            setDraft({ ...current, caret: 0 });
            return true;
        }
        if (key.end === true || (key.ctrl === true && input === 'e')) {
            setDraft({ ...current, caret: current.text.length });
            return true;
        }
        if (input !== '' && key.ctrl !== true && key.meta !== true) {
            setDraft({ text: current.text.slice(0, current.caret) + input + current.text.slice(current.caret), caret: current.caret + input.length });
            setNotice(null);
            return true;
        }
        return false;
    };
    if (keyHandlerRef !== undefined)
        keyHandlerRef.current = focused ? handleKey : null;
    useInput((input, key, event) => {
        if (handleKey(input, key))
            event.stopImmediatePropagation();
    }, { isActive: focused && keyHandlerRef === undefined });
    const viaLabel = agentMessageViaText(control.via);
    const afterCaret = nextCodePoint(text, caret);
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", children: [_jsx(Text, { color: "accent", children: '› ' }), _jsx(Text, { bold: true, children: t('agent-message-compose-title', { name: shownName }) }), _jsx(Text, { dimColor: true, children: ` · ${viaLabel}` })] }), target.ambiguous === true && (_jsx(Text, { dimColor: true, children: t('agent-message-target-ambiguous', { id: target.agentId.slice(0, 8) }) })), target.name === undefined && (_jsx(Text, { color: "warning", children: t('agent-message-target-nameless') })), _jsxs(Box, { flexDirection: "row", children: [_jsx(Text, { children: text.slice(0, caret) }), _jsx(InputCaret, { active: focused, children: text.slice(caret, afterCaret) || ' ' }), _jsx(Text, { children: text.slice(afterCaret) })] }), notice !== null && (_jsx(Text, { color: notice.failure === true ? 'error' : undefined, children: `${t(notice.key)}${notice.failure === true ? ` · ${t('agent-message-draft-retained')}` : ''}` })), latestIntentState !== undefined && sent !== null && (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { dimColor: true, children: `${t('agent-message-submitted')}: ` }), _jsx(Text, { color: agentMessageStateColor(latestIntentState), children: agentMessageStateText(latestIntentState) }), _jsx(Text, { dimColor: true, children: ` · ${t('agent-message-inbox-note')}` })] })), _jsx(Text, { dimColor: true, children: canSubmit
                    ? (control.steer === true
                        ? t('agent-message-hint-queue-steer')
                        : t('agent-message-hint-queue'))
                    : t('agent-message-hint-nameless') })] }));
}
