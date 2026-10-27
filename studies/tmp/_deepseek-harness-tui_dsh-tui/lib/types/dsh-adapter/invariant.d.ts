/**
 * Package-owned invariant companion for `@deepseek-harness-tui/dsh-tui`.
 *
 * The vendored renderer core is third-party code written against
 * looser compiler flags; the relaxed `tsconfig` options exist only for that
 * subtree and must not spread to new code.
 * @module @deepseek-harness-tui/dsh-tui/invariant
 */
import type { Context, Inject } from '@deepseek-ai/cordis';
/** Legacy companion contract; DSH 0.2.1 removed the invariant service. */
export interface InvariantInstaller {
    (ctx: Context, fail: (message: string) => never): void | Promise<void>;
    readonly inject?: Inject;
}
/** Cordis companion plugin name. */
export declare const name = "dsh-tui-invariant";
/** Modern hosts no longer provide an invariant service. */
export declare const inject: string[];
/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map