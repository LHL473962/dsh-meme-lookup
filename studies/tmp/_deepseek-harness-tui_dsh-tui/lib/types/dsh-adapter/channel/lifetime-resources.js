/** Owns temporary Agent handles until a caller explicitly transfers them. */
export function createDetachedHandleFactory(owner) {
    return async (create) => {
        owner.assertActive();
        let handle;
        let transferred = false;
        let disposePromise;
        const release = () => {
            if (transferred || handle === undefined)
                return Promise.resolve();
            disposePromise ??= handle.dispose().catch(() => undefined);
            return disposePromise;
        };
        const unregister = owner.own(() => { void release(); });
        try {
            handle = await create();
            if (!owner.current()) {
                await release();
                throw new Error('dsh-tui: Channel lifetime has ended');
            }
            return {
                handle,
                transfer() { transferred = true; unregister(); },
                async release() { unregister(); await release(); },
            };
        }
        catch (error) {
            unregister();
            await release();
            throw error;
        }
    };
}
