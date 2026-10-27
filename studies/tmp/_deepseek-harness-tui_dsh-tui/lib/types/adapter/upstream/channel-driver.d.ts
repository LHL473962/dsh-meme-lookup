/**
 * Upstream driver for the TUI live Channel.
 *
 * The live Channel is a TUI host-internal stateful object, not a DSH service.
 * The driver mounts the five Channel Host Ports (projection/actions/state/
 * plugins/transcript) over the channel registered for the composition root.
 * It is deliberately read-only at mount time: the HostFacade shadow wrapper
 * gates every action method before a caller can mutate the Channel.
 *
 * Publication is feature-level and honest:
 * - read-only projection/state/transcript features become live after a real
 *   snapshot/row probe;
 * - action/plugin mutation methods stay degraded because they cannot be
 *   safely auto-reversed on a live TUI.
 */
import type { CapabilityLifecycle } from '../kernel/lifecycle.js';
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
export declare function detectChannelCapability(ctx: unknown): Detection;
export declare function verifyChannelLive(ctx: unknown): Promise<CapabilityLifecycle[]>;
export declare const channelDriver: UpstreamDriver;
//# sourceMappingURL=channel-driver.d.ts.map