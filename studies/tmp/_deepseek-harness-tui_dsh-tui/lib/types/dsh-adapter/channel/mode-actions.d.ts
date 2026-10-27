import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { type SessionModeSpec } from '../../sessionModes.js';
import { type AdapterRuntimeOptions } from '../../adapter/kernel/runtime.js';
import type { ChannelState } from './types.js';
import type { DshChannelBinding } from './binding.js';
type Binding = DshChannelBinding;
type ModeState = Pick<ChannelState, 'mode' | 'modeIndex' | 'emit'>;
/**
 * Fail-soft reporting for a session-mode write. The mutation path reaches
 * kernel-owned state (`session.append`, `approval.setPolicy` → the agent
 * inbox) that can legitimately refuse while a turn is publishing, and the
 * keyboard entry point (`Shift+Tab`) cannot await it — a rejection there
 * becomes an unhandledRejection, which the process guard treats as fatal and
 * which kills the TUI with the session still open. A refused switch is a
 * user-visible outcome, not a crash: log it, say so in the status line, and
 * re-derive the indicator from the durable log so the UI cannot keep showing
 * a mode the session never entered. Shared by the base actions and the
 * permission-aware composition so both report the same way.
 */
export declare function reportModeSwitchFailure(ctx: Context, notify: ChannelState['notify'], refreshMode: () => void, error: unknown): void;
/** Durable session-mode folds and transitions. Construction is inert; root wires it after state construction. */
export declare function createModeActions(ctx: Context, state: ModeState, deps: {
    owner: {
        current(): boolean;
    };
    runtime: AdapterRuntimeOptions;
    binding: Pick<Binding, 'agent' | 'capture' | 'isCurrent'>;
    sessionModes: readonly SessionModeSpec[];
    executeRegistryCommand(name: string, input: string): Promise<string | undefined>;
    notify: ChannelState['notify'];
}): {
    refreshMode: () => void;
    cycleMode: () => Promise<void>;
    applyMode: (spec: SessionModeSpec, capture?: import("./binding.js").DshBindingCapture) => Promise<void>;
    onSessionEvent: (session: Agent["session"], event: SessionEvent) => void;
};
export {};
//# sourceMappingURL=mode-actions.d.ts.map