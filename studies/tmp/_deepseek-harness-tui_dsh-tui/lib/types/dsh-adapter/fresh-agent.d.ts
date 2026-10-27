import { Context } from '@deepseek-ai/cordis';
import type { AgentHandle, CreateAgentOptions } from '@deepseek-ai/dsh-agent';
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session';
type AgentCreator = {
    create(options: CreateAgentOptions): Promise<AgentHandle>;
};
/** Policy facts held in memory until the session has further activity. */
export declare const INITIAL_POLICY_EVENTS: ReadonlySet<string>;
/** Source-less legacy messages and explicit user messages count as human input. */
export declare function isHumanSource(source: unknown): boolean;
/** Policy commands also emit command envelopes and nonhuman inbox notices. */
export declare function isPolicyPlaneActivity(event: SessionEvent): boolean;
/** Initialization-only fresh session with no persistence requested yet. */
export declare function isUnstoredFreshSession(session: Session | undefined): boolean;
/**
 * Startup and `/new` use an unseeded DSH session. Permission initialization
 * alone must not publish a stored conversation; all facts still belong to
 * the real Session, and the official JSONL writer owns their eventual storage.
 */
export declare function createFreshAgent(ctx: Context, agents: AgentCreator, options: CreateAgentOptions): Promise<AgentHandle>;
export {};
//# sourceMappingURL=fresh-agent.d.ts.map