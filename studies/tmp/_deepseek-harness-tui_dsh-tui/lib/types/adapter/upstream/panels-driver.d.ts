/**
 * Upstream driver for the TUI side-panel capability (ctx.tuiPanels).
 *
 * Panels are a register-class capability. The driver performs a real
 * reversible probe through the host-only panels facade: register a uniquely
 * named temporary panel, list it, dispose it, then prove the same id can be
 * registered again (no residue). It never opens the panel during the probe,
 * so no visible UI mutation is caused.
 *
 * Publication is feature-level: register/list are live only after the
 * reversible no-residue probe; open/close/badge/subscribe are not safely
 * auto-verifiable and stay degraded.
 */
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
export declare function detectPanelsCapability(ctx: unknown): Detection;
export declare const panelsDriver: UpstreamDriver;
//# sourceMappingURL=panels-driver.d.ts.map