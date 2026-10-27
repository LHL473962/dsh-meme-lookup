/** Track Task* result state and TodoWrite snapshots for the todo panel. */
import type { AgentEvent } from '../../../agent/events.js';
import type { ClaudeTaskSeed, ClaudeTranslatorOptions, TrackedTask } from './types.js';
export declare function createTaskTools(options: ClaudeTranslatorOptions): {
    trackedTasks: Map<string, TrackedTask>;
    taskSeeds: () => readonly ClaudeTaskSeed[];
    applyTaskInput: (out: AgentEvent[], name: string, input: unknown) => void;
    applyTaskResult: (out: AgentEvent[], call: {
        readonly name: string;
        readonly input: unknown;
    } | undefined, isError: boolean, structured: unknown, openCalls: Map<string, {
        readonly name: string;
        readonly input: unknown;
        readonly turn: number;
        readonly lane?: string;
    }>) => void;
    taskSeq: number;
};
//# sourceMappingURL=tasks.d.ts.map