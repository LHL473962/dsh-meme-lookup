import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import figures from 'figures';
import { useMemo, useRef } from 'react';
import { useAnimationFrame } from '../../ink/hooks/use-animation-frame.js';
import Box from '../../ink/components/Box.js';
import Text from '../design-system/ThemedText.js';
import { stringWidth } from '../../ink/stringWidth.js';
import { formatDuration, formatNumber } from '../../terminal-utils/format.js';
import { getTheme } from '../../theme.js';
import { Byline } from '../design-system/Byline.js';
import { GlimmerMessage } from './GlimmerMessage.js';
import { SpinnerGlyph } from './SpinnerGlyph.js';
import { useStalledAnimation } from './useStalledAnimation.js';
import { interpolateColor, parseRGB, toRGBColor } from './spinnerUtils.js';
import { useTheme } from '../design-system/ThemeProvider.js';
const SEP_WIDTH = stringWidth(' · ');
const THINKING_BARE_WIDTH = stringWidth('thinking');
const SHOW_TOKENS_AFTER_MS = 30_000;
const THINKING_DELAY_MS = 2800;
const THINKING_PULSE_MS = 1800;
const TOKEN_RESPONSE_MS = 220;
function trianglePulse(time, period) {
    if (period <= 0)
        return 0;
    const phase = ((time % period) + period) % period / period;
    return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}
function easeToward(current, target, elapsedMs, responseMs) {
    if (elapsedMs <= 0)
        return current;
    const amount = 1 - Math.exp(-elapsedMs / responseMs);
    return current + (target - current) * amount;
}
/**
 * The 50ms-animated portion of the working spinner. It owns
 * `useAnimationFrame(50)` and all values derived from the
 * animation clock (frame, glimmer, token counter animation, elapsed time,
 * stalled intensity, thinking shimmer).
 */
export function SpinnerAnimationRow({ mode, reducedMotion, hasActiveTools, responseLengthRef, uploadTokensRef, message, messageColor, shimmerColor, loadingStartTimeRef, totalPausedMsRef, pauseStartTimeRef, spinnerSuffix, verbose, columns, thinkingStatus, }) {
    const [viewportRef, time] = useAnimationFrame(reducedMotion ? null : 50);
    // === Elapsed time (wall-clock, derived from refs each frame) ===
    const now = Date.now();
    const elapsedTimeMs = pauseStartTimeRef.current !== null
        ? pauseStartTimeRef.current -
            loadingStartTimeRef.current -
            totalPausedMsRef.current
        : now - loadingStartTimeRef.current - totalPausedMsRef.current;
    // === Animation derivations from `time` ===
    const currentResponseLength = responseLengthRef.current;
    const { isStalled, stalledIntensity } = useStalledAnimation(time, currentResponseLength, hasActiveTools, reducedMotion);
    const [themeName] = useTheme();
    const theme = getTheme(themeName);
    const frame = reducedMotion ? 0 : Math.floor(time / 140);
    const glimmerPeriod = mode === 'requesting' ? 1600 : 2200;
    const glimmerMessageWidth = useMemo(() => stringWidth(message), [message]);
    const glimmerTravel = glimmerMessageWidth + 8;
    const glimmerProgress = trianglePulse(time, glimmerPeriod);
    const leftToRight = mode === 'requesting';
    const glimmerIndex = reducedMotion
        ? -100
        : isStalled
            ? -100
            : leftToRight
                ? glimmerProgress * glimmerTravel - 4
                : (1 - glimmerProgress) * glimmerTravel - 4;
    const flashOpacity = reducedMotion
        ? 0
        : mode === 'tool-use'
            ? trianglePulse(time, 720)
            : 0;
    // === Token counter animation (smooth increment, driven by 50ms clock) ===
    const tokenCounterRef = useRef({ value: currentResponseLength, time });
    const tokenElapsed = Math.max(0, time - tokenCounterRef.current.time);
    tokenCounterRef.current.time = time;
    tokenCounterRef.current.value = reducedMotion
        ? currentResponseLength
        : easeToward(tokenCounterRef.current.value, currentResponseLength, tokenElapsed, TOKEN_RESPONSE_MS);
    const displayedResponseLength = Math.round(tokenCounterRef.current.value);
    const leaderTokens = Math.round(displayedResponseLength / 4);
    const timerText = formatDuration(elapsedTimeMs);
    const timerWidth = stringWidth(timerText);
    const tokenCount = formatNumber(leaderTokens);
    const uploadTokens = uploadTokensRef.current;
    // Real upload tokens (last request's input + cache) ride beside the
    // animated download estimate; both labeled once to keep the row short.
    const tokensLabel = uploadTokens > 0
        ? `↑ ${formatNumber(uploadTokens)} · ↓ ${tokenCount} tokens`
        : `↓ ${tokenCount} tokens`;
    const tokensWidth = stringWidth(tokensLabel);
    // === Thinking text (may shrink to fit) ===
    let thinkingText = thinkingStatus === 'thinking'
        ? 'thinking'
        : typeof thinkingStatus === 'number'
            ? `thought for ${Math.max(1, Math.round(thinkingStatus / 1000))}s`
            : null;
    let thinkingWidthValue = thinkingText ? stringWidth(thinkingText) : 0;
    // === Progressive width gating ===
    const messageWidth = glimmerMessageWidth + 2;
    const sep = SEP_WIDTH;
    const wantsThinking = thinkingStatus !== null;
    const wantsTimerAndTokens = verbose || elapsedTimeMs > SHOW_TOKENS_AFTER_MS;
    const availableSpace = columns - messageWidth - 5;
    let showThinking = wantsThinking && availableSpace > thinkingWidthValue;
    if (!showThinking && wantsThinking && thinkingStatus === 'thinking') {
        if (availableSpace > THINKING_BARE_WIDTH) {
            thinkingText = 'thinking';
            thinkingWidthValue = THINKING_BARE_WIDTH;
            showThinking = true;
        }
    }
    const usedAfterThinking = showThinking ? thinkingWidthValue + sep : 0;
    const showTimer = wantsTimerAndTokens && availableSpace > usedAfterThinking + timerWidth;
    const usedAfterTimer = usedAfterThinking + (showTimer ? timerWidth + sep : 0);
    const showTokens = wantsTimerAndTokens &&
        (leaderTokens > 0 || uploadTokens > 0) &&
        availableSpace > usedAfterTimer + tokensWidth;
    const thinkingOnly = showThinking &&
        thinkingStatus === 'thinking' &&
        !spinnerSuffix &&
        !showTimer &&
        !showTokens;
    // === Thinking shimmer color ===
    const thinkingOpacity = time < THINKING_DELAY_MS
        ? 0
        : trianglePulse(time - THINKING_DELAY_MS, THINKING_PULSE_MS);
    const thinkingBase = parseRGB(theme[messageColor]);
    const thinkingHighlight = parseRGB(theme[shimmerColor]);
    const thinkingShimmerColor = thinkingBase && thinkingHighlight
        ? toRGBColor(interpolateColor(thinkingBase, thinkingHighlight, thinkingOpacity))
        : shimmerColor;
    // === Build status parts ===
    const parts = [
        ...(spinnerSuffix
            ? [
                _jsx(Text, { dimColor: true, children: spinnerSuffix }, "suffix"),
            ]
            : []),
        ...(showTimer
            ? [
                _jsx(Text, { dimColor: true, children: timerText }, "elapsedTime"),
            ]
            : []),
        ...(showTokens
            ? [
                _jsxs(Box, { flexDirection: "row", children: [_jsx(SpinnerModeGlyph, { mode: mode }), _jsx(Text, { dimColor: true, children: tokensLabel })] }, "tokens"),
            ]
            : []),
        ...(showThinking && thinkingText
            ? [
                thinkingStatus === 'thinking' && !reducedMotion ? (_jsx(Text, { color: thinkingShimmerColor, children: thinkingOnly ? `(${thinkingText})` : thinkingText }, "thinking")) : (_jsx(Text, { dimColor: true, children: thinkingText }, "thinking")),
            ]
            : []),
    ];
    const status = parts.length > 0 ? (thinkingOnly ? (_jsx(Byline, { children: parts })) : (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: "(" }), _jsx(Byline, { children: parts }), _jsx(Text, { dimColor: true, children: ")" })] }))) : null;
    return (_jsxs(Box, { ref: viewportRef, flexDirection: "row", flexWrap: "wrap", marginTop: 1, width: "100%", children: [_jsx(SpinnerGlyph, { frame: frame, messageColor: messageColor, stalledIntensity: stalledIntensity, reducedMotion: reducedMotion, time: time }), _jsx(GlimmerMessage, { message: message, mode: mode, messageColor: messageColor, glimmerIndex: glimmerIndex, flashOpacity: flashOpacity, shimmerColor: shimmerColor, stalledIntensity: stalledIntensity }), status] }));
}
function SpinnerModeGlyph({ mode }) {
    switch (mode) {
        case 'tool-input':
        case 'tool-use':
        case 'responding':
        case 'thinking':
            return (_jsx(Box, { width: 2, children: _jsx(Text, { dimColor: true, children: figures.arrowDown }) }));
        case 'requesting':
            return (_jsx(Box, { width: 2, children: _jsx(Text, { dimColor: true, children: figures.arrowUp }) }));
    }
}
