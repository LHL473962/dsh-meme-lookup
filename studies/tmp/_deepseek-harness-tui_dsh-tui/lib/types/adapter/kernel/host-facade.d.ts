/**
 * HostFacade: thin composition / identity entry over mounted Host Ports.
 *
 * P2 callers normally obtain this from `KernelRuntime.facade()`, which backs
 * the descriptor port with the unified kernel lifecycle evidence.
 * `facadeFromLegacy` remains only as a long-term compatibility fallback for
 * bare/test compositions (outside P6 removal scope; owner: dsh-tui adapter).
 * Hard rules:
 * - It performs no business logic, no protocol translation, no capability
 *   detection, no registry, and stores no mutable host state.
 * - It is for TUI host-internal code only. External plugins continue to use
 *   dsh-std / tui-profile public protocol surfaces.
 * - It only exposes Host Ports; admission, permission evaluation and ledger
 *   writes are Kernel/Standard internal services and must never be exposed
 *   as ordinary Host Ports.
 */
import type { HostDescriptorPort } from '../ports/descriptor.js';
import type { HostPresentationPort } from '../ports/presentation.js';
import type { HostWorkspacePort } from '../ports/workspace.js';
import type { HostScenesPort } from '../ports/scenes.js';
import type { HostPanelsPort } from '../ports/panels.js';
import type { HostSettingsPort } from '../ports/settings.js';
import type { HostStatusPort, HostShortcutsPort, HostRenderersPort, HostThemesPort, HostToastPort, HostCommandTreesPort } from '../ports/extensions.js';
import type { HostDecisionsPort } from '../ports/decisions.js';
import type { HostChannelPort } from '../ports/channel.js';
import { type AdapterMode } from './runtime.js';
export interface HostFacade {
    readonly descriptor: HostDescriptorPort;
    readonly presentation?: HostPresentationPort;
    readonly workspace?: HostWorkspacePort;
    readonly scenes?: HostScenesPort;
    readonly panels?: HostPanelsPort;
    readonly settings?: HostSettingsPort;
    readonly status?: HostStatusPort;
    readonly shortcuts?: HostShortcutsPort;
    readonly renderers?: HostRenderersPort;
    readonly themes?: HostThemesPort;
    readonly toast?: HostToastPort;
    readonly commandTrees?: HostCommandTreesPort;
    readonly decisions?: HostDecisionsPort;
    readonly channel?: HostChannelPort;
}
export interface HostFacadePorts {
    readonly descriptor: HostDescriptorPort;
    readonly presentation?: HostPresentationPort;
    readonly workspace?: HostWorkspacePort;
    readonly scenes?: HostScenesPort;
    readonly panels?: HostPanelsPort;
    readonly settings?: HostSettingsPort;
    readonly status?: HostStatusPort;
    readonly shortcuts?: HostShortcutsPort;
    readonly renderers?: HostRenderersPort;
    readonly themes?: HostThemesPort;
    readonly toast?: HostToastPort;
    readonly commandTrees?: HostCommandTreesPort;
    readonly decisions?: HostDecisionsPort;
    readonly channel?: HostChannelPort;
}
/** Build the immutable facade from already-composed slice implementations. */
export declare function createHostFacade(ports: HostFacadePorts): HostFacade;
/**
 * Build a HostFacade whose descriptor and every mounted Host Port method are
 * wrapped with the unified shadow-policy assertion. This is what the Kernel
 * exposes to internal TUI callers: no Port method can silently perform a
 * mutate/register/subscribe side effect in passive/replay production modes.
 */
export declare function createShadowGuardedHostFacade(ports: HostFacadePorts, mode: AdapterMode): HostFacade;
//# sourceMappingURL=host-facade.d.ts.map