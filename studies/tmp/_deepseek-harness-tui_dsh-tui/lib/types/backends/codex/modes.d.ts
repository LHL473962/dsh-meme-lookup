/** The permission modes (Plan mode is C2). */
export declare const CODEX_MODE_IDS: readonly ["read-only", "auto", "full-access"];
export type CodexModeId = typeof CODEX_MODE_IDS[number];
/** The mode a session starts in when nothing is remembered. */
export declare const DEFAULT_CODEX_MODE: CodexModeId;
/** What each mode sends: `thread/start`/`thread/resume` take a sandbox
 *  mode; `turn/start` and `thread/settings/update` a sandbox policy. */
export declare const CODEX_MODE_PARAMS: Readonly<Record<CodexModeId, {
    readonly approvalPolicy: 'on-request' | 'never';
    readonly sandbox: 'read-only' | 'workspace-write' | 'danger-full-access';
}>>;
export declare function isCodexModeId(value: unknown): value is CodexModeId;
/** The mode a thread's reported settings correspond to; `custom` when they
 *  match no preset (a user config the presets do not cover). */
export declare function modeIdOf(approvalPolicy: unknown, sandbox: unknown): CodexModeId | 'custom';
//# sourceMappingURL=modes.d.ts.map