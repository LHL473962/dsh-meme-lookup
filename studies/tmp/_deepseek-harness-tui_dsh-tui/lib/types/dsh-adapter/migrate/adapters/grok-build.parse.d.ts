import type { MigrationSession } from '../types.js';
/** One session directory's two files, as text. */
export interface GrokSessionInput {
    readonly summaryJson: string;
    readonly chatHistory: string;
}
/**
 * Parse one Grok Build session.
 * @returns The session, or undefined when the summary lacks an id or cwd,
 *   or the history holds no prompt.
 */
export declare function parseGrokSession(input: GrokSessionInput): MigrationSession | undefined;
//# sourceMappingURL=grok-build.parse.d.ts.map