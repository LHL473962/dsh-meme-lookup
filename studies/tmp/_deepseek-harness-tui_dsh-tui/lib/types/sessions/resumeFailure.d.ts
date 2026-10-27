/**
 * One wording for "why a session could not be mounted".
 *
 * Four surfaces can refuse a mount — the supervisor, the session browser, the
 * workspace home screen and the transcript itself — and each used to spell the
 * same failures out on its own. That is how `/resume` and `/agentview` ended
 * up telling the user different things about the same refusal, and it is why a
 * newly added reason (the cross-process occupancy case) would have been
 * silently mis-reported as a generic failure on whichever surface was missed.
 *
 * The mapping is pure and total: it takes the adapter's discriminated result
 * and returns the sentence to show, or `undefined` for the outcomes that need
 * no words. The `cancelled` case is deliberately silent — the user (or a rival
 * switch) asked for it, so there is nothing to explain.
 *
 * @module @deepseek-harness-tui/dsh-tui/sessions/resumeFailure
 */
import type { ResumeResult } from '../adapter/ports/channel-view.js';
import type { MountFailure } from '../sessionMounts.js';
/**
 * The message for a failed mount, or undefined when it should stay silent.
 * @param result - The adapter's mount outcome.
 * @returns The user-facing sentence, or undefined for `cancelled`.
 */
export declare function resumeFailureText(result: ResumeResult): string | undefined;
/**
 * The sentence for a ledger refusal that did NOT find a holder.
 *
 * A refusal to CHECK is not a refusal by a peer, so it must not borrow the
 * "another terminal holds it" wording — that would invent a terminal. The
 * `occupied` case is here too because it is a {@link MountFailure} and its
 * sentence already exists; {@link resumeFailureText} reaches the same key from
 * the adapter's own result.
 *
 * A refusal the user can clear gets the repair instruction appended: every
 * interactive surface goes through here, and "occupancy could not be verified"
 * on its own is a dead end when the cause is a file that has to be deleted.
 * @param failure - Why the session could not be claimed.
 * @returns The user-facing sentence.
 */
export declare function mountFailureText(failure: MountFailure): string;
//# sourceMappingURL=resumeFailure.d.ts.map