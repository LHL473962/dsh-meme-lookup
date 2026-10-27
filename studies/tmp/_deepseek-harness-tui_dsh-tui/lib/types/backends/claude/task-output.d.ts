/** The tail read per call (the card shows 3 lines, the panel 30). */
export declare const TASK_OUTPUT_TAIL_BYTES: number;
/** Where the CLI may keep task output (each resolved, symlinks included). */
export declare function taskOutputRoots(env?: Readonly<Record<string, string | undefined>>): string[];
/**
 * Validate a reported output path for one task; returns the resolved path
 * or throws a user-facing error (never opening anything that fails).
 */
export declare function resolveTaskOutputPath(reported: string, taskId: string, roots: readonly string[]): string;
/** The last {@link TASK_OUTPUT_TAIL_BYTES} of a task's output (a partial
 *  first line dropped when the read starts mid-file). */
export declare function readTaskOutputTail(reported: string, taskId: string, roots?: readonly string[]): string;
//# sourceMappingURL=task-output.d.ts.map