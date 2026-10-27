/** One composed whale pose, in the web plugin's WhaleFrame shape. */
export interface WhaleLayerPose {
    /** 0 = resting tail; 1..4 = TAIL_1..4. */
    readonly tail: number;
    /** 0 = resting fins; 1..2 = FIN_1..2. */
    readonly fin: number;
    /** 0 = none; 1..6 = SPOUT_1..6. */
    readonly spout: number;
    /** 0 = none; 1..3 = HEART_1..3. */
    readonly heart: number;
    /** 0 = awake; 1..5 = SLEEP_1..5 (the Z loop). */
    readonly sleep: number;
    /** Eyes closed. */
    readonly blink: boolean;
}
/** The resting pose every animation returns to. */
export declare const RESTING_POSE: WhaleLayerPose;
type Grid = string[][];
/**
 * Compose one pose into the full 25x40 character grid: body + eyes + tail +
 * fins + spout + heart + sleep-Z, painted in the web plugin's layer order.
 * Single-family poses compose to exactly that family's whole frame.
 */
export declare function composeWhaleGrid(pose: WhaleLayerPose): Grid;
/** Stable cache key for one pose (layer indices are small integers). */
export declare function poseKey(pose: WhaleLayerPose): string;
export {};
//# sourceMappingURL=whaleLayers.d.ts.map