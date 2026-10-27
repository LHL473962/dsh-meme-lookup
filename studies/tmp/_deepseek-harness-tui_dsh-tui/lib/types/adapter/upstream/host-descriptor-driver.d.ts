/**
 * Minimal real upstream driver for the Host Descriptor / diagnostics slice.
 *
 * The driver never treats "the npm package is installed" or "the service key
 * exists" as live support. It distinguishes:
 *   - service present       -> evidence.kind = 'service'
 *   - method/capability     -> evidence.kind = 'method'
 *   - a read-only probe     -> evidence.kind = 'probe'
 *
 * A lifecycle becomes `live` only when `verifyAndPromote()` sees at least one
 * `probe` evidence item. Method/source presence alone keeps the capability
 * `staged` or `degraded`.
 */
import type { CapabilityLifecycle } from '../kernel/lifecycle.js';
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
/**
 * Structured detection for the complete host descriptor capability.
 *
 * Supported only when the host service is present, its descriptor methods are
 * present, AND a read-only `describe()` probe actually returns a valid build.
 */
export declare function detectHostDescriptorCapability(ctx: unknown): Detection;
/**
 * Build the per-contract lifecycle list from the live host services.
 *
 * All returned lifecycles are `staged`; the caller must call
 * `verifyAndPromote()` before using them as live publication evidence.
 * Service/method evidence alone cannot cross the verifier; a real probe is
 * required.
 */
export declare function buildHostCapabilityLifecycles(ctx: unknown): CapabilityLifecycle[];
/**
 * Run the full async live-verification path for the host descriptor slice.
 *
 * This is the production driver method behind `KernelRuntime.refresh()` in
 * legacy/new modes. It performs the real reversible probes and returns
 * capability lifecycles that already carry `probe` evidence. In passive/replay
 * production modes the Kernel must not call this on a real host context; the
 * replay harness may call it on an isolated mock context.
 */
export declare function refreshHostCapabilityLifecycles(ctx: unknown): Promise<CapabilityLifecycle[]>;
/** The driver object for future kernel composition. */
export declare const hostDescriptorDriver: UpstreamDriver;
//# sourceMappingURL=host-descriptor-driver.d.ts.map