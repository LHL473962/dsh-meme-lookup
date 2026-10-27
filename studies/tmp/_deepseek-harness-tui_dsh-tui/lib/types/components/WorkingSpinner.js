import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTerminalSize } from '../ink/hooks/use-terminal-size.js';
import { Box } from '../ui.js';
import { SpinnerAnimationRow } from './Spinner/SpinnerAnimationRow.js';
import { tOr } from '../i18n.js';
import sample from 'lodash-es/sample.js';
/**
 * Which verbs fit which spinner phase: the working line's copy follows the
 * turn's stage (waiting → thinking → tools → responding) instead of one
 * random word for the whole turn — a phase change re-picks from its pool.
 * Words are the existing SPINNER_VERBS (i18n coverage), just bucketed.
 */
const VERBS_BY_MODE = {
    requesting: ['Connecting', 'Preparing', 'Considering'],
    thinking: ['Thinking', 'Reasoning', 'Considering', 'Planning'],
    responding: ['Working', 'Responding', 'Building', 'Summarizing', 'Resolving', 'Testing'],
    'tool-use': ['Analyzing', 'Reading', 'Searching', 'Reviewing', 'Checking', 'Exploring'],
    'tool-input': ['Working', 'Responding'],
};
/**
 * The working spinner block shown between the transcript and the prompt
 * input while a turn is in flight. The channel feeds the mode, token count,
 * and thinking status while this component owns the compact presentation.
 *
 * A random verb is picked per phase (per mode change), so the copy tracks
 * what the turn is actually doing.
 */
export function WorkingSpinner({ mode, hasActiveTools, responseLengthRef, uploadTokensRef, loadingStartTimeRef, totalPausedMsRef, pauseStartTimeRef, thinkingStatus, suffix, }) {
    const { columns } = useTerminalSize();
    // Pick a random verb from the current phase's pool; a phase change
    // re-picks (the copy mirrors the turn's stage).
    const [randomVerb, setRandomVerb] = useState(() => sample(VERBS_BY_MODE[mode]) ?? 'Working');
    useEffect(() => {
        setRandomVerb(sample(VERBS_BY_MODE[mode]) ?? 'Working');
    }, [mode]);
    const message = `${tOr(`spinner-verb-${randomVerb.toLowerCase()}`, randomVerb)}…`;
    return (_jsx(Box, { flexDirection: "column", width: "100%", alignItems: "flex-start", children: _jsx(SpinnerAnimationRow, { mode: mode, reducedMotion: false, hasActiveTools: hasActiveTools, responseLengthRef: responseLengthRef, uploadTokensRef: uploadTokensRef, message: message, messageColor: "accent", shimmerColor: "accentShimmer", loadingStartTimeRef: loadingStartTimeRef, totalPausedMsRef: totalPausedMsRef, pauseStartTimeRef: pauseStartTimeRef, spinnerSuffix: suffix === undefined ? null : suffix, verbose: true, columns: columns, thinkingStatus: thinkingStatus }) }));
}
/**
 * Tracks thinking status: 'thinking' while the model is streaming reasoning,
 * then the duration in ms for a minimum 2s display (avoids UI jank).
 */
export function useThinkingStatus(isThinking) {
    const [thinkingStatus, setThinkingStatus] = useState(null);
    const thinkingStartRef = useRef(null);
    useEffect(() => {
        let showDurationTimer = null;
        let clearStatusTimer = null;
        if (isThinking) {
            // Started thinking
            if (thinkingStartRef.current === null) {
                thinkingStartRef.current = Date.now();
                setThinkingStatus('thinking');
            }
        }
        else if (thinkingStartRef.current !== null) {
            // Stopped thinking - calculate duration and ensure 2s minimum display
            const duration = Date.now() - thinkingStartRef.current;
            const elapsed = Date.now() - thinkingStartRef.current;
            const remainingThinkingTime = Math.max(0, 2000 - elapsed);
            thinkingStartRef.current = null;
            // Show "thinking..." for remaining time if < 2s elapsed, then show duration
            const showDuration = () => {
                setThinkingStatus(duration);
                // Clear after 2s
                clearStatusTimer = setTimeout(() => setThinkingStatus(null), 2000);
            };
            if (remainingThinkingTime > 0) {
                showDurationTimer = setTimeout(showDuration, remainingThinkingTime);
            }
            else {
                showDuration();
            }
        }
        return () => {
            if (showDurationTimer)
                clearTimeout(showDurationTimer);
            if (clearStatusTimer)
                clearTimeout(clearStatusTimer);
        };
    }, [isThinking]);
    return thinkingStatus;
}
