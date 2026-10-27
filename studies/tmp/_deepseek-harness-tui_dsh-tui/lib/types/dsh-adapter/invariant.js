/**
 * Package-owned invariant companion for `@deepseek-harness-tui/dsh-tui`.
 *
 * The vendored renderer core is third-party code written against
 * looser compiler flags; the relaxed `tsconfig` options exist only for that
 * subtree and must not spread to new code.
 * @module @deepseek-harness-tui/dsh-tui/invariant
 */
const PACKAGE_NAME = '@deepseek-harness-tui/dsh-tui';
/** Cordis companion plugin name. */
export const name = 'dsh-tui-invariant';
/** Modern hosts no longer provide an invariant service. */
export const inject = [];
/**
 * No runtime invariant: this interactive TUI front door owns no independent
 * lifecycle stream; state relations are owned by the agent/session seams it
 * renders.
 */
const install = () => { };
/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx) => {
    const registry = ctx.get('invariants', false);
    return Promise.resolve(registry?.register(PACKAGE_NAME, install) ?? (() => { }));
};
/* jscpd:ignore-end */
