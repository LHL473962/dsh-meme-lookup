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
import { agentRelaySourceOf } from '../agent/messages.js';
import { legacySendMessageStatus } from './compat/agent-team-0.2.0.js';
const DISPLAY_KEYS = {
    send_message: 'tool-name-team-message',
    list_agents: 'tool-name-team-roster',
    wait_agent: 'tool-name-team-wait',
    interrupt_agent: 'tool-name-team-interrupt',
    team_task_create: 'tool-name-team-task',
    team_task_list: 'tool-name-team-task',
    team_task_get: 'tool-name-team-task',
    team_task_update: 'tool-name-team-task',
};
/** The team's own delegation tool; its presence is what "team on" means to a request. */
export const TEAM_SPAWN_TOOL = 'spawn_teammate';
/** Whether `name` is a team tool with a compact card here (not `spawn_teammate`). */
export function isTeamToolName(name) {
    return DISPLAY_KEYS[name] !== undefined;
}
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function str(value) {
    return typeof value === 'string' && value !== '' ? value : undefined;
}
function firstLine(text) {
    return text.split('\n', 1)[0].trim();
}
function callTitle(name, args) {
    switch (name) {
        case 'send_message': {
            const target = str(args.target);
            if (target === undefined)
                return undefined;
            const message = str(args.message);
            return message === undefined ? `→ ${target}` : `→ ${target} · ${firstLine(message)}`;
        }
        // `list_agents` / `wait_agent` calls carry nothing that tells them from the
        // legacy subagent controls of the same names; only their results do.
        case 'interrupt_agent':
            return str(args.target);
        case 'team_task_create':
            return str(args.subject);
        case 'team_task_list':
            return ['status', 'owner', 'ready'].flatMap(key => (args[key] === undefined ? [] : [`${key}=${String(args[key])}`])).join(' ') || undefined;
        case 'team_task_get':
            return str(args.task_id);
        case 'team_task_update': {
            const id = str(args.task_id);
            const action = str(args.action);
            if (id === undefined || action === undefined)
                return undefined;
            const owner = str(args.owner);
            return owner === undefined ? `${id} ${action}` : `${id} ${action} → ${owner}`;
        }
        default:
            return undefined;
    }
}
/**
 * Call card for a team tool without its own presenter.
 * @param name - Tool name.
 * @param rawArgs - The call's JSON arguments.
 * @returns the card, or `undefined` when this is not a team tool call it knows.
 */
export function teamToolCallView(name, rawArgs) {
    const displayKey = DISPLAY_KEYS[name];
    if (displayKey === undefined)
        return undefined;
    const title = titleOf(name, rawArgs);
    return title === undefined ? undefined : { card: 'generic', title, displayKey, category: 'other' };
}
function titleOf(name, rawArgs) {
    let args;
    try {
        args = JSON.parse(rawArgs);
    }
    catch {
        return undefined;
    }
    return isRecord(args) ? callTitle(name, args) : undefined;
}
function taskLine(task) {
    const id = str(task.id);
    const status = str(task.status);
    if (id === undefined || status === undefined || typeof task.revision !== 'number')
        return undefined;
    const owner = str(task.ownerName);
    return `${id} r${task.revision} · ${status}${owner === undefined ? '' : ` · ${owner}`}`;
}
function resultLine(name, value) {
    switch (name) {
        case 'send_message':
            if (!isRecord(value))
                return undefined;
            if (value.sent === true)
                return 'sent';
            // compat(dsh 0.2.0, log): the mailbox status a 0.2.0 send answered.
            return legacySendMessageStatus(value);
        case 'list_agents': {
            if (!Array.isArray(value))
                return undefined;
            const members = value.flatMap(member => (isRecord(member) && str(member.target) !== undefined && str(member.status) !== undefined
                ? [`${String(member.target)} ${String(member.status)}`]
                : []));
            return members.length === value.length ? members.join(' · ') : undefined;
        }
        case 'wait_agent':
            if (!isRecord(value) || typeof value.timedOut !== 'boolean')
                return undefined;
            if (value.noProgress)
                return 'noProgress';
            return value.timedOut ? 'timedOut' : 'changed';
        case 'interrupt_agent':
            return isRecord(value) ? str(value.previousStatus) : undefined;
        case 'team_task_list': {
            if (!isRecord(value) || !Array.isArray(value.tasks))
                return undefined;
            const tasks = value.tasks.map(task => (isRecord(task) ? taskLine(task) : undefined));
            if (tasks.includes(undefined))
                return undefined;
            return tasks.join('\n');
        }
        case 'team_task_create':
        case 'team_task_get':
        case 'team_task_update':
            return isRecord(value) ? taskLine(value) : undefined;
        default:
            return undefined;
    }
}
/**
 * Result card for a team tool without its own presenter. It replaces the
 * call card, so it carries the call's title too.
 * @param name - Tool name.
 * @param rawArgs - The call's JSON arguments.
 * @param text - The result's text content.
 * @returns the card, or `undefined` for anything but a known result record.
 */
export function teamToolResultView(name, rawArgs, text) {
    const displayKey = DISPLAY_KEYS[name];
    if (displayKey === undefined || !text.startsWith('{') && !text.startsWith('['))
        return undefined;
    let value;
    try {
        value = JSON.parse(text);
    }
    catch {
        return undefined;
    }
    const line = resultLine(name, value);
    if (line === undefined)
        return undefined;
    const title = titleOf(name, rawArgs);
    return {
        card: 'generic', displayKey, category: 'other',
        ...title === undefined || title === '' ? {} : { title },
        content: line === '' ? [] : line.split('\n').map(text => ({ type: 'text', text })),
    };
}
/** Relay framing: one whole leading block, `Team message from <name>:`. */
const RELAY_FRAMING = /^Team message from ([^\n]+):$/;
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
export function teamMessageOf(source, content) {
    const first = content[0];
    const framing = agentRelaySourceOf(source) !== undefined && first?.type === 'text' && typeof first.text === 'string'
        ? RELAY_FRAMING.exec(first.text)
        : null;
    if (framing === null)
        return undefined;
    const sender = framing[1];
    const blocks = content.slice(1);
    const text = blocks
        .flatMap(block => {
        const value = block.text;
        return block.type === 'text' && typeof value === 'string' ? [value] : [];
    })
        .join('\n')
        .trim();
    return { sender, blocks, text };
}
