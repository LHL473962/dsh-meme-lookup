/**
 * The host's install-executor table (roadmap Stage B / B-1, §6 item 12).
 *
 * Stage A locked the install surface to a **backend id** — `backend-registry.ts`
 * kept `HOST_INSTALLABLE_BACKEND_ID = 'claude'` and `backends.ts` statically
 * imported that one backend's installer. That held only while the host had
 * exactly one consumer writing manifests. A manifest now names an **executor**
 * instead, and the registry looks the name up in this table when the entry
 * registers: the value is data any mounted bundle can be checked against
 * (§4.4), not a static import.
 *
 * The table holds exactly one value today, and a recipe naming anything else is
 * treated as **having no install surface** rather than refused (§6 item 12: the
 * field *shape* is public, the value set is the host's). Widening it is adding an
 * entry here; the shape does not change, which is what keeps "one more executor"
 * a non-breaking act once the contribution family freezes (§6 item 5).
 */
import type { SdkInstallTarget, SdkInstaller } from '../../agent/backend.js';
/** The one executor value this host implements: one `pnpm add` in the DSH
 *  profile root. Named as a verb, not as a backend — a backend *declares* it. */
export declare const PNPM_PROFILE_ADD = "pnpm-profile-add";
/**
 * What one executor value means: the parameterized *how* of an install, with
 * every backend-specific *what* left to the manifest recipe that names it.
 */
export interface InstallExecutor {
    /** Where this launch would install — synchronous, read-only (argv + the file
     *  system) and never throwing. The non-profile kinds carry the reason for the
     *  wizard's manual-instructions panel. `argv` is injectable for regressions. */
    readonly resolveTarget: (argv?: readonly string[]) => SdkInstallTarget;
    /** Whether the tool this executor shells out to runs at all (the wizard's
     *  preflight, asked after the user confirmed the target). */
    readonly preflight: () => Promise<boolean>;
    /** Start one install of `specifier` into `dir`; cancellable, settles once. */
    readonly start: (specifier: string, dir: string) => SdkInstaller;
}
/** Executor name → actions. The single source of "which recipes this host can
 *  actually run"; everything else reads it through {@link installExecutor}. */
export declare const INSTALL_EXECUTORS: ReadonlyMap<string, InstallExecutor>;
/** The executor a manifest recipe names, or undefined when this host does not
 *  implement it — which every caller reads as "no install surface", never as an
 *  error (§6 item 12). */
export declare function installExecutor(name: string): InstallExecutor | undefined;
//# sourceMappingURL=executors.d.ts.map