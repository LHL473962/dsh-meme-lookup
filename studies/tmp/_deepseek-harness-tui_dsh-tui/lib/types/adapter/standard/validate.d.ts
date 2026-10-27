/** Semantic validation layered on the official manifest parser/projection. */
import { getAdmissionCatalog } from './tui-extension.js';
import type { ContractCoordinate, ContractRegistry, HostDescriptor, PermissionRegistry, PluginManifest, RegistryEntry, SubscriptionRef } from './types.js';
export interface ContractIndex {
    registry: ContractRegistry;
    permissions: PermissionRegistry;
    facetApiVersions: string[];
    protocols: ReturnType<typeof getAdmissionCatalog>['protocols'];
    manifests: ReturnType<typeof getAdmissionCatalog>['manifests'];
    lookupContract(coordinate: ContractCoordinate): RegistryEntry | undefined;
    resolveContractRef(ref: ContractCoordinate): {
        entry: RegistryEntry | null;
        unregisteredVersion: boolean;
    };
    resolveSubscription(sub: SubscriptionRef): RegistryEntry;
}
export declare const groupOf: (apiVersion: string) => string;
export declare function createContractIndex(registry: ContractRegistry, permissions: PermissionRegistry): ContractIndex;
export declare function validatePlugin(index: ContractIndex, manifest: PluginManifest): void;
export declare function validateHost(index: ContractIndex, host: HostDescriptor): void;
//# sourceMappingURL=validate.d.ts.map