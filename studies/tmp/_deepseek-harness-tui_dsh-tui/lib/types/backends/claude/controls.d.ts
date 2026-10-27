/**
 * The Claude session's control capabilities: model, effort, permission mode, compaction, the
 * CLI's own slash commands, MCP status, context usage and the account — each
 * a thin typed wrapper over the live `Query`'s control requests.
 *
 * Every write is confirmed the way the CLI reports it (the next
 * `message_start.model`, `system/status.permissionMode`, `compact_boundary`):
 * the wrappers emit the change as soon as the control request succeeds and
 * the translator's own tracking keeps later frames from repeating it.
 * The user's model / effort / permission-mode choice persists in `~/.dsh-tui`
 * under a backend-scoped key (never in Claude's settings files).
 */
import type { AccountInfo, Query, SDKControlGetContextUsageResponse } from '@anthropic-ai/claude-agent-sdk';
import type { AccountView, ChannelProfileView, ContextUsageView, EffortOption, McpServerView, ModelOption, ModelRef, ModelSwitchOutcome, ModeOption } from '../../agent/capabilities.js';
import type { AgentEvent, CommandInfo } from '../../agent/events.js';
import { type ClaudeChannelTokens } from '../shared/channel-tokens.js';
import { type ClaudeChannels } from './channels.js';
import type { ClaudePrefs } from './prefs.js';
/** What the controls read from and write to the live session. */
export interface ClaudeControlsDeps {
    /** The live query (it changes when the session reconnects). */
    query(): Pick<Query, 'setModel' | 'setPermissionMode' | 'applyFlagSettings' | 'supportedModels' | 'supportedCommands' | 'mcpServerStatus' | 'reconnectMcpServer' | 'toggleMcpServer' | 'getContextUsage' | 'accountInfo'>;
    /** Deliver events (model/mode/effort changes). */
    emit(events: readonly AgentEvent[]): void;
    /** Push one user input (native `/compact` or `/init` command text). */
    submitText(text: string): Promise<void>;
    /** The model the session runs (translator's view). */
    currentModel(): string;
    /** The backend-native permission mode (translator's view). */
    currentMode(): string;
    /** Record a confirmed model / mode in the translator (dedupes later frames). */
    noteModel(model: string): readonly AgentEvent[];
    noteMode(mode: string): readonly AgentEvent[];
    readonly prefs: ClaudePrefs;
    /** The channel-profile store (channels.json); the session wires the file
     *  store by default and tests an in-memory one. */
    readonly channels: ClaudeChannels;
    /** The channel-token credential seam (~/.dsh/.credentials.yaml, the
     *  /provider precedent); the session wires the file store by default.
     *  Token material moves between this seam and the spawn pipeline only. */
    readonly tokens?: ClaudeChannelTokens;
    /** The env the CLI child applies (settings `env` + live env), read lazily
     *  by the settings import. Absent = nothing to import from. */
    settingsEnv?(): Record<string, string | undefined>;
    debug(message: string): void;
    /** The channel's model truth (settings `env` + live env), read lazily on
     *  the first model-list call: a relay's cosmetic tier name must not hide
     *  the model that actually serves the request (see modelEnv.ts). */
    modelTruth?(): {
        actualFor(requestedId: string): string | undefined;
    };
}
/** Context usage → the neutral view (no free/buffer pseudo-categories as "used"). */
export declare function contextUsageView(usage: SDKControlGetContextUsageResponse): ContextUsageView;
/** Account info → the neutral view (the email is never surfaced). */
export declare function accountView(info: AccountInfo, apiKeySource: string | undefined): AccountView;
/** Build the capabilities (catalogs seeded from the handshake by `seed`). */
export declare function createClaudeControls(deps: ClaudeControlsDeps): {
    capabilities: {
        models: {
            list(): Promise<readonly ModelOption[]>;
            current: () => ModelRef;
            display: () => string | undefined;
            set(ref: ModelRef): Promise<ModelSwitchOutcome>;
        };
        effort: {
            readonly levelsFallback: true | undefined;
            levels(): readonly EffortOption[];
            forModel: (ref: ModelRef) => {
                levels: readonly EffortOption[];
                levelsFallback?: true;
            };
            current: () => string | undefined;
            set(id: string | null): Promise<void>;
        };
        modes: {
            list: () => readonly ModeOption[];
            cycle: () => readonly ModeOption[];
            current: () => string;
            set(id: string): Promise<void>;
        };
        channels: {
            list: () => readonly ChannelProfileView[];
            activeId: () => string | undefined;
            setActive: (id: string) => void;
            importFromSettings: () => ChannelProfileView | undefined;
            save: (input: {
                readonly id: string;
                readonly name: string;
                readonly baseUrl?: string;
                readonly token?: string;
                readonly env?: Readonly<Record<string, string>>;
                readonly models?: Readonly<Record<string, string>>;
                readonly tiers?: Readonly<Record<string, string>>;
            }) => ChannelProfileView;
            remove: (id: string) => boolean;
            peekSettingsImport: () => {
                tiers: Readonly<Record<string, string>>;
                baseUrl?: string | undefined;
            } | undefined;
        };
        init: {
            run: () => Promise<void>;
        };
        compact: {
            run: () => Promise<void>;
        };
        commands: {
            list(): Promise<readonly CommandInfo[]>;
        };
        mcp: {
            status(): Promise<readonly McpServerView[]>;
            reconnect: (name: string) => Promise<void>;
            toggle: (name: string, enabled: boolean) => Promise<void>;
        };
        context: {
            usage(detail: "summary" | "full"): Promise<ContextUsageView>;
        };
    };
    /** The handshake's catalogs (`initializationResult().models/commands`),
     *  read without a round trip; malformed entries are skipped. */
    seed(init: Readonly<Record<string, unknown>> | undefined): void;
    /** The session confirmed the model by other means than a switch (the
     *  open/resume seed, `system/init`, `message_start`): check the effort
     *  as convergeEffort does. A model without a catalog row keeps it. */
    noteConfirmedModel(model: string): void;
    /** `system/init.terminal_slash_commands` (terminal-only, never offered). */
    setTerminalOnly(names: readonly string[]): void;
};
/** The localized label of a backend-native permission mode. */
export declare function modeLabel(id: string): string;
/** The one-line explanation of a backend-native permission mode (the
 *  picker's second row: what the mode actually does — never a repeat of the
 *  label). Unknown ids have none. */
export declare function modeDescription(id: string): string | undefined;
/** The localized label of an effort level. */
export declare function effortLabel(id: string): string;
//# sourceMappingURL=controls.d.ts.map