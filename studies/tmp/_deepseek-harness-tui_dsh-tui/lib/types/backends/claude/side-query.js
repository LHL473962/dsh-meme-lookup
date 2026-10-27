import { claudeText } from './text.js';
import { writeFlagSettingsFile } from './flag-settings.js';
import { buildSideQueryOptions } from './options.js';
import { errorText, rec, str } from './narrow.js';
/** The one prompt of a side query, as a closed single-message stream. */
async function* singlePrompt(text) {
    yield { type: 'user', message: { role: 'user', content: text }, parent_tool_use_id: null };
}
export function createClaudeSideQuery(deps) {
    return {
        async ask(prompt, options = {}) {
            const { signal, onText } = options;
            if (signal?.aborted)
                return { answer: null };
            if (!deps.persisted())
                return { answer: null, error: claudeText('claude-side-query-empty') };
            const abortController = new AbortController();
            const onAbort = () => { abortController.abort(); };
            signal?.addEventListener('abort', onAbort, { once: true });
            const spawn = deps.spawn();
            const model = deps.model();
            // The flag layer goes by file, out of argv (flag-settings.ts).
            let flagSettings;
            let query;
            try {
                flagSettings = spawn.settings === undefined ? undefined : writeFlagSettingsFile(spawn.settings);
                query = deps.sdk.query({
                    prompt: singlePrompt(prompt),
                    options: buildSideQueryOptions({
                        cwd: deps.cwd,
                        resume: deps.sessionId(),
                        env: spawn.env,
                        ...(flagSettings === undefined ? {} : { settingsFile: flagSettings.path }),
                        executable: spawn.executable,
                        abortController,
                        stderr: line => { deps.debug(`[claude-side-stderr] ${line.trimEnd()}`); },
                        ...(model === '' ? {} : { model }),
                    }),
                });
            }
            catch (error) {
                signal?.removeEventListener('abort', onAbort);
                flagSettings?.dispose();
                throw error;
            }
            let streamed = '';
            let settled = '';
            let failure;
            let incomplete;
            try {
                for await (const raw of query) {
                    if (signal?.aborted)
                        break;
                    const message = rec(raw);
                    if (message?.type === 'stream_event') {
                        const event = rec(message.event);
                        const delta = rec(event?.delta);
                        if (event?.type === 'content_block_delta' && delta?.type === 'text_delta') {
                            const text = str(delta.text) ?? '';
                            if (text !== '') {
                                streamed += text;
                                onText?.(text);
                            }
                        }
                        continue;
                    }
                    if (message?.type === 'assistant') {
                        for (const block of Array.isArray(rec(message.message)?.content) ? rec(message.message).content : []) {
                            const value = rec(block);
                            if (value?.type === 'text')
                                settled += str(value.text) ?? '';
                        }
                        continue;
                    }
                    if (message?.type === 'result') {
                        const errors = Array.isArray(message.errors) ? message.errors.filter((line) => typeof line === 'string' && !line.startsWith('[ede_diagnostic]')) : [];
                        const reason = str(message.result) ?? (errors.join('\n') || str(message.subtype) || 'error');
                        // An error result fails; a non-success close (the turn bound)
                        // fails only when it left no answer.
                        if (message.is_error === true)
                            failure = reason;
                        else if (message.subtype !== 'success')
                            incomplete = reason;
                        break;
                    }
                }
            }
            catch (error) {
                if (!signal?.aborted)
                    failure = errorText(error);
            }
            finally {
                signal?.removeEventListener('abort', onAbort);
                try {
                    query.close();
                }
                catch (error) {
                    deps.debug(`claude: side query close failed (${errorText(error)})`);
                }
                abortController.abort();
                flagSettings?.dispose();
            }
            if (signal?.aborted)
                return { answer: null };
            // A gateway that does not stream still settles the whole text.
            if (streamed === '' && settled !== '')
                onText?.(settled);
            const answer = (streamed !== '' ? streamed : settled).trim();
            if (failure !== undefined)
                return { answer: null, error: failure };
            if (answer === '')
                return { answer: null, error: incomplete ?? claudeText('claude-side-query-no-answer') };
            return { answer };
        },
    };
}
