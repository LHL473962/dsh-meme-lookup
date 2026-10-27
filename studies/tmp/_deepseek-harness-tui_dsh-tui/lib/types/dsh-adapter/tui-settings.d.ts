/**
 * The `dsh-tui` settings namespace served from the TUI's own document
 * (../tuiSettingsFile.ts) instead of the DSH profile, so every kernel reads and writes one user layer. Same shape as
 * the settings service the plugin and channel already consume; every other
 * namespace goes to `delegate` (the host's settings service, when mounted).
 */
import type Schema from '@deepseek-ai/schemastery';
import type { SettingsNamespaceWarning } from '../adapter/ports/channel-settings.js';
type PathOp = {
    readonly op: 'set';
    readonly path: readonly string[];
    readonly value: unknown;
} | {
    readonly op: 'unset';
    readonly path: readonly string[];
};
interface Descriptor {
    readonly ns: string;
    readonly revision: number;
    readonly applies: 'live' | 'restart';
    readonly value?: unknown;
    readonly user?: unknown;
    /** A fault in the settings document itself, when there is one. */
    readonly warning?: SettingsNamespaceWarning;
}
/** The settings service as the plugin and the channel consume it. */
export interface TuiSettingsService {
    register<T>(ns: string, schema: Schema<T>): {
        get(): T;
        watch(callback: (next: T) => void): () => void;
    };
    describe(options?: {
        redactSecrets?: boolean;
    }): readonly Descriptor[];
    mutate(ns: string, ops: readonly PathOp[], expectedRevision?: number): Promise<void>;
    get(ns: string): unknown;
}
/** What the composite forwards other namespaces to (structural). */
export interface DelegateSettings {
    describe(options?: {
        redactSecrets?: boolean;
    }): readonly Descriptor[];
    mutate(ns: string, ops: readonly PathOp[], expectedRevision?: number): Promise<void>;
    get?(ns: string): unknown;
}
export declare function createTuiSettingsService(input: {
    /** The namespace this service owns (the plugin's settings namespace). */
    readonly ns: string;
    readonly file?: string;
    readonly profile: string;
    /** The editable Config keys (what the import may take from the profile). */
    readonly keys: readonly string[];
    /** Read per call: the host's own settings service may register late. */
    readonly delegate?: () => DelegateSettings | undefined;
}): TuiSettingsService;
export {};
//# sourceMappingURL=tui-settings.d.ts.map