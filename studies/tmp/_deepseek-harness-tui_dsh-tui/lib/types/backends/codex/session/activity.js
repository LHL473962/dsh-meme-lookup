import { codexLocale, codexText } from '../text.js';
import { arr, rec, str } from '../narrow.js';
import { NOTIFY } from '../protocol/index.js';
import { commandTitle, unwrapCommand } from '../translate/commands.js';
export function createCodexActivity(deps) {
    const listeners = new Set();
    let view = { phase: 'idle', line: '', live: false, toolCount: 0, phaseStartedAt: 0, turnStartedAt: 0, updatedAt: 0, lang: codexLocale() };
    let active = false;
    let blocked = false;
    let waiting;
    let stalled;
    let closed = false;
    const set = (phase, line) => {
        if (closed || (view.phase === phase && view.line === line && view.lang === codexLocale()))
            return;
        const now = deps.now();
        view = { ...view, phase, line, phaseStartedAt: phase === view.phase ? view.phaseStartedAt : now, updatedAt: now, lang: codexLocale() };
        for (const listener of listeners)
            listener(view);
    };
    const clearWait = () => {
        if (waiting !== undefined)
            deps.clock.clearTimeout(waiting);
        if (stalled !== undefined)
            deps.clock.clearTimeout(stalled);
        waiting = undefined;
        stalled = undefined;
    };
    const wait = () => {
        clearWait();
        if (!active || blocked || view.phase === 'tool')
            return;
        waiting = deps.clock.setTimeout(() => set('waiting', codexText('codex-model-waiting')), 30_000);
        stalled = deps.clock.setTimeout(() => deps.emit([{ type: 'notice', level: 'warning', key: 'codex-model-stalled', text: codexText('codex-model-stalled') }]), 120_000);
    };
    return {
        capability: { subscribe(listener) { listeners.add(listener); listener(view); return () => { listeners.delete(listener); }; } },
        notification(method, params) {
            if (closed)
                return;
            const now = deps.now();
            if (method === NOTIFY.turnStarted) {
                active = true;
                blocked = false;
                view = { ...view, toolCount: 0, turnStartedAt: now };
                set('waiting', codexText('codex-working-thinking'));
            }
            else if (method === NOTIFY.turnCompleted) {
                active = false;
                blocked = false;
                set('idle', '');
            }
            else if (method === NOTIFY.threadStatusChanged) {
                const status = rec(params.status);
                const flags = arr(status?.activeFlags);
                blocked = flags.includes('waitingOnApproval') || flags.includes('waitingOnUserInput');
                if (str(status?.type) === 'idle') {
                    active = false;
                    set('idle', '');
                }
            }
            else if (method === NOTIFY.itemStarted) {
                const item = rec(params.item);
                switch (str(item?.type)) {
                    case 'commandExecution':
                        set('tool', codexText('codex-working-command', { command: commandTitle(unwrapCommand(str(item?.command) ?? '', item?.commandActions)) }));
                        break;
                    case 'fileChange':
                        set('tool', codexText('codex-working-files', { files: arr(item?.changes).map(raw => str(rec(raw)?.path) ?? '').join(', ') }));
                        break;
                    case 'collabAgentToolCall':
                        set('tool', codexText('codex-working-subagents'));
                        break;
                    case 'mcpToolCall':
                        set('tool', `${str(item?.server) ?? 'MCP'}.${str(item?.tool) ?? ''}`);
                        break;
                    case 'webSearch':
                        set('tool', str(item?.query) ?? '');
                        break;
                    case 'agentMessage':
                    case 'reasoning':
                    case 'plan':
                        set('thinking', codexText('codex-working-thinking'));
                        break;
                }
            }
            else if (method === NOTIFY.itemCompleted) {
                const item = rec(params.item);
                // A completed commentary settles into the transcript as an assistant
                // message (translate §7.3): the working line must NOT keep narrating
                // its text — the same sentence would show twice at once, once under
                // the ⏵ spinner and once as the reply's first message. Claude's
                // narrated line differs there: it is a `⏵` line STRIPPED from the
                // transcript, so its working line never duplicates anything.
                if (str(item?.type) === 'agentMessage' && str(item?.phase) === 'commentary') {
                    set('thinking', codexText('codex-working-thinking'));
                }
                else if (['commandExecution', 'fileChange', 'mcpToolCall', 'collabAgentToolCall', 'webSearch'].includes(str(item?.type) ?? '')) {
                    view = { ...view, toolCount: view.toolCount + 1 };
                    set('thinking', codexText('codex-working-thinking'));
                }
            }
            wait();
        },
        reset() { active = false; blocked = false; clearWait(); set('idle', ''); },
        close() { active = false; clearWait(); set('idle', ''); closed = true; listeners.clear(); },
    };
}
