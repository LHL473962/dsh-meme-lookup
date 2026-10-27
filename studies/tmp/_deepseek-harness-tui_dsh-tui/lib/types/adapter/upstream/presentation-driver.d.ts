/**
 * Upstream driver for the TUI presentation capability.
 *
 * Presentation is fundamentally interactive: ask/approve/confirm require a
 * human answer and cannot be safely auto-reversed without producing user-
 * visible UI. This driver therefore stays honest:
 * - detect() reports the service/method topology as `degraded` until a real
 *   reversible presentation probe exists;
 * - verifyLive() returns a degraded lifecycle and never fabricates `live`.
 * The only thin port surface mounted today is the host dialog queue; ask and
 * approve are intentionally staged and fail closed.
 */
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
export declare function detectPresentationCapability(ctx: unknown): Detection;
export declare const presentationDriver: UpstreamDriver;
//# sourceMappingURL=presentation-driver.d.ts.map