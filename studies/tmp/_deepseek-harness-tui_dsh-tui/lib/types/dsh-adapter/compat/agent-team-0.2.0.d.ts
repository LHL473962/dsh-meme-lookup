/**
 * Agent Teams 0.2.0 durable shapes, read as their 0.2.1 equivalents.
 *
 * The readers that meet these shapes call in here first, so the rest of the
 * adapter knows only the 0.2.1 forms (docs/agent-teams-design.md「兼容（0.2.0）」):
 * the translator and the subagent projection for mailbox deliveries, the
 * translator and agent-view for a teammate's first prompt. Session previews
 * (sessions/digest.ts) and the recap read no teammate session today: the
 * listings previews serve skip `origin: subagent`, and the recap reads only
 * the bound session. Route them here when a teammate session opens there.
 * The shapes are log compatibility, not host compatibility: a 0.2.1 host
 * still resumes sessions recorded under 0.2.0, so dropping the 0.2.0 host
 * line alone does not retire this module. It retires when reading
 * 0.2.0-era team logs is given up; then delete this file and its callers
 * (`grep -rn "compat(dsh 0.2.0"`).
 *
 * @module
 */
/**
 * A team message delivered by the 0.2.0 mailbox, as the relay it became:
 * source `{ kind: 'agent-message', form: 'relay', senderSessionId }`, first
 * block `Team message from <name>:`. The 0.2.0 framing block
 * (`Team message <id> from <name>:`) is replaced only when it matches this
 * message's identity exactly; otherwise it stays as content, as it did.
 * @param data - the message's source and content (other fields are kept).
 * @returns `data`, or a copy in the 0.2.1 form.
 */
export declare function teamMailboxAsRelay<T extends {
    readonly source?: unknown;
    readonly content?: unknown;
}>(data: T): T;
/**
 * A teammate's first prompt without the leading `<system-reminder>` identity
 * block (0.2.1 carries it as a system-prompt context). Matched against the
 * whole 0.2.0 template, on a human-sourced message with more blocks after it;
 * callers apply it to the first prompt they read (a translator: the first
 * since its replay or reset). A reader that starts mid-log — a subagent
 * transcript page, the live translator after `history()` replayed on its own
 * instance — counts its first prompt as one, so only that prompt, pasted as
 * the exact template plus more blocks, could lose the block.
 * @param data - the message's source and content (other fields are kept).
 * @returns `data`, or a copy without the block.
 */
export declare function withoutTeammateReminder<T extends {
    readonly source?: unknown;
    readonly content?: unknown;
}>(data: T): T;
/**
 * The 0.2.0 `send_message` result: the mailbox status of the queued message
 * (0.2.1 answers `{ sent: true }`).
 * @param value - the parsed tool result.
 * @returns `accepted` / `queued`, or `undefined` for anything else.
 */
export declare function legacySendMessageStatus(value: Readonly<Record<string, unknown>>): string | undefined;
//# sourceMappingURL=agent-team-0.2.0.d.ts.map