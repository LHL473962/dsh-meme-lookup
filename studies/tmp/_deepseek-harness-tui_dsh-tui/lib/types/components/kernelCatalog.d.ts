/** Kernel rows shared by the launchpad and picker. Detection *and* the entry
 *  list are supplied by the host: the UI never imports the registry (and may not
 *  import `src/backends/` at all), it only renders the data it is handed. */
import type { BackendManifest, KernelLabel } from '../agent/backend-manifest.js';
import type { KernelBackendId } from '../kernelPrefs.js';
export type KernelUnavailableReason = 'kernel-unavailable-not-installed' | 'kernel-probing'
/** The installable variant of not-installed: the row stays dim but Enter
 *  opens the SDK install wizard instead of a dead-end toast. */
 | 'kernel-not-installed-installable'
/** Installed, but older than the backend supports (its hint says how to upgrade). */
 | 'kernel-unavailable-too-old';
/** What the host hands the picker about one registry entry: the manifest facts
 *  the UI needs, with the id already validated by the registry (`RegisteredBackend`). */
export interface KernelEntry {
    readonly id: KernelBackendId;
    /** Full name: an i18n key for in-tree backends, external text for plugins. */
    readonly label: KernelLabel;
    /** Short brand name for the launchpad's corner plate and the notices. */
    readonly shortLabel: string;
    /** Always selectable, no `AgentBackend` behind it (only dsh). */
    readonly alwaysAvailable: boolean;
    /** Product a version belongs to (`claude-code`); absent = bare version. */
    readonly product?: string;
    /** The backend declares an SDK this host can install (Enter opens the wizard). */
    readonly installable: boolean;
}
/**
 * The static facts the picker needs from one backend: a registry entry, or any
 * other source of the same shape (the regressions build fixtures this way).
 */
export interface KernelEntrySource {
    readonly id: KernelBackendId;
    readonly manifest: Pick<BackendManifest, 'label' | 'shortLabel' | 'alwaysAvailable' | 'product'>;
    /** The host can actually install this entry — its manifest declares an install
     *  recipe *and* this host implements that recipe's executor. Derived by the
     *  registry (`RegisteredBackend.installable`), never declared by a manifest:
     *  "which executor values exist" is the host's fact, not the backend's. */
    readonly installable: boolean;
}
/**
 * Project registry entries into the picker's data (P0: the UI renders the list
 * the host hands it — `listBackends()` in the composition root, fixtures in the
 * regressions — and never imports the registry itself).
 */
export declare function kernelEntriesOf(backends: readonly KernelEntrySource[]): readonly KernelEntry[];
/** Product-qualified version; an entry without a product keeps the raw version. */
export declare function kernelVersionLabel(product: string | undefined, version?: string): string | undefined;
export interface KernelOption {
    readonly id: KernelBackendId;
    readonly label: KernelLabel;
    /** Short brand name (the launchpad corner; narrow terminals drop the full one). */
    readonly shortLabel: string;
    readonly current: boolean;
    readonly selectable: boolean;
    readonly reasonKey?: KernelUnavailableReason;
    /** A selectable row's caveat (signed out, but `/login` works in-session). */
    readonly noteKey?: 'kernel-login-in-session';
    /** An unavailable row's own guidance from detection (install / upgrade). */
    readonly hint?: string;
    readonly version?: string;
    /** Not installed, but the host can install it (Enter opens the wizard). */
    readonly installable?: boolean;
}
export interface KernelStatus {
    readonly installed: boolean;
    readonly auth?: 'ok' | 'missing' | 'unknown';
    readonly version?: string;
    /** A missing credential can be supplied after start (BackendDetection). */
    readonly loginInSession?: true;
    /** Not installed, but a version was found: the binary is too old
     *  (`BackendDetection.stale` — the backend's own detection decides, not an id
     *  comparison in here; P0 D5-2). */
    readonly stale?: true;
    /** Detection's install / upgrade / sign-in guidance. */
    readonly hint?: string;
}
/** Entries stay in registry order (= declaration order, the picker's order).
 *  Only dsh is always available; optional backends stay disabled until
 *  detection completes. */
export declare function buildKernelCatalog(input: {
    readonly current: string;
    readonly entries: readonly KernelEntry[];
    readonly dshVersion?: string;
    readonly statuses?: Readonly<Record<string, KernelStatus>>;
    /** The host provides an install path (the wizard callbacks): a dim
     *  not-installed row of a backend the wizard can install (`entry.installable`)
     *  then says "press Enter to install" instead of a dead-end reason. */
    readonly canInstallSdk?: boolean;
}): readonly KernelOption[];
/** Join the available version and unavailability reason without an empty subtitle. */
export declare function kernelSubtitle(option: KernelOption, reason: (key: KernelUnavailableReason | 'kernel-login-in-session') => string): string | undefined;
//# sourceMappingURL=kernelCatalog.d.ts.map