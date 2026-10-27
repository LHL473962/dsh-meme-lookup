/** Channel lifetime plus binding fences for work that crosses an await. */
export function createChannelOwner() {
    let active = true;
    let externalCheck = () => true;
    const cleanups = new Set();
    const controller = new AbortController();
    const current = () => {
        if (!active)
            return false;
        try {
            return externalCheck();
        }
        catch {
            return false;
        }
    };
    const assertActive = () => {
        if (!current())
            throw new Error('dsh-tui: Channel lifetime has ended');
    };
    return {
        current, assertActive,
        get cleanupCount() { return cleanups.size; },
        signal: controller.signal,
        bind(check) { externalCheck = check; },
        own(cleanup) {
            let released = false;
            const release = () => {
                if (released)
                    return;
                released = true;
                cleanups.delete(release);
                cleanup();
            };
            if (active)
                cleanups.add(release);
            else
                release();
            return release;
        },
        dispose() {
            if (!active)
                return;
            active = false;
            controller.abort();
            const failures = [];
            // Every registered resource gets one cleanup attempt. A throwing
            // external disposer must not strand later subscriptions or handles.
            for (const cleanup of [...cleanups]) {
                try {
                    cleanup();
                }
                catch (error) {
                    failures.push(error);
                }
            }
            if (failures.length === 1)
                throw failures[0];
            if (failures.length > 1)
                throw new AggregateError(failures, 'dsh-tui: Channel cleanup failed');
        },
    };
}
const owners = new WeakMap();
export function registerChannelOwner(channel, owner) { owners.set(channel, owner); }
export function bindChannelOwner(channel, check) { owners.get(channel)?.bind(check); }
export function channelOwnerCurrent(channel) { return owners.get(channel)?.current() ?? false; }
/** Register work that must be revoked whenever this Channel owner releases. */
export function onChannelOwnerDispose(channel, cleanup) {
    const owner = owners.get(channel);
    return owner === undefined ? (() => undefined) : owner.own(cleanup);
}
export function disposeChannelOwner(channel) { owners.get(channel)?.dispose(); }
