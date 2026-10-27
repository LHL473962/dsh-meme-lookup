/**
 * Claude tool presentations: which
 * card shape each Claude Code tool call and result renders as, in the
 * backend-neutral `ToolPresentation` vocabulary the shared projector and the
 * tool card already understand. The UI never picks a card by tool name; this
 * table does, from the tool input and the structured `tool_use_result`.
 *
 * Every reader narrows `unknown`: inputs come from the model and structured
 * results are undeclared in the SDK types. A shape this
 * module does not recognise degrades to the plain text card.
 */
import { displayPath } from '../shared/display-path.js';
import type { ToolCallPresentation, ToolResultPresentation } from '../../agent/presentation.js';
/** How a tool call is projected besides (or instead of) a card. */
export type ClaudeToolRole = 
/** An ordinary tool card. */
'card'
/** `Agent`/`Task`: a subagent delegation (subagent row, never a card). */
 | 'subagent'
/** `AskUserQuestion`: the questionnaire surface. */
 | 'question'
/** `TodoWrite` and the task family that replaced it (CLI 2.1.284:
 *  `TaskCreate`/`TaskUpdate`/`TaskList`/`TaskGet`): the todo panel, never
 *  a card — the translator emits `todo.write` snapshots for them. Not the
 *  `Task` subagent delegation nor `TaskStop` (a background task). */
 | 'todo'
/** `EnterPlanMode` / `ExitPlanMode`: the mode and the plan-review panel,
 *  never a card (the translator emits no call for them). */
 | 'plan';
/** The role of a tool call (cards are the default). */
export declare function claudeToolRole(name: string): ClaudeToolRole;
export { displayPath };
/** How a call renders while it runs. */
export declare function presentClaudeToolCall(name: string, rawInput: unknown, cwd: string): ToolCallPresentation | undefined;
/** The settled facts of one tool result. */
export interface ClaudeToolOutcome {
    readonly isError: boolean;
    /** The result's text blocks joined. */
    readonly text: string;
    /** `tool_use_result` (undeclared, per-tool). */
    readonly structured: unknown;
}
/** How a settled result renders (undefined = the plain text card). */
export declare function presentClaudeToolResult(name: string, rawInput: unknown, outcome: ClaudeToolOutcome, cwd: string): ToolResultPresentation | undefined;
//# sourceMappingURL=tools.d.ts.map