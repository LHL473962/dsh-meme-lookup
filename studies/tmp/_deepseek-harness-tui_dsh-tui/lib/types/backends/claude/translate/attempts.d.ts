/** Assemble turns, attempts and streaming deltas into canonical messages. */
import type { AgentEvent, AgentEventOf, TurnEndReason, UsageDelta } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { OpenAttempt } from './types.js';
/** Settled API message ids remembered (a late block only ever trails the
 *  response it belongs to by a few messages). */
export declare const MAX_SETTLED_ATTEMPTS = 256;
export declare function createAttemptTranslator(context: {
    stepOpen: boolean;
    step: number;
    turn: number;
    turnOpen: boolean;
    turnTime: number;
    toolResults: number;
    narrated: string | undefined;
    notificationTurnExpected: boolean;
    currentModel: string;
    attempt: OpenAttempt | undefined;
    compactRequested: boolean;
    readonly settledAttempts: Set<string>;
    now(): number;
    nextSeq(): number;
}): {
    closeStep: (out: AgentEvent[]) => void;
    openTurn: (out: AgentEvent[], origin: AgentEventOf<"turn.start">["origin"], userMessageId?: string) => void;
    settleAttempt: (out: AgentEvent[]) => void;
    ensureAttempt: (out: AgentEvent[], id: string, model: string | undefined, usage: UsageDelta | undefined) => OpenAttempt | undefined;
    delta: (open: OpenAttempt, value: AgentEventOf<"assistant.delta">["delta"], index: number) => AgentEvent;
    translateStream: (message: Rec) => AgentEvent[];
    translateResult: (message: Rec) => AgentEvent[];
    forceCloseTurn: (reason: TurnEndReason) => AgentEvent[];
};
//# sourceMappingURL=attempts.d.ts.map