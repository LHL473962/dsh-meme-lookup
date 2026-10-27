import { randomUUID } from 'node:crypto';
import { markChannelReadDirty } from '../../../adapter/channel/read-view.js';
import { writeActivityFrames } from '../../../activityPrefs.js';
import { isPresetName, normalizeActivityPreset } from '../../../components/activityFrames.js';
import { t } from '../../../i18n.js';
import { runForegroundShell } from '../../compat/shell.js';
import { LOCAL_OUTPUT_LIMIT, MAX_ROWS, preview } from '../transcript.js';
import { sessionWorkingDirectory } from '../../../channel/working-directory.js';
/** `/activity frames <name>`: validate, persist, re-render. */
export function setActivityFrames(state, notify, name) {
    // A retired preset id normalizes to the current default, so the
    // in-memory state, the persisted preference and the toast agree instead
    // of diverging until restart.
    const preset = normalizeActivityPreset(name) ?? name;
    if (!isPresetName(preset)) {
        notify(t('unknown-activity-preset', { name }), { color: 'error' });
        return false;
    }
    if (preset === state.activityFrames) {
        notify(t('activity-indicator-already', { name: preset }), { color: 'success' });
        return true;
    }
    if (!writeActivityFrames(preset)) {
        notify(t('activity-pref-write-failed'), { color: 'error' });
        return false;
    }
    state.activityFrames = preset;
    state.emit();
    notify(t('activity-indicator-switched', { name: preset }));
    return true;
}
/**
 * One report line that keeps its shape: blank rows stay blank and leading
 * indentation survives; a stray newline still cannot become a second row.
 */
function previewIndented(text, limit) {
    const line = text.replace(/[\r\n]+/gu, ' ').replace(/\s+$/u, '');
    // A truly empty Text node measures as zero height; one no-break space keeps
    // the blank row the report asked for without painting anything.
    if (line === '')
        return '\u00a0';
    return line.length <= limit ? line : `${line.slice(0, limit)}…`;
}
export function createCoreLocalActions(ctx, deps) {
    const { owner, binding, state, rowIds, notify } = deps;
    return {
        loadOlder() {
            const restore = deps.loadOlder();
            if (restore === undefined)
                return 0;
            const restored = restore();
            if (restored > 0)
                state.emit();
            return restored;
        },
        clear() {
            state.rows.length = 0;
            markChannelReadDirty(state.rows);
            rowIds.value = 0;
            deps.resetProjection();
            deps.dropRows();
            state.activeToolCount = 0;
            state.responseChars = 0;
            state.rows.push({ id: rowIds.value++, kind: 'notice', text: t('session-cleared') });
            state.emit();
        },
        pushLocal(title, lines, options) {
            // A report whose line IS the payload (the /goal objective) raises the
            // budget; every other report keeps the shared 240-cell preview.
            const limit = options?.lineLimit ?? LOCAL_OUTPUT_LIMIT;
            const render = options?.preserveWhitespace ? previewIndented : preview;
            // Local reports cannot be restored from backend history. Retain whole
            // recent blocks within the existing row budget, without folding facts.
            let count = state.rows.reduce((sum, row) => sum + Number(row.kind === 'local' || row.kind === 'local-output'), lines.length + 1);
            for (let i = 0; count > MAX_ROWS && i < state.rows.length;) {
                if (state.rows[i].kind !== 'local' && state.rows[i].kind !== 'local-output') {
                    i++;
                    continue;
                }
                let end = i + 1;
                while (state.rows[end]?.kind === 'local-output')
                    end++;
                count -= end - i;
                state.rows.splice(i, end - i);
                markChannelReadDirty(state.rows);
            }
            state.rows.push({ id: rowIds.value++, kind: 'local', text: title });
            for (const line of lines)
                state.rows.push({ id: rowIds.value++, kind: 'local-output', text: render(line, limit) });
            state.emit();
        },
        setActivityFrames: (name) => setActivityFrames(state, notify, name),
        /**
         * `!cmd` / `!!cmd`: the workspace's own command shell when it has one
         * (a remote workspace runs the command there), else the host shell;
         * `!!` sends the output on as a followup of the session it ran for.
         */
        async runLocalCommand(command, includeInContext) {
            // `!!` is an input from its first keystroke: `/new` must not adopt
            // over a command whose output is about to reach this session.
            const end = includeInContext ? deps.beginInput?.() : undefined;
            try {
                await runLocal(command, includeInContext);
            }
            finally {
                end?.();
            }
        },
    };
    async function runLocal(command, includeInContext) {
        const capture = binding.capture();
        const current = () => owner.current() && binding.isCurrent(capture);
        const cwd = sessionWorkingDirectory(state);
        const target = deps.workspace.describe(cwd);
        state.rows.push({ id: rowIds.value++, kind: 'local', text: command, executionTarget: target.kind === 'local' ? target.badge : `${target.badge} · ${target.label}` });
        state.emit();
        const executor = await deps.workspace.commandShell(cwd) ?? ctx.get('shell');
        if (!current())
            return;
        if (executor === undefined) {
            deps.unavailable('shell');
            return;
        }
        let output;
        try {
            const result = await runForegroundShell(executor, { command, workdir: cwd, timeoutMs: 30000 });
            output = result.stdout.text.trim() || result.stderr.text.trim() || (result.timedOut ? '(timed out)' : '(no output)');
        }
        catch (error) {
            output = error instanceof Error ? error.message : String(error);
        }
        if (!current())
            return;
        state.rows.push({ id: rowIds.value++, kind: 'local-output', text: preview(output, LOCAL_OUTPUT_LIMIT) });
        state.emit();
        if (includeInContext) {
            // This runs detached (`void runLocalCommand`): a session that closed
            // meanwhile (a backend process that exited) must not surface as an
            // unhandled rejection.
            try {
                await capture.session.submit({ text: `<bash-stdout>\n${output}\n</bash-stdout>`, clientMessageId: randomUUID() }, 'followup');
            }
            catch (error) {
                if (current())
                    notify(t('send-failed', { err: error instanceof Error ? error.message : String(error) }), { color: 'error', timeoutMs: 8000 });
            }
        }
    }
}
