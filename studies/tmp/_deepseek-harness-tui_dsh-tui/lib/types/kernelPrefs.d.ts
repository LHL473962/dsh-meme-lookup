import { type BackendId } from './agent/backend-manifest.js';
/**
 * The backends that ship inside this package, in picker order. They are the
 * registry's seed and the vocabulary the launcher's messages use — **not** the
 * validation source any more: since P0 D1 any syntactically valid id may name a
 * plugin backend, and membership is decided by
 * `src/dsh-adapter/backend-registry.ts` (which the launcher cannot import when
 * it runs without compiled modules, hence the mirrored copy in `bin/dsh-tui.js`).
 */
export declare const BUILTIN_BACKEND_IDS: readonly ["dsh", "claude", "codex"];
/**
 * An id that passed the id-syntax gate (the rule and the brand live in
 * `agent/backend-manifest.ts`, next to the manifest that declares it).
 *
 * It marks "validated input", which is what the session-ref and path builders
 * need. *Membership* ("is this backend installed?") is a runtime question:
 * `parseBackendChoice()` in the registry answers both halves, and the boot falls
 * back to dsh when the second half misses — exactly like an unknown value always
 * did (P0 D1).
 */
export type KernelBackendId = BackendId;
/** The fallback every path lands on. `dsh` passes the syntax gate by
 *  construction and is always registered, so it needs no runtime check. */
export declare const DSH_BACKEND_ID: KernelBackendId;
/**
 * The first half of the parse: trim, lowercase, id syntax. Anything else (a
 * blank, a typo, `has:colon`, `a/b`) is undefined, which every caller reads as
 * "no choice made". The second half — is it registered? — belongs to the
 * registry, which is deliberately not imported here (this module is reachable
 * from the UI, which may not import the adapter).
 */
export declare function parseBackendId(value: unknown): KernelBackendId | undefined;
/** Stored shape. */
export interface KernelPrefsData {
    readonly backend?: KernelBackendId;
}
/** Read the preference; missing, broken or unreadable means none. Never throws. */
export declare function readKernelPrefs(file?: string): KernelPrefsData;
/** Write the preference atomically; a failure goes to the debug log, never throws. */
export declare function writeKernelPrefs(data: KernelPrefsData, file?: string, debug?: (message: string) => void): void;
/**
 * The kernel this one boot must land on, set by a kernel switch (restartTui's
 * backend option) and by the launcher's crash retry. Boot deletes it from
 * process.env as soon as it reads it. Unlike DSH_TUI_BACKEND it ranks above
 * the Config row: with `backend: dsh` in the config, a switch to claude would
 * otherwise restart straight back onto dsh. Ordinary launches keep
 * config > env > remembered choice.
 */
export declare const KERNEL_SWITCH_HANDOFF_ENV = "DSH_TUI_BACKEND_HANDOFF";
/** The entry's path, set by the launcher: every replacement
 *  relaunches through it (src/update.ts restartArgv). */
export declare const HOST_ENTRY_PATH_ENV = "DSH_TUI_HOST_ENTRY_PATH";
export declare function hostEntryDisabled(env?: NodeJS.ProcessEnv): boolean;
/** Why the entry could not use the installed dsh; set by the entry, read and
 *  cleared once by the runtime (plugin.ts), also in a delegated `dsh --profile`. */
export declare const HOST_NOTICE_ENV = "DSH_TUI_HOST_NOTICE";
/**
 * The kernel boot runs on (plugin.ts backendChoice): a valid switch handoff
 * first, then the Config row, then DSH_TUI_BACKEND, then the remembered
 * choice, else dsh. An invalid DSH_TUI_BACKEND still means dsh, which is what
 * the boot warning says, rather than falling through to the remembered
 * choice; an invalid handoff value is ignored. Pure.
 */
export declare function resolveRememberedBackend(input: {
    /** KERNEL_SWITCH_HANDOFF_ENV, normalized; undefined on ordinary launches. */
    readonly handoff?: KernelBackendId | undefined;
    /** Config.backend after the boot's post-discovery membership check. */
    readonly configured?: KernelBackendId | undefined;
    /** process.env.DSH_TUI_BACKEND as given. */
    readonly envRaw?: string | undefined;
    /**
     * Whether DSH_TUI_BACKEND names an *installed* backend. Absent means the
     * syntax gate alone, which is what callers without a registry (the
     * crash-retry regressions) can offer. The boot passes the registry's
     * `isRegisteredBackend`: an uninstalled plugin id must fall back to dsh
     * exactly like a typo does, instead of reaching `loadBackend()` and crashing
     * the boot on a pinned choice (P0 D1).
     */
    readonly envKnown?: ((id: string) => boolean) | undefined;
    /** The kernel remembered in kernel.json. */
    readonly memory?: KernelBackendId | undefined;
}): KernelBackendId;
/**
 * The backend a **derived** resume target was read from (launcher → boot handoff).
 *
 * `DSH_TUI_RESUME_SESSION` alone cannot be trusted across backends. The launcher
 * derives a bare `--resume` target from the chosen backend's own
 * `backends/<id>/prefs.json` (`envFromLastRun` does the same from `last-run.json`),
 * and this boot may then land on a *different* backend: an uninstalled plugin id
 * falls back to dsh (P0 D1), and an unset `DSH_TUI_BACKEND` follows the remembered
 * kernel instead. Handing the id to whoever booted resumes the wrong backend's
 * session, or fails on one that never heard of it. This variable records the
 * source so the boot can refuse it.
 *
 * An id the user placed themselves (`--resume <id>`, a Config row, `/restart`)
 * carries no mark — where it belongs is theirs to decide, and the boot only says
 * what it knows. Boot deletes this from process.env as soon as it reads it,
 * exactly like {@link KERNEL_SWITCH_HANDOFF_ENV}.
 */
export declare const RESUME_BACKEND_ENV = "DSH_TUI_RESUME_BACKEND";
/**
 * Marks a boot the launcher started as the safe-mode **retry** (`dsh-tui safe`
 * → option 1, and the first-run fallback that shares it).
 *
 * A retry derives its target from `last-run.json` — "the kernel and session that
 * were running when the crash happened" — and the recorded kernel may no longer
 * be in the registry, which is exactly the case {@link resolveResumeTarget}
 * revokes. Failing the boot there would close the user's last way back, so a
 * retry gets the tolerated branch instead: warn, then cold-start on the kernel
 * that did open. The launcher sets it for the whole retry env, the boot deletes
 * it as soon as it reads it (one-shot, like the mark above), and it never
 * reaches the plugin protocol — `lastSession` and this handoff are implementation
 * details, not a backend contract (roadmap §6 item 11).
 */
export declare const RESUME_RETRY_ENV = "DSH_TUI_RESUME_RETRY";
/**
 * What the boot must do with the resume request it inherited.
 *
 * The four outcomes the decision names (roadmap §6 item 11): only the selected
 * backend is ever asked, a target is bound to the backend that derived it, and a
 * request that cannot be honored fails the boot instead of degrading into a cold
 * start or a session nobody asked for. `none` and `usable` are the two ordinary
 * outcomes; `revoked` carries everything the caller needs to report the refusal —
 * which backend the target came from, and whether the refusal is allowed to be
 * soft (safe-mode retry only).
 */
export type ResumeTarget = 
/** No resume request survives (nothing was asked for, or the id was blank). */
{
    readonly kind: 'none';
}
/** Hand this id to `backendChoice`, the backend this boot landed on. */
 | {
    readonly kind: 'usable';
    readonly sessionId: string;
}
/**
 * A **derived** target whose source backend is not the one this boot landed on.
 * `fatal` says how loud the refusal is: `true` fails the boot (the target is
 * neither carried across nor silently replaced by a new session), `false`
 * (safe-mode retry) only warns and lets the boot continue on `backendChoice`.
 */
 | {
    readonly kind: 'revoked';
    readonly from: KernelBackendId;
    readonly fatal: boolean;
};
/**
 * Whether a resume target may be handed to the backend this boot landed on. A
 * derived target is usable only on the backend it came from; a revoked one is
 * dropped rather than carried over, which is why the result hands the source back
 * for the caller's refusal instead of returning nothing. Pure.
 */
export declare function resolveResumeTarget(input: {
    /** The id as given: DSH_TUI_RESUME_SESSION, else Config.sessionId. */
    readonly sessionId?: string | undefined;
    /** RESUME_BACKEND_ENV, normalized. Absent = the user named the target. */
    readonly sourceBackend?: KernelBackendId | undefined;
    /** The backend this boot landed on (plugin.ts `backendChoice`). */
    readonly backendChoice: KernelBackendId;
    /** RESUME_RETRY_ENV: a safe-mode retry must survive a revoked target. */
    readonly retry?: boolean | undefined;
}): ResumeTarget;
//# sourceMappingURL=kernelPrefs.d.ts.map