/**
 * Compact cards for DSH's experimental Agent Teams tools. Their results are
 * compact JSON records and the tools ship no presenters, so the plain card
 * would show a capitalised tool id and a raw `⎿ {"messageId":…}` line. These
 * views fold known shapes into one line; anything else (an error text, a
 * changed upstream shape) falls back to the plain card. A presenter the tool
 * itself registers always wins: these run only when it has none.
 * `spawn_teammate` is not here — it renders as the subagent row, and as a
 * plain card only when it fails before the teammate exists (translate.ts).
 *
 * Three names are shared with the legacy subagent controls, which also ship
 * no presenters: a team call is told apart by its `target` argument (the
 * legacy ones take `agent_id`), a team result by its record shape.
 *
 * {@link teamMessageOf} reads a delivered team message for the transcript
 * translator.
 *
 * @module
 */
import type { ToolCallView, ToolResultView } from './channel/types.js';
/** The team's own delegation tool; its presence is what "team on" means to a request. */
export declare const TEAM_SPAWN_TOOL = "spawn_teammate";
/** Whether `name` is a team tool with a compact card here (not `spawn_teammate`). */
export declare function isTeamToolName(name: string): boolean;
/**
 * Call card for a team tool without its own presenter.
 * @param name - Tool name.
 * @param rawArgs - The call's JSON arguments.
 * @returns the card, or `undefined` when this is not a team tool call it knows.
 */
export declare function teamToolCallView(name: string, rawArgs: string): ToolCallView | undefined;
/**
 * Result card for a team tool without its own presenter. It replaces the
 * call card, so it carries the call's title too.
 * @param name - Tool name.
 * @param rawArgs - The call's JSON arguments.
 * @param text - The result's text content.
 * @returns the card, or `undefined` for anything but a known result record.
 */
export declare function teamToolResultView(name: string, rawArgs: string, text: string): ToolResultView | undefined;
/**
 * An Agent Teams message delivered to a session (`user/message`): the
 * generic relay (`agent-message` / `relay`) whose first block is exactly
 * `Team message from <name>:`. A relay is any agent's message (the legacy
 * `send_message` writes one too), so only the team's framing block marks it
 * as a team message; the sender label replaces that block. The relay also
 * reaches the agent-message feed, which owns it on a teammate's own pages;
 * this reading is for the receiving transcript. A 0.2.0 log is read through
 * `compat/agent-team-0.2.0.ts` first.
 */
export declare function teamMessageOf<B extends {
    readonly type: string;
}>(source: unknown, content: readonly B[]): {
    sender: string;
    blocks: readonly B[];
    text: string;
} | undefined;
//# sourceMappingURL=team-tools.d.ts.map