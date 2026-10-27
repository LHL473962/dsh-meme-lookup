import type { MigrationSession } from '../types.js';
/** What the adapter knows about a rollout besides its text. */
export interface CodexRolloutInput {
    readonly raw: string;
    /** The rollout's stable source id (the uuid in its file name). */
    readonly sourceId: string;
}
/**
 * Parse one Codex rollout.
 * @returns The session, or undefined when it records no cwd or no prompt, or
 *   is a sub-agent thread (`thread_source: 'subagent'` / `source.subagent`):
 *   those are spawned by a main session and are not conversations of their
 *   own. Forks (`forked_from_id` without the sub-agent marker) are kept.
 */
export declare function parseCodexRollout(input: CodexRolloutInput): MigrationSession | undefined;
//# sourceMappingURL=codex.parse.d.ts.map