import { createElicitationForm, createElicitationUrlAsk, elicitationNotices, parseFieldText as parseField } from '../shared/elicitation.js';
import { claudeElicitationText, claudeText } from './text.js';
import { errorText, rec, str } from './narrow.js';
/** The dialog kinds this client renders (`supportedDialogKinds`). */
export const SUPPORTED_DIALOG_KINDS = ['refusal_fallback_prompt'];
// The form schema rules are the shared, backend-neutral ones
// (`src/backends/shared/elicitation.ts`); re-exported for this backend's
// callers, with this backend's copy bound in. A flow freezes its labels when
// it opens (answers are matched against the strings the panel showed);
// `parseFieldText` only builds a re-ask reason, so it reads the live language.
export { formFields, serverHeader } from '../shared/elicitation.js';
export const parseFieldText = (field, text) => parseField(field, text, claudeElicitationText());
/** The elicitation notices in the language showing now: a notice is a
 *  one-shot line, so it follows a `/lang` switch (the questions of a flow do
 *  not — see above). */
const notices = () => elicitationNotices(claudeElicitationText());
/** Create the bridge for one session. */
export function createClaudeDialogBridge(deps) {
    /** By the ask id currently shown. */
    const byAsk = new Map();
    /** By the SDK request id. */
    const byFlow = new Map();
    const changed = () => {
        try {
            deps.onPendingChange?.(byFlow.size);
        }
        catch (error) {
            deps.debug(`claude: dialog pending-change listener failed (${errorText(error)})`);
        }
    };
    /** Show (or re-show) a flow's ask. */
    const show = (entry, askId, questions) => {
        byAsk.delete(entry.askId);
        entry.askId = askId;
        byAsk.set(askId, entry);
        deps.emit([{ type: 'question.request', request: { requestId: askId, questions } }]);
    };
    /** Close a flow's panel and forget it (once). */
    const close = (entry) => {
        if (byFlow.get(entry.flow) !== entry)
            return false;
        byFlow.delete(entry.flow);
        byAsk.delete(entry.askId);
        deps.emit([{ type: 'question.settled', requestId: entry.askId }]);
        changed();
        return true;
    };
    /** Park a flow: its first ask, its abort wiring, its settlement. */
    const park = (flow, signal, resolve, build) => {
        let settled = false;
        let round = 0;
        let entry;
        const resolvers = [resolve];
        const signals = [signal];
        const onAbort = () => { entry?.withdraw(); };
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            for (const each of signals.splice(0))
                each.removeEventListener('abort', onAbort);
            if (entry !== undefined)
                close(entry);
            for (const each of resolvers.splice(0))
                each(result);
        };
        const reask = (questions) => {
            if (settled || entry === undefined)
                return;
            round += 1;
            // The old ask closes; the new one carries its own id.
            deps.emit([{ type: 'question.settled', requestId: entry.askId }]);
            show(entry, `${flow}~${round}`, questions);
        };
        const built = build(finish, reask);
        entry = {
            flow,
            askId: flow,
            kind: built.kind,
            answer: built.answer,
            dismiss: built.dismiss,
            withdraw: () => finish(built.cancelled),
            join: (more, moreSignal) => {
                resolvers.push(more);
                if (moreSignal.aborted) {
                    finish(built.cancelled);
                    return;
                }
                signals.push(moreSignal);
                moreSignal.addEventListener('abort', onAbort, { once: true });
            },
            ...(built.url === undefined ? {} : { url: built.url }),
            ...(built.complete === undefined ? {} : { complete: built.complete }),
        };
        byFlow.set(flow, entry);
        byAsk.set(flow, entry);
        signal.addEventListener('abort', onAbort, { once: true });
        deps.emit([{ type: 'question.request', request: { requestId: flow, questions: built.questions } }]);
        changed();
    };
    /** A form elicitation: its fields, then send / decline (the shared
     *  form flow decides every round; this bridge only parks and answers). */
    const form = (request, flow, signal, resolve) => {
        const ask = createElicitationForm(request, claudeElicitationText());
        park(flow, signal, resolve, (finish, reask) => ({
            kind: 'form',
            questions: ask.questions,
            cancelled: { action: 'cancel' },
            answer: answers => {
                const step = ask.answer(answers);
                if (step.kind === 'reask')
                    reask(step.questions);
                else if (step.kind === 'decline')
                    finish({ action: 'decline' });
                else
                    finish({ action: 'accept', content: { ...step.content } });
            },
            dismiss: () => finish({ action: 'cancel' }),
        }));
    };
    /** A URL elicitation: the notice, then accept / decline with the link. */
    const url = (request, flow, signal, resolve) => {
        const ask = createElicitationUrlAsk(request, claudeElicitationText());
        if (ask === undefined) {
            deps.emit([{ type: 'notice', level: 'warning', key: `elicit:${flow}`, text: notices().urlMissing(request.serverName) }]);
            resolve({ action: 'decline' });
            return;
        }
        deps.emit([{ type: 'notice', level: 'info', key: `elicit-url:${request.elicitationId ?? flow}`, text: notices().urlOpen(request.serverName, request.url) }]);
        park(flow, signal, resolve, finish => ({
            kind: 'url',
            url: { server: request.serverName, ...(request.elicitationId === undefined ? {} : { elicitationId: request.elicitationId }) },
            questions: ask.questions,
            cancelled: { action: 'cancel' },
            answer: answers => finish({ action: ask.accepted(answers) ? 'accept' : 'decline' }),
            dismiss: () => finish({ action: 'cancel' }),
            complete: () => finish({ action: 'accept' }),
        }));
    };
    const onElicitation = (request, options) => new Promise(resolve => {
        try {
            const flow = `elicit-${options.requestId}`;
            if (deps.closing()) {
                resolve({ action: 'cancel' });
                return;
            }
            const previous = byFlow.get(flow);
            if (previous !== undefined) {
                // A redelivered request (a transport gap) waits for the same answer.
                previous.join(resolve, options.signal);
                return;
            }
            if (options.signal.aborted) {
                resolve({ action: 'cancel' });
                return;
            }
            const mode = request.mode ?? 'form';
            if (mode === 'form')
                form(request, flow, options.signal, resolve);
            else if (mode === 'url')
                url(request, flow, options.signal, resolve);
            else {
                deps.emit([{ type: 'notice', level: 'warning', key: `elicit:${flow}`, text: notices().unsupported(request.serverName, String(mode)) }]);
                resolve({ action: 'decline' });
            }
        }
        catch (error) {
            deps.debug(`claude: elicitation failed (${errorText(error)})`);
            resolve({ action: 'decline' });
        }
    });
    /** The refusal-fallback dialog: retry on the fallback model, or cancel. */
    const refusalFallback = (request, flow, signal, resolve) => {
        const payload = rec(request.payload);
        const fallback = str(payload?.fallbackModel);
        const original = str(payload?.originalModel);
        if (fallback === undefined || fallback === '') {
            resolve({ behavior: 'cancelled' });
            return;
        }
        const retry = claudeText('claude-refusal-retry', { model: fallback });
        const cancel = claudeText('claude-refusal-cancel');
        const category = str(payload?.apiRefusalCategory);
        const detail = [
            str(payload?.guidanceText)?.trim(),
            category === undefined || category === '' ? undefined : claudeText('claude-refusal-category', { category }),
        ].filter((line) => line !== undefined && line !== '').join('\n');
        park(flow, signal, resolve, finish => ({
            kind: 'dialog',
            questions: [{
                    question: claudeText('claude-refusal-question', { model: original ?? claudeText('claude-refusal-this-model') }),
                    header: claudeText('claude-refusal-header'),
                    ...(detail === '' ? {} : { detail }),
                    options: [{ label: retry, description: claudeText('claude-refusal-retry-desc') }, { label: cancel, description: claudeText('claude-refusal-cancel-desc') }],
                    hideCustomInput: true,
                }],
            cancelled: { behavior: 'cancelled' },
            answer: answers => finish(answers.answers[0]?.selected[0] === retry
                ? { behavior: 'completed', result: 'retry_fallback' }
                : { behavior: 'completed', result: 'cancelled' }),
            dismiss: () => finish({ behavior: 'cancelled' }),
        }));
    };
    const onUserDialog = (request, options) => new Promise(resolve => {
        try {
            const flow = `dialog-${options.requestId}`;
            if (deps.closing()) {
                resolve({ behavior: 'cancelled' });
                return;
            }
            const previous = byFlow.get(flow);
            if (previous !== undefined) {
                previous.join(resolve, options.signal);
                return;
            }
            if (options.signal.aborted) {
                resolve({ behavior: 'cancelled' });
                return;
            }
            if (request.dialogKind === 'refusal_fallback_prompt') {
                refusalFallback(request, flow, options.signal, resolve);
                return;
            }
            // An undeclared kind: the SDK's contract answer (the CLI then applies
            // the dialog's default).
            deps.debug(`claude: dialog kind ${request.dialogKind} not rendered; cancelled`);
            resolve({ behavior: 'cancelled' });
        }
        catch (error) {
            deps.debug(`claude: dialog failed (${errorText(error)})`);
            resolve({ behavior: 'cancelled' });
        }
    });
    return {
        onElicitation,
        onUserDialog,
        /** Whether an ask id is one of this bridge's (else the permission bridge's). */
        owns: (askId) => byAsk.has(askId),
        respond(askId, answers) {
            byAsk.get(askId)?.answer(answers);
        },
        cancel(askId) {
            byAsk.get(askId)?.dismiss();
        },
        /** `system/elicitation_complete`: the URL flow it names is done. */
        complete(server, elicitationId) {
            for (const entry of [...byFlow.values()]) {
                if (entry.kind !== 'url' || entry.url?.server !== server || entry.url.elicitationId !== elicitationId)
                    continue;
                deps.emit([{ type: 'notice', level: 'info', key: `elicit-url:${elicitationId}`, text: notices().urlComplete(server) }]);
                entry.complete?.();
            }
        },
        get size() { return byFlow.size; },
        /** Withdraw everything (dispose, reconnect, a forced turn close). */
        settleAll() {
            for (const entry of [...byFlow.values()])
                entry.withdraw();
        },
    };
}
