/**
 * Minimal real Adapter Kernel runtime (P2).
 *
 * Responsibility:
 * - register/mount upstream driver objects,
 * - run structured detection and the `declared → staged → live` lifecycle,
 * - run reversible live verification outside passive/replay production modes,
 * - keep a unified evidence snapshot used by Host Descriptor / HostFacade /
 *   diagnostics,
 * - support passive-shadow (read-only detect only) and replay-shadow
 *   (isolated mock/replay contexts; the harness calls refresh with
 *   `allowReplay` on mock data only).
 *
 * This is intentionally small: business translation, protocol semantics and
 * plugin admission remain in upstream/standard layers. The Kernel only owns
 * composition, lifecycle promotion and diagnostics.
 */
import type { HostDescriptorPort, HostDescriptorSnapshot } from '../ports/descriptor.js';
import type { CapabilityLifecycle } from './lifecycle.js';
import { type AdapterMode } from './runtime.js';
import type { UpstreamDriver } from '../upstream/driver.js';
import type { Detection } from '../upstream/detection.js';
import type { HostDescriptorBuild } from '../standard/descriptor.js';
import { type HostFacade } from './host-facade.js';
import type { KernelSlice } from './slices/types.js';
export interface KernelRuntimeOptions {
    readonly context: unknown;
    readonly mode: AdapterMode;
    readonly slices?: readonly string[];
    readonly generationId: string;
    readonly drivers?: readonly UpstreamDriver[];
    /** P3 vertical slice definitions. Their drivers are mounted in addition to
     * any explicit `drivers` and their mounted Ports are exposed by facade(). */
    readonly kernelSlices?: readonly KernelSlice[];
    readonly hostId?: string;
    readonly hostVersion?: string;
    readonly headless?: boolean;
    /** Freshness window for live lifecycle evidence, in milliseconds. */
    readonly refreshTtlMs?: number;
}
/** Real ports handed to mounted upstream drivers. Drivers may consume the
 * read-only descriptor port; mutation/authorization stays in Kernel/Standard. */
export interface KernelRuntimeDriverPorts {
    readonly descriptor: HostDescriptorPort;
}
export interface KernelDriverDiagnostic {
    readonly id: string;
    readonly capability: string;
    readonly mounted: boolean;
    readonly portMounted: boolean;
}
export interface KernelDiagnosticSnapshot {
    readonly mode: AdapterMode;
    readonly generationId: string;
    readonly lifecycles: readonly CapabilityLifecycle[];
    readonly drivers: readonly KernelDriverDiagnostic[];
    readonly detections: readonly {
        readonly id: string;
        readonly detection: Detection;
    }[];
    readonly descriptor: HostDescriptorSnapshot;
    readonly lastRefresh: 'pending' | 'completed' | 'failed' | 'skipped';
    readonly refreshError?: string;
}
export interface KernelRefreshOptions {
    /** Allow reversible live verification while mode is replay-shadow. This is
     * only safe on an isolated replay/mock context, not on a real host. */
    readonly allowReplay?: boolean;
}
export declare class KernelRuntime {
    readonly mode: AdapterMode;
    readonly generationId: string;
    private readonly context;
    private readonly drivers;
    private readonly kernelSlices;
    private readonly slices;
    private readonly hostId;
    private readonly hostVersion;
    private readonly headless;
    private lifecycles;
    private descriptorCache;
    private readonly mountDisposers;
    private readonly mountedPorts;
    private readonly mountedDriverIds;
    private readonly driverDetections;
    private readonly liveVerifiedAt;
    private readonly lastVerifiedLifecycles;
    private readonly refreshTtlMs;
    private lastRefreshAt;
    private refreshState;
    private refreshError;
    private refreshTimer;
    private refreshInFlight;
    private refreshRerunRequested;
    private mountPromise;
    private unsubscribeChannelListener;
    private disposed;
    constructor(options: KernelRuntimeOptions);
    /** Synchronous detection: never performs reversible/side-effectful probes.
     * It consumes each driver's structured `detect()` for diagnostics and, for
     * drivers with a lifecycle projection, builds the publication evidence. */
    detect(): readonly CapabilityLifecycle[];
    private hasFreshVerification;
    private preserveFreshVerifiedLifecycles;
    private lifecycleKey;
    private replaceLifecycles;
    private sameCriticalMethodEvidence;
    /**
     * Run reversible live verification.
     *
     * In passive-shadow production mode this is skipped (read-only only). In
     * replay-shadow production mode this is also skipped unless the caller
     * explicitly passes `allowReplay: true` for an isolated replay/mock context.
     */
    refresh(options?: KernelRefreshOptions): Promise<readonly CapabilityLifecycle[]>;
    private refreshInternal;
    currentLifecycles(): readonly CapabilityLifecycle[];
    /** Whether async live verification has completed successfully. */
    isRefreshCompleted(): boolean;
    /** Diagnostic refresh state. */
    refreshStatus(): 'pending' | 'completed' | 'failed' | 'skipped';
    descriptorBuild(): HostDescriptorBuild;
    descriptorPort(): HostDescriptorPort;
    /** The internal thin HostFacade backed by this Kernel runtime's snapshot. */
    facade(): HostFacade;
    diagnosticSnapshot(): KernelDiagnosticSnapshot;
    /** Mount all drivers that have not been mounted yet. */
    mount(): Promise<void>;
    private mountInternal;
    private rollbackNewMounts;
    private needsAutoRefresh;
    private startAutoRefreshTimer;
    dispose(): void;
    private invalidateDescriptor;
}
/** Convenience constructor. */
export declare function createKernelRuntime(options: KernelRuntimeOptions): KernelRuntime;
//# sourceMappingURL=kernel-runtime.d.ts.map