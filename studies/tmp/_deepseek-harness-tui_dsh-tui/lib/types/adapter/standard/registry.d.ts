/** Load and verify the in-tree TUI Profile (dsh-TUI 自维护的准入与私有协议定义). */
import type { ContractRegistry, PermissionRegistry, RegistryEntry } from './types.js';
export declare const DSH_STD_REVISION = "614dfa1ac168db79fcf4577cf0ebb34e2e3b944b";
/** 仓内 TUI Profile 目录（纯文件，无 submodule 挂载，随本仓库代码一起修订）。 */
export declare const TUI_PROFILE_DIR = "tui-profile";
export interface SpecData {
    dir: string;
    registry: ContractRegistry;
    permissions: PermissionRegistry;
    schemas: {
        host: Record<string, unknown>;
        ledger: Record<string, unknown>;
        claim: Record<string, unknown>;
    };
}
export declare function locateSpecDir(start?: string): string | undefined;
export declare function loadSpecData(dir?: string | undefined): SpecData | undefined;
/**
 * Every registry entry this host can resolve a contract reference against, in
 * section order: imported contracts, TUI-owned protocol definitions, and the
 * manifest extension definitions (`Backend` is the family that made this section
 * load-bearing — a bundle's declaration is admitted against it).
 */
export declare function registryEntries(registry: ContractRegistry): RegistryEntry[];
export declare function digestFile(dir: string, relative: string): `sha256:${string}`;
/** Verify definition availability and private profile digest pins. */
export declare function verifyRegistry(data: SpecData): string[];
/** Verify the TUI-owned definitions; public definitions live in dsh-std. */
export declare function verifyContractProfiles(data: SpecData): string[];
//# sourceMappingURL=registry.d.ts.map