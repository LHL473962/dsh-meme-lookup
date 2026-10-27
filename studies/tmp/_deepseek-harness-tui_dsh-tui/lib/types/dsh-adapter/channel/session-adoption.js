import { dshHandleOf } from '../backend/session.js';
import { resetSessionProjection } from './session-reset.js';
/**
 * Binding-transaction tails shared by session actions. Construction is inert:
 * callers install the returned operations only after their ChannelState exists.
 */
export function createSessionAdoption(state, deps) {
    /**
     * Commit a prepared rewind/fork candidate through the sole binding writer.
     * The transaction resets only after ownership is committed; setup remains
     * synchronous so subscriptions cannot observe a half-reset projection.
     */
    const adoptForkedAgent = (candidate, capture, seed, agentPreset, childId) => deps.binding.adopt(candidate, capture, (previous, disposePrevious) => {
        const handle = dshHandleOf(candidate);
        const sourceSessionId = String(previous.agent.session.id);
        resetSessionProjection(state, deps.rowIds, deps.resetProjector, deps.resetSubagents, deps.resetJobs);
        state.status = handle.agent.status;
        state.agentId = handle.agent.id;
        state.sessionId = handle.agent.session.id;
        state.agentPreset = agentPreset;
        deps.replay(seed);
        deps.settleReplay();
        state.working = handle.agent.status === 'running';
        // Reset the input FIFO and pending-decision indicators BEFORE the first
        // emit: a submit from a session-changed subscriber must not chain onto the
        // replaced session's parked promise (main's bind → clear → refresh order).
        deps.clearStagedImages();
        deps.bindAgent();
        deps.refreshCommands();
        void deps.refreshLoadedContext();
        void deps.refreshSkillCommands();
        deps.touchSession(childId);
        state.emit();
        disposePrevious('dispose');
        return sourceSessionId;
    });
    return { adoptForkedAgent };
}
