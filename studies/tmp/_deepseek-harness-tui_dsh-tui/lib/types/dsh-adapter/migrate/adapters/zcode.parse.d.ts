import type { MigrationSession } from '../types.js';
/**
 * Parse one zcode session document.
 * @returns The session, or undefined when the document is not a
 *   `{ meta, messages }` object with a task id and workspace, or holds no
 *   prompt.
 */
export declare function parseZcodeSession(raw: string): MigrationSession | undefined;
//# sourceMappingURL=zcode.parse.d.ts.map