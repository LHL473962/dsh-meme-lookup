import { recordedModelRoute } from '../../modelRoute.js';
import { touchAgentViewSession, touchSession, writeResumeTarget } from '../../sessionHistory.js';
import { agentViewHasTurns } from '../agent-view.js';
import { snapshotLiveSessionEvents } from '../compat/liveSession.js';
import { runningPresetOf } from '../presets.js';
import { resetSessionProjection } from './session-reset.js';
/** Adopt an already-live agent, preserving a meaningful previous handle in the background ledger. */
export function createLiveAgentAdoption(state, deps) {
    return async (target) => deps.binding.switchTo(deps.openSession(target, deps.backgroundHandles.get(String(target.id))), (committed, disposePrevious) => {
        const previousHandle = committed.handle;
        const previousSessionId = String(committed.agent.session.id);
        const keepPrevious = previousHandle !== undefined
            && previousHandle.agent !== target
            && (previousHandle.agent.status === 'running' || agentViewHasTurns(snapshotLiveSessionEvents(previousHandle.agent.session)));
        // Registry attachment borrows an Agent without taking its upstream
        // handle. Leaving that view must retain its projection independently
        // of whether this channel can transfer or dispose the handle.
        if (committed.agent !== target && (previousHandle === undefined || keepPrevious))
            deps.parkSubagents(committed.agent);
        deps.backgroundHandles.delete(String(target.id));
        resetSessionProjection(state, deps.rowIds, deps.resetProjector, deps.resetSubagents, deps.resetJobs);
        deps.restoreSubagents(target);
        state.status = target.status;
        state.agentId = target.id;
        state.sessionId = target.session.id;
        state.cwd = target.session.header.cwd ?? state.cwd;
        state.displayCwd = deps.describeWorkspace(state.cwd).description ?? state.cwd;
        deps.resetIdeSelection();
        deps.refreshGitBranch();
        state.agentPreset = runningPresetOf(target.session);
        const route = recordedModelRoute(snapshotLiveSessionEvents(target.session));
        if (route !== undefined) {
            state.provider = route.provider;
            state.model = route.model;
        }
        state.loadedContext = undefined;
        state.contextWindow = undefined;
        state.effortLevels = undefined;
        state.reasoningEffort = undefined;
        deps.replay(snapshotLiveSessionEvents(target.session));
        deps.settleReplay();
        state.working = target.status === 'running';
        // Reset the input FIFO and pending-decision indicators BEFORE the first
        // emit: a submit from a session-changed subscriber must not chain onto
        // the replaced session's parked promise (main's bind → clear → refresh
        // order).
        deps.clearStagedImages();
        deps.bindAgent();
        deps.refreshCommands();
        void deps.refreshLoadedContext();
        void deps.refreshSkillCommands();
        writeResumeTarget(String(target.id));
        touchSession(target.id);
        state.emit();
        if (previousHandle !== undefined && previousHandle.agent !== target) {
            if (keepPrevious) {
                deps.backgroundHandles.set(previousSessionId, previousHandle);
                disposePrevious('park');
            }
            else {
                disposePrevious('dispose');
            }
        }
        touchAgentViewSession(String(target.id));
        touchAgentViewSession(previousSessionId);
        deps.notifySessionSwitched('agent-view', String(target.id), previousSessionId);
        deps.notifyAgentView();
        return { ok: true };
    });
}
