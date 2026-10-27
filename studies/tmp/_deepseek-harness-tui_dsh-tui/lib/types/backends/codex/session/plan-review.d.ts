/** Client-side Plan implementation confirmation (official Codex TUI flow). */
import type { QuestionAnswers } from '../../../agent/capabilities.js';
import type { AgentEvent } from '../../../agent/events.js';
import { PLAN_IMPLEMENTATION_PROMPT } from './prompts.js';
interface PlanReviewDeps {
    emit(events: readonly AgentEvent[]): void;
    implement(): Promise<void>;
    clearContext(plan: string): Promise<void>;
    followup(text: string): Promise<void>;
}
export declare function createPlanReview(deps: PlanReviewDeps): {
    offer(turnId: string, plan: string): void;
    owns(id: string): boolean;
    respond(id: string, answers: QuestionAnswers): void;
    cancel(id: string): void;
    withdraw: () => void;
};
export { PLAN_IMPLEMENTATION_PROMPT };
//# sourceMappingURL=plan-review.d.ts.map