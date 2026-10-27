import { createChannelProjection as createSharedProjection } from '../../channel/projection.js';
import { createDshTranslator, dshPricingWindow } from '../backend/translate.js';
const LIVE = { replay: false };
const REPLAY = { replay: true };
/** One reducer for both durable replay and live session events. */
export function createChannelProjection(state, deps) {
    const translator = createDshTranslator({
        tools: () => deps.tools,
        scope: () => deps.agent(),
        attachments: () => deps.attachments(),
    });
    const projector = createSharedProjection(state, {
        rowIds: deps.rowIds,
        resetContextWarning: () => deps.resetContextWarning(),
        checkContextWarning: () => deps.checkContextWarning(),
        notify: (...args) => deps.notify(...args),
        jobs: deps.jobs,
        inputConvergence: deps.inputConvergence,
        get renderer() { return deps.renderer; },
        selectionAttached: messageId => deps.selectionAttached(messageId),
        pricingWindow: dshPricingWindow,
    });
    return {
        /** Forget every per-session ledger on both halves. */
        reset() {
            translator.reset();
            projector.reset();
        },
        replayEvents(events) {
            projector.apply(translator.translateReplay(events), REPLAY);
        },
        renderEvent(event) {
            projector.apply(translator.translateEvent(event), LIVE);
        },
        renderStreamFrame(frame) {
            projector.apply(translator.translateFrame(frame), LIVE);
        },
        settleStreaming: projector.settleStreaming,
        updateSpinnerMode: projector.updateSpinnerMode,
    };
}
