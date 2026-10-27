import type { TodoPanelItem } from './types.js';
export declare function isSubagentToolName(name: string): boolean;
/** Extract `job_id` from a job_output call's raw args (JSON), or undefined. */
export declare function parseJobOutputId(argsFull: string | undefined): string | undefined;
/** Extract the command that launched a background job from its tool args
 *  (`command` for the shell tools, `text` for terminal_send). The registry
 *  label is the friendly description; the command is the actual invocation. */
export declare function toolCommandOf(argsFull: string | undefined): string | undefined;
/** The ack a shell tool returns for `run_in_background: true`. */
export declare const BACKGROUND_START_ACK: RegExp;
/** Narrow an optional plugin event without importing its module augmentation. */
export declare function todoPanelItems(data: unknown): TodoPanelItem[] | undefined;
//# sourceMappingURL=projection-helpers.d.ts.map