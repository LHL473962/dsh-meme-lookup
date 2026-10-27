import type { MigrationSession } from '../types.js';
/** What the adapter knows about a transcript besides its text. */
export interface ClaudeTranscriptInput {
    readonly raw: string;
    /** File name without `.jsonl` — the session's stable source id. */
    readonly fileStem: string;
    /** cwd derived from the project directory name, used when no line records one. */
    readonly fallbackCwd: string;
}
/**
 * Parse one Claude Code transcript.
 * @returns The session, or undefined when it holds no human prompt or is an
 *   auxiliary transcript (its records name another session: only the main
 *   `<sessionId>.jsonl` is a conversation of its own).
 */
export declare function parseClaudeTranscript(input: ClaudeTranscriptInput): MigrationSession | undefined;
//# sourceMappingURL=claude-code.parse.d.ts.map