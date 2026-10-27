import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { effectiveComboDisplay } from '../../utils/keymap.js';
/**
 * 提问面板挂起条 — the two-line stand-in for a folded questionnaire
 * (manual collapse; the ask stays parked and the panel stays mounted, so
 * drafts survive).
 *
 * Line 1 mirrors the GoalTodoPanel fold-header language: a dim `▸` (folded
 * state), the same progress title as the expanded header, then the first
 * line of the question truncated to whatever width remains. The whole row
 * is clickable (fullscreen mouse) and hover-highlighted to expand.
 *
 * Line 2 is the permanent "answer pending" affordance — a blinking pause
 * glyph (`⏸` toggled dim/bright on a local interval that lives only while
 * the bar is mounted) plus the waiting text and the fold key hint. The key
 * label follows keymap remaps via effectiveComboString, like the /settings
 * shortcut rows.
 *
 * The component is deliberately dumb: the parent formats the strings, so
 * the bar owns only its local hover/blink state.
 */
const BLINK_MS = 500;
export function QuestionMinimizedBar({ progress, questionText, onExpand, }) {
    const [blinkOn, setBlinkOn] = React.useState(true);
    const [hovered, setHovered] = React.useState(false);
    // The pause glyph blinks by APPEARING and DISAPPEARING (a visible→gone
    // beat reads as a true blink; dim↔normal is too subtle). The off phase
    // must occupy exactly the glyph's width or the waiting text shifts left
    // and right every beat: '⏸ ' measures 2 columns (⏸ is a narrow 1-col
    // glyph here), so it is replaced by two spaces. Blink only while the
    // bar exists; unmounting clears the interval.
    React.useEffect(() => {
        const id = setInterval(() => setBlinkOn(previous => !previous), BLINK_MS);
        return () => clearInterval(id);
    }, []);
    const waiting = `${t('question-fold-waiting')} — ${t('question-fold-expand', {
        combo: effectiveComboDisplay('questionFold'),
    })}`;
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, paddingLeft: 2, paddingRight: 2, width: "100%", children: [_jsxs(Box, { flexDirection: "row", height: 1, onClick: onExpand, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), backgroundColor: hovered ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Text, { dimColor: true, children: '▸ ' }), _jsx(Text, { dimColor: true, children: progress }), _jsx(Box, { flexGrow: 1, flexShrink: 1, marginLeft: 1, children: _jsx(Text, { wrap: "truncate", children: questionText }) })] }), _jsxs(Box, { flexDirection: "row", height: 1, children: [_jsx(Text, { children: blinkOn ? '⏸ ' : '  ' }), _jsx(Text, { dimColor: true, wrap: "truncate", children: waiting })] })] }));
}
