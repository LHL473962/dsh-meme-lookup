import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { type SessionModeSpec } from '../../sessionModes.js';
import type { PermissionModeRoster } from './mode-roster.js';
import type { ChannelState } from './types.js';
/** Last durable permission preset identity (`permission/preset`), if any.
 *  Registered by the harness permission preset service, never manufactured
 *  by the TUI. */
export declare function foldPermissionPreset(events: readonly SessionEvent[]): string | undefined;
/** Effective sandbox of a mode target: its explicit atom, else the folded
 *  session value, else the sandbox-policy service default. Unknown means the
 *  bundle is not safely mappable. */
export declare function effectiveSandboxForMode(ctx: Context, spec: SessionModeSpec, events: readonly SessionEvent[]): SessionModeSpec['sandbox'] | undefined;
/** Effective approval policy of a mode target: its explicit atom, else the
 *  folded session value, else the approval service configuration. */
export declare function effectiveApprovalForMode(ctx: Context, spec: SessionModeSpec, session: Agent['session']): SessionModeSpec['approval'] | undefined;
/** Durable permission identity operations for one channel. */
export interface PermissionIdentity {
    /** Folded durable identity of one session log. */
    foldPermissionPreset(session: Agent['session']): string | undefined;
    /** Canonical preset for a mode's effective sandbox/approval bundle, when
     *  the deployment's runtime table (or the stock built-ins) has one. */
    canonicalPermissionForMode(spec: SessionModeSpec, session: Agent['session']): string | undefined;
    /** True when the durable identity OR a runtime registry readback reports
     *  the target. */
    permissionTargetConfirmed(target: string, session: Agent['session']): boolean;
    /** Poll fold/registry readback for the target within a grace window. */
    confirmPermissionTarget(target: string, session: Agent['session'], timeoutMs: number): Promise<boolean>;
    /** Official `/permission <preset>` switch (or the service write fallback),
     *  then confirmation. The TUI never fabricates permission events. */
    applyPermissionIdentity(target: string): Promise<boolean>;
    /** Static-mode guard: canonicalize a durable identity BEFORE atoms, and
     *  fail closed when no canonical preset exists for the target bundle. */
    canonicalizeForMode(spec: SessionModeSpec, session: Agent['session']): Promise<boolean>;
    /** Capture the preset the user is on before plan mode runs. */
    rememberPrePlanIdentity(session: Agent['session']): void;
    /** The captured pre-plan identity, if one is still pending. */
    prePlanPermissionIdentity(session: Agent['session']): string | undefined;
    forgetPrePlanIdentity(session: Agent['session']): void;
    /** `ChannelUi.runPermissionPreset` (see the public Channel type). */
    runPermissionPreset(name: string): Promise<boolean>;
}
/**
 * Durable `permission/preset` identity: readback, canonical mapping, the
 * official switch path, and the pre-plan identity memory. Construction is
 * inert — it acquires nothing and subscribes to nothing.
 */
export declare function createPermissionIdentity(ctx: Context, deps: {
    agent: () => Agent;
    roster: PermissionModeRoster;
    commandService?: {
        find(agent: Agent, name: string): unknown;
    };
    executeRegistryCommand(name: string, input: string): Promise<string | undefined>;
    notify: ChannelState['notify'];
}): PermissionIdentity;
//# sourceMappingURL=mode-permission.d.ts.map