/**
 * Pixel-whale animation frames for the startup splash, converted from
 * the hand-drawn Excel art (the `dsh-ui-whale` frame set by @lhh010,
 * https://github.com/lhh010/dsh-ui-whale — see also whaleIdle.ts for the
 * ported settled-header behaviors; 25x40 cells,
 * palette alphabet shared with Whale.tsx: D outline, B body, L belly,
 * W mouth, H heart, Z sleep-Z, `.` transparent). All 22 source frames
 * are here; `OPENING_SEQUENCES` packs them into three startup intros —
 * the classic blink + spout + tail-wag combo, the heart pass, and the
 * sleep-Z float — of which one is rolled every time the logo header
 * mounts (see `pickOpeningSequence`): randomly at startup, and again on
 * every `/deepseek` easter-egg replay. The header then settles static
 * on the standard pose.
 */
/** One animation frame: 25 sprite rows of 40 palette characters. */
export interface WhaleFrame {
    /** Frame label from the source art (Chinese names kept for traceability). */
    readonly name: string;
    readonly rows: readonly string[];
}
/** The 22 hand-drawn frames (all poses from the source art, incl. heart and sleep). */
export declare const WHALE_FRAMES: readonly WhaleFrame[];
/** One step of an opening animation: frame index + dwell time. */
export interface OpeningStep {
    /** Index into WHALE_FRAMES. */
    readonly frame: number;
    /** How long the frame stays on screen, in milliseconds. */
    readonly ms: number;
}
/** Named indices into WHALE_FRAMES (the order matches the source art). */
export declare const WHALE_FRAME_INDEX: {
    readonly standard: 0;
    readonly blink: 1;
    readonly fin1: 2;
    readonly fin2: 3;
    readonly spout1: 4;
    readonly spout2: 5;
    readonly spout3: 6;
    readonly spout4: 7;
    readonly spout5: 8;
    readonly spout6: 9;
    readonly tail1: 10;
    readonly tail2: 11;
    readonly tail3: 12;
    readonly tail4: 13;
    readonly heart1: 14;
    readonly heart2: 15;
    readonly heart3: 16;
    readonly sleep1: 17;
    readonly sleep2: 18;
    readonly sleep3: 19;
    readonly sleep4: 20;
    readonly sleep5: 21;
};
/**
 * The three intro animations; each one ends back on the standard pose.
 * The base actions (blink, fin, tail, spout) stay bundled in the classic
 * opener as they were — only the behaviors the TUI never had (heart,
 * sleep) get their own standalone intro.
 */
export type WhaleIntroId = 'classic' | 'heart' | 'sleep';
/** All intro ids, in a stable order (drives the random pick). */
export declare const WHALE_INTRO_IDS: readonly WhaleIntroId[];
/**
 * One startup intro per behavior, mirroring the source plugin's cadence:
 * classic = the shipped opener (blink → one-way water-spout bloom → full
 * 1→2→3→4→3→2→1 tail wag); heart = a pink heart growing small→large in
 * the top-left corner; sleep = gray Z's rising above the blowhole, then
 * settling back to rest.
 */
export declare const OPENING_SEQUENCES: Record<WhaleIntroId, readonly OpeningStep[]>;
/**
 * Roll one intro id uniformly at random. Called once per logo header
 * mount — the startup splash and every `/deepseek` replay each roll
 * independently. `random` is a test seam (0-based, values in [0, 1)).
 */
export declare function pickOpeningSequence(random?: () => number): {
    id: WhaleIntroId;
    sequence: readonly OpeningStep[];
};
//# sourceMappingURL=whaleFrames.d.ts.map