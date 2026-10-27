import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { clearResumeTarget, forgetSession, readResumeTarget, touchSession, writeResumeTarget } from '../../sessionHistory.js';
import { t } from '../../i18n.js';
import { appendSessionTitle, deleteSessionLog, userTitleData } from '../compat/index.js';
import { snapshotLiveSessionEvents } from '../compat/liveSession.js';
import { collectRecentActivity, parseRecapResponse, RECAP_RECENT_CHARS, wrapRecapPrompt } from '../recap.js';
import { listSummaries, locateSession, previewSession } from '../sessions/index.js';
import { openStepToolCallIds, runAsSideBranch, runSideQuestion, splitUnresolvedToolCalls, wrapSideQuestion } from '../sideQuestion.js';
import { beginListingSnapshot, readListingSnapshot } from '../sessions/snapshot.js';
import { createSessionListing } from './session-listing.js';
import { isUserInvocable } from '@deepseek-ai/dsh-skill';
const PREVIEW_ENTRIES = 8;
/** Session-scoped metadata, persistence queries, and tool-less LLM reads. */
export function createSessionMetadataActions(ctx, deps) {
    const current = (capture) => deps.owner.current() && deps.binding.isCurrent(capture);
    const persistence = () => ctx.get('sessionPersistence');
    const withOwnerSignal = (signal) => signal === undefined ? deps.owner.signal : AbortSignal.any([signal, deps.owner.signal]);
    // The public registry-global getter is independent of workspace sessionIds:
    // archived sessions deliberately retain their workspace accounting slot.
    const archiveProjection = () => {
        const registry = ctx.get('workspaceRegistry');
        // Older hosts lack this capability. A present getter that throws must
        // reject the listing rather than masquerading as an empty archive set.
        const archived = new Set(registry?.archivedSessionIds ?? []);
        return row => ({ ...row, archived: archived.has(row.id) });
    };
    let lastListing;
    const remember = (source, rows) => {
        lastListing = { source: source.identity ?? source, rows };
    };
    const cachedSessions = () => {
        const source = persistence();
        if (source === undefined)
            return undefined;
        // Providers without a durable scope still keep same-instance reopen fast.
        // A replaced service never inherits this in-memory view.
        const rows = lastListing?.source === (source.identity ?? source)
            ? lastListing.rows
            : readListingSnapshot(source);
        return rows?.map(archiveProjection());
    };
    const listing = createSessionListing({
        owner: deps.owner,
        capture: () => {
            const capture = deps.binding.capture();
            const source = persistence();
            const identity = source?.identity;
            const cwd = deps.cwd?.();
            return () => {
                const liveSource = persistence();
                // Legacy hosts may return a new service wrapper on every lookup;
                // only the provider's explicit identity is stable across proxies.
                return current(capture) && (liveSource !== undefined) === (source !== undefined)
                    && liveSource?.identity === identity && deps.cwd?.() === cwd;
            };
        },
        async read(listingCurrent, onEnriched, onPartial) {
            const source = persistence();
            if (!source) {
                if (listingCurrent())
                    deps.setPersistedSessions([]);
                return [];
            }
            const projectArchive = archiveProjection();
            let summaries = [];
            summaries = await listSummaries(source, deps.owner.signal, enriched => {
                if (!listingCurrent())
                    return;
                enriched = projectArchive(enriched);
                summaries = summaries.map(row => row.id === enriched.id ? enriched : row);
                remember(source, summaries);
                deps.setPersistedSessions(summaries);
                onEnriched(enriched);
            }, rows => {
                if (listingCurrent())
                    onPartial(rows.map(projectArchive));
            }, deps.cwd?.());
            if (!listingCurrent())
                return [];
            summaries = summaries.map(projectArchive);
            remember(source, summaries);
            deps.setPersistedSessions(summaries);
            return summaries;
        },
    });
    const saveMutation = (rows) => {
        listing.invalidate();
        const source = persistence();
        if (source === undefined)
            return;
        // Revoke a pending scan's disk write even before any complete cache exists.
        const save = beginListingSnapshot(source);
        if (rows === undefined)
            return;
        remember(source, rows);
        save(rows);
    };
    const preview = async (sessionId) => {
        const capture = deps.binding.capture();
        const source = persistence();
        if (!source)
            return [];
        const path = await locateSession(source, sessionId);
        if (!current(capture) || path === undefined)
            return [];
        const entries = await previewSession(path, PREVIEW_ENTRIES);
        return current(capture) ? entries : [];
    };
    const listSkills = async () => {
        const capture = deps.binding.capture();
        const target = capture.agent;
        const registry = deps.skillRegistryFor(target);
        if (!registry)
            return [];
        try {
            const observation = await registry.snapshot(deps.skillViewOptions(target));
            if (!current(capture) || !observation.complete)
                return undefined;
            return observation.skills.map(skill => ({
                name: skill.name,
                description: skill.description,
                userInvocable: isUserInvocable(skill),
                source: skill.source,
            }));
        }
        catch {
            return current(capture) ? undefined : [];
        }
    };
    const describeCredential = async (ref) => {
        const capture = deps.binding.capture();
        const credentials = ctx.get('credentials');
        if (!credentials)
            return undefined;
        try {
            const result = await credentials.describe(ref);
            return current(capture) ? result : undefined;
        }
        catch (error) { // `undefined` means the optional service is absent. Keep a live
            // credential service's read failure observable; only suppress it once
            // this Channel binding has been replaced or disposed.
            if (!current(capture))
                return undefined;
            throw error;
        }
    };
    /**
     * Recaps omit conversation history but borrow its effective system text.
     * Derivation applies surface replacements and empty prompt tombstones;
     * scanning the event log would revive superseded instructions.
     */
    const currentSystemText = (capture) => {
        try {
            const system = capture.agent.session.deriveMessages().findLast(message => message.role === 'system');
            const text = system?.content.map(block => block.type === 'text' ? block.text : '').join('') ?? '';
            return text === '' ? undefined : text;
        }
        catch {
            // A session without derived history has no surface prompt to lend.
        }
        return undefined;
    };
    const llmRequest = (capture, messages, includesHistory, signal) => {
        const header = capture.agent.session.requestHeader();
        const config = header?.config;
        // Pre-V3 headers carried the system prompt inline; V3 moved it to
        // `system/message` surface nodes (see currentSystemText).
        const legacySystem = header?.system;
        const system = messages.some(message => message.role === 'system')
            ? undefined
            : typeof legacySystem === 'string' ? legacySystem : includesHistory ? undefined : currentSystemText(capture);
        return {
            provider: config?.provider ?? deps.provider(),
            model: config?.model ?? deps.model(),
            messages,
            ...(system !== undefined && { system }),
            ...(config?.reasoningEffort !== undefined && { reasoningEffort: config.reasoningEffort }),
            ...(config?.temperature !== undefined && { temperature: config.temperature }),
            ...(config?.maxTokens !== undefined && { maxTokens: config.maxTokens }),
            ...(config?.stop !== undefined && { stop: [...config.stop] }),
            sessionId: capture.agent.session.id,
            ...(signal && { signal }),
        };
    };
    const sideQuestion = async (question, options) => {
        const capture = deps.binding.capture();
        const llm = ctx.get('llm');
        if (!llm)
            return { answer: null, error: t('btw-llm-unavailable') };
        const signal = withOwnerSignal(options?.signal);
        // /btw can land mid-step; see splitUnresolvedToolCalls.
        const running = openStepToolCallIds(snapshotLiveSessionEvents(capture.agent.session));
        const history = splitUnresolvedToolCalls(capture.agent.session.deriveMessages(), running);
        const agents = ctx.get('agents');
        const outcome = await runAsSideBranch(agents, capture.agent, () => runSideQuestion({
            stream: llm.stream.bind(llm),
            options: llmRequest(capture, [
                ...history.messages,
                createUserMessage({ content: [{ type: 'text', text: wrapSideQuestion(question, history.pending) }], source: { kind: 'dsh-tui-btw' } }),
            ], true, signal),
            // Do not let an old session append streamed UI facts after a switch.
            onText: delta => { if (current(capture) && !options?.signal?.aborted)
                options?.onText?.(delta); },
            signal,
        }));
        return current(capture) ? outcome : { answer: null };
    };
    const recapRecent = async (options) => {
        const capture = deps.binding.capture();
        const llm = ctx.get('llm');
        // Optional host services can be partially mounted while startup is still
        // composing. A present service without its streaming capability is just
        // as unavailable as an absent service; do not throw from an auto recap.
        if (typeof llm?.stream !== 'function')
            return { summary: null, error: t('recap-llm-unavailable') };
        const activity = collectRecentActivity(snapshotLiveSessionEvents(capture.agent.session), RECAP_RECENT_CHARS);
        if (activity === '')
            return { summary: null, error: t('recap-no-activity') };
        const signal = withOwnerSignal(options?.signal);
        const outcome = await runSideQuestion({
            stream: llm.stream.bind(llm),
            options: llmRequest(capture, [
                createUserMessage({ content: [{ type: 'text', text: wrapRecapPrompt(activity) }], source: { kind: 'dsh-tui-recap' } }),
            ], false, signal),
            onText: delta => { if (current(capture) && !options?.signal?.aborted)
                options?.onText?.(delta); },
            signal,
        });
        if (!current(capture) || outcome.answer === null)
            return { summary: null, ...(current(capture) ? { error: outcome.error } : {}) };
        const parsed = parseRecapResponse(outcome.answer);
        return parsed.title === undefined ? { summary: parsed.summary } : { summary: parsed.summary, title: parsed.title };
    };
    const renameSession = (title) => {
        const capture = deps.binding.capture();
        if (!current(capture))
            return;
        // Live rename: the same strict-reader-required payload the offline append
        // writes — a `{ title }`-only event made the log unopenable (issue #1006).
        capture.agent.session.append('session/title', userTitleData(title));
        saveMutation(cachedSessions()?.map(row => row.id === capture.agent.session.id ? { ...row, title: { text: title, source: 'renamed' } } : row));
        deps.setSessionTitle(title);
        deps.emit();
    };
    const setSessionColor = (color) => {
        const capture = deps.binding.capture();
        if (!current(capture))
            return;
        capture.agent.session
            .append('session/color', { color });
        deps.setSessionColor(color);
        deps.emit();
    };
    const deleteSession = async (sessionId) => {
        const capture = deps.binding.capture();
        if (sessionId === capture.agent.session.id || !current(capture))
            return false;
        if (deleteSessionLog(sessionId) !== 'deleted' || !current(capture))
            return false;
        saveMutation(cachedSessions()?.filter(row => row.id !== sessionId));
        forgetSession(sessionId);
        deps.forgetAgentView(sessionId);
        if (readResumeTarget() === sessionId)
            clearResumeTarget();
        return true;
    };
    const renameSessionTo = async (sessionId, title) => {
        const capture = deps.binding.capture();
        if (!current(capture))
            return false;
        if (sessionId === capture.agent.session.id) {
            renameSession(title);
            return true;
        }
        if (appendSessionTitle(sessionId, title) !== 'appended' || !current(capture))
            return false;
        saveMutation(cachedSessions()?.map(row => row.id === sessionId ? { ...row, title: { text: title, source: 'renamed' } } : row));
        touchSession(sessionId);
        return true;
    };
    return {
        cachedSessions, listSessions: listing.listSessions, previewSession: preview, listSkills, describeCredential,
        sideQuestion, recapRecent, setResumeTarget: writeResumeTarget,
        renameSession, setSessionColor, deleteSession, renameSessionTo,
    };
}
