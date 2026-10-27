import { pnpmProfileAdd } from './pnpm-profile-add.js';
/** The one executor value this host implements: one `pnpm add` in the DSH
 *  profile root. Named as a verb, not as a backend — a backend *declares* it. */
export const PNPM_PROFILE_ADD = 'pnpm-profile-add';
/** Executor name → actions. The single source of "which recipes this host can
 *  actually run"; everything else reads it through {@link installExecutor}. */
export const INSTALL_EXECUTORS = new Map([
    [PNPM_PROFILE_ADD, pnpmProfileAdd],
]);
/** The executor a manifest recipe names, or undefined when this host does not
 *  implement it — which every caller reads as "no install surface", never as an
 *  error (§6 item 12). */
export function installExecutor(name) {
    return INSTALL_EXECUTORS.get(name);
}
