/**
 * Effect ledger (C-060): an append-only JSONL journal of plugin-visible
 * effects at `~/.dsh-tui/effect-ledger.jsonl`, mounted by the
 * dsh-tui-plugin-host row as `ctx.tuiEffectLedger`.
 *
 * Every record carries the lifecycle triple:
 *
 * - `pluginId` — derived from the verified Component identity bound to the
 *   PASSED activation. `'host'` is used for host/root records and
 *   `'undeclared'` for a plugin-facing call without a verified identity; a
 *   display fiber name is never trusted as authorization identity.
 * - `activationInstance` — stable per cordis fiber for the lifetime of this
 *   process (first-seen assignment from a WeakMap), so a hot-reloaded plugin
 *   shows up as a NEW instance while all effects of one activation share one
 *   id.
 * - `runtimeGenerationId` — the plugin-host row's generation (C-050), so
 *   records from different process generations can never be confused.
 *
 * Recording rules:
 *
 * - FAIL-CLOSED ON SCHEMA: every record is validated against the vendored
 *   `effect-ledger-record.schema.json` BEFORE it is appended; a record that
 *   fails is dropped with a warning, never written. A missing vendored
 *   schema suppresses ALL writes (warned once) — the same posture as the
 *   messages.observe envelope check. The schema's `additionalProperties:
 *   false` is what structurally bans secrets from the ledger: callers
 *   cannot smuggle payload fields through.
 * - SEQUENCE: continues across restarts (max sequence in the existing file
 *   + 1); corrupt lines are skipped, never rewritten.
 * - NEVER THROWS: recording is observability, not a gate — internal errors
 *   (including disk failures) are caught and warned, the caller's path is
 *   unaffected.
 *
 * privacyClass: operational — records hold identifiers and error codes,
 * never message content, storage values, or grant-file contents.
 */
import { Context, Service } from '@deepseek-ai/cordis';
/**
 * The ledger's file name under a data directory. The name and the default
 * location are separate so that a check reading "what is left under this data
 * root" can point at another root and still find the ledger — the grants file and
 * the storage directory already follow one (C-5).
 */
export declare const EFFECT_LEDGER_NAME = "effect-ledger.jsonl";
/** Default ledger file (JSONL, one record per line). */
export declare const EFFECT_LEDGER_FILE: string;
/** Resource kinds recorded by the host's wired emitters. */
export declare const LEDGER_RESOURCE_KINDS: readonly ["command", "scene", "shortcut", "status", "status-field", "renderer", "theme", "storage-namespace", "subscription", "permission"];
export type LedgerOperation = 'create' | 'bind' | 'replace' | 'release' | 'cleanup-failed';
export type LedgerResult = 'applied' | 'pending' | 'failed';
/** Caller-facing record input; the runtime fills the lifecycle triple. */
export interface LedgerEntry {
    operation: LedgerOperation;
    resource: {
        kind: string;
        id: string;
    };
    result: LedgerResult;
    /** Contract error code when result is 'failed' (e.g. PERMISSION_NOT_GRANTED). */
    errorCode?: string;
    /** What this record supersedes (operation 'replace'). */
    replaces?: {
        resourceId?: string;
        activationInstance?: string;
    };
    /** `sha256:<64hex>` digest of an opaque value, when a record must reference one. */
    valueDigest?: string;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiEffectLedger: TuiEffectLedgerRuntime;
    }
}
/** `ctx.tuiEffectLedger` — append-only effect journal (C-060). */
export declare class TuiEffectLedgerRuntime extends Service {
    constructor(ctx: Context, options?: {
        file?: string;
        generationId?: string;
        ledgerSchema?: Record<string, unknown>;
    });
    /**
     * Append one record. `identity` is the caller's own context (plugins pass
     * their plugin ctx through the managed services' optional trailing
     * parameter); omitting it records `undeclared`, never a guess.
     */
    record(entry: LedgerEntry, identity?: Context): void;
    /** Append one kernel-resolved record to the JSONL file. */
    private appendKernelRecord;
    /** Kernel-ledger owner resolver: verified activation identity wins; host /
     * undeclared fallbacks are explicit and never borrowed from fiber names. */
    private resolveKernelOwner;
    /** Runtime generation (C-050): options override, else the plugin-host
     *  service's id — resolved on first record and cached (the host row mounts
     *  before any caller can record). */
    private generation;
    /** Continue numbering after the existing file's max sequence (restart-safe). */
    private resumeSequence;
    private fiberOf;
    private pluginIdOf;
    private activationOf;
}
export default TuiEffectLedgerRuntime;
//# sourceMappingURL=effect-ledger.d.ts.map