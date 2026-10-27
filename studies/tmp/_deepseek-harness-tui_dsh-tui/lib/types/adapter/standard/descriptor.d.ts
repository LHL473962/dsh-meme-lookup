/** Build the current dsh-TUI Host Descriptor from live Kernel lifecycle evidence. */
import type { ContractCoordinate, HostDescriptor } from './types.js';
import type { CapabilityLifecycle } from '../kernel/lifecycle.js';
import { HOST_SUPPORTED_CONTRACTS } from '../spec/protocol-constants.js';
export { HOST_SUPPORTED_CONTRACTS };
/** The facet version is part of the host identity, not a protocol definition.
 * Keep a conservative fallback so a descriptor remains schema-valid when the
 * optional vendored registry is unavailable; the contract list is still
 * empty in that degraded state. */
export declare const HOST_FACET_API_VERSIONS: readonly string[];
export interface HostDescriptorOptions {
    hostId?: string;
    hostVersion?: string;
    generationId: string;
    headless?: boolean;
    /**
     * Canonical live publication source. Only `lifecycles` with state `live`
     * (or explicitly split feature-level live evidence) are published. A
     * `degraded` lifecycle is never published as a whole capability; it must
     * first be split into feature-level live evidence.
     */
    lifecycles?: readonly CapabilityLifecycle[];
    /**
     * Explicit legacy-compatibility topology. This is NOT live probe evidence:
     * it represents the old mounted-service declaration path that remains the
     * default in `legacy` adapter mode. It is intentionally kept separate from
     * the live-only publication path and is used only by the dedicated legacy
     * host descriptor builder / legacy production branch.
     */
    legacySupported?: readonly ContractCoordinate[];
    /** Feature-level legacy DecisionEvents declaration, when the read-only
     * topology probe has verified them. Empty/undefined means no features. */
    legacyDecisionFeatures?: readonly string[];
    /** Marks a build as a legacy compatibility declaration (adds warnings). */
    legacy?: boolean;
    specDir?: string;
}
export interface HostDescriptorBuild {
    descriptor: HostDescriptor;
    readonly dropped: readonly string[];
    readonly warnings: readonly string[];
}
export declare function readOwnPackageVersion(): string;
/**
 * Build Host Descriptor only from live lifecycle evidence. This is the
 * canonical production entry point; it never accepts a bare supported array as
 * final fact.
 */
export declare function buildHostDescriptorFromLifecycles(lifecycles: readonly CapabilityLifecycle[], options?: Omit<HostDescriptorOptions, 'lifecycles'>): HostDescriptorBuild;
export interface LegacyHostDescriptorOptions {
    hostId?: string;
    hostVersion?: string;
    generationId: string;
    headless?: boolean;
    specDir?: string;
    /** Coordinates declared by the legacy mounted-service topology. */
    supported: readonly ContractCoordinate[];
    /** Feature-level DecisionEvents declaration from the read-only legacy probe. */
    decisionFeatures?: readonly string[];
}
/**
 * Build the explicit legacy-mode Host Descriptor.
 *
 * P6 keeps this as a first-class mode, not a compatibility shim: it preserves
 * the old default (`legacy` adapter mode) publication semantics. Command /
 * LocalStorage / MessageObserver are declared when their legacy service rows
 * are mounted, without running the new Kernel or any reversible live probe.
 * It is deliberately distinct from the live-only
 * `buildHostDescriptorFromLifecycles` path and returns warnings identifying it
 * as a legacy declaration.
 */
export declare function buildLegacyHostDescriptor(options: LegacyHostDescriptorOptions): HostDescriptorBuild;
export declare function buildHostDescriptor(options: HostDescriptorOptions): HostDescriptorBuild;
//# sourceMappingURL=descriptor.d.ts.map