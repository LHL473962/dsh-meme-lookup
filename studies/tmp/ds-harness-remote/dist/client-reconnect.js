/** Retry only carrier establishment, never an RPC or an outgoing user action. */
export class ClientReconnect {
    config;
    pending;
    constructor(config) {
        this.config = config;
    }
    cancel() {
        this.pending?.abort();
        this.pending = undefined;
    }
    start(connect, error) {
        this.cancel();
        if (!this.config.enabled || !canReconnect(error))
            return;
        const pending = new AbortController();
        this.pending = pending;
        void this.run(connect, pending).finally(() => {
            if (this.pending === pending)
                this.pending = undefined;
        });
    }
    async run(connect, pending) {
        let delay = this.config.initialDelayMs;
        while (!pending.signal.aborted) {
            const jitter = delay * this.config.jitter * (Math.random() * 2 - 1);
            await new Promise(resolve => {
                const finish = () => {
                    clearTimeout(timer);
                    pending.signal.removeEventListener('abort', finish);
                    resolve();
                };
                const timer = setTimeout(finish, Math.max(0, delay + jitter));
                pending.signal.addEventListener('abort', finish, { once: true });
            });
            if (pending.signal.aborted)
                return;
            try {
                await connect(pending.signal);
                return;
            }
            catch (error) {
                if (!canReconnect(error))
                    return;
            }
            delay = Math.min(this.config.maxDelayMs, delay * 2);
        }
    }
}
function canReconnect(error) {
    if (typeof error !== 'object' || error === null)
        return true;
    const failure = error;
    // Explicit protocol/authentication failures fail closed, including 4003.
    // Unknown network exceptions (e.g. fetch TypeError) can recover.
    if (failure.code !== undefined && ![
        'HOST_OFFLINE', 'CONNECTION_FAILED', 'CONNECTION_NOT_FOUND', 'TRANSPORT_CLOSED', 'RPC_TIMEOUT',
        'P2P_FAILED', 'TURN_UNAVAILABLE', 'RELAY_UNAVAILABLE', 'RATE_LIMITED', 'SLOW_CONSUMER', 'INTERNAL_ERROR',
    ].includes(String(failure.code)))
        return false;
    return failure.retryable !== false;
}
//# sourceMappingURL=client-reconnect.js.map