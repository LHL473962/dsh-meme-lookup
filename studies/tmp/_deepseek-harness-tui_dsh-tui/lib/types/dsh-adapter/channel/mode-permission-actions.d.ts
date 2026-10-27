import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { type SessionModeSpec } from '../../sessionModes.js';
import type { DshChannelBinding } from './binding.js';
import { createModeActions } from './mode-actions.js';
import { type PermissionIdentity } from './mode-permission.js';
import type { PermissionModeRoster } from './mode-roster.js';
import type { ChannelState } from './types.js';
type Binding = DshChannelBinding;
type ModeState = Pick<ChannelState, 'mode' | 'modeIndex' | 'emit'>;
type ModeCapture = ReturnType<Binding['capture']>;
/** The composition seam `createModeActions` owns; this factory forwards every
 *  member verbatim so both stay in lockstep. */
type BaseModeActionDeps = Parameters<typeof createModeActions>[2];
/** Whether this session's log ever selected the experimental `auto` preset
 *  (picker confirmation, typed command, or a resumed Auto session). Only then
 *  may Shift+Tab land on it: a key press cannot await the risk confirmation. */
export declare function autoPresetConfirmed(events: readonly SessionEvent[]): boolean;
/**
 * Permission-aware session-mode actions: main's mode transition (plan
 * exclusivity, atom application, plan-exit restore) composed with the durable
 * permission identity, on top of the refactored `createModeActions`.
 *
 * Construction is inert. The returned shape is a superset of
 * `ReturnType<typeof createModeActions>`, so the composition root and
 * `createBindingEvents` can consume it unchanged, plus
 * `runPermissionPreset` for the public `ChannelUi` surface.
 */
export declare function createPermissionModeActions(ctx: Context, state: ModeState, deps: Pick<BaseModeActionDeps, 'owner' | 'runtime' | 'binding' | 'sessionModes' | 'executeRegistryCommand' | 'notify'> & {
    roster: PermissionModeRoster;
    /** Only the permission identity reads the registry directly (#755 is the
     *  authoritative design for `/permission`); the plan route comes from the
     *  shared capability facts inside `createModeActions`. */
    commandService?: {
        find(agent: Agent, name: string): unknown;
    };
}): {
    refreshMode(): void;
    cycleMode(): Promise<void>;
    applyMode(spec: SessionModeSpec, capture?: ModeCapture): Promise<void>;
    onSessionEvent(session: unknown, event: unknown): void;
    applyRememberedPermission(): Promise<void>;
    runPermissionPreset(name: string): Promise<boolean>;
    trackUserPermissionSwitch<T>(target: string, run: () => Promise<T>): Promise<T>;
    permission: PermissionIdentity;
};
export {};
//# sourceMappingURL=mode-permission-actions.d.ts.map