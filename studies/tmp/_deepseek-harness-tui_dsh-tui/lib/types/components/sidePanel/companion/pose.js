import { initialWhaleIdleState, nextWhaleIdleStep, } from '../../whaleIdle.js';
export const initialCompanionPoseState = initialWhaleIdleState;
const AWAKE_ACTIVE_MOODS = new Set([
    'waiting',
    'thinking',
    'working',
    'responding',
    'attention',
]);
export function nextCompanionPoseStep(prev, input, now) {
    const step = nextWhaleIdleStep(prev, { working: AWAKE_ACTIVE_MOODS.has(input.mood), heart: input.heart }, now);
    const layers = step.pose;
    const gestures = new Set();
    if (layers.tail > 0)
        gestures.add('wag');
    if (layers.fin > 0)
        gestures.add('flutter');
    if (layers.spout > 0)
        gestures.add('spout');
    return {
        state: step.state,
        pose: {
            mood: input.mood,
            tick: Math.max(0, Math.floor(now / 120)),
            gestures,
            blink: layers.blink,
            heart: Math.min(3, Math.max(0, layers.heart)),
            sleepZ: Math.min(5, Math.max(0, layers.sleep)),
            facing: 'left',
            nativeWhalePose: layers,
        },
        delayMs: step.delayMs,
    };
}
