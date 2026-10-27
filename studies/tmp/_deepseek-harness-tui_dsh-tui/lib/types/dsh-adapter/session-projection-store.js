/**
 * One host session-projection key, folded for the session on screen.
 *
 * The host projection feed is process-wide and carries whole values, so a
 * read side needs the same three pieces every time: drop other keys, narrow
 * the wire value with a local guard (the producer package is never imported),
 * and read one baseline snapshot when a session binds — a value is only
 * published on change, so a resumed session would otherwise wait for its next
 * event. The store keeps only the watched session's value: a background
 * session must not overwrite what the screen shows.
 *
 * @module
 */
/** A raw value no snapshot can return: the next update always narrows. */
const UNREAD = Symbol('unread');
function sessionIdOf(session) {
    return String(session.id);
}
export function createSessionProjectionStore(options) {
    const listeners = new Set();
    let registry;
    let bound;
    let watched;
    let raw;
    let value;
    let warned = false;
    const emit = () => {
        for (const listener of [...listeners])
            listener();
    };
    const store = {
        attachRegistry(next) {
            registry = next;
            warned = false;
            if (bound !== undefined)
                store.seed(bound);
        },
        detachRegistry(left) {
            if (registry !== left)
                return;
            registry = undefined;
            raw = undefined;
            if (value === undefined)
                return;
            value = undefined;
            emit();
        },
        seed(session) {
            if (session === null || session === undefined)
                return;
            bound = session;
            const next = options.watch?.(session) ?? { id: sessionIdOf(session), session };
            if (next.id !== watched?.id) {
                raw = undefined;
                if (value !== undefined) {
                    value = undefined;
                    emit();
                }
            }
            watched = next;
            if (registry === undefined || next.session === undefined)
                return;
            try {
                store.update(next.id, registry.snapshot(next.session, [options.key]).values[options.key]);
            }
            catch (error) {
                store.noteReadFailure(error);
            }
        },
        update(sessionId, next) {
            if (sessionId !== watched?.id)
                return;
            // The host reuses the value reference while its state is unchanged, so
            // identity is the whole change test.
            if (next === raw)
                return;
            raw = next;
            const narrowed = options.narrow(next, sessionId);
            if (narrowed === undefined && value === undefined)
                return;
            value = narrowed;
            emit();
        },
        reseed() {
            if (bound === undefined)
                return;
            // The narrow may read host state the value reference does not track
            // (the team's service presence), so an unchanged value, an absent one
            // included, is re-narrowed.
            const held = raw;
            raw = UNREAD;
            store.seed(bound);
            // No snapshot was read (no registry, the watched session not live, or a
            // failed read): narrow the value already held instead.
            if (raw === UNREAD && held !== UNREAD && watched !== undefined)
                store.update(watched.id, held);
        },
        get boundId() {
            return bound === undefined ? undefined : sessionIdOf(bound);
        },
        get watchedId() {
            return watched?.id;
        },
        read: () => value,
        subscribe(listener) {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        noteReadFailure(error) {
            if (warned)
                return;
            warned = true;
            const detail = error instanceof Error ? error.message : String(error);
            options.warn?.(`dsh-tui: ${options.key} projection read failed: ${detail}`);
        },
    };
    return store;
}
/**
 * Wire one store to the host's projection registry once it exists. The
 * registry and the unit that publishes the key are mounted by other plugins,
 * so both may arrive later — or never, which leaves the store empty.
 * @param ctx - Host context of the composition root.
 * @param key - Projection key the store folds.
 * @param store - Store to fill.
 */
export function attachSessionProjection(ctx, key, store) {
    ctx.inject(['sessionProjections'], ((projectionCtx) => {
        const registry = projectionCtx.sessionProjections;
        if (registry === undefined)
            return;
        store.attachRegistry(registry);
        let offFeed;
        try {
            offFeed = registry.onChanged((session, changed, value) => {
                if (changed === key)
                    store.update(sessionIdOf(session), value);
            });
        }
        catch (error) {
            store.noteReadFailure(error);
        }
        // On the injected fiber: a re-provided registry re-runs this callback.
        projectionCtx.effect(() => () => {
            offFeed?.();
            store.detachRegistry(registry);
        }, `dsh-tui ${key} projection feed`);
    }));
}
