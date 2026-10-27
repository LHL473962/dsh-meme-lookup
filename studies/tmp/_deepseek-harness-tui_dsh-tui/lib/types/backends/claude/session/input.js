import { rec } from '../narrow.js';
/** A minimal push-based async iterable: the session's stdin. */
export function createInbox() {
    const queue = [];
    const waiters = [];
    let closed = false;
    return {
        push(value) {
            if (closed)
                throw new Error('dsh-tui: Claude session input is closed');
            const waiter = waiters.shift();
            if (waiter !== undefined)
                waiter({ value, done: false });
            else
                queue.push(value);
        },
        close() {
            if (closed)
                return;
            closed = true;
            for (const waiter of waiters.splice(0))
                waiter({ value: undefined, done: true });
        },
        get closed() { return closed; },
        [Symbol.asyncIterator]() {
            return {
                next: () => {
                    const value = queue.shift();
                    if (value !== undefined)
                        return Promise.resolve({ value, done: false });
                    if (closed)
                        return Promise.resolve({ value: undefined, done: true });
                    return new Promise(resolve => { waiters.push(resolve); });
                },
                return: () => {
                    closed = true;
                    return Promise.resolve({ value: undefined, done: true });
                },
            };
        },
    };
}
/** Renderer urgency of one translated message. */
export function wakeOf(message, events) {
    const value = rec(message);
    if (value?.type === 'stream_event' && rec(value.event)?.type === 'content_block_delta')
        return 'frame';
    if (value?.type === 'system' && value.subtype === 'thinking_tokens')
        return 'frame';
    return events.every(event => event.type === 'session.status' || event.type === 'pending.changed') ? 'none' : 'sync';
}
/** `SDKUserMessage.priority` for a channel placement. */
export function priorityOf(placement, turnOpen) {
    switch (placement) {
        case 'steer':
            return 'next';
        case 'now':
            return 'now';
        case 'followup':
            return turnOpen ? 'later' : undefined;
        default:
            return undefined;
    }
}
