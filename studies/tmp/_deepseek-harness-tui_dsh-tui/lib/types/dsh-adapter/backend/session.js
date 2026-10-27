import { createUserMessage, MessageId } from '@deepseek-ai/dsh-llm';
import { isTokenDelta, tokenDeltaChars } from '../channel/usage.js';
import { snapshotLiveSessionEvents } from '../compat/liveSession.js';
import { createDshTranslator } from './translate.js';
const SYNC = { replay: false, wake: 'sync' };
const FRAME = { replay: false, wake: 'frame' };
const QUIET = { replay: false, wake: 'none' };
// The borrowed form always names its `handle` slot (possibly undefined);
// anything else is the handle itself.
const isHandle = (target) => !('handle' in target);
/** Whether a value is an `AgentSession` rather than a raw DSH agent. */
export function isAgentSession(value) {
    return typeof value === 'object' && value !== null &&
        typeof value.subscribe === 'function' &&
        typeof value.capabilities === 'object';
}
/**
 * Wrap a DSH agent (and the handle that owns it, if any) as an
 * `AgentSession`. Creating the wrapper acquires nothing: listeners exist only
 * while `subscribe`/`subscribeRaw` subscriptions are live, and only `dispose()`
 * releases the handle.
 */
export function createDshSession(ctx, target) {
    const agent = target.agent;
    const handle = isHandle(target) ? target : target.handle;
    // The tools registry is read lazily, once per session, on the first
    // presenter call, so wrapping an agent touches no host service.
    let tools;
    const translatorDeps = {
        tools: () => (tools ??= { registry: ctx.get('tools') }).registry,
        scope: () => agent,
        attachments: () => ctx.get('attachments'),
    };
    const translator = createDshTranslator(translatorDeps);
    let disposed = false;
    /** Inputs this session queued that the inbox has not claimed or discarded. */
    const pending = new Map();
    /**
     * One `session/event` listener per subscription period, shared by raw and
     * translated subscribers. Raw subscribers (the DSH extensions) see each
     * main-session event before the translated batch reaches the projector, and
     * the bus only ever sees one foreground listener. A removed install is
     * inert.
     */
    const rawListeners = new Set();
    const eventListeners = new Set();
    let eventTap;
    const tapEvents = () => {
        if (eventTap !== undefined)
            return;
        let live = true;
        const dispose = ctx.on('session/event', (subject, event) => {
            if (!live || subject !== agent.session)
                return;
            for (const listener of [...rawListeners])
                listener(event);
            for (const listener of [...eventListeners])
                listener(event);
        });
        eventTap = { dispose: () => { live = false; dispose(); } };
    };
    const untapEvents = () => {
        if (rawListeners.size > 0 || eventListeners.size > 0 || eventTap === undefined)
            return;
        const tap = eventTap;
        eventTap = undefined;
        tap.dispose();
    };
    /** Every listener install is owned at once; a throwing unsubscriber does not
     *  stop the rest (the first failure is rethrown after all ran). */
    const disposeAll = (disposers) => {
        let failure;
        for (const dispose of disposers.splice(0)) {
            try {
                dispose();
            }
            catch (error) {
                failure ??= error;
            }
        }
        if (failure !== undefined)
            throw failure;
    };
    const messageFor = (input) => {
        // The channel's DSH input pipeline already built the durable message; its
        // id is the clientMessageId the channel tracks pending/selection/context
        // under. Any other caller gets a fresh message from its blocks.
        const native = input.native;
        if (native !== undefined && native.id === input.clientMessageId)
            return native;
        return createUserMessage({
            content: (input.blocks ?? [{ type: 'text', text: input.text }]),
            source: { kind: 'user' },
        });
    };
    const native = {
        kind: 'dsh',
        agent,
        handle,
        ctx,
        subscribeRaw(listener) {
            const entry = (event) => listener(event);
            rawListeners.add(entry);
            try {
                tapEvents();
            }
            catch (error) {
                rawListeners.delete(entry);
                throw error;
            }
            return () => {
                rawListeners.delete(entry);
                untapEvents();
            };
        },
        rawHistory: () => snapshotLiveSessionEvents(agent.session),
        translateReplay: (events) => translator.translateReplay(events),
        resetTranslation: () => translator.reset(),
        presentCallView: translator.presentCallView,
        presentResultView: translator.presentResultView,
    };
    const session = {
        get ref() { return { backendId: 'dsh', sessionId: String(agent.session.id) }; },
        get cwd() {
            return agent.session.header?.cwd ?? '';
        },
        get status() {
            if (disposed)
                return 'disposed';
            return agent.status === 'running' ? 'running' : 'idle';
        },
        capabilities: {
            pendingRetraction: {
                remove(clientMessageId) {
                    const removed = agent.inbox.remove(MessageId(clientMessageId));
                    if (removed)
                        pending.delete(clientMessageId);
                    return removed;
                },
            },
            native: { dsh: native },
        },
        // A throwaway translator: `history()` is a read, so it must neither reset
        // the live translator's frame fence nor leave the replay's open calls in
        // the live open-call ledger. (Adoption seeds still go through
        // `native.translateReplay`, which is a deliberate live reset.)
        history: () => Promise.resolve(createDshTranslator(translatorDeps).translateReplay(snapshotLiveSessionEvents(agent.session))),
        subscribe(listener) {
            // A callback the bus retained past unsubscription (a dispatch already
            // in flight, an ABA rebind) is inert: nothing is translated for it.
            let active = true;
            const disposers = [() => { active = false; }];
            const own = (dispose) => { disposers.push(dispose); };
            try {
                own(ctx.on('agent/status', ({ agent: subject, status }) => {
                    if (!active || subject !== agent)
                        return;
                    listener([{ type: 'session.status', status }], QUIET);
                }));
                own(ctx.on('agent/disposed', ({ agent: subject }) => {
                    if (!active || subject !== agent)
                        return;
                    disposed = true;
                    listener([{ type: 'session.status', status: 'disposed' }], QUIET);
                }));
                /**
                 * The inbox removed one message. Both events retire the pending entry;
                 * the channel retires attached context only for a discard.
                 * `agent/inbox/claimed` fires while the loop claims the batch, before
                 * the resident `agent/pre-step` listener can append the attachment
                 * (dsh-agent-loop: `inbox.claim()` → claimed event → `agent/pre-step`).
                 */
                const retire = (payload, how) => {
                    if (!active || payload.agent !== agent)
                        return;
                    const messageId = payload.message?.id;
                    if (typeof messageId !== 'string')
                        return;
                    pending.delete(messageId);
                    const items = [...pending.values()];
                    listener([how === 'claimed'
                            ? { type: 'pending.changed', items, claimed: [messageId] }
                            : { type: 'pending.changed', items, discarded: [messageId] }], QUIET);
                };
                own(ctx.on('agent/inbox/claimed', payload => retire(payload, 'claimed')));
                own(ctx.on('agent/inbox/discarded', payload => retire(payload, 'discarded')));
                const onEvent = (event) => {
                    if (!active)
                        return;
                    // Legacy per-token chunks arrive as session events; they wake the
                    // renderer frame-coalesced like live stream frames.
                    listener(translator.translateEvent(event), event.type === 'assistant/chunk' ? FRAME : SYNC);
                };
                eventListeners.add(onEvent);
                own(() => {
                    eventListeners.delete(onEvent);
                    untapEvents();
                });
                tapEvents();
                // Live streaming (dsh 0.1.5+; older hosts never emit this): per-token
                // chunks are transient attempt frames on this agent-scoped event, and
                // the durable result still arrives through `session/event`. A start
                // frame alone changes nothing visible, so it does not wake the
                // renderer.
                own(ctx.on('agent/assistant-stream', ({ agent: subject, frame }) => {
                    if (!active || subject !== agent)
                        return;
                    listener(translator.translateFrame(frame), frame.type === 'chunk' ? FRAME : frame.type === 'end' ? SYNC : QUIET);
                }));
                // Live compaction progress. The summarizer is one `ctx.llm.stream()`
                // call, so its chunks are the only sign of work between
                // `compaction/start` and `compaction/end`. dsh-llm tags that call
                // `purpose: 'compaction'`, and a manual compaction runs while the
                // session is idle, so it cannot be mixed up with a turn's stream. Any
                // other purpose or session gets the original iterable back.
                // A summary stream that started while subscribed keeps reporting until
                // it ends; the channel decides what a late report may still touch.
                own(ctx.on('llm/stream', (options, next) => {
                    const stream = next();
                    if (!active || options.purpose !== 'compaction')
                        return stream;
                    if (options.sessionId === undefined || String(options.sessionId) !== String(agent.session.id))
                        return stream;
                    return (async function* compactionStream() {
                        for await (const chunk of stream) {
                            if (isTokenDelta(chunk))
                                listener([{ type: 'compaction.progress', outputChars: tokenDeltaChars(chunk) }], FRAME);
                            yield chunk;
                        }
                    })();
                }));
            }
            catch (error) {
                try {
                    disposeAll(disposers);
                }
                catch { /* the install failure stays primary */ }
                throw error;
            }
            return () => disposeAll(disposers);
        },
        // Synchronous by contract for DSH: steer/followup run before this returns,
        // and a synchronous throw reaches the caller synchronously (the input
        // pipeline rolls its bookkeeping back on it).
        submit(input, placement) {
            const message = messageFor(input);
            const queued = placement === 'steer' ? 'steer' : 'followup';
            pending.set(message.id, { id: message.id, text: input.text, placement: queued });
            try {
                if (placement === 'now')
                    agent.cancel({ kind: 'user' });
                if (placement === 'steer')
                    agent.steer(message);
                else
                    agent.followup(message);
            }
            catch (error) {
                pending.delete(message.id);
                throw error;
            }
            return Promise.resolve({ accepted: true });
        },
        cancel(cause) {
            // `user` keeps the queue, so queued/steered inputs run as the next turn.
            // Every other cause drops it: after `interrupt` the channel parks those
            // inputs in a dock and re-delivers nothing until the user sends it, and
            // a switch/dispose never resumes the old queue. keepInbox is only for
            // the user-cancel and normal turn-end paths.
            if (cause === 'user')
                agent.cancel({ kind: 'user' }, { keepInbox: true });
            else
                agent.cancel({ kind: 'user' });
            // The kernel cancel settles its bookkeeping synchronously: the answer
            // is definitive either way (kept ids for a 'user' cancel, an emptied
            // queue otherwise).
            return Promise.resolve({ stillQueued: cause === 'user' ? [...pending.keys()] : [], outcome: 'confirmed' });
        },
        dispose() {
            return handle === undefined ? Promise.resolve() : handle.dispose();
        },
    };
    return session;
}
/** The lifetime handle of a DSH session this process created or resumed;
 *  throws when the session borrows its agent (or is not a DSH session). */
export function dshHandleOf(session) {
    const handle = session.capabilities.native.dsh?.handle;
    if (handle === undefined)
        throw new Error(`dsh-tui: session ${session.ref.backendId}:${session.ref.sessionId} owns no DSH handle`);
    return handle;
}
