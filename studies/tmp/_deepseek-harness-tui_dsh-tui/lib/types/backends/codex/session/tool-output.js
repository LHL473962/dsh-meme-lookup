export function createToolOutputBuffer(emit, clock) {
    const pending = new Map();
    const keyOf = (event) => (event.parentCallId ?? '') + '\u0000' + event.callId;
    const flush = (callId) => {
        for (const [id, value] of pending) {
            if (callId !== undefined && value.event.callId !== callId)
                continue;
            pending.delete(id);
            clock.clearTimeout(value.timer);
            emit([value.event]);
        }
    };
    return {
        push(event) {
            const value = pending.get(keyOf(event));
            if (value !== undefined) {
                value.event = { ...event, text: value.event.text + event.text };
                return;
            }
            pending.set(keyOf(event), { event, timer: clock.setTimeout(() => flush(event.callId), 100) });
        },
        flush,
        close() {
            for (const value of pending.values())
                clock.clearTimeout(value.timer);
            pending.clear();
        },
    };
}
