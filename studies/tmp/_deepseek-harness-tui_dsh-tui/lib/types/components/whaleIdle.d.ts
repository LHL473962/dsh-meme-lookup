/**
 * Settled-header whale behaviors, ported from the dsh-ui-whale web plugin's
 * animation driver (https://github.com/lhh010/dsh-ui-whale, src/client/
 * animation.ts): independent tail / fin / heart / sleep-Z / blink layers —
 * a click heart plays OVER a mid-wag tail or the sleep-Z loop instead of
 * replacing it (the old whole-frame planner arbitrated one action at a time).
 *
 * Web-faithful layer semantics: continuous tail/fin cycling while the agent
 * works, occasional passes while idle AND while asleep (the web pet never
 * freezes mid-sleep), a sticky sleep entered after SLEEP_DELAY_MS of
 * inactivity that work or a click clears (the web pet's sleep is
 * click-sticky — TUI divergence), and a one-way 1-2-3 heart pass.
 *
 * Event-driven: while resting, the ONLY pending timer is the next due layer
 * transition, and with the setting off the component holds no timer at all
 * (the idle-wakeup contract keeps holding). Pure functions over (state,
 * input, now) — unit-testable without timers.
 */
import type { WhaleLayerPose } from './whaleLayers.js';
/** How long each heart size is held (web HEART_HOLD = 3 ticks). */
export declare const HEART_HOLD_MS: number;
/** Continuous inactivity before the whale falls asleep (10 seconds). */
export declare const SLEEP_DELAY_MS = 10000;
/**
 * Planner state — one independent plane per layer. Steps index their pose
 * sequence (-1 = resting); holds are deadlines; the *At fields schedule the
 * occasional passes and the sleep entry. The heart is its own one-shot plane
 * so it overlays whatever the body planes are doing.
 */
export interface WhaleIdleState {
    readonly tailStep: number;
    readonly tailHoldUntil: number;
    readonly thumpAt: number;
    readonly finStep: number;
    readonly finHoldUntil: number;
    readonly flutterAt: number;
    readonly blinkAt: number;
    readonly blinkUntil: number;
    readonly heartStep: number;
    readonly heartHoldUntil: number;
    readonly asleep: boolean;
    readonly sleepStep: number;
    readonly sleepHoldUntil: number;
    readonly sleepAt: number;
}
/** The per-step inputs: agent activity + a pending click-heart request. */
export interface WhaleIdleInput {
    readonly working: boolean;
    readonly heart: boolean;
}
/** One planner decision: the state to keep, the pose to paint, the wait. */
export interface WhaleIdleStep {
    readonly state: WhaleIdleState;
    readonly pose: WhaleLayerPose;
    readonly delayMs: number;
}
/** The resting initial state; `now` seeds the idle event schedule. */
export declare function initialWhaleIdleState(now: number): WhaleIdleState;
/**
 * Compute the next animation step.
 * @param prev - the state carried from the previous step.
 * @param input - working (agent turn active) and heart (click requested).
 * @param now - current wall-clock ms (test seam: inject fixed clocks).
 */
export declare function nextWhaleIdleStep(prev: WhaleIdleState, input: WhaleIdleInput, now: number): WhaleIdleStep;
//# sourceMappingURL=whaleIdle.d.ts.map