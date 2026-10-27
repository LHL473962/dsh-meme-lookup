/**
 * Upstream driver for the TUI scenes capability.
 *
 * Scenes are a register-class capability. The driver performs a real
 * reversible probe through the host-only scenes facade: register a uniquely
 * named temporary scene, list it, dispose it, then prove the same name can
 * be registered again (no residue). It never opens the scene during the
 * probe, so no visible UI mutation is caused.
 *
 * Publication is feature-level: register/list are live only after the
 * reversible no-residue probe; open/close/active/subscribe are not safely
 * auto-verifiable in P3 and stay degraded.
 */
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
export declare function detectScenesCapability(ctx: unknown): Detection;
export declare const scenesDriver: UpstreamDriver;
//# sourceMappingURL=scenes-driver.d.ts.map