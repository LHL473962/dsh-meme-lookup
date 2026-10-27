export type HandoffEventKind = 'starting' | 'stage-start' | 'first-frame' | 'succeeded' | 'failed' | 'crashed';
/** One-line reason vocabulary for failed events (classified, not raw stacks). */
export type HandoffFailureReason = 'spawn-error' | 'boot-failure';
/** What the old process concludes about the replacement's outcome. */
export type ReplacementOutcome = {
    kind: 'succeeded';
} | {
    kind: 'failed';
    reason: HandoffFailureReason;
} | {
    kind: 'crashed';
    code: number | null;
};
/**
 * Classify how a replacement ended. Without a handoff pipe the only signal is
 * time: a death within 4s means the TUI never came up (failed), a clean exit
 * means the user ran and closed a working session (succeeded), and a later
 * nonzero exit is a crash of that session.
 *
 * With the pipe (firstFrameAcked defined) the first flushed frame decides
 * instead: after it every death is post-boot (crashed or succeeded); without
 * it the switch failed however long the process lived.
 */
export declare function classifyReplacementOutcome(input: {
    spawnError?: unknown;
    closed: boolean;
    code: number | null;
    signal: NodeJS.Signals | null;
    elapsedMs: number;
    firstFrameAcked?: boolean;
}): ReplacementOutcome;
/** restart.log event tag for a kind. */
export declare function handoffEventTag(kind: HandoffEventKind): string;
/**
 * Format one event's visible text. Pure: no I/O, clock or env. succeeded and
 * first-frame format to '' because they only go to restart.log.
 */
export declare function formatHandoffNotice(kind: HandoffEventKind, options: {
    name: string;
    reason?: HandoffFailureReason;
    code?: number | null;
    safeHint?: boolean;
    color?: boolean;
}): string;
/**
 * Write a stage line and resolve once the stream's write callback fires, so
 * the line is out before the caller spawns the replacement. A write that
 * returns true also resolves on the next setImmediate, for sinks that never
 * call back.
 */
export declare function writeHandoffStage(stream: Pick<NodeJS.WriteStream, 'write'>, text: string): Promise<void>;
//# sourceMappingURL=handoffEvents.d.ts.map