/**
 * Store the session to resume and report the launcher invocation.
 * @param sessionId - Session id for `dsh-tui --resume` on the next launch.
 */
export declare function writeResumeTarget(sessionId: string): void;
/** Forget the resume marker (`/new` starts a fresh conversation). */
export declare function clearResumeTarget(): void;
/**
 * The session id requested by `dsh-tui --resume`, if any.
 * @returns The stored session id, or undefined when none is set.
 */
export declare function readResumeTarget(): string | undefined;
/**
 * The session id requested through `--resume`/`-c`/`--continue` in app args,
 * mirroring the standalone bin's interception (issue #120/#53). The
 * `dsh --profile tui` boot path forwards these args to the booted app
 * verbatim and never parses them into DSH_TUI_RESUME_SESSION, so the
 * in-profile plugin reads them itself. A bare flag with no id defers to the
 * exit-time marker, exactly like the bin. An app-level `--` ends option parsing.
 *
 * A bare flag whose fallback is empty yields `undefined` here — the caller decides
 * what that means, and both callers fail closed: the launcher reports "no session
 * to resume" and exits non-zero, the boot treats it as "no target" only because the
 * launcher already refused (roadmap §6 item 11). Never invent a fallback.
 * @param argv - the app arguments from cmdlineArgs, after the host's own options.
 * @returns The requested session id, or undefined when none was given.
 */
export declare function resumeTargetFromArgv(argv: readonly string[], 
/** What a bare flag resumes: DSH's exit-time marker by default; another
 *  backend passes its own (a Claude id never lives in `resume.txt`). */
readFallback?: () => string | undefined): string | undefined;
/**
 * Drop the resume flags {@link resumeTargetFromArgv} recognizes (the same
 * grammar, through the same helpers).
 *
 * A kernel switch respawns the process onto the OTHER backend: this
 * kernel's session id means nothing there, and an inherited `--resume
 * <id>` in argv would send the replacement looking for a session that
 * belongs to the kernel it just left (DSH's `resume.txt` marker is
 * already deleted by restartTui for the same reason). `--` still ends
 * option parsing.
 * @param argv - App arguments, exactly as passed to the replacement.
 * @returns A copy without those flags (and without the id they consumed).
 */
export declare function stripResumeArgs(argv: readonly string[]): string[];
/**
 * Session-id → last-used epoch ms map for MRU ordering.
 * @returns The parsed map; best effort, an unreadable file yields {}.
 */
export declare function readLastUsed(): Readonly<Record<string, number>>;
/**
 * Record that a session was just used (resumed or written to) so `/resume`
 * can sort most-recently-used first. Best effort — never throws.
 * @param sessionId - Session id to touch.
 */
export declare function touchSession(sessionId: string): void;
/**
 * Drop a session's last-used entry (`/resume` picker delete) so the MRU map
 * never accumulates ids whose logs are gone. Best effort — never throws.
 * @param sessionId - Session id to forget.
 */
export declare function forgetSession(sessionId: string): void;
/**
 * The agent-view ledger (see {@link AGENT_VIEW_SESSIONS_FILE}): session-id →
 * epoch-ms. Best effort — an unreadable file yields {}.
 * @returns The parsed map.
 */
export declare function readAgentViewSessions(): Readonly<Record<string, number>>;
/**
 * Record a session as agent-view-managed (dispatched, backgrounded, or
 * attached from the view). Best effort — never throws.
 * @param sessionId - Session id to record.
 */
export declare function touchAgentViewSession(sessionId: string): void;
/**
 * Drop a session from the agent-view ledger (its log was deleted). Best
 * effort — never throws.
 * @param sessionId - Session id to forget.
 */
export declare function forgetAgentViewSession(sessionId: string): void;
//# sourceMappingURL=sessionHistory.d.ts.map