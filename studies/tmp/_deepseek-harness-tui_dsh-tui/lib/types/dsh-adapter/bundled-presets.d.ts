import type { Context } from '@deepseek-ai/cordis';
/**
 * 0.1.7 removed directory discovery. Consume the official bundle definitions
 * through its registry, without copying or reimplementing their tool sets.
 * Web/profile declarations own their seats even while still activating.
 * Returns false on the legacy directory-backed roster or while absent. An
 * absent service is watched through Cordis so a late registry is not missed.
 */
export declare function registerBundledPresets(ctx: Context): Promise<boolean>;
//# sourceMappingURL=bundled-presets.d.ts.map