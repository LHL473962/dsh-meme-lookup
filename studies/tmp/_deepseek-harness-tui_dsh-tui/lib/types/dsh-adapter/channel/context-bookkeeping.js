/** Small mutable cells for Channel-local warning and pending-message state. */
export function createContextBookkeeping(state, notify, lowContextText, warningBufferTokens) {
    const warning = { value: false };
    const checkContextWarning = () => {
        const channel = state();
        const occupancy = channel.contextOccupancy;
        // No window (no route capacity) is the only reason to stay silent: the
        // numerator is now the projected occupancy, which exists as soon as a
        // meter (any normal deployment) or one settled request knows anything.
        if (warning.value || occupancy === undefined || occupancy.contextWindow === undefined)
            return;
        if (occupancy.contextWindow <= 0)
            return;
        const remaining = occupancy.contextWindow - occupancy.usedTokens;
        if (remaining >= warningBufferTokens)
            return;
        warning.value = true;
        notify(lowContextText(Math.max(0, Math.round((remaining / occupancy.contextWindow) * 100))), {
            color: 'warning', timeoutMs: 8000,
        });
    };
    const trackPending = (message, placement) => {
        const channel = state();
        channel.pending = [...channel.pending, { id: message.id, text: message.text, images: message.images ?? [], placement }];
        channel.emit();
    };
    const untrackPending = (messageId) => {
        const channel = state();
        const before = channel.pending.length;
        channel.pending = channel.pending.filter(item => item.id !== messageId);
        if (channel.pending.length !== before)
            channel.emit();
    };
    const resetContextWarning = () => { warning.value = false; };
    return { warning, resetContextWarning, checkContextWarning, trackPending, untrackPending };
}
