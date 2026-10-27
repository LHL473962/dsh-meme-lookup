/**
 * Read side of DSH's experimental Agent Teams: the Lead session's `agentTeam`
 * projection (roster + non-deleted task board), folded for the session on
 * screen. Inside a teammate it reads the Lead's value, found through the
 * teammate header's `parentSession` (another child of the Lead reads none).
 *
 * The wire value is narrowed locally (`@deepseek-ai/dsh-experimental-agent-team`
 * is never imported); a composition without the team service never publishes
 * the key and the store stays empty.
 *
 * @module
 */
import type { Context } from '@deepseek-ai/cordis';
import type { TeamView } from '../adapter/ports/channel-view.js';
import { type SessionProjectionStore, type WatchedSession } from './session-projection-store.js';
export declare const TEAM_PROJECTION_KEY = "agentTeam";
/** The upstream bundle that mounts the team service and tools: the team-mode switch. */
export declare const TEAM_BUNDLE = "@deepseek-ai/dsh-experimental-agent-team-profile";
/** What the channel reads: the team of one session, if any. */
export interface TeamSource {
    /** The team of `sessionId` — `undefined` unless it is the session last
     *  seeded (a non-DSH session never seeds, so it never reads a stale team). */
    teamOf(sessionId: string): TeamView | undefined;
    subscribe(listener: () => void): () => void;
}
export type TeamRosterStore = SessionProjectionStore<TeamView> & TeamSource;
/**
 * Narrow one `agentTeam` value into the view the UI renders. A session's
 * implicit team (the Lead alone, no task, no failure) is no team: every root
 * session publishes that baseline once the service is mounted.
 * @param value - Raw projection value.
 * @param leadSessionId - The session the value was published for.
 * @returns the team view, or `undefined` when there is nothing to show.
 */
export declare function asTeamView(value: unknown, leadSessionId: string): TeamView | undefined;
interface AgentsLike {
    list(): Iterable<{
        readonly session: {
            readonly id: unknown;
        };
    }>;
}
/**
 * The team a bound session belongs to is rooted at itself, or — for a
 * delegated child — at its parent: teammates are direct children of the Lead.
 * @param session - The bound session.
 * @param agents - Live agents, to find the Lead's session object for a baseline.
 * @returns the session whose `agentTeam` value to read.
 */
export declare function teamRootOf(session: unknown, agents: AgentsLike | undefined): WatchedSession;
/**
 * The watched team as seen from `sessionId`: the Lead's own, or a listed
 * teammate's. Any other child of the Lead (a plain subagent, a workflow
 * spawn) is watched at the same parent but belongs to no team.
 * @param team - The watched session's team.
 * @param sessionId - The bound session.
 * @returns the team, or `undefined` when the session is not on it.
 */
export declare function teamFor(team: TeamView | undefined, sessionId: string): TeamView | undefined;
/**
 * Create the composition root's team store and wire it to the host.
 * @param ctx - Host context of the composition root.
 * @returns the store the channel reads from.
 */
export declare function createTeamRosterStore(ctx: Context): TeamRosterStore;
export {};
//# sourceMappingURL=team-roster.d.ts.map