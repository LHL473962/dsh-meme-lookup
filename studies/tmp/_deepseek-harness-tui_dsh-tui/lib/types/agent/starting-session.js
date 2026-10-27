/** A placeholder session of `backendId` in `cwd`; its session id is empty. */
export function createStartingSession(backendId, cwd) {
    const ref = { backendId, sessionId: '' };
    let status = 'starting';
    return {
        ref,
        cwd,
        get status() { return status; },
        capabilities: { native: {} },
        history: () => Promise.resolve([]),
        subscribe: () => () => undefined,
        submit: () => Promise.resolve({ accepted: false, reason: 'starting' }),
        cancel: () => Promise.resolve({ stillQueued: [], outcome: 'confirmed' }),
        dispose: () => {
            status = 'disposed';
            return Promise.resolve();
        },
    };
}
