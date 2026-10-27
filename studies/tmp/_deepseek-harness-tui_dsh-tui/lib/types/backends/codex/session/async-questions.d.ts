import type { QuestionAnswers } from '../../../agent/capabilities.js';
import type { AgentEvent } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { InputQueue } from './input.js';
interface AsyncQuestionDeps {
    readonly input: InputQueue;
    emit(events: readonly AgentEvent[]): void;
}
export declare function createAsyncQuestions(deps: AsyncQuestionDeps): {
    notification(method: string, params: Rec): void;
    owns(requestId: string): boolean;
    respond(requestId: string, answers: QuestionAnswers): void;
    cancel: (requestId: string) => void;
    withdraw: () => void;
};
export {};
//# sourceMappingURL=async-questions.d.ts.map