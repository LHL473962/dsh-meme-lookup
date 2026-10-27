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
import { attachSessionProjection, createSessionProjectionStore } from './session-projection-store.js';
export const TEAM_PROJECTION_KEY = 'agentTeam';
/** The upstream bundle that mounts the team service and tools: the team-mode switch. */
export const TEAM_BUNDLE = '@deepseek-ai/dsh-experimental-agent-team-profile';
const PHASES = new Set(['provisioning', 'active', 'failed']);
const TASK_STATUSES = new Set(['pending', 'in_progress', 'completed']);
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isStringArray(value) {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}
function asMember(value) {
    if (!isRecord(value))
        return undefined;
    const { id, name, role, phase, error } = value;
    if (typeof id !== 'string' || typeof name !== 'string')
        return undefined;
    if (role !== 'lead' && role !== 'teammate')
        return undefined;
    if (typeof phase !== 'string' || !PHASES.has(phase))
        return undefined;
    return { id, name, role, phase: phase, ...typeof error === 'string' ? { error } : {} };
}
function asTask(value) {
    if (!isRecord(value))
        return undefined;
    const { id, revision, subject, description, status, blockedBy, writeScopes, ownerName, ready, writeScopeWarnings } = value;
    if (typeof id !== 'string' || typeof revision !== 'number' || typeof subject !== 'string' || typeof description !== 'string')
        return undefined;
    if (typeof status !== 'string' || !TASK_STATUSES.has(status))
        return undefined;
    if (!isStringArray(blockedBy) || !isStringArray(writeScopes) || !isStringArray(writeScopeWarnings) || typeof ready !== 'boolean')
        return undefined;
    return {
        id, revision, subject, description, status: status, blockedBy, writeScopes, ready, writeScopeWarnings,
        ...typeof ownerName === 'string' ? { ownerName } : {},
    };
}
/**
 * Narrow one `agentTeam` value into the view the UI renders. A session's
 * implicit team (the Lead alone, no task, no failure) is no team: every root
 * session publishes that baseline once the service is mounted.
 * @param value - Raw projection value.
 * @param leadSessionId - The session the value was published for.
 * @returns the team view, or `undefined` when there is nothing to show.
 */
export function asTeamView(value, leadSessionId) {
    if (!isRecord(value) || !Array.isArray(value.members) || !Array.isArray(value.tasks))
        return undefined;
    const members = value.members.map(asMember);
    const tasks = value.tasks.map(asTask);
    if (members.includes(undefined) || tasks.includes(undefined))
        return undefined;
    const failure = typeof value.failure === 'string' ? value.failure : undefined;
    const roster = members;
    const board = tasks;
    if (!roster.some(member => member.role === 'teammate') && board.length === 0 && failure === undefined)
        return undefined;
    return { leadSessionId, members: roster, tasks: board, ...failure === undefined ? {} : { failure } };
}
/**
 * The team a bound session belongs to is rooted at itself, or — for a
 * delegated child — at its parent: teammates are direct children of the Lead.
 * @param session - The bound session.
 * @param agents - Live agents, to find the Lead's session object for a baseline.
 * @returns the session whose `agentTeam` value to read.
 */
export function teamRootOf(session, agents) {
    const own = session;
    const parent = own.header?.origin === 'subagent' ? own.header.parentSession : undefined;
    if (typeof parent !== 'string')
        return { id: String(own.id), session };
    for (const agent of agents?.list() ?? []) {
        if (String(agent.session.id) === parent)
            return { id: parent, session: agent.session };
    }
    return { id: parent };
}
/**
 * The watched team as seen from `sessionId`: the Lead's own, or a listed
 * teammate's. Any other child of the Lead (a plain subagent, a workflow
 * spawn) is watched at the same parent but belongs to no team.
 * @param team - The watched session's team.
 * @param sessionId - The bound session.
 * @returns the team, or `undefined` when the session is not on it.
 */
export function teamFor(team, sessionId) {
    if (team === undefined || team.leadSessionId === sessionId)
        return team;
    return team.members.some(member => member.role === 'teammate' && member.id === sessionId) ? team : undefined;
}
/**
 * Create the composition root's team store and wire it to the host.
 * @param ctx - Host context of the composition root.
 * @returns the store the channel reads from.
 */
export function createTeamRosterStore(ctx) {
    const store = createSessionProjectionStore({
        key: TEAM_PROJECTION_KEY,
        // A team bundle switched off at run time takes the service down before
        // (or while) its projection definition leaves: no service, no team.
        narrow: (value, leadSessionId) => (ctx.get('agentTeams', false) === undefined ? undefined : asTeamView(value, leadSessionId)),
        watch: session => teamRootOf(session, ctx.get('agents')),
        warn: message => { ctx.logger.warn(message); },
    });
    attachSessionProjection(ctx, TEAM_PROJECTION_KEY, store);
    // The plugin manager announces every profile write it applied (`/team`,
    // `/plugin`, the Web UI). Unregistering a projection emits nothing on the
    // change feed, so the bound session is read again: an unmounted team clears
    // the view, a remounted one comes back from the Lead's log.
    ctx.on('plugin-manager/changed', () => { store.reseed(); });
    // Not every service change is announced there (an HMR-applied CLI or hand
    // edit, a late or recovered activation), and the narrow reads the service:
    // follow it directly. A service that comes back before its projection
    // definition reads absent here; the manager event above reads it again.
    ctx.on('internal/service', ((name) => {
        if (name === 'agentTeams')
            store.reseed();
    }));
    return Object.assign(store, {
        teamOf: (sessionId) => (store.boundId === sessionId ? teamFor(store.read(), sessionId) : undefined),
    });
}
