/**
 * Cross-process session mounting ledger, kept at
 * `~/.dsh-tui/session-mounts.json`.
 *
 * A TUI terminal hosts SEVERAL agent sessions at once (the attached one plus
 * every parked background session), and sessions are durable: another TUI, or
 * `dsh web`, can list the same logs. Nothing in the DSH session store says
 * *who is currently driving a log*, so two TUI processes resuming the same
 * session would interleave writes into one append-only event log and corrupt
 * the transcript. This file is that missing fact: each TUI process publishes
 * the set of sessions it has mounted, and a reader that sees a foreign entry
 * treats the session as OCCUPIED and refuses to mount it.
 *
 * Liveness is one witness, `process.kill(pid, 0)`: it catches a clean exit and
 * a `kill -9`. There is no heartbeat timestamp, because a timestamp only stays
 * truthful while a timer keeps refreshing it, and the process that cannot
 * refresh it is exactly the one whose record should expire. The cost is pid
 * REUSE — a recycled pid keeps a dead owner's record alive — which errs toward
 * refusing a session that is in fact free and costs one restart; the opposite
 * error interleaves two writers into one transcript. This is a same-machine
 * guard only: the host's own session write lock stays the authority that
 * actually separates writers.
 *
 * Reads never write. Pruning a dead owner happens on the write path, because a
 * reader that wrote its snapshot back could erase a peer's record published
 * between its read and its replace — silently dropping a live session from the
 * occupancy table while its process kept writing.
 *
 * Writes take a short cross-process lock, re-read the file under it, and replace
 * it atomically. The lock is token-checked, so a holder whose lock was reclaimed
 * as stale cannot write over — or delete — the new holder's lock. A CLAIM
 * re-derives its conflict under that lock ({@link claimMount}), because
 * "check, then publish" is not atomic across processes.
 *
 * "I could not read the ledger" is NOT "nobody holds the session". Granting a
 * write handle on a damaged or unreadable ledger is exactly the failure this
 * module exists to prevent, and it is unrecoverable, so the authoritative
 * paths refuse instead of degrading ({@link readMountLedgerStrict},
 * {@link MountFailure}). Only the display surface reads best-effort.
 *
 * The lock is reclaimable only from a holder that is provably gone: its token
 * carries the holder pid, so a lock whose holder is still ALIVE is never stolen
 * from — not even by a peer that finds it old. That closes the window where a
 * paused holder resumed after its lock had been reclaimed and committed a
 * snapshot derived before the steal. The price is pid REUSE on a lock: a
 * recycled pid keeps a dead holder's lock alive, and the remedy is to delete
 * `session-mounts.lock` while every process sharing this data directory is
 * stopped.
 */
/** One process's published claim: the sessions it currently has mounted. */
export interface SessionMountOwner {
    /** Operating-system process id of the TUI holding these sessions. */
    readonly pid: number;
    /** Epoch ms when this process first published a record (diagnostics). */
    readonly startedAt: number;
    /** Session ids this process has mounted, in no significant order. */
    readonly sessionIds: readonly string[];
}
/** Whether a published record was written by THIS process. */
export declare function ownerIsSelf(owner: SessionMountOwner): boolean;
/** Why a session cannot be mounted by this process. */
export type SessionOccupancy = {
    readonly kind: 'free';
} | {
    readonly kind: 'mine';
} | {
    readonly kind: 'occupied';
    readonly pid: number;
};
/**
 * Why a claim did not succeed.
 *
 * The three cases are kept apart because the caller has to answer them
 * differently: `occupied` names a terminal the user can go close, `busy`
 * names a transient collision worth retrying, and `unavailable` means the
 * occupancy question could not be answered at all. Folding them together is
 * how "we did not manage to check" turns into "there was nothing to check".
 *
 * `damaged` splits `unavailable` one step further, because only one of its
 * causes has anything the user can do: the file was read and is not a ledger
 * document, so deleting it clears the refusal. A failure that is not marked
 * (permissions, a directory in its place, a lock we could not take) must not
 * be described as deformation — sending someone to delete a path that may be
 * their own data is worse than telling them nothing (issue #1579).
 */
export type MountFailure = {
    readonly ok: false;
    readonly reason: 'occupied';
    readonly holders: readonly number[];
} | {
    readonly ok: false;
    readonly reason: 'busy';
} | {
    readonly ok: false;
    readonly reason: 'unavailable';
    readonly detail: string;
    readonly damaged?: true;
};
/**
 * Outcome of {@link claimMount}: either this process now owns the session, or
 * a {@link MountFailure} says why it does not.
 *
 * `fresh` says whether the claim is what PUT the session in this process's
 * published set. Claiming a session this process already holds is legal and
 * common (a parked handle, a re-resume, a claim a publisher beat has already
 * mirrored), and the difference matters on the way out: a caller may only give
 * back what it took. Releasing an inherited claim would hand a session this
 * process is still driving to the next peer that asks.
 */
export type MountClaim = {
    readonly ok: true;
    readonly fresh: boolean;
} | MountFailure;
/**
 * Whether a process id is still alive. `process.kill(pid, 0)` sends no signal
 * and throws `ESRCH` when the process is gone; `EPERM` means it exists but is
 * owned by another user, which still counts as alive here.
 */
export declare function pidAlive(pid: number): boolean;
/**
 * Read the ledger for DISPLAY, keeping every record the shape check accepts.
 * A missing, empty, truncated or foreign-shaped document reads as an empty
 * ledger, because a screen that cannot read the occupancy table should still
 * paint the sessions it does know about.
 *
 * Never use this to decide whether a session may be mounted: "the read failed"
 * and "nobody holds it" are the same answer here. Authoritative callers use
 * {@link readMountLedgerStrict}.
 */
export declare function readMountLedger(): readonly SessionMountOwner[];
/**
 * Outcome of the authoritative read. `unavailable` carries a sentence naming
 * what was wrong, so a refusal can say "cannot verify occupancy" instead of
 * inventing a holder.
 *
 * `damaged` is the read's half of {@link MountFailure}: set only when the bytes
 * were in hand and they are not a ledger document.
 */
export type MountLedgerRead = {
    readonly ok: true;
    readonly owners: readonly SessionMountOwner[];
} | {
    readonly ok: false;
    readonly detail: string;
    readonly damaged?: true;
};
/**
 * Read the ledger for DECIDING, where "I could not read it" must not pass for
 * "it is empty".
 *
 * Only a missing file is an empty ledger — that is the genuine first run.
 * Everything else (unreadable, malformed JSON, unknown version, a record whose
 * shape does not parse) is `unavailable`, and the caller must refuse. Skipping
 * a bad record and writing the ledger anyway is not an option either: the
 * record that failed to parse may be another writer's only claim, so the safe
 * move is to leave the file exactly as it is and ask the user to repair it.
 * The five refusals that mean "read, but not a ledger document" carry
 * `damaged`; a failure to read at all carries no verdict.
 */
export declare function readMountLedgerStrict(): MountLedgerRead;
/**
 * Which process has each session mounted, considering only owners whose pid is
 * still alive. A session claimed by several live owners keeps the record that
 * started last: the protocol forbids that state, and picking one
 * deterministically beats reporting whichever the file happened to list first.
 */
export declare function readSessionOwners(): ReadonlyMap<string, SessionMountOwner>;
/**
 * The occupancy of one session, from THIS process's point of view.
 * @param sessionId - Session id to look up.
 * @param owners - A snapshot from {@link readSessionOwners}, so a screen can
 *   resolve a whole listing from one read instead of one per row.
 * @returns `mine` for a self-held session, `occupied` for a foreign one.
 */
export declare function occupancyOf(sessionId: string, owners: ReadonlyMap<string, SessionMountOwner>): SessionOccupancy;
/**
 * Publish this process's mounted set. Call at boot, whenever the set changes,
 * and just before teardown, so a peer always reads a current answer without a
 * timer keeping it fresh.
 *
 * The argument is the set the caller can OBSERVE (the live agent roster). Any
 * session with an in-flight operation is added on top, because a claim is
 * published before its agent exists: without that union a beat landing inside
 * a resume would delete the reservation this process just committed.
 * @param sessionIds - The sessions currently mounted (replaces the prior set).
 * @returns True when the ledger was updated.
 */
export declare function publishMounts(sessionIds: Iterable<string>): boolean;
/**
 * Claim one session for THIS process, atomically.
 *
 * The occupancy check and the claim have to be one lock-protected step: two
 * processes that each check first and publish second can both observe `free`
 * and both publish, which is exactly the state this ledger exists to prevent.
 * Inside the lock the conflict is re-derived from the file, and a session that
 * is genuinely ours is accepted — a second mount of our own parked handle is
 * not a conflict. When a live PEER holds it, nothing is written.
 *
 * A refusal that cannot name a peer is reported as `busy` (the lock was taken)
 * or `unavailable` (the ledger could not be read or replaced) — never as an
 * empty holder list, because callers have to be able to tell "somebody else
 * has it" from "we could not find out".
 * @param sessionId - Session id to claim.
 * @returns `ok`, or why the session is not ours.
 */
export declare function claimMount(sessionId: string): MountClaim;
/**
 * Drop one session from this process's published set. Used when a session is
 * explicitly closed; an ordinary session switch KEEPS its session mounted
 * (that is the point of parking), so most switches do not call this.
 * @param sessionId - Session id to release.
 * @returns True when the ledger was updated.
 */
export declare function releaseMount(sessionId: string): boolean;
/**
 * Remove this process's record entirely, so every session it held is
 * immediately mountable by another TUI. Called from the teardown funnel; a
 * crashed process skips this and its record is pruned by the next write
 * instead, which is why both paths must work.
 * @returns True when the ledger was updated.
 */
export declare function clearOwnMounts(): boolean;
/**
 * {@link reserveMount} for a session id this process just minted, where a
 * refusal is a loss of ANNOUNCEMENT rather than a conflict.
 *
 * A brand-new id cannot be held by anybody, so a create must not be blocked by
 * a ledger it cannot write — but it still has to be announced before the
 * factory runs, because from the moment the factory returns this process owns
 * the only write handle and the publisher will not name the session until its
 * next beat. A refusal therefore yields a no-op reservation and the caller
 * carries on; `failure` reports what happened so the caller can say so.
 * @param sessionId - Freshly minted session id.
 * @returns A reservation (never a refusal) plus the failure, if any.
 */
export declare function reserveNewSession(sessionId: string): Promise<{
    readonly reservation: MountReservation;
    readonly failure?: MountFailure;
}>;
/**
 * The sessions this process has published, for the diagnostics surface.
 * @returns The ids last handed to {@link publishMounts}.
 */
export declare function ownMounts(): readonly string[];
/**
 * {@link claimMount} with a bounded retry for `busy`.
 *
 * `busy` means a peer held the ledger lock for the instant we wanted it, which
 * says nothing about occupancy and is worth waiting out. `occupied` and
 * `unavailable` are answers, not collisions, and are returned immediately.
 * @param sessionId - Session id to claim.
 * @returns The final claim, `busy` only when the whole budget was spent.
 */
export declare function claimMountWithRetry(sessionId: string): Promise<MountClaim>;
/**
 * What a caller holds after {@link reserveMount} succeeds.
 *
 * A reservation ends one of two ways, and they are not the same act. `settle`
 * hands the session over to the agent registry — the mount happened, and from
 * then on the publisher derives the set from the roster. `abandon` gives it
 * back — the mount never happened, so nothing may be left claiming it. Both
 * are idempotent, so a `finally` can call either without tracking which.
 */
export interface MountReservation {
    readonly settle: () => void;
    readonly abandon: () => void;
}
/** Outcome of {@link reserveMount}: the reservation, or why there is none. */
export type MountReservationResult = {
    readonly ok: true;
    readonly reservation: MountReservation;
} | MountFailure;
/**
 * Claim `sessionId` and pin it for the WHOLE mount attempt, not just the claim
 * call.
 *
 * Everything that opens a writer goes through here, so that the rules live in
 * one place: the claim is atomic (nothing is opened on a refusal), the pin
 * survives a publisher beat while the agent does not exist yet, and the
 * reservation ends explicitly — `settle` on a commit, `abandon` on every path
 * that does not commit.
 * @param sessionId - Session about to be mounted.
 * @returns The reservation, or the {@link MountFailure} to report back.
 */
export declare function reserveMount(sessionId: string): Promise<MountReservationResult>;
//# sourceMappingURL=sessionMounts.d.ts.map