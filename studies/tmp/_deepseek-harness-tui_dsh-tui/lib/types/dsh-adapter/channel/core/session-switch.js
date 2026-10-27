import { formatSessionRef } from '../../../agent/refs.js';
import { t } from '../../../i18n.js';
import { WORKING_GATE_NOTICES } from '../../../commands.js';
import { mountFailureText } from '../../../sessions/resumeFailure.js';
import { releaseMount, reserveMount, reserveNewSession } from '../../../sessionMounts.js';
import { normalizeCancelDecision } from '../../extension-events.js';
import { resetSessionProjection } from '../session-reset.js';
export function createSessionSwitch(ctx, deps) {
    const { binding, notify } = deps;
    /**
     * The `tui/session-switch` decision event (pi's `session_before_switch`),
     * fired before `/new` or `/resume` replaces the live session (rewind has
     * its own prompt event). The first answering plugin may veto the switch;
     * the reason is toasted here so the fallback string stays host-localized.
     */
    const sessionSwitchVetoed = async (kind, targetSessionId) => {
        // Stale detection compares the conversation reference, not the session
        // id (ids are reusable: ABA). A slow decision must not let an older
        // switch roll over a newer session the user switched to mid-await.
        const origin = deps.conversationKey(binding.session);
        const state = deps.state();
        const decision = await deps.withDecisionPending('tui/session-switch', ctx.dispatchDecision('tui/session-switch', {
            kind,
            ...(targetSessionId === undefined ? {} : { targetSessionId }),
            sessionId: state.agentId,
            cwd: state.cwd,
        }, normalizeCancelDecision));
        if (deps.conversationKey(binding.session) !== origin) {
            // The world changed while the decision parked: drop the pending
            // switch instead of replacing the user's newer session.
            notify(t('ext-stale-dropped'), { color: 'warning', timeoutMs: 4000 });
            return true;
        }
        if (decision !== undefined) {
            notify(decision.reason ?? t('ext-action-cancelled'), { color: 'warning', timeoutMs: 4000 });
            return true;
        }
        return false;
    };
    /** Fire-and-forget `tui/session-switched` (parallel): per-session plugin
     *  state rebinds here. Listener failures are logged, never propagated;
     *  the switch itself already succeeded. */
    const notifySessionSwitched = (kind, sessionId, previousSessionId) => {
        try {
            void ctx.dispatchNotification('tui/session-switched', { kind, sessionId, previousSessionId, cwd: deps.state().cwd }).catch((error) => {
                ctx.logger.warn('dsh-tui: tui/session-switched listener failed: %o', error);
            });
        }
        catch (error) {
            // A bare embedder's context may lack the event bus entirely; the
            // switch itself already succeeded, so this stays a log line.
            ctx.logger.warn('dsh-tui: tui/session-switched dispatch failed: %o', error);
        }
    };
    /**
     * An input still on its way to the bound session (a parked decision, an
     * `@` read, a `!!` command) would race any switch, so refuse at once and
     * name it, instead of after a handshake of up to a minute. Skipped for an
     * opener that stale-drops parked inputs (DSH).
     */
    const parkedInputRefused = (dropsParkedInputs) => {
        if (dropsParkedInputs)
            return false;
        const activity = deps.activity();
        if (!activity.unsettled)
            return false;
        const parked = (activity.parked ?? '').replace(/\s+/gu, ' ').trim();
        notify(t('session-switch-input-parked', { input: parked.length > 40 ? `${parked.slice(0, 40)}…` : parked }), { color: 'warning', timeoutMs: 8000 });
        return true;
    };
    const failed = (current, error) => {
        if (current())
            notify(t('new-session-failed', { err: error instanceof Error ? error.message : String(error) }), { color: 'error', timeoutMs: 8000 });
        return false;
    };
    /**
     * For `/new` and `/resume`: the open may take long (a backend handshake),
     * and meanwhile the user may start work on the bound session: a turn (even
     * one that already finished, which `working` alone misses), a prompt
     * queued in the backend, or an input still in the channel's own FIFO (a
     * parked decision, an `@` or IDE-selection read, a `!!` command). Adopting
     * then would dispose that session and lose the work, so the caller
     * abandons its candidate. Inputs already queued when the switch began do
     * not count (a backend that holds queued inputs while idle keeps them).
     * With `dropsParkedInputs` the backend stale-drops FIFO inputs at adoption
     * instead (DSH), so they do not race it.
     */
    const raceProbe = (dropsParkedInputs) => {
        const queuedAtStart = new Set(deps.state().pending.map(item => item.id));
        const activityAtStart = deps.activity();
        return () => {
            const live = deps.state();
            const activity = deps.activity();
            return live.working
                || live.pending.some(item => !queuedAtStart.has(item.id))
                || activity.turnStarts !== activityAtStart.turnStarts
                || (!dropsParkedInputs && (activity.inputs !== activityAtStart.inputs || activity.unsettled));
        };
    };
    /** `/new` (and the `/workspace` handoff): a fresh session of the bound backend. */
    const newSession = async (target) => {
        const opener = deps.opener();
        if (opener === undefined) {
            deps.unavailable('new');
            return false;
        }
        opener.assertAllowed?.();
        const adoption = binding.capture();
        const state = deps.state();
        const targetCwd = target?.cwd ?? state.cwd;
        const targetDisplayCwd = target?.displayCwd;
        const current = () => deps.owner.current() && binding.isCurrent(adoption);
        if (state.working) {
            notify(t(WORKING_GATE_NOTICES.new), { color: 'warning' });
            return false;
        }
        if (!opener.available())
            return false;
        if (parkedInputRefused(opener.dropsParkedInputs === true))
            return false;
        const raced = raceProbe(opener.dropsParkedInputs === true);
        const abandonRaced = async (candidate) => {
            await binding.abandon(candidate);
            if (current())
                notify(t('new-session-raced'), { color: 'warning', timeoutMs: 8000 });
            return false;
        };
        let plan;
        try {
            if (await sessionSwitchVetoed('new') || !current())
                return false;
            const planned = await opener.plan({ cwd: targetCwd }, current);
            if (planned === undefined)
                return false;
            plan = planned;
        }
        catch (error) {
            return failed(current, error);
        }
        await plan.reserve?.();
        // Do not catch the synchronous commit tail. A post-commit setup failure
        // is owned by binding.adopt(), which revokes the new live session and
        // must reject its caller rather than masquerade as an ordinary false.
        let committed = false;
        try {
            let candidate;
            try {
                candidate = await binding.prepare(adoption, () => plan.open(targetCwd));
            }
            catch (error) {
                return failed(current, error);
            }
            if (!current()) {
                await binding.abandon(candidate);
                return false;
            }
            // Checked before the attach too: an abandoned candidate must not have
            // been accounted to a workspace first (DSH ownership is durable).
            if (raced())
                return await abandonRaced(candidate);
            if (plan.attach !== undefined) {
                await plan.attach(candidate, current);
                if (!current()) {
                    await binding.abandon(candidate);
                    return false;
                }
            }
            if (raced())
                return await abandonRaced(candidate);
            const result = binding.adopt(candidate, adoption, (previous, disposePrevious) => {
                const previousSessionId = previous.session.ref.sessionId;
                const tail = deps.state();
                // The target only becomes shared channel state inside the successful
                // adoption tail. A losing prepared session therefore cannot publish
                // or roll back another workspace's cwd.
                tail.cwd = targetCwd;
                tail.displayCwd = targetDisplayCwd ?? deps.describeWorkspace(targetCwd).description ?? targetCwd;
                deps.resetIdeSelection();
                // clearStagedImages() also resets the input FIFO and the
                // pending-decision indicators. It must run before the adoption's
                // first emit: a submit enqueued from a session-changed subscriber has
                // to land on a fresh chain, not behind the replaced session's parked
                // promise.
                deps.clearStagedImages();
                const sessionId = plan.adopt(candidate);
                disposePrevious('dispose');
                notifySessionSwitched('new', sessionId, previousSessionId);
                return true;
            });
            committed = true;
            return result;
        }
        finally {
            plan.finish?.(committed);
        }
    };
    /**
     * `/resume` (and the adoption of a rewind's fork, `kind: 'rewind'`): a
     * persisted session of the bound backend replaces the bound one. The bound
     * session is closed by the adoption; a running turn refuses the switch.
     */
    const resumeSession = async (sessionId, kind = 'resume') => {
        const opener = deps.resumeOpener?.();
        if (opener === undefined) {
            deps.unavailable('resume');
            return { ok: false, reason: 'unavailable' };
        }
        // Already attached: a no-op, not a switch (never reopen the live session).
        if (sessionId === binding.session.ref.sessionId)
            return { ok: true };
        const adoption = binding.capture();
        const current = () => deps.owner.current() && binding.isCurrent(adoption);
        const state = deps.state();
        if (state.working) {
            notify(t(kind === 'rewind' ? WORKING_GATE_NOTICES.rewind : WORKING_GATE_NOTICES.resume), { color: 'warning' });
            return { ok: false, reason: 'working' };
        }
        if (parkedInputRefused(false))
            return { ok: false, reason: 'cancelled' };
        const raced = raceProbe(false);
        // A rewind asked its own question (the rewind prompt) already.
        if (kind === 'resume') {
            try {
                if (await sessionSwitchVetoed('resume', sessionId))
                    return { ok: false, reason: 'cancelled' };
            }
            catch (error) {
                return resumeFailed(current, error);
            }
        }
        if (!current())
            return { ok: false, reason: 'cancelled' };
        const plan = opener.plan({ sessionId });
        let committed = false;
        try {
            const refused = await plan.reserve?.();
            if (refused !== undefined)
                return refused;
            if (!current())
                return { ok: false, reason: 'cancelled' };
            let candidate;
            try {
                candidate = await binding.prepare(adoption, () => plan.open());
            }
            catch (error) {
                return resumeFailed(current, error);
            }
            if (!current()) {
                await binding.abandon(candidate);
                return { ok: false, reason: 'cancelled' };
            }
            // The /new race rule: work that started on the bound session while
            // the other one was opening keeps its session.
            if (raced()) {
                await binding.abandon(candidate);
                if (current())
                    notify(t('resume-raced'), { color: 'warning', timeoutMs: 8000 });
                return { ok: false, reason: 'cancelled' };
            }
            const result = binding.adopt(candidate, adoption, (previous, disposePrevious) => {
                const previousSessionId = previous.session.ref.sessionId;
                const tail = deps.state();
                tail.cwd = candidate.cwd;
                tail.displayCwd = deps.describeWorkspace(candidate.cwd).description ?? candidate.cwd;
                deps.resetIdeSelection();
                deps.clearStagedImages();
                const adopted = plan.adopt(candidate);
                disposePrevious('dispose');
                notifySessionSwitched(kind, adopted, previousSessionId);
                return { ok: true };
            });
            committed = true;
            return result;
        }
        finally {
            plan.finish?.(committed);
        }
    };
    const resumeFailed = (current, error) => {
        const message = error instanceof Error ? error.message : String(error);
        if (current())
            notify(t('resume-failed', { err: message }), { color: 'error', timeoutMs: 8000 });
        return { ok: false, reason: 'failed', error: message };
    };
    return { sessionSwitchVetoed, notifySessionSwitched, newSession, resumeSession };
}
/** The process-wide ledger (`~/.dsh-tui/session-mounts.json`). */
export const SESSION_MOUNT_LEDGER = {
    reserve: key => reserveMount(key),
    announce: key => { void reserveNewSession(key).then(({ reservation }) => { reservation.settle(); }, () => undefined); },
    release: key => { releaseMount(key); },
};
/**
 * `/new` and `/resume` for a session served by the core alone: the backend's
 * own `open`, the session's history read ahead of the adoption, then the
 * common projection reset, the new session's identity, capability snapshot
 * and command list, the history painted and the bind. The mount ledger holds
 * the backend-qualified key of the bound session (`claude:<id>`): a resume
 * claims it for the whole attempt and refuses one another TUI process holds;
 * a create announces its fresh id; the replaced session's claim is released.
 */
export function createBackendOpener(deps) {
    const { state } = deps;
    const boundKey = () => formatSessionRef(deps.bound().ref);
    /** Open, then read the history ahead of the adoption (a failed read
     *  closes the session it opened). */
    const openWithHistory = async (open) => {
        const session = await open();
        try {
            return { session, history: await session.history() };
        }
        catch (error) {
            await session.dispose().catch(() => undefined);
            throw error;
        }
    };
    const adoptWith = (candidate, history) => {
        resetSessionProjection(state, deps.rowIds, deps.resetProjection, () => { deps.resetActivity?.(candidate); }, () => undefined);
        state.agentId = candidate.ref.sessionId;
        state.sessionId = candidate.ref.sessionId;
        state.backendCapabilities = deps.snapshotOf(candidate);
        // A placeholder whose startup open failed is retried by `/new`.
        state.ready = true;
        state.startupFailure = undefined;
        deps.resetControls();
        deps.attach?.(candidate);
        deps.bind(history);
        deps.touch?.(candidate.ref.sessionId);
        state.emit();
        return candidate.ref.sessionId;
    };
    return {
        create: {
            available: () => true,
            plan: () => {
                let history = [];
                // The session the adoption replaces (an adoption commits only while
                // the binding is still the one captured with this plan).
                const previousKey = boundKey();
                return Promise.resolve({
                    open: async (cwd) => {
                        const opened = await openWithHistory(() => deps.open({ kind: 'create', cwd }));
                        history = opened.history;
                        return opened.session;
                    },
                    adopt: candidate => adoptWith(candidate, history),
                    finish(committed) {
                        if (!committed)
                            return;
                        deps.mounts.announce(boundKey());
                        deps.mounts.release(previousKey);
                    },
                });
            },
        },
        resume: {
            plan(target) {
                let history = [];
                let reservation;
                const previousKey = boundKey();
                // Within one backend per process: the target is of the bound backend.
                const key = formatSessionRef({ backendId: deps.bound().ref.backendId, sessionId: target.sessionId });
                return {
                    async reserve() {
                        const reserved = await deps.mounts.reserve(key);
                        if (reserved.ok) {
                            reservation = reserved.reservation;
                            return undefined;
                        }
                        const text = mountFailureText(reserved);
                        deps.notify(text, { color: 'error', timeoutMs: 8000 });
                        return reserved.reason === 'occupied'
                            ? { ok: false, reason: 'occupied', pid: reserved.holders[0] ?? 0 }
                            : { ok: false, reason: 'failed', error: text };
                    },
                    async open() {
                        const opened = await openWithHistory(() => deps.open({ kind: 'resume', sessionId: target.sessionId }));
                        history = opened.history;
                        return opened.session;
                    },
                    adopt: candidate => adoptWith(candidate, history),
                    finish(committed) {
                        if (committed)
                            reservation?.settle();
                        else
                            reservation?.abandon();
                        if (committed)
                            deps.mounts.release(previousKey);
                    },
                };
            },
        },
    };
}
