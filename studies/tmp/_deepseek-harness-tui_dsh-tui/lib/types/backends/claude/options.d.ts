/**
 * The Claude Code fidelity profile: the `query()` options that make a dsh-tui Claude session behave like `claude`
 * in the same project — the CLI's own system prompt, every settings source
 * (CLAUDE.md, hooks, MCP, plugins load as in the CLI), its tool preset, an
 * explicit start permission mode, streaming partials, subagent text and
 * per-task stop, file checkpoints, and the host's permission callback.
 *
 * `OPTION_POLICY` classifies every SDK option. It is checked with
 * `satisfies Record<keyof Options, …>`: an option the SDK adds or removes
 * fails `tsc` here until someone decides what the profile does with it.
 */
import type { CanUseTool, OnElicitation, OnUserDialog, Options, PermissionMode, SettingSource } from '@anthropic-ai/claude-agent-sdk';
import type { ClaudeSdkModule } from './sdk.js';
import './sdk-warnings.js';
export declare const OPTION_POLICY: {
    readonly abortController: "set";
    readonly additionalDirectories: "later";
    readonly projectConfigRoot: "omit";
    readonly agent: "omit";
    readonly agents: "omit";
    readonly allowedTools: "set";
    readonly canUseTool: "set";
    readonly continue: "omit";
    readonly cwd: "set";
    readonly disallowedTools: "omit";
    readonly toolAliases: "omit";
    readonly tools: "set";
    readonly env: "set";
    readonly executable: "omit";
    readonly executableArgs: "omit";
    readonly extraArgs: "set";
    readonly fallbackModel: "omit";
    readonly enableFileCheckpointing: "set";
    readonly toolConfig: "omit";
    readonly forkSession: "side";
    readonly betas: "omit";
    readonly hooks: "omit";
    readonly onElicitation: "set";
    readonly onUserDialog: "set";
    readonly supportedDialogKinds: "set";
    readonly perTaskStopAffordance: "set";
    readonly persistSession: "side";
    readonly sessionStore: "omit";
    readonly sessionStoreFlush: "omit";
    readonly loadTimeoutMs: "omit";
    readonly includeHookEvents: "set";
    readonly includePartialMessages: "set";
    readonly forwardSubagentText: "set";
    readonly verbatimPrompts: "omit";
    readonly thinking: "omit";
    readonly effort: "set";
    readonly maxThinkingTokens: "omit";
    readonly maxTurns: "side";
    readonly maxBudgetUsd: "omit";
    readonly taskBudget: "omit";
    readonly mcpServers: "omit";
    readonly model: "set";
    readonly outputFormat: "omit";
    readonly pathToClaudeCodeExecutable: "set";
    readonly permissionMode: "set";
    readonly planModeInstructions: "omit";
    readonly allowDangerouslySkipPermissions: "set";
    readonly permissionPromptToolName: "omit";
    readonly permissionPrompts: "omit";
    readonly plugins: "omit";
    readonly pluginDelivery: "omit";
    readonly promptSuggestions: "omit";
    readonly agentProgressSummaries: "omit";
    readonly resume: "set";
    readonly sessionId: "set";
    readonly resumeSessionAt: "later";
    readonly resumeDropsTurn: "later";
    readonly sandbox: "omit";
    readonly settings: "set";
    readonly managedSettings: "omit";
    readonly settingSources: "set";
    readonly skills: "omit";
    readonly debug: "omit";
    readonly debugFile: "omit";
    readonly stderr: "set";
    readonly strictMcpConfig: "omit";
    readonly systemPrompt: "set";
    readonly title: "omit";
    readonly spawnClaudeCodeProcess: "omit";
};
/** Every settings source, so CLAUDE.md, hooks, MCP and plugins load as in
 *  the CLI (`project` is the one that brings CLAUDE.md). */
export declare const SETTING_SOURCES: SettingSource[];
/** The plan-tracking tools the todo panel renders (the Task* family
 *  replaced TodoWrite in CLI 2.1.284). The preset defers them, so
 *  `allowedTools` brings them in and pre-approves them; `tools` stays the
 *  preset (an explicit list would replace the whole default set). */
export declare const TODO_PANEL_TOOLS: readonly string[];
/** What the start-mode resolution decided, and why (for a notice). */
export interface StartPermissionMode {
    readonly mode: PermissionMode;
    /** Set when the configured mode was not honoured. */
    readonly downgradedFrom?: PermissionMode;
    readonly source: 'env' | 'pref' | 'settings' | 'default';
    /** `DSH_TUI_CLAUDE_PERMISSION_MODE` was set to a value the override refuses. */
    readonly ignoredOverride?: string;
    /** The remembered pick was `bypassPermissions`, which a new session never
     *  starts in (it was resolved as if nothing were remembered). */
    readonly bypassNotCarried?: true;
}
/**
 * The explicit start permission mode (never omitted: the CLI default may be
 * `auto`). `DSH_TUI_CLAUDE_PERMISSION_MODE` is a developer override for live
 * tests and the only way to start in `bypassPermissions`
 * (docs/configuration.md). Next comes `pref`, the user's remembered
 * `/permission` pick (`~/.dsh-tui/backends/claude/prefs.json`): it skips the
 * settings cascade (no escalation filter, no downgrade notice) — except a
 * remembered `bypassPermissions`, which is never carried into a new session
 * (Claude Code itself wants an explicit flag on every start): it resolves as
 * if nothing were remembered and says so (`bypassNotCarried`). An illegal
 * persisted value reads as no choice. Otherwise the user's settings cascade
 * after the CLI's own trust filter for escalating modes from repo-committed
 * files; otherwise `default`.
 *
 * Starting elsewhere restricts nothing: the bypass gate rides along on every
 * query (`buildQueryOptions`), so `/permission` may switch into
 * `bypassPermissions` at any point of the session.
 */
export declare function resolveStartPermissionMode(sdk: Pick<ClaudeSdkModule, 'resolveSettings' | 'filterEscalatingDefaultMode'>, cwd: string, env?: NodeJS.ProcessEnv, pref?: string): Promise<StartPermissionMode>;
export type ProfileInput = {
    readonly cwd: string;
    readonly permissionMode: PermissionMode;
    readonly executable: string | undefined;
    readonly env: Record<string, string>;
    readonly canUseTool: CanUseTool;
    /** MCP elicitation and the CLI's user dialogs (dialogs.ts); absent = the
     *  SDK defaults (elicitation declined, no dialog kinds declared). */
    readonly onElicitation?: OnElicitation;
    readonly onUserDialog?: OnUserDialog;
    readonly supportedDialogKinds?: readonly string[];
    readonly stderr: (data: string) => void;
    readonly abortController: AbortController;
    /** Fall back to echoed user messages when the CLI has no lifecycle frames. */
    readonly replayUserMessages: boolean;
    /** Start model / effort (the user's persisted choice); absent = the CLI's. */
    readonly model?: string;
    readonly effort?: string;
    /** The auth plan's flag layer (auth.ts) as a file path
     *  (flag-settings.ts); absent = none. */
    readonly settingsFile?: string;
} & (
/** A new session under this id … */
{
    readonly sessionId: string;
    readonly resume?: undefined;
}
/** … or the same session resumed (the SDK refuses both together). */
 | {
    readonly resume: string;
    readonly sessionId?: undefined;
});
/** What a side query (`/btw`, `/recap`; side-query.ts) runs with. */
export interface SideQueryInput {
    readonly cwd: string;
    /** The session it forks (persisted). */
    readonly resume: string;
    readonly env: Record<string, string>;
    /** The flag layer as a file path (flag-settings.ts). */
    readonly settingsFile?: string;
    readonly executable: string | undefined;
    readonly abortController: AbortController;
    readonly stderr: (data: string) => void;
    readonly model?: string;
}
/**
 * The side query's options: a throwaway fork of the
 * conversation (`resume` + `forkSession`, `persistSession:false` — no
 * transcript written), no tools, one turn, the session's model, and the
 * session's own system prompt, settings sources, environment, credential
 * and route pin. Nothing can ask for permission (no tools; any request is
 * refused).
 */
export declare function buildSideQueryOptions(input: SideQueryInput): Options;
/** Assemble the `query()` options of one session. */
export declare function buildQueryOptions(input: ProfileInput): Options;
//# sourceMappingURL=options.d.ts.map