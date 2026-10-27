import React from 'react';
import type { SpinnerMode } from './Spinner/spinnerMode.js';
/**
 * The working spinner block shown between the transcript and the prompt
 * input while a turn is in flight. The channel feeds the mode, token count,
 * and thinking status while this component owns the compact presentation.
 *
 * A random verb is picked per phase (per mode change), so the copy tracks
 * what the turn is actually doing.
 */
export declare function WorkingSpinner({ mode, hasActiveTools, responseLengthRef, uploadTokensRef, loadingStartTimeRef, totalPausedMsRef, pauseStartTimeRef, thinkingStatus, suffix, }: {
    mode: SpinnerMode;
    hasActiveTools: boolean;
    responseLengthRef: React.RefObject<number>;
    /** Most recent request's real upload tokens; 0 until the first usage event. */
    uploadTokensRef: React.RefObject<number>;
    loadingStartTimeRef: React.RefObject<number>;
    totalPausedMsRef: React.RefObject<number>;
    pauseStartTimeRef: React.RefObject<number | null>;
    thinkingStatus: 'thinking' | number | null;
    /** Extra leading field (e.g. the auto-compaction badge) shown before the
     *  timer/token counters; omitted for an ordinary turn. */
    suffix?: string;
}): React.ReactNode;
/**
 * Tracks thinking status: 'thinking' while the model is streaming reasoning,
 * then the duration in ms for a minimum 2s display (avoids UI jank).
 */
export declare function useThinkingStatus(isThinking: boolean): 'thinking' | number | null;
//# sourceMappingURL=WorkingSpinner.d.ts.map