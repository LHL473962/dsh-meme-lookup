/**
 * Command ownership attribution — the data source for the C-041 invoke
 * checkpoint's per-owner grant decision.
 *
 * dsh-commands has NO owner concept (its `normalizeDefinition` rebuilds a
 * frozen object and drops unknown fields, and its scoped layers key by
 * agent, not by registrant), and neither realistic access path can carry
 * the caller's identity to `register` for us: `ctx.get('commands')` is an
 * accessor that bypasses cordis's `internal/get` waterfall, and an
 * inject-declared property read resolves before it. So attribution does
 * NOT try to spy on the registry — it is a MEDIATED REGISTRATION surface,
 * the same honest-identity pattern as storage.local / messages.observe:
 * the plugin-host row's `registerCommand(pluginCtx, definition)` supplies a
 * unique wrapper handler and stamps that actual registered definition with
 * the verified Component id and activation on success. The invoke checkpoint resolves the
 * effective definition for its receiving agent first, then looks up that
 * definition's handler here. This mirrors dsh-commands' scoped shadowing:
 * same-name definitions in separate agent scopes never share attribution.
 *
 * A plugin that registers directly through `ctx.get('commands')` keeps its
 * command UNATTRIBUTED: the invoke checkpoint then applies the root grant
 * only — the documented C-070 trusted-in-process boundary, exactly like a
 * plugin calling `ctx.commands.execute` directly. Attribution only ever
 * TIGHTENS the check, never widens it.
 *
 * The map is keyed by the cordis ROOT so the row and the channel (two
 * different contexts of one runtime) share one view.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { VerifiedComponentIdentity } from './component-identity.js';
export interface CommandOwner {
    componentId: string;
    activationId: string;
    commandId: string;
}
/** The registrant's display name for diagnostics only: the passed context's
 * fiber name (nearest named ancestor), 'root' for host-side or degraded
 * contexts. Authorization never uses this display value. */
export declare function fiberNameOf(ctx: Context): string;
/** Record one mediated command definition's owner after successful registration. */
export declare function stampCommandOwner(ctx: Context, definition: unknown, identity: VerifiedComponentIdentity, commandId: string): void;
/** Lift one definition's stamp without touching a later registration. */
export declare function unstampCommandOwner(ctx: Context, definition: unknown, activationId: string): void;
/**
 * The recorded owner of the EFFECTIVE command definition, or undefined when
 * it is unattributed (root-side/direct registrations are the documented
 * C-070 boundary). Callers must pass `commands.find(agent, name)`, not only
 * the command name, so agent-scoped shadows select their own owner.
 */
export declare function commandOwner(ctx: Context, definition: unknown): CommandOwner | undefined;
//# sourceMappingURL=command-attribution.d.ts.map