/**
 * P1 incremental bridge from the legacy adapter services to the new
 * HostFacade.
 *
 * This bridge exposes only the read-only Host Descriptor snapshot; it is not
 * a full kernel runtime. It does NOT
 * expose admission, grants, or ledger writes: those are sensitive Kernel /
 * Standard internal services and must not be callable through the Host Port /
 * HostFacade surface (especially in passive shadow).
 *
 * `facadeFromLegacy` is a retained long-term compatibility fallback for
 * bare/test compositions and is explicitly outside the P6 removal scope.
 * OWNER: dsh-tui adapter. UNTIL: no scheduled removal.
 */
import type { HostDescriptorBuild } from '../standard/descriptor.js';
import { type HostFacade } from './host-facade.js';
export interface LegacyHostServices {
    readonly generationId: string;
    describe(): HostDescriptorBuild;
}
export declare function facadeFromLegacy(services: LegacyHostServices): HostFacade;
//# sourceMappingURL=legacy-facade.d.ts.map