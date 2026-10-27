/** Translate session, compaction, background-task and rate-limit frames. */
import type { AgentEvent, AgentEventOf, TurnEndReason } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { ClaudeTranslatorOptions, OpenAttempt } from './types.js';
/** A duration until a reset, coarse (`3d 1h`, `2h 5m`, `7m`). */
export declare function formatDuration(ms: number): string;
export declare function createSystemTranslator(context: {
    currentModel: string;
    currentMode: string | undefined;
    summaryExpected: boolean;
    notificationTurnExpected: boolean;
    readonly options: ClaudeTranslatorOptions;
    readonly turnOpen: boolean;
    readonly compactRequested: boolean;
    readonly attempt: OpenAttempt | undefined;
    readonly taskKinds: Map<string, 'agent' | 'job' | 'foreground'>;
    readonly taskInfo: Map<string, {
        readonly description: string;
        readonly callId?: string;
    }>;
    readonly laneTasks: Map<string, string>;
    readonly outputFiles: Map<string, string>;
    readonly hiddenTasks: Set<string>;
    readonly openCalls: Map<string, {
        readonly name: string;
        readonly input: unknown;
        readonly turn: number;
        readonly lane?: string;
    }>;
    readonly deniedReasons: Map<string, string>;
    now(): number;
    debug(message: string): void;
    openTurn(out: AgentEvent[], origin: AgentEventOf<'turn.start'>['origin'], userMessageId?: string): void;
    delta(open: OpenAttempt, value: AgentEventOf<'assistant.delta'>['delta'], index: number): AgentEvent;
    forceCloseTurn(reason: TurnEndReason): AgentEvent[];
}): {
    translateSystem: (message: Rec) => AgentEvent[];
    rateLimitNotice: (info: Rec | undefined) => AgentEvent[];
};
//# sourceMappingURL=system.d.ts.map