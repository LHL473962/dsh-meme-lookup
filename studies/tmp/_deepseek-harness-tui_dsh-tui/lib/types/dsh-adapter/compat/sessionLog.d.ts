/**
 * Session-log compatibility helpers.
 *
 * Title lookup tolerates event types unknown to the current harness. Offline
 * rename and delete support the `/resume` picker when no live Agent owns the
 * selected persisted session. The resume seam registers vouched-for legacy
 * event types into every reachable KNOWN_SESSION_EVENT_TYPES copy so the
 * strict read path stops rejecting whole sessions over them (issue #153).
 *
 * Registration background: plugins like dsh-working-activity (< the publish
 * cut) appended `activity/status` through `session.append`, but rc.6's
 * append exposes no `ignorable` flag and the type is absent from
 * KNOWN_SESSION_EVENT_TYPES — so resume's seed validation rejects the WHOLE
 * session ("unknown to this harness and not marked ignorable"). Upstream's
 * catalog header defers a registration surface "until such a consumer
 * exists"; the working-activity plugin became that consumer at #119 and
 * registers its type at load. Logs written BEFORE that cut, resumed in a
 * process where the plugin's registration never ran (plugin unmounted, or
 * a bare cordis.yml), still hit the rejection — this module is the consumer
 * for exactly that residue.
 *
 * Why registration and NOT rewriting the log to mark events `ignorable`
 * (the #107 approach, restored then replaced after review): the store is
 * shared with dsh web (#24) and possibly a second TUI instance (#153), and
 * a whole-file tmp+rename swap (a) loses frames an already-open appender
 * lands on the replaced inode, (b) drops the backend's 0600 artifact mode,
 * (c) re-encodes frames without the writer's checksum flag, and (d) dies on
 * torn tails the backend itself can recover. Registration touches nothing
 * on disk and degrades to exactly the pre-patch behavior when no copy
 * resolves.
 *
 * Whitelist discipline: ONLY `activity/status` — the type the plugin
 * provably wrote as ephemeral UI frames. Anything else unknown stays
 * unknown: upstream's fail-closed ("likely written by a newer harness") is
 * a feature — silently skipping a REQUIRED future event would reconstruct
 * a wrong session. Retires the day upstream's shared catalog adopts the
 * type or ships a real registration API (the add() calls become no-ops).
 *
 * The second half of this module is the bounded, tolerant, read-only log
 * reader behind the session tree (channel.buildSessionTree): 64 KiB chunked
 * I/O, lazy per-frame zstd decode over an RFC 8878 structural frame walk (a
 * torn final frame — crash mid-flush — is dropped as uncommitted, never
 * fatal), packed-row expansion, an event budget plus a scanned-envelope
 * budget so ignorable-heavy logs cannot multiply the cost of opening the
 * panel, and an inherited-prefix skip so a fork's event budget pays only for
 * its OWN events. It never writes; both stock encodings are read.
 *
 * @module @deepseek-harness-tui/dsh-tui/compat/sessionLog
 */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
/**
 * Legacy third-party session-event types the TUI vouches for as ephemeral
 * UI frames — safe for the strict read path to accept and skip. Exported
 * for the regression verifier; grow it only with proof the type was always
 * inert (never load-bearing for session reconstruction).
 *
 * 0.1.5 note: the vouch is not only for OLD logs. `session/color` is written
 * by the TUI itself on every host generation (session-metadata.ts), and
 * 0.1.5's `validateStoredEvents` refuses unknown non-ignorable types at load
 * — without this registration a single color pick makes that session
 * permanently unresumable (probed: SessionFormatUnsupportedError without the
 * vouch, clean load with it). The type stays inert for reconstruction either
 * way: it only re-tints the row.
 */
export declare const LEGACY_SESSION_EVENT_TYPES: readonly string[];
/**
 * Session-log storage roots, in priority order, mirroring the persistence
 * backend's `root` resolution: cordis.patch.yml sets `DSH_TUI_SESSION_ROOT ?? dshHomePath(
 * 'sessions')` where dshHomePath is `$DSH_HOME ?? ~/.dsh`; the unpatched
 * cordis.yml base falls back to ~/.dsh-tui/sessions, kept here as the legacy
 * last resort. Every candidate is scanned — the first hit wins, so an
 * explicit DSH_TUI_SESSION_ROOT always outranks the defaults.
 */
export declare function sessionsRoots(): string[];
/**
 * Locate a session's log by scanning workspace directories for the session
 * id — deliberately NOT replicating the persistence plugin's workspace-key
 * sanitization, so the helpers survive upstream key-scheme changes. Every
 * committed generation is considered; the newest wins (the backend migrates
 * historical artifacts by publishing a `session.vN` sibling and reading only
 * it, so the newest generation is always the authoritative one).
 * @param sessionId - Session id (directory name under each workspace dir).
 * @returns Absolute path of the selected log, or undefined when absent.
 */
export declare function findSessionLogFile(sessionId: string): string | undefined;
/** A located session log and its on-disk encoding. */
interface SessionLogFile {
    readonly path: string;
    /** true for session.jsonl.zstd (default), false for compression:"none". */
    readonly compressed: boolean;
}
/**
 * Resolve a `persistence.locate()` hint to a readable log. The hint may name
 * the physical artifact directly or the backend's LOGICAL name for it (the
 * jsonl backend's raw-artifact filename carries no encoding suffix), so the
 * compressed twin is probed as well. Since 0.1.5 the hint names the CURRENT
 * generation (`session.vN.jsonl[.zstd]`) without touching the filesystem —
 * for a session never opened since its format was superseded that file does
 * not exist yet, and the authoritative artifact is an older-generation
 * sibling in the same directory. Encoding is sniffed from content, never
 * inferred from the extension.
 * @param hint - Absolute path from SessionPersistence.locate().
 * @returns The readable log, or undefined when nothing materialized there.
 */
export declare function resolveLocatedPath(hint: string): SessionLogFile | undefined;
/** Outcome of reading an EXISTING log through the bounded reader. */
export interface SessionLogRead {
    readonly events: readonly SessionEvent[];
    /** Physical generation of these sequence coordinates, read from the header. */
    readonly formatVersion?: number;
    /** False when the read stopped early (event/scan budget) — a plain
     *  truncation; the collected prefix is fully usable. */
    readonly complete: boolean;
    /** Envelopes inspected (collected or skipped) — the real scan cost. */
    readonly scanned: number;
    /** True when an EXISTING log could not be read: corruption, a torn first
     *  frame, an over-cap frame, a decode bomb. Distinct from ABSENT (which
     *  reports `undefined`): a failed log must degrade to a structure-only
     *  placeholder and must NOT be retried through an unbounded strict read —
     *  that fallback would defeat every cap this reader exists to enforce.
     *  `events` keeps the partial prefix collected before the failure, for
     *  diagnostics; callers building trees ignore it. */
    readonly failed?: boolean;
}
/**
 * Default scan budget derived from the event budget: 4× headroom over the
 * collectible events (legitimate logs interleave a modest share of skipped
 * rows — headers, repair-marked ignorable frames), plus a floor so even a
 * tiny `maxEvents` tolerates a noisy prefix. Unbounded reads stay unbounded.
 */
export declare function defaultMaxScanned(maxEvents: number): number;
/**
 * File-level sibling of {@link readSessionEventsFromLog} for paths resolved
 * by the backend itself (`persistence.locate`) — covers a custom-configured
 * root that none of the stock sessionsRoots() candidates describes.
 * @param path - Absolute artifact path (physical or logical name).
 * @param maxEvents - Stop before collecting more than this many events.
 * @param maxScanned - Stop after INSPECTING this many envelopes, collected
 *   or skipped (default: {@link defaultMaxScanned} of maxEvents).
 * @param skipBelowSeq - Inherited-prefix cutoff (session-tree dedup):
 *   seq'd events below it are skipped without spending the event budget —
 *   they still count against maxScanned. `session/title` events are always
 *   collected (branch-head labels need them; they never become entries).
 * @returns The read outcome, or undefined ONLY when nothing materialized at
 *   the path — an existing-but-undecodable log reports `failed: true`.
 */
export declare function readSessionEventsFromFile(path: string, maxEvents?: number, maxScanned?: number, skipBelowSeq?: number): SessionLogRead | undefined;
/**
 * Read a session's events from its persisted log — tolerant, read-only, and
 * cost-bounded. Built for the session tree (buildSessionTree), whose browse
 * must satisfy three constraints the strict backend read cannot:
 *
 *  - READ-ONLY: the strict backend read (`persistence.inspect` on pre-0.1.5
 *    hosts, the validated `handle.read` path since) rejects logs carrying
 *    third-party event types (working-activity's `activity/status`), and
 *    the resume seam's answer (in-process type registration, issue #153)
 *    must not be inverted here: opening a picker never rewrites a history
 *    log. This reader never writes; unknown types are simply passed through
 *    (extractEntries skips what it does not know).
 *  - TOLERANT: envelope-shape or decode anomalies degrade to
 *    `failed: true` (a structure-only tree node) instead of rejecting the
 *    whole log — and a torn FINAL zstd frame (crash mid-flush) is dropped
 *    as uncommitted, keeping the frames before it readable.
 *  - BOUNDED: the file is read in 64 KiB slices and frames decode lazily,
 *    stopping the moment `maxEvents` events have been collected — a
 *    200k-event log costs budget × per-event work, not a whole-file read +
 *    decompress + parse. `complete: false` marks the early stop (the caller
 *    surfaces it as `truncated`). One honest exception: a single zstd FRAME
 *    is the atomic unit (see logRecords) — the budget bounds work ACROSS
 *    frames, never inside one giant flush.
 *
 * Packed rows are expanded with the backend's own `decodeStorageRecord`:
 * the packChunks writer folds each run of same-block delta chunks into ONE
 * `text-chunks`/`reasoning-chunks`/`tool-call-chunks` line (the default —
 * the finding that motivated this reader's third revision), so a line is a
 * storage record, not an event, and seq-less rows must not be dropped as if
 * they were headers. The budget counts EXPANDED events, matching the tree's
 * per-event cost. Malformed packed rows throw inside decodeStorageRecord —
 * corrupt storage reports `failed: true`, never silently dropped runs.
 *
 * Torn-tail semantics mirror the backend's own reader: a plain log's
 * unterminated final line (crash mid-append) is uncommitted data and
 * ignored, while an unterminated record INSIDE a complete zstd frame is
 * corruption and fails the read.
 *
 * Envelopes with `ignorable: true` are skipped (the read path's own skip
 * signal) and the seq-less header row is metadata, not an event. Skipped
 * envelopes still count against the SCAN budget (maxScanned): skipping is
 * not free — the I/O, decompress and JSON.parse for them have already been
 * paid — so an ignorable-heavy log cannot bypass the cost bound by keeping
 * its collectible count low. Never throws; returns undefined ONLY when the
 * log is absent — an existing-but-undecodable log returns `failed: true`
 * so the caller degrades to a placeholder instead of escalating to an
 * unbounded strict re-read.
 * @param sessionId - Session whose log should be read.
 * @param maxEvents - Stop before collecting more than this many events
 *   (default: unbounded). 0 collects nothing and reports complete: false
 *   whenever the log holds any collectible event.
 * @param maxScanned - Stop after INSPECTING this many envelopes, collected
 *   or skipped (default: 4× maxEvents + 4096; unbounded when maxEvents is).
 * @param skipBelowSeq - Inherited-prefix cutoff (session-tree dedup):
 *   seq'd events below it are skipped without spending the event budget —
 *   they still count against maxScanned. `session/title` events are always
 *   collected (branch-head labels need them; they never become entries).
 * @returns The read outcome — events, completeness, real scan cost, and a
 *   `failed` marker for safety-cap/corruption bailouts.
 */
export declare function readSessionEventsFromLog(sessionId: string, maxEvents?: number, maxScanned?: number, skipBelowSeq?: number): SessionLogRead | undefined;
/**
 * Read the exact inherited-prefix length from a log. Pre-V2 physical headers
 * carry it as `seedLength` on the first line; V2/V3 headers only have
 * `isSeeded`, and the cut is the seq of the `session/end-seed` marker event
 * stamped with `inherited: true` — scanned for, bounded, only when the
 * header says the session is seeded. Logical list headers never carry the
 * cut on any generation. Never guesses from snapshot length, and an
 * unseeded or marker-less log reports undefined (no cut to report).
 */
export declare function readPhysicalHeaderSeedLength(path: string): number | undefined;
/** Locate a session log by id and read its inherited-prefix cut. */
export declare function readPhysicalHeaderSeedLengthForSession(sessionId: string): number | undefined;
/**
 * Register every {@link LEGACY_SESSION_EVENT_TYPES} type as known in EVERY
 * reachable KNOWN_SESSION_EVENT_TYPES copy, ahead of the strict read path
 * (`agents.resume` seed validation, `persistence.load`). Idempotent; never
 * throws.
 *
 * Why a walk instead of a single import: a runtime can load dsh-session
 * more than once (CLI tree vs profile tree, version overlap during
 * upgrades, pnpm peer-context splits), and the strict validator — which
 * lives in the dsh-session-persistence package — consults only ITS OWN
 * tree's copy. Registering through one import leaves the other trees'
 * copies untouched. So from EACH base anchor (this module = the dsh-tui
 * tree, the process entry point = the launcher/CLI tree) the walk
 * registers the tree's own dsh-session AND steps one edge further:
 * resolve the validator package from that same tree, then register the
 * dsh-session copy the validator's entry resolves. A branch that cannot
 * be resolved simply is not there; resolved module paths are deduped.
 */
export declare function ensureLegacySessionEventTypes(): void;
/**
 * Read a session's display title from its persisted log, tolerantly.
 *
 * Why not `persistence.load()`: the backend validates every event against
 * KNOWN_SESSION_EVENT_TYPES and throws the WHOLE load when a third-party
 * plugin wrote an unmarked unknown type. A picker label is
 * read-only UI state: decoding frames directly here keeps titles working
 * for logs the strict path refuses, now and for future plugin event types.
 *
 * Title precedence: the LAST `session/title` event wins (a /rename append
 * overrides the first-prompt auto title), falling back to the first user
 * message text. `hasUserMessage` drives the picker's launch-artifact filter.
 * @param sessionId - Session whose log should be read.
 * @returns The title info, or undefined when the log is absent/undecodable.
 */
export declare function readSessionTitleFromLog(sessionId: string): {
    title?: string;
    hasUserMessage: boolean;
} | undefined;
/**
 * Payload of an explicit user rename — the shape upstream
 * `SessionTitleService.rename()` writes. The strict reader requires BOTH
 * fields on every `session/title` event: `messageSeqs` must be an array, and
 * empty exactly when the user supplied the title (`source.kind === 'user'`).
 * A `{ title }`-only payload makes the whole log unopenable
 * (`title messageSeqs requires an array`, issue #1006). The live `/rename`
 * and this module's offline append share this builder so the two writers
 * cannot drift apart again.
 * @param title - New display title (already trimmed by the caller).
 */
export declare function userTitleData(title: string): {
    title: string;
    messageSeqs: number[];
    source: {
        kind: 'user';
    };
};
/**
 * Append a `session/title` event to a persisted session's log — the
 * `/resume` picker rename for a NON-LIVE session (the live one goes through
 * `session.append` in the channel). The backend flushes by appending zstd
 * frames, so the new event lands as one more frame: existing bytes stay
 * untouched (the frame-0 header invariant holds), and `last title wins` in
 * {@link readSessionTitleFromLog} surfaces the new name. The seq continues
 * the log's contiguity contract (seq = event count) by taking maxSeq + 1.
 * The frame is APPEND-ONLY (O_APPEND), matching the backend's own flush
 * discipline: this store is shared with dsh web (#24), and a
 * read-concat-rewrite (tmp + rename) would silently drop a frame another
 * writer lands between our read and replace. A single append never rewrites
 * existing bytes, so concurrent frames all survive; the worst remaining
 * race is a duplicate seq when the maxSeq read above passes another
 * appender — benign next to lost frames, since last-title-wins keeps the
 * rename semantics. Never throws.
 * @param sessionId - Session to rename.
 * @param title - New display title (already trimmed by the caller).
 * @returns 'appended', or 'unavailable' when the log is absent/undecodable.
 */
export declare function appendSessionTitle(sessionId: string, title: string): 'appended' | 'unavailable';
/**
 * Delete a persisted session's log directory (`<root>/<workspace>/<id>/`),
 * the `/resume` picker delete. The directory holds only session.jsonl.zstd
 * today; removing it whole keeps future sidecar files from orphaning. The
 * backend's list() materializes entries from these logs, so the session
 * drops out of the picker on the next refresh. Never throws.
 * @param sessionId - Session to delete (must not be the live session).
 * @returns 'deleted', or 'unavailable' when the log is absent.
 */
export declare function deleteSessionLog(sessionId: string): 'deleted' | 'unavailable';
export {};
//# sourceMappingURL=sessionLog.d.ts.map