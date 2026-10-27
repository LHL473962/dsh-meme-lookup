import { attachInteraction } from '../../../channel/interaction.js';
import { createChannelProjection } from '../../../channel/projection.js';
import { logForDebugging } from '../../../utils/debug.js';
import { createTaskCompletion } from '../task-completion.js';
/**
 * The one session-batch writer path, shared by every channel composition:
 * binding-generation fence over the whole batch, session status and
 * pending-queue bookkeeping, compaction-progress gating, then the shared
 * projector and the renderer wake the backend asked for.
 */
export function createSessionBatchRouter(deps) {
    const reconcileRetiredProjection = (status) => {
        if (!deps.state.working)
            return;
        deps.warn(`dsh-tui: agent became ${status} while the channel still projected an open turn; releasing volatile UI gates`);
        deps.inputConvergence.cancelInFlight = false;
        deps.state.cancelPending = false;
        deps.state.working = false;
        deps.state.activeToolCount = 0;
        deps.projector.settleStreaming();
        deps.projector.updateSpinnerMode();
    };
    /** `session.status` as the backend reports it. */
    const applyStatus = (status) => {
        if (status === 'disposed') {
            deps.state.status = 'disposed';
            reconcileRetiredProjection('disposed');
            deps.state.emit();
            return;
        }
        // The channel's status is idle/running only; a parked prompt is mid-turn.
        deps.state.status = status === 'idle' ? 'idle' : 'running';
        if (status === 'idle')
            reconcileRetiredProjection('idle');
        deps.state.emit();
    };
    /**
     * The backend queue lost inputs. A claim and a discard both retire the
     * pending preview, but only a discard retires an attached-context entry. A
     * claim fires while the loop claims the batch, before the resident
     * `agent/pre-step` listener appends the attachment, so retiring there would
     * delete the context before it is ever injected.
     */
    const applyPending = (event) => {
        for (const messageId of event.discarded ?? [])
            deps.retireAttachment?.(messageId);
        // A discard of a docked preview only drops the backend copy. The dock
        // (where an interrupt parks inputs on the channel side) owns the row, so
        // it stays until sent (`deliverDocked`) or retracted. A claim always
        // retires the row: a fallback backend that kept its queue ran it.
        const dockedDiscards = new Set(event.discarded ?? []);
        for (const messageId of [...event.claimed ?? [], ...event.discarded ?? []]) {
            const before = deps.state.pending.length;
            deps.state.pending = deps.state.pending.filter(item => item.id !== messageId || (item.docked === true && dockedDiscards.has(messageId)));
            if (deps.state.pending.length !== before)
                deps.state.emit();
        }
    };
    /** Monotonic count of live turns that started on a bound session (`/new`
     *  compares it across its open: a whole turn may come and go meanwhile). */
    let turnStarts = 0;
    let turnEnds = 0;
    const route = (batch, meta, current) => {
        // The generation fence covers the whole batch, whatever it carries. A
        // callback retained past a rebind (an in-flight dispatch, a compaction
        // summary stream that outlived the binding it started under) must never
        // write the replacement session's transcript.
        if (!current())
            return;
        let admitted;
        let progressOnly = batch.length > 0;
        for (const [index, event] of batch.entries()) {
            switch (event.type) {
                case 'turn.start':
                    if (!meta.replay)
                        turnStarts += 1;
                    break;
                case 'turn.end':
                    if (!meta.replay)
                        turnEnds += 1;
                    break;
                case 'session.status':
                    applyStatus(event.status);
                    break;
                case 'pending.changed':
                    applyPending(event);
                    break;
                case 'compaction.progress':
                    // Summary output only advances a compaction row that is open; a
                    // stale stream after the row closed finds nothing to advance.
                    if (deps.state.compaction === undefined || deps.ownsCompactionProgress?.()) {
                        admitted ??= batch.slice(0, index);
                        continue;
                    }
                    break;
                default:
                    break;
            }
            if (event.type !== 'compaction.progress')
                progressOnly = false;
            admitted?.push(event);
        }
        const events = admitted ?? batch;
        if (progressOnly) {
            // Pure summary progress: frame-coalesced like the stream it counts.
            if (events.length === 0)
                return;
            deps.projector.apply(events, meta);
            deps.state.emitStream();
            return;
        }
        // The one writer of the foreground transcript. A live conversation
        // reset splits the batch: what came before it is projected first.
        const onReset = meta.replay ? undefined : deps.onReset;
        if (onReset !== undefined && events.some(event => event.type === 'session.reset')) {
            let start = 0;
            events.forEach((event, index) => {
                if (event.type !== 'session.reset')
                    return;
                if (index > start)
                    deps.projector.apply(events.slice(start, index), meta);
                onReset(event);
                start = index + 1;
            });
            if (start < events.length)
                deps.projector.apply(events.slice(start), meta);
        }
        else {
            deps.projector.apply(events, meta);
        }
        if (meta.wake === 'frame')
            deps.state.emitStream();
        else if (meta.wake !== 'none')
            deps.state.emit();
        deps.taskCompletion?.(events, meta, current);
    };
    return { route, reconcileRetiredProjection, turnStarts: () => turnStarts, turnEnds: () => turnEnds };
}
/**
 * The bind that follows the bound session: shared by the channel feed below
 * and the DSH binding-events owner (which direct regressions drive alone).
 */
export function createSessionBinder(deps) {
    const { owner, binding, state, inputConvergence } = deps;
    /**
     * Links the bound session's prompts to the stores Chat renders. One link
     * per binding: a replaced session (or a released channel) withdraws
     * everything it parked, so no panel outlives its session.
     */
    let interactionLink;
    if (deps.interaction !== undefined)
        owner.own(() => { interactionLink?.release(); });
    /** Bind the current session: the one subscription feeding the projector. */
    const bind = (seed) => {
        const hooks = deps.hooks();
        try {
            state.agentBindingGeneration = binding.bind();
            deps.resetTrajectory?.();
            hooks.onGeneration?.();
            inputConvergence.cancelInFlight = false;
            inputConvergence.interruptSeq += 1;
            const capture = binding.capture();
            const session = capture.session;
            const current = () => owner.current() && binding.isCurrent(capture);
            const register = (dispose) => {
                binding.subscribe(dispose);
                return dispose;
            };
            hooks.onBind?.({ capture, current, register });
            const interaction = deps.interaction;
            let link;
            if (interaction !== undefined) {
                interactionLink?.release();
                link = attachInteraction({ ...interaction, debug: logForDebugging }, { sessionId: session.ref.sessionId, capabilities: session.capabilities });
                interactionLink = link;
            }
            const facts = hooks.ownsSessionFacts === true ? undefined : deps.facts;
            // The history read ahead of the adoption paints first, so every live
            // event lands after it.
            if (facts !== undefined && seed !== undefined)
                facts.replay(seed);
            if (facts === undefined && link === undefined) {
                register(session.subscribe((batch, meta) => deps.route(batch, meta, current)));
            }
            else {
                register(session.subscribe((batch, meta) => {
                    // Prompts first: a batch that also closes the turn must not leave
                    // a panel behind it; the generation fence applies to both halves.
                    if (current()) {
                        link?.apply(batch);
                        facts?.observe(batch, session, current);
                    }
                    deps.route(batch, meta, current);
                }));
            }
            facts?.seed(capture, current, seed !== undefined);
        }
        catch (error) {
            owner.dispose();
            throw error;
        }
        hooks.afterBind?.();
    };
    return { bind };
}
export function createBindingFeed(ctx, deps) {
    const { owner, binding, state, inputConvergence, controls } = deps;
    // The projector reads its deps per use, so an extension can install its
    // job feed and pricing policy before any event is projected.
    const projectorDeps = {
        ...deps.projection, inputConvergence,
        backendLabel: () => state.backendCapabilities.backendId === 'dsh' ? undefined : state.backendCapabilities.backendLabel,
    };
    const projector = createChannelProjection(state, projectorDeps);
    const router = createSessionBatchRouter({
        state,
        projector,
        inputConvergence,
        retireAttachment: deps.retireAttachment,
        ownsCompactionProgress: () => deps.hooks().ownsCompactionProgress?.() ?? false,
        ...(deps.onReset === undefined ? {} : { onReset: deps.onReset }),
        warn: message => ctx.logger.warn(message),
        taskCompletion: deps.options.onTaskComplete === undefined ? undefined : createTaskCompletion(state, owner, deps.options.onTaskComplete),
    });
    /** Forget every per-session projection ledger: the projector's and the
     *  bound session translator's, together. */
    const resetProjection = () => {
        projector.reset();
        deps.hooks().resetTranslation?.();
    };
    /** Paint a settled history: no live toasts, no open turn left behind. */
    const paintHistory = (events) => {
        if (events.length === 0)
            return;
        projector.apply(events, { replay: true });
        projector.settleStreaming();
        state.working = false;
        state.cancelPending = false;
    };
    /**
     * Fallback for a bind without a history read ahead of it (an embedder
     * handing `createChannel` a session whose history it never read): read it
     * once, asynchronously, and paint it only if nothing live has painted yet.
     * Painting it after live rows that already arrived would misorder both.
     * Every core adoption (`/new`, `/resume`, a rewind's fork) and the plugin's
     * startup session pass the history in instead.
     */
    const replayHistory = (capture, current) => {
        void capture.session.history().then(events => {
            if (events.length === 0 || !current())
                return;
            if (state.rows.length > 0) {
                logForDebugging('channel: history arrived after live rows; not replayed');
                return;
            }
            paintHistory(events);
            state.emit();
        }).catch((error) => {
            logForDebugging(`channel: history failed (${error instanceof Error ? error.message : String(error)})`);
        });
    };
    const statusOf = (session) => session.status === 'running' || session.status === 'requires-action'
        ? 'running'
        : session.status === 'disposed' ? 'disposed' : 'idle';
    const binder = createSessionBinder({
        owner,
        binding,
        state,
        inputConvergence,
        route: router.route,
        hooks: deps.hooks,
        ...(deps.resetTrajectory === undefined ? {} : { resetTrajectory: deps.resetTrajectory }),
        interaction: deps.options.interaction,
        facts: {
            observe: controls.observe,
            replay: paintHistory,
            seed(capture, current, replayed) {
                state.status = statusOf(capture.session);
                if (!replayed)
                    replayHistory(capture, current);
                controls.seed(capture.session, current);
            },
        },
    });
    let endsBeforeBind = 0;
    return {
        projector,
        router,
        liveTurnEnds: () => router.turnEnds() - endsBeforeBind,
        bind(seed) {
            // Capture before subscribe can synchronously deliver an entire live turn.
            endsBeforeBind = router.turnEnds();
            binder.bind(seed);
        },
        resetProjection,
        /** Install the backend's job-registry feed and pricing policy (before start). */
        configureProjection(update) {
            if (update.jobs !== undefined)
                projectorDeps.jobs = update.jobs;
            if (update.pricingWindow !== undefined)
                projectorDeps.pricingWindow = update.pricingWindow;
        },
    };
}
