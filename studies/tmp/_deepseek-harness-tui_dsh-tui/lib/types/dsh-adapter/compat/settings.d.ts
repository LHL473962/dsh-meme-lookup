import type { Context } from '@deepseek-ai/cordis';
import type Schema from '@deepseek-ai/schemastery';
/** New Cordis configs wrap editable fields; old hosts pass plain values. */
export type RuntimeConfig<T> = {
    [K in keyof T]: T[K] | {
        get(): T[K];
    };
};
/** Declare only UI preferences as live fields, never the agent/session route. */
export declare function editableConfig<T>(schema: Schema<T>, keys: readonly (keyof T)[]): Schema<T, RuntimeConfig<T>>;
/** Settings forms use the Config owner's Loader ID, not the plugin name. */
export declare function resolveSettingsNamespace(ctx: Context, schema: Pick<Schema, 'dict'>): string;
/** Snapshot at an operation boundary; retain the host refs for later updates. */
export declare function configValues<T extends object>(config: RuntimeConfig<T>): T;
interface SettingsScope<T> {
    get(): T;
    watch(callback: (next: T) => void): () => void;
}
/**
 * 0.1.7 owns settings in Config; older hosts still own registered scopes.
 * Pass the Config owner's context, and dispose watch with the consumer's lifecycle.
 */
export declare function createSettingsScope<T>(ctx: Context, service: unknown, ns: string, schema: Schema<T>, current: () => T): SettingsScope<T> & {
    legacy: boolean;
};
/** New settings forms expose values through describe(), not get(). */
export declare function settingsValue(settings: {
    get?(ns: string): unknown;
    describe(): readonly {
        ns: string;
        value?: unknown;
    }[];
}, ns: string): unknown;
export {};
//# sourceMappingURL=settings.d.ts.map