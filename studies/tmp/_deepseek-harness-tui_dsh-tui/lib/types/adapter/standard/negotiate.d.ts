/** Five-state admission decision using dsh-std projection and ProtocolCatalog. */
import type { ContractIndex } from './validate.js';
import type { HostDescriptor, NegotiationDecision, PluginManifest } from './types.js';
export interface GrantedPermission {
    name: string;
    scope: string;
    /** Explicit effective answer. Omitted means a legacy positive grant row. */
    granted?: boolean;
}
export declare function negotiate(index: ContractIndex, manifest: PluginManifest, host: HostDescriptor, grants?: readonly GrantedPermission[]): NegotiationDecision;
//# sourceMappingURL=negotiate.d.ts.map