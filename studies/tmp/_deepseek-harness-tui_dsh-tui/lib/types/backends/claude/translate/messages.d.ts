/** Translate main-lane assistant blocks, user echoes and tool results. */
import type { AgentEvent, UsageDelta } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { createTaskTools } from './tasks.js';
import type { ClaudeTranslatorOptions, ClaudeUserRows, OpenAttempt, RegisteredInput } from './types.js';
export declare function createMessageTranslator(context: {
    readonly options: ClaudeTranslatorOptions;
    readonly userRows: ClaudeUserRows;
    readonly seq: number;
    readonly turn: number;
    readonly step: number;
    currentMode: string | undefined;
    toolResults: number;
    summaryExpected: boolean;
    readonly inputs: Map<string, RegisteredInput>;
    readonly openCalls: Map<string, {
        readonly name: string;
        readonly input: unknown;
        readonly turn: number;
        readonly lane?: string;
    }>;
    readonly deniedReasons: Map<string, string>;
    readonly outputFiles: Map<string, string>;
    readonly tasks: ReturnType<typeof createTaskTools>;
    now(): number;
    nextSeq(): number;
    debug(message: string): void;
    ensureAttempt(out: AgentEvent[], id: string, model: string | undefined, usage: UsageDelta | undefined): OpenAttempt | undefined;
    settleAttempt(out: AgentEvent[]): void;
    confirmInput(out: AgentEvent[], uuid: string): void;
    delegation(callId: string, input: unknown): AgentEvent;
}): {
    translateAssistant: (message: Rec) => AgentEvent[];
    translateUser: (message: Rec) => AgentEvent[];
};
//# sourceMappingURL=messages.d.ts.map