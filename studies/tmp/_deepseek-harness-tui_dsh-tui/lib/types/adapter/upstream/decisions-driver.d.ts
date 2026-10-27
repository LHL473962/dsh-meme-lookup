/**
 * Upstream driver for the TUI DecisionEvents capability.
 *
 * The read-only dispatch-topology probe is real: it asks the host which
 * decision event names are actually dispatched in this composition. The
 * subscribe path is intentionally kept staged on the internal Host Port
 * because plugin-side subscriptions must go through the mediated
 * DecisionEvents API (which derives owner from the Cordis activation); the
 * driver never fabricates a live subscribe probe.
 */
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
export declare function detectDecisionsCapability(ctx: unknown): Detection;
export declare const decisionsDriver: UpstreamDriver;
//# sourceMappingURL=decisions-driver.d.ts.map