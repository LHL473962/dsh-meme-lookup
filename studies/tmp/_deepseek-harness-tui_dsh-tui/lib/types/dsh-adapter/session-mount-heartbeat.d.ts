/**
 * Publishes this TUI process's mounted-session set to the cross-process
 * ledger ({@link ../../sessionMounts.js}).
 *
 * A TUI terminal hosts several agent sessions at once — the attached one plus
 * every parked background session — and two processes driving the same
 * session log would interleave writes into one append-only transcript. The
 * ledger is what lets another TUI see "this session is already mounted" and
 * refuse it, so the published set has to cover EVERY live agent in this
 * process, not just the attached one.
 *
 * Reading the agent registry is what makes that automatic, and the small timer
 * is what keeps it honest: agents are created from more than seven paths
 * (`/new`, `/resume`, `/bg`, fork, rewind, model switch, boot attach), so an
 * announce-at-each-call-site design would silently drop a session the day
 * someone adds an eighth. Deriving the set from the registry has exactly one
 * place to be right.
 *
 * Publishing is NOT a liveness witness: {@link ../../sessionMounts.js} decides
 * liveness from the owner's pid alone, so a late or missed publish cannot keep
 * a dead process's claim alive and there is no timestamp here to expire. The
 * timer's only job is to keep the published SET current, and it is deliberately
 * unref'd: it must never be the reason a quitting TUI stays alive. Teardown
 * removes the record outright so a clean exit frees its sessions immediately.
 *
 * Registered through the host's single teardown funnel by the caller, so both
 * the interval and the ledger record are released exactly once.
 *
 * @module
 */
import type { Context } from '@deepseek-ai/cordis';
/**
 * Collect the session ids this process currently has mounted: every live agent
 * the registry knows about, minus sub-agent runs.
 *
 * Sub-agents are excluded because they are not independently mountable: they
 * are a parent session's own work, they never appear as `/resume` rows, and
 * claiming their ids would make the parent look occupied to a TUI that only
 * wants to read the parent.
 * @param ctx - The plugin context, for the agent registry.
 * @returns Session ids as strings.
 */
export declare function mountedSessionIds(ctx: Context): string[];
/**
 * Start publishing this process's mounted sessions.
 *
 * The first publish runs synchronously so a session mounted during boot is
 * claimed before the user can reach a second terminal.
 * @param ctx - The plugin context, for the agent registry.
 * @param extra - Sessions no DSH registry lists: a non-DSH backend's bound
 *   session under its backend-qualified key (`claude:<id>`).
 * @returns A disposer that stops publishing and releases the claim.
 */
export declare function startSessionMountHeartbeat(ctx: Context, extra?: () => Iterable<string>): () => void;
//# sourceMappingURL=session-mount-heartbeat.d.ts.map