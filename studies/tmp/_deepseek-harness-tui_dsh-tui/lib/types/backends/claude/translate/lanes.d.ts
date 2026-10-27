/** Translate subagent lanes without touching main-lane attempt state. */
import type { AgentEvent } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { ClaudeTranslatorOptions } from './types.js';
/**
 * The output path a backgrounded command's acknowledgement names: the rest
 * of its line, cut after `<taskId>.output` (the sentence that follows on the
 * same line is not part of it), else after the first `.output` that ends a
 * word. Undefined when the text names none.
 */
export declare function backgroundOutputPath(text: string, taskId: string): string | undefined;
export declare function createLaneTranslator(context: {
    readonly options: ClaudeTranslatorOptions;
    readonly seq: number;
    readonly turn: number;
    readonly step: number;
    readonly openCalls: Map<string, {
        readonly name: string;
        readonly input: unknown;
        readonly turn: number;
        readonly lane?: string;
    }>;
    readonly outputFiles: Map<string, string>;
    now(): number;
    nextSeq(): number;
    debug(message: string): void;
}): {
    delegation: (callId: string, input: unknown) => AgentEvent;
    translateLane: (lane: string, type: string, message: Rec) => AgentEvent[];
};
//# sourceMappingURL=lanes.d.ts.map