/** Thin wrappers over Codex's control requests; choices persist only in TUI prefs. */
import type { AccountView, ModelOption, SessionCapabilities } from '../../../agent/capabilities.js';
import type { AgentEvent } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { CodexPrefs } from '../prefs.js';
import type { CodexHub } from '../rpc/hub.js';
import type { ItemContext } from '../translate/items.js';
import type { SettingsSnapshot } from '../translate/live.js';
interface ControlsDeps {
    readonly hub: CodexHub;
    readonly prefs: CodexPrefs;
    readonly ctx: ItemContext;
    readonly settings: SettingsSnapshot;
    readonly cwd: string;
    threadId(): string;
    busy(): boolean;
    emit(events: readonly AgentEvent[]): void;
    submitText(text: string): Promise<void>;
    account?(): Promise<AccountView>;
    mappedModels?(): readonly ModelOption[];
    actualModel?(id: string): string;
    debug(message: string): void;
}
/** Policy objects used by turn/start and thread/settings/update. */
export declare function sandboxPolicy(mode: string, cwd: string): Rec;
export declare function createCodexControls(deps: ControlsDeps): {
    capabilities: Pick<SessionCapabilities, "context" | "effort" | "models" | "modes" | "compact" | "init" | "mcp" | "rename" | "account">;
    initialize(): Promise<void>;
    /** Knobs not yet applied by a turn (or an idle settings update). */
    turnOverrides(): Rec;
    /** A refused turn did not apply its settings. Drop only unsupported Plan. */
    turnFailed(error: unknown, overrides: Rec): void;
    note(method: string, params: Rec): boolean;
    readonly planSupported: boolean;
};
export {};
//# sourceMappingURL=controls.d.ts.map