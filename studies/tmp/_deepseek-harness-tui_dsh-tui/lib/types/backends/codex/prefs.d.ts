import { type CodexModeId } from './modes.js';
import { type Rec } from './narrow.js';
export interface CodexPrefsData {
    readonly model?: string;
    readonly effort?: string;
    readonly mode?: CodexModeId;
    /** Collaboration mode is independent of the permission preset. */
    readonly plan?: boolean;
    /** The thread a bare `dsh-tui --backend codex --resume` opens (the
     *  launcher reads this field directly). */
    readonly lastSession?: string;
    /** This install's last use of each thread (epoch ms; the newest kept). */
    readonly lastUsed?: Readonly<Record<string, number>>;
    readonly colors?: Readonly<Record<string, string>>;
}
/** A patch: a value sets the field, `null` clears it. */
export interface CodexPrefsPatch {
    readonly model?: string | null;
    readonly effort?: string | null;
    readonly mode?: CodexModeId | null;
    readonly plan?: boolean | null;
    readonly lastSession?: string | null;
    readonly colors?: Readonly<Record<string, string>>;
}
export interface CodexPrefs {
    read(): CodexPrefsData;
    write(patch: CodexPrefsPatch): void;
    touch(threadId: string): void;
    forget(threadId: string): void;
}
/** Per-field start overrides: explicit prefs > config/read > defaults.
 * An unreadable config is not evidence that a user has no configuration. */
export declare function resolveCodexStartOptions(prefs: CodexPrefsData, config?: Rec): Rec;
/** Unwrap config/read without accepting a malformed answer as defaults. */
export declare function codexConfigOf(answer: unknown): Rec | undefined;
/** The file-backed prefs under `<dir>` (the host's `dataDir` for this
 *  backend). The directory is required: a backend never picks a location of
 *  its own under the host's data directory (D2, B-3/B-5). */
export declare function fileCodexPrefs(dir: string, debug?: (message: string) => void): CodexPrefs;
/** An in-memory store (tests). */
export declare function memoryCodexPrefs(initial?: CodexPrefsData): CodexPrefs & {
    readonly data: CodexPrefsData;
};
//# sourceMappingURL=prefs.d.ts.map