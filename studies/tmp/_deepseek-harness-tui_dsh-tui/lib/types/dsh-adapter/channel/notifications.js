/** Own expiry and explicit dismissal in the same bounded notification scope. */
export function createChannelNotifications(state, owner) {
    let sequence = 0;
    return (text, options = {}) => {
        owner.assertActive();
        const item = { id: sequence++, text, color: options.color, timeoutMs: options.timeoutMs ?? 4000 };
        state().notifications.push(item);
        state().emit();
        let timer;
        const release = owner.own(() => {
            if (timer !== undefined)
                clearTimeout(timer);
            const store = state();
            const index = store.notifications.indexOf(item);
            if (index >= 0) {
                store.notifications.splice(index, 1);
                store.emit();
            }
        });
        if (item.timeoutMs > 0)
            timer = setTimeout(release, item.timeoutMs);
        return release;
    };
}
