/**
 * Harness-injection recognition and user-text unwrapping.
 *
 * Every foreign agent writes machine text into its user role: environment
 * blocks, instruction files, reminders, slash-command echoes. None of it is
 * the human's words, so it must never open a turn or become a title. The
 * other half is wrappers the harness puts AROUND real words (`<user_query>`,
 * pasted-content envelopes, interrupt notices): those keep the words and
 * drop the frame.
 *
 * Every scan here is linear: tag bodies are located with indexOf, never a
 * lazy `[\s\S]*?` regex, whose per-unclosed-tag rescans a hostile single
 * line can turn quadratic (deep-review m1 on the first claude adapter).
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/parse/injection
 */
/**
 * Line-start markers of injected blocks, matched case-insensitively after
 * trimming. A user text that STARTS with one of these is harness output.
 */
export declare const INJECTED_PREFIXES: readonly string[];
/** Whether a user text is harness injection rather than the human's words. */
export declare function isInjectedText(text: string): boolean;
/** Strip inline `<system-reminder>` blocks (Claude Code puts them anywhere). */
export declare function stripSystemReminders(text: string): string;
/** Whether a user text is an interrupt notice (the previous turn was cut short). */
export declare function isInterruptNotice(text: string): boolean;
/**
 * Reduce a user text to the human's own words.
 *
 * - `<user_query>` wrappers keep only their bodies — this also covers the
 *   interrupt / "sent a message while you were working" notices, whose
 *   human part is always inside a `<user_query>`;
 * - a notice without a `<user_query>` keeps what follows the notice line;
 * - pasted-content envelopes lose their tags but keep the pasted text.
 *
 * @returns The unwrapped, trimmed text ('' when nothing human remains).
 */
export declare function unwrapUserText(text: string): string;
//# sourceMappingURL=injection.d.ts.map