import { claudeLocale, claudeText } from './text.js';
/** Input fields that read like the DSH detail fragment, in priority order. */
const DETAIL_KEYS = ['file_path', 'command', 'pattern', 'url', 'path'];
/** The longest detail fragment kept (mirrors the plugin's detail limit). */
const DETAIL_CHARS = 60;
/**
 * The input's most DSH-like short field: the first string among
 * file_path / command / pattern / url / path, clipped. Undefined when the
 * input names none of them.
 */
export function activityDetail(input) {
    const record = typeof input === 'object' && input !== null && !Array.isArray(input) ? input : undefined;
    if (record === undefined)
        return undefined;
    for (const key of DETAIL_KEYS) {
        const value = record[key];
        if (typeof value !== 'string' || value === '')
            continue;
        const flat = value.replace(/[\t\r\n]+/gu, ' ').trim();
        if (flat === '')
            continue;
        return flat.length <= DETAIL_CHARS ? flat : flat.slice(0, DETAIL_CHARS) + '…';
    }
    return undefined;
}
/** Create one session's publisher. `now` defaults to the wall clock. */
export function createClaudeActivityPublisher(options = {}) {
    const now = options.now ?? Date.now;
    const listeners = new Set();
    let current;
    const view = (phase, line, extra) => ({
        phase,
        line,
        live: false,
        ...(extra.label === undefined ? {} : { label: extra.label }),
        ...(extra.detail === undefined ? {} : { detail: extra.detail }),
        ...(extra.phrase === undefined ? {} : { phrase: extra.phrase }),
        toolCount: extra.toolCount,
        phaseStartedAt: 0,
        turnStartedAt: 0,
        updatedAt: 0,
        lang: claudeLocale(),
    });
    return {
        fold(state, waiting) {
            let next;
            if (state.turnOpen) {
                const openTool = state.openTool;
                const detail = openTool === undefined ? undefined : activityDetail(openTool.input);
                if (waiting) {
                    next = view('waiting', claudeText('claude-activity-waiting'), {
                        ...(openTool === undefined ? {} : { label: openTool.name, ...(detail === undefined ? {} : { detail }) }),
                        toolCount: state.toolCount,
                    });
                }
                else if (openTool !== undefined) {
                    next = view('tool', detail === undefined ? openTool.name : openTool.name + ' ' + detail, {
                        label: openTool.name,
                        ...(detail === undefined ? {} : { detail }),
                        toolCount: state.toolCount,
                    });
                }
                else {
                    const phrase = state.narration ?? state.activeForm;
                    next = view('thinking', phrase ?? claudeText('claude-activity-thinking'), {
                        ...(phrase === undefined ? {} : { phrase }),
                        toolCount: state.toolCount,
                    });
                }
            }
            else if (current !== undefined) {
                // The turn closed: park on the done card (kept until the next turn,
                // like the plugin — the status line shows it while the session idles).
                next = view('done', state.toolCount > 0 ? claudeText('claude-activity-done-tools', { count: state.toolCount }) : claudeText('claude-activity-done'), { toolCount: state.toolCount });
            }
            if (next === undefined)
                return undefined;
            if (current !== undefined && current.phase === next.phase && current.line === next.line) {
                // No visible change: a toolCount-only drift rides the next real one.
                return undefined;
            }
            current = {
                ...next,
                phaseStartedAt: current !== undefined && current.phase === next.phase ? current.phaseStartedAt : now(),
                turnStartedAt: state.turnStartedAt,
                updatedAt: now(),
            };
            for (const listener of [...listeners])
                listener(current);
            return current;
        },
        last() {
            return current;
        },
        subscribe(listener) {
            listeners.add(listener);
            const last = current;
            if (last !== undefined)
                listener(last);
            return () => { listeners.delete(listener); };
        },
    };
}
