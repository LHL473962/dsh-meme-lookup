/**
 * Disposing the entry's root while the profile may still be composing into it:
 * @deepseek-ai/dsh-hmr deadlocks when disposed while its init starts config
 * watchers, so a root dispose first lets the Loader settle, and the composition
 * skips its audit and readiness once a dispose is waiting.
 */
import type { Context } from '@deepseek-ai/cordis';
export interface CompositionTracker {
    /** True once a root dispose waits for the composition: stop short of the audit and readiness. */
    readonly disposing: boolean;
    /** Composed, failed or stopped. */
    done(): void;
}
/** A root dispose waits for `settle` first. */
export declare function trackComposition(root: Context, settle: () => Promise<unknown>): CompositionTracker;
/** Dispose the root once a composition in progress on it has let its Loader settle. */
export declare function disposeRootSettled(ctx: Context, dispose?: () => Promise<unknown>): Promise<unknown>;
//# sourceMappingURL=root-dispose.d.ts.map