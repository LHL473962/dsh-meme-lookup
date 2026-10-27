const dispatchers = new WeakMap();
export function bindChannelCommands(state, commands) {
    dispatchers.set(state, commands);
    // Keep the revoked dispatcher installed: late async work must fail closed,
    // not revert to the bare-embedder path after production teardown.
}
export function channelCommands(state) {
    return dispatchers.get(state) ?? state;
}
