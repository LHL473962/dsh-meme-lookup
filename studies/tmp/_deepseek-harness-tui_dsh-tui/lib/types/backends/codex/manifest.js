export const manifest = {
    id: 'codex',
    label: { kind: 'key', key: 'kernel-label-codex' },
    shortLabel: 'Codex',
    product: 'codex-cli',
    inTree: true,
    backendExport: 'codexBackend',
    unloadExport: 'closeAllCodexHubs',
    vendorPackages: [],
    // The optional session surfaces this backend serves (B-2 dogfood): the union
    // of `session/session.ts`'s own literal capabilities, the model/mode/compaction
    // controls it spreads in from `session/controls.ts`, and the two conditional
    // ones (`auth` when the credential bridge is up, `channels` for relay profiles).
    capabilities: [
        'native', 'commands', 'workingActivity', 'subagents', 'goals', 'tasks', 'images',
        'transcript', 'color', 'fork', 'rewind', 'sideQuery', 'permissions', 'questions',
        'pendingRetraction', 'diagnostics', 'models', 'effort', 'modes', 'compact',
        'context', 'account', 'mcp', 'rename', 'init', 'auth', 'channels',
    ],
    // See the Claude manifest: a backend's real needs are `BackendHost` capabilities,
    // not host permissions (D-3). Declared rather than omitted.
    grants: [],
};
