import { codexText } from '../text.js';
import { errorText, rec, str } from '../narrow.js';
import { CLIENT } from '../protocol/index.js';
import { codexImageInputs } from './images.js';
/** The model-facing input of a submission: every text block as its own
 *  text input (the first is what the user typed), in block order. */
export function userInputOf(input) {
    const blocks = input.blocks ?? [{ type: 'text', text: input.text }];
    const out = [];
    for (const block of blocks) {
        if (block.type === 'text' && typeof block.text === 'string' && block.text !== '')
            out.push({ type: 'text', text: block.text, text_elements: [] });
    }
    if (out.length === 0)
        out.push({ type: 'text', text: input.text, text_elements: [] });
    return out;
}
export function createInputQueue(deps) {
    /** The running turn (from its start answer or `turn/started`). */
    let activeTurnId;
    /** Inline reviews can use a different id for items/completion than the
     *  one announced by `turn/started` (Codex 0.160.1). */
    let reviewTurnId;
    /** A `turn/start` in flight: resolves with the turn id (undefined = it failed). */
    let starting;
    /** Reviews announce their interrupt id separately from their request id. */
    let resolveReviewStart;
    /** Inputs not sent yet (the client follow-up queue). */
    let queue = [];
    /** Sent with `turn/start`, not yet claimed by their user message. */
    const started = new Map();
    /** Sent with `turn/steer`, not yet claimed. */
    const steered = new Map();
    /** Why the running turn is being cancelled (decides the fate of steers). */
    let cancelCause;
    let forceTimer;
    let steerFallbackSaid = false;
    /** The connection is down: nothing is sent until it is back. */
    let offline = false;
    /** The connection is gone FOR GOOD: submits fail fast instead of parking. */
    let dead = false;
    const snapshot = () => [
        ...[...steered.values()].map(entry => ({ id: entry.id, text: entry.text, placement: 'steer' })),
        ...queue.map(entry => ({ id: entry.id, text: entry.text, placement: entry.placement })),
    ];
    const pendingEvent = (change) => ({ type: 'pending.changed', items: snapshot(), ...change });
    const clearForceTimer = () => {
        if (forceTimer === undefined)
            return;
        deps.clock.clearTimeout(forceTimer);
        forceTimer = undefined;
    };
    const settleReviewStart = (id) => {
        if (resolveReviewStart === undefined)
            return;
        resolveReviewStart(id);
        resolveReviewStart = undefined;
        starting = undefined;
    };
    /** Send one input as a new turn. */
    const startTurn = async (entry) => {
        started.set(entry.id, entry);
        let resolveStart;
        starting = new Promise(resolve => { resolveStart = resolve; });
        const overrides = deps.overrides();
        try {
            const answer = rec(await deps.call(CLIENT.turnStart, {
                threadId: deps.threadId,
                clientUserMessageId: entry.id,
                input: entry.input,
                ...overrides,
            }));
            const turnId = str(rec(answer?.turn)?.id);
            if (turnId !== undefined && activeTurnId === undefined)
                activeTurnId = turnId;
            resolveStart(turnId ?? activeTurnId);
            return { accepted: true };
        }
        catch (error) {
            deps.startFailed?.(error, overrides);
            started.delete(entry.id);
            resolveStart(undefined);
            const reason = codexText('codex-turn-start-failed', { err: errorText(error) });
            deps.debug(`codex: turn/start failed (${errorText(error)})`);
            deps.emit([pendingEvent({ discarded: [entry.id] })]);
            return { accepted: false, reason };
        }
        finally {
            starting = undefined;
        }
    };
    /** Start the next queued input when the thread is idle. */
    const drain = () => {
        if (offline || deps.closed() || activeTurnId !== undefined || starting !== undefined)
            return;
        const next = queue.shift();
        if (next === undefined)
            return;
        void startTurn(next).then(result => {
            if (!result.accepted)
                deps.emit([{ type: 'notice', level: 'error', text: result.reason ?? codexText('codex-turn-start-failed', { err: '' }) }]);
            else
                drain();
        });
    };
    /** Join the running turn, or fall back to the queue. */
    const steer = async (entry) => {
        const turnId = activeTurnId ?? await starting;
        if (turnId === undefined) {
            queue.push(entry);
            drain();
            return { accepted: true };
        }
        steered.set(entry.id, entry);
        try {
            await deps.call(CLIENT.turnSteer, { threadId: deps.threadId, expectedTurnId: turnId, clientUserMessageId: entry.id, input: entry.input });
            return { accepted: true };
        }
        catch (error) {
            steered.delete(entry.id);
            deps.debug(`codex: turn/steer refused (${errorText(error)}); queued as a follow-up`);
            if (deps.closed())
                throw error;
            queue.push(entry);
            if (!steerFallbackSaid) {
                steerFallbackSaid = true;
                deps.emit([{ type: 'notice', level: 'info', text: codexText('codex-steer-fallback') }]);
            }
            drain();
            return { accepted: true };
        }
    };
    const interrupt = async (waitForReviewStart = true) => {
        // Dispose has already stopped notification delivery. It cannot wait for
        // a review lifecycle id that only a notification could resolve.
        const turnId = activeTurnId ?? (resolveReviewStart !== undefined && !waitForReviewStart ? undefined : await starting);
        if (turnId === undefined)
            return true;
        try {
            await deps.call(CLIENT.turnInterrupt, { threadId: deps.threadId, turnId });
        }
        catch (error) {
            deps.debug(`codex: turn/interrupt failed (${errorText(error)})`);
            return false;
        }
        if (forceTimer === undefined) {
            forceTimer = deps.clock.setTimeout(() => {
                forceTimer = undefined;
                if (activeTurnId !== turnId)
                    return;
                deps.emit([{ type: 'notice', level: 'warning', text: codexText('codex-cancel-forced') }]);
                deps.forceClose(turnId, reviewTurnId);
                onTurnCompleted(turnId, true);
            }, deps.forceSettleMs);
        }
        return true;
    };
    /** The turn ended: settle unclaimed inputs, then start the next queued one. */
    const onTurnCompleted = (turnId, interrupted) => {
        if (turnId !== undefined && activeTurnId !== undefined && turnId !== activeTurnId && turnId !== reviewTurnId)
            return;
        clearForceTimer();
        settleReviewStart();
        activeTurnId = undefined;
        reviewTurnId = undefined;
        const cause = cancelCause;
        cancelCause = undefined;
        const events = [];
        // A turn/start whose user message never showed: it did not run.
        if (started.size > 0) {
            const ids = [...started.keys()];
            started.clear();
            events.push(pendingEvent({ discarded: ids }));
        }
        if (steered.size > 0) {
            const leftover = [...steered.values()];
            steered.clear();
            if (!interrupted) {
                // A completed turn records the input it had not taken yet.
                events.push(pendingEvent({ claimed: leftover.map(entry => entry.id) }));
            }
            else if (cause === 'interrupt' || cause === 'switch' || cause === 'dispose') {
                events.push(pendingEvent({ discarded: leftover.map(entry => entry.id) }));
            }
            else {
                // Dropped by the interrupt (V6) but still wanted: run them next,
                // after an input sent with `now` (the reason for the interrupt).
                const urgent = queue.filter(entry => entry.urgent === true);
                const rest = queue.filter(entry => entry.urgent !== true);
                queue = [...urgent, ...leftover.map(entry => ({ ...entry, placement: 'followup' })), ...rest];
            }
        }
        if (events.length > 0)
            deps.emit(events);
        drain();
    };
    return {
        get activeTurnId() { return activeTurnId; },
        /** Whether a turn runs or is being started. */
        busy() { return activeTurnId !== undefined || starting !== undefined; },
        async submit(input, placement, wireInput) {
            if (deps.closed())
                throw new Error(codexText('codex-session-closed'));
            if (dead)
                throw new Error(codexText('codex-connection-dead'));
            if ((input.images ?? []).length === 0 && (input.blocks ?? []).some(block => block.type === 'image'))
                throw new Error(codexText('codex-image-unreadable', { name: input.clientMessageId }));
            const pictureInputs = await codexImageInputs(input.images ?? []);
            if (deps.closed())
                throw new Error(codexText('codex-session-closed'));
            const entry = { id: input.clientMessageId, text: input.text, input: [...(wireInput ?? userInputOf(input)), ...pictureInputs], placement: placement === 'steer' ? 'steer' : 'followup' };
            if (offline) {
                queue.push(entry);
                return { accepted: true };
            }
            if (activeTurnId === undefined && starting === undefined)
                return startTurn(entry);
            switch (placement) {
                case 'steer':
                    return steer(entry);
                case 'now':
                    queue.unshift({ ...entry, urgent: true });
                    void interrupt();
                    return { accepted: true };
                default:
                    queue.push(entry);
                    return { accepted: true };
            }
        },
        async cancel(cause) {
            const covered = [...steered.keys(), ...queue.map(entry => entry.id)];
            const busy = activeTurnId !== undefined || starting !== undefined;
            if (cause !== 'user') {
                const dropped = queue.map(entry => entry.id);
                queue = [];
                if (dropped.length > 0)
                    deps.emit([pendingEvent({ discarded: dropped })]);
            }
            if (busy) {
                cancelCause = cause;
                const ok = await interrupt();
                if (!ok) {
                    // The turn goes on: its end must not be read as this cancel's.
                    cancelCause = undefined;
                    return { stillQueued: cause === 'user' ? covered : [...steered.keys()], outcome: 'failed' };
                }
            }
            return cause === 'user'
                ? { stillQueued: [...steered.keys(), ...queue.map(entry => entry.id)], outcome: 'confirmed' }
                : { stillQueued: [], outcome: 'confirmed' };
        },
        /** Pull a queued input back before it is sent. */
        remove(id) {
            const index = queue.findIndex(entry => entry.id === id);
            if (index === -1)
                return false;
            queue.splice(index, 1);
            return true;
        },
        /** A user message carried this client id back: the input ran. */
        claim(clientId) {
            if (!started.delete(clientId) && !steered.delete(clientId))
                return undefined;
            return pendingEvent({ claimed: [clientId] });
        },
        onTurnStarted(turnId) {
            activeTurnId = turnId;
            settleReviewStart(turnId);
        },
        /** Reserve the turn before review/start reaches the server. The returned
         *  cleanup releases only this request's wait if its RPC fails. */
        beginReview() {
            const pending = new Promise(resolve => { resolveReviewStart = resolve; });
            starting = pending;
            return () => {
                if (starting !== pending)
                    return;
                settleReviewStart();
                reviewTurnId = undefined;
                cancelCause = undefined;
                drain();
            };
        },
        onReviewStarted(turnId) {
            reviewTurnId = turnId;
            // review/start's id cannot be used by turn/interrupt. Keep submissions
            // queued and let an early Esc wait for the native lifecycle id.
            if (activeTurnId === undefined && starting === undefined)
                starting = new Promise(resolve => { resolveReviewStart = resolve; });
        },
        onTurnCompleted,
        /** Re-queue a rejection's reason as the next turn (D10). */
        enqueueFollowup(id, text) {
            queue.push({ id, text, input: [{ type: 'text', text, text_elements: [] }], placement: 'followup' });
            drain();
        },
        /** The connection dropped: the running turn is gone, the queue stays. */
        connectionLost() {
            offline = true;
            clearForceTimer();
            settleReviewStart();
            activeTurnId = undefined;
            reviewTurnId = undefined;
            const lost = [...started.keys(), ...steered.keys()];
            started.clear();
            steered.clear();
            return lost.length === 0 ? [] : [pendingEvent({ discarded: lost })];
        },
        connectionRestored() {
            offline = false;
            dead = false;
            drain();
        },
        /** The connection is gone for good: the parked queue is discarded (their
         *  pending rows say so) and later submits fail fast instead of parking
         *  forever behind an offline flag nothing will ever clear. */
        permanentLoss() {
            offline = false;
            dead = true;
            const dropped = queue.map(entry => entry.id);
            queue = [];
            return dropped.length === 0 ? [] : [pendingEvent({ discarded: dropped })];
        },
        /** Dispose: forget everything, stop the timer. */
        close() {
            clearForceTimer();
            settleReviewStart();
            queue = [];
            started.clear();
            steered.clear();
            reviewTurnId = undefined;
        },
        /** Interrupt the running turn (best-effort, dispose path). */
        interrupt,
    };
}
