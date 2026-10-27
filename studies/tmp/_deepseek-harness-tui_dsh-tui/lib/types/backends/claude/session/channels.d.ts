import type { AgentEvent } from '../../../agent/events.js';
import type { AgentSession } from '../../../agent/session.js';
import type { ClaudeAuthPlan } from '../auth.js';
import { type ClaudeChannels } from '../channels.js';
import type { ClaudeChannelTokens } from '../../shared/channel-tokens.js';
import type { ClaudePrefs } from '../prefs.js';
import type { ClaudeTranslator } from '../translate.js';
import type { ClaudeSessionDeps, Run } from './types.js';
export declare function createSessionControls(context: {
    readonly deps: ClaudeSessionDeps;
    readonly prefs: ClaudePrefs;
    readonly channels: ClaudeChannels;
    readonly channelTokens: ClaudeChannelTokens;
    readonly translator: ClaudeTranslator;
    readonly run: Run;
    readonly authPlan: ClaudeAuthPlan;
    readonly session: AgentSession;
    configDir(): string;
    emit(events: readonly AgentEvent[]): void;
}): {
    capabilities: {
        models: {
            list(): Promise<readonly import("../../../agent/capabilities.js").ModelOption[]>;
            current: () => import("../../../agent/capabilities.js").ModelRef;
            display: () => string | undefined;
            set(ref: import("../../../agent/capabilities.js").ModelRef): Promise<import("../../../agent/capabilities.js").ModelSwitchOutcome>;
        };
        effort: {
            readonly levelsFallback: true | undefined;
            levels(): readonly import("../../../agent/capabilities.js").EffortOption[];
            forModel: (ref: import("../../../agent/capabilities.js").ModelRef) => {
                levels: readonly import("../../../agent/capabilities.js").EffortOption[];
                levelsFallback?: true;
            };
            current: () => string | undefined;
            set(id: string | null): Promise<void>;
        };
        modes: {
            list: () => readonly import("../../../agent/capabilities.js").ModeOption[];
            cycle: () => readonly import("../../../agent/capabilities.js").ModeOption[];
            current: () => string;
            set(id: string): Promise<void>;
        };
        channels: {
            list: () => readonly import("../../../agent/capabilities.js").ChannelProfileView[];
            activeId: () => string | undefined;
            setActive: (id: string) => void;
            importFromSettings: () => import("../../../agent/capabilities.js").ChannelProfileView | undefined;
            save: (input: {
                readonly id: string;
                readonly name: string;
                readonly baseUrl?: string;
                readonly token?: string;
                readonly env?: Readonly<Record<string, string>>;
                readonly models?: Readonly<Record<string, string>>;
                readonly tiers?: Readonly<Record<string, string>>;
            }) => import("../../../agent/capabilities.js").ChannelProfileView;
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
            list(): Promise<readonly import("../../../agent/events.js").CommandInfo[]>;
        };
        mcp: {
            status(): Promise<readonly import("../../../agent/capabilities.js").McpServerView[]>;
            reconnect: (name: string) => Promise<void>;
            toggle: (name: string, enabled: boolean) => Promise<void>;
        };
        context: {
            usage(detail: "summary" | "full"): Promise<import("../../../agent/capabilities.js").ContextUsageView>;
        };
    };
    seed(init: Readonly<Record<string, unknown>> | undefined): void;
    noteConfirmedModel(model: string): void;
    setTerminalOnly(names: readonly string[]): void;
};
//# sourceMappingURL=channels.d.ts.map