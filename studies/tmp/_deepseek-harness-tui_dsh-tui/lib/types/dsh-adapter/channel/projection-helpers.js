/** Names the subagent delegation tools ship under (preset `toolName` values
 *  plus the CLI default); each renders as a live subagent card, never a plain
 *  tool card. */
const SUBAGENT_TOOL_NAMES = new Set([
    'task',
    'subagent',
    'subagent_fork',
    'subagent_claude_code',
    'subagent_codex',
    'spawn_task',
    // Agent Teams: a teammate is a continuable child of the Lead.
    'spawn_teammate',
]);
export function isSubagentToolName(name) {
    return SUBAGENT_TOOL_NAMES.has(name.toLowerCase());
}
/** Extract `job_id` from a job_output call's raw args (JSON), or undefined. */
export function parseJobOutputId(argsFull) {
    if (argsFull === undefined || argsFull === '')
        return undefined;
    try {
        const args = JSON.parse(argsFull);
        return typeof args.job_id === 'string' && args.job_id !== '' ? args.job_id : undefined;
    }
    catch {
        return undefined;
    }
}
/** Extract the command that launched a background job from its tool args
 *  (`command` for the shell tools, `text` for terminal_send). The registry
 *  label is the friendly description; the command is the actual invocation. */
export function toolCommandOf(argsFull) {
    if (argsFull === undefined || argsFull === '')
        return undefined;
    try {
        const args = JSON.parse(argsFull);
        const candidate = typeof args.command === 'string' && args.command !== ''
            ? args.command
            : typeof args.text === 'string' && args.text !== ''
                ? args.text
                : undefined;
        return candidate;
    }
    catch {
        return undefined;
    }
}
/** The ack a shell tool returns for `run_in_background: true`. */
export const BACKGROUND_START_ACK = /^started background job (\S+)/;
/** Narrow an optional plugin event without importing its module augmentation. */
export function todoPanelItems(data) {
    if (typeof data !== 'object' || data === null)
        return undefined;
    const todos = data.todos;
    if (!Array.isArray(todos))
        return undefined;
    const valid = todos.every(item => {
        if (typeof item !== 'object' || item === null)
            return false;
        const candidate = item;
        return typeof candidate.content === 'string' &&
            (candidate.status === 'pending' || candidate.status === 'in_progress' || candidate.status === 'completed');
    });
    return valid ? todos : undefined;
}
