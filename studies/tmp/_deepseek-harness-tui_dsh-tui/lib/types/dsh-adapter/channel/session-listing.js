/** Share a pending background read with the browser, including progress that
 * arrived before it opened. Completed reads still refresh on the next open. */
export function createSessionListing(deps) {
    let active;
    let generation = 0;
    const invalidate = () => {
        ++generation;
        active?.listeners.clear();
        active = undefined;
    };
    deps.owner.own(invalidate);
    const listSessions = async (onEnriched, onPartial) => {
        if (active === undefined || !active.current()) {
            invalidate();
            const version = generation;
            const fence = deps.capture();
            const flight = {
                current: () => generation === version && fence(),
                listeners: new Set(),
                // Defer the read so the first subscriber is installed before even a
                // synchronous provider publishes progress.
                promise: Promise.resolve().then(() => flight.current() ? deps.read(flight.current, enriched => {
                    if (!flight.current())
                        return;
                    flight.rows = flight.rows?.map(row => row.id === enriched.id ? enriched : row);
                    for (const listener of flight.listeners)
                        listener.enriched?.(enriched);
                }, rows => {
                    if (!flight.current())
                        return;
                    flight.rows = rows;
                    for (const listener of flight.listeners)
                        listener.partial?.(rows);
                }) : []).finally(() => {
                    // DSH title recovery may still enrich this generation after the
                    // read resolves. Let its callbacks live with that work, without
                    // retaining the browser through the channel's pending-read slot.
                    if (active === flight)
                        active = undefined;
                }),
            };
            active = flight;
        }
        const flight = active;
        flight.listeners.add({ enriched: onEnriched, partial: onPartial });
        if (flight.rows !== undefined)
            onPartial?.(flight.rows);
        return flight.promise;
    };
    return { listSessions, invalidate };
}
