export type StallState = {
    isStalled: boolean;
    intensity: number;
};
/** Derive the target stall state from elapsed output time and tool activity. */
export declare function getStallState(timeSinceOutput: number, hasActiveTools?: boolean): StallState;
/**
 * Track output silence from the parent's animation clock. The target color
 * changes linearly over the ramp, while the displayed value eases toward it
 * with a time-based response that remains stable if a frame is delayed.
 */
export declare function useStalledAnimation(time: number, currentResponseLength: number, hasActiveTools?: boolean, reducedMotion?: boolean): {
    isStalled: boolean;
    stalledIntensity: number;
};
//# sourceMappingURL=useStalledAnimation.d.ts.map