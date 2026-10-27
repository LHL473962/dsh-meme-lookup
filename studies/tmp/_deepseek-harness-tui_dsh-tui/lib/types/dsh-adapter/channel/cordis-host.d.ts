/**
 * The ChannelHost a Cordis plugin context provides. Root-keyed registries
 * (adapter runtime, decision gate and handlers, local settings sections) stay
 * keyed on the Cordis root, so the extensions row that also installs the gate
 * meets the channel on one registry.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ChannelHost } from './channel-host.js';
/**
 * @param services - Services served in place of the context's own (the
 *   TUI's file-backed `settings`, ../tui-settings.ts).
 */
export declare function cordisChannelHost(ctx: Context, services?: Readonly<Record<string, unknown>>): ChannelHost;
//# sourceMappingURL=cordis-host.d.ts.map