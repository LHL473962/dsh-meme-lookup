import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, ScrollBox, useTerminalSize, useAnimationFrame } from '../ui.js';
import { formatJobDuration, JOBS_MAX_OUTPUT_LINES } from '../dsh-adapter/jobs.js';
import { JobProgress, JobSection, jobCommandRows } from './Chat/JobCard.js';
import { Markdown } from './Markdown.js';
import { t } from '../i18n.js';
import { Divider } from './design-system/Divider.js';
import { ExitButton } from './SubagentDashboard.js';
import { isPlainReturnInput } from '../utils/modifiers.js';
import { isMinimalUiMode } from '../minimalUiMode.js';
import { usePanelInput } from './sidePanel/usePanelInput.js';
export function resolveJobsRowColumns(width) {
    if (width >= 52)
        return { showProgress: true, showDuration: true, showStatus: true, idWidth: 9, statusWidth: 9, labelWrap: false };
    if (width >= 44)
        return { showProgress: false, showDuration: true, showStatus: true, idWidth: 9, statusWidth: 9, labelWrap: false };
    if (width >= 34)
        return { showProgress: false, showDuration: true, showStatus: true, idWidth: 8, statusWidth: 6, labelWrap: false };
    return { showProgress: false, showDuration: false, showStatus: true, idWidth: 7, statusWidth: 6, labelWrap: false };
}
function statusInfo(status) {
    const minimalUi = isMinimalUiMode();
    switch (status) {
        case 'completed':
            return { glyph: minimalUi ? '✓' : '●', label: t('jobs-status-completed'), color: minimalUi ? undefined : 'success' };
        case 'failed':
            return { glyph: minimalUi ? '×' : '●', label: t('jobs-status-failed'), color: minimalUi ? undefined : 'error' };
        case 'killed':
            return { glyph: minimalUi ? '×' : '●', label: t('jobs-status-killed'), color: minimalUi ? undefined : 'error' };
        case 'stopping':
            return { glyph: minimalUi ? '·' : '●', label: t('jobs-status-stopping'), color: minimalUi ? undefined : 'warning' };
        default:
            return { glyph: minimalUi ? '·' : '●', label: t('jobs-status-running'), color: minimalUi ? undefined : 'warning' };
    }
}
function isTerminalStatus(status) {
    return status === 'completed' || status === 'killed' || status === 'failed';
}
/** 12.3 KB / 1.4 MB — byte counter for the detail block. */
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function renderOutputRuns(job) {
    const runs = [];
    let markdown = [];
    const flush = () => {
        if (markdown.length === 0)
            return;
        runs.push({ kind: 'markdown', text: markdown.join('\n') });
        markdown = [];
    };
    for (const line of job.outputLines ?? []) {
        if (line.gapBefore === true) {
            flush();
            runs.push({ kind: 'gap' });
        }
        if (line.channel === 'stderr') {
            flush();
            runs.push({ kind: 'stderr', text: line.text });
        }
        else if (line.channel === 'log') {
            flush();
            runs.push({ kind: 'log', text: line.text });
        }
        else {
            markdown.push(line.text);
        }
    }
    flush();
    return runs;
}
function JobRowLine({ job, focused, armed, columns, onFocus, expanded, onToggle, width }) {
    const info = statusInfo(job.status);
    const duration = formatJobDuration(job);
    const live = !isTerminalStatus(job.status);
    const progress = live && job.progress !== undefined && job.progress !== '' ? job.progress : undefined;
    const labelRows = jobCommandRows(job.label, width - 2, expanded);
    const command = job.command !== undefined && job.command !== '' ? job.command : job.label;
    const commandRows = focused ? jobCommandRows(command, width - 2, expanded) : [];
    return (_jsxs(Box, { flexDirection: "column", onClick: onFocus, children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsxs(Box, { width: 2, flexShrink: 0, children: [_jsx(Text, { color: focused ? 'accent' : undefined, children: focused ? '❯' : ' ' }), _jsx(Text, { color: info.color, children: info.glyph })] }), _jsx(Box, { width: columns.idWidth, flexShrink: 0, children: _jsx(Text, { bold: focused, color: focused ? 'accent' : undefined, wrap: "truncate-end", children: job.id }) }), _jsx(Box, { flexGrow: 1, flexShrink: 1, children: _jsx(Text, { bold: focused, wrap: columns.labelWrap && expanded ? 'wrap' : 'truncate-end', children: job.label }) }), columns.showProgress && (_jsx(Box, { width: 11, flexShrink: 0, justifyContent: "flex-end", children: progress !== undefined ? _jsx(JobProgress, { progress: progress }) : _jsx(Text, { children: " " }) })), armed === true ? (_jsx(Text, { bold: true, color: "error", wrap: "truncate-end", children: t('jobs-kill-armed') })) : (_jsxs(_Fragment, { children: [columns.showDuration && (_jsx(Box, { width: 6, flexShrink: 0, justifyContent: "flex-end", children: _jsx(Text, { dimColor: true, children: duration }) })), columns.showStatus && (_jsx(Box, { width: columns.statusWidth, flexShrink: 0, justifyContent: "flex-end", children: _jsx(Text, { color: info.color, wrap: "truncate-end", children: info.label }) }))] }))] }), (!columns.labelWrap || focused) && (_jsx(JobSection, { rows: focused ? commandRows : labelRows, color: "accent", onToggle: onToggle })), focused && (_jsxs(Box, { flexDirection: "column", paddingLeft: 4, children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Box, { width: 7, flexShrink: 0, children: _jsx(Text, { dimColor: true, children: t('jobs-panel-started') }) }), _jsx(Text, { dimColor: true, children: timeOf(job.startedAt)
                                    + (job.finishedAt !== undefined ? ` · ${t('jobs-panel-finished')} ${timeOf(job.finishedAt)}` : '')
                                    + (job.lastOutputAt !== undefined ? ` · ${t('jobs-panel-output-at')} ${timeOf(job.lastOutputAt)}` : '') })] }), (job.outputTotalBytes !== undefined || job.outputDropped === true || (job.outputLines?.length ?? 0) >= JOBS_MAX_OUTPUT_LINES) && (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Box, { width: 7, flexShrink: 0, children: _jsx(Text, { dimColor: true, children: t('jobs-panel-output') }) }), _jsx(Text, { dimColor: true, children: (job.outputTotalBytes !== undefined ? formatBytes(job.outputTotalBytes) : '')
                                    + (job.outputDropped === true
                                        ? `${job.outputTotalBytes !== undefined ? ' · ' : ''}${t('jobs-output-dropped')}`
                                        : '')
                                    // At the retention cap the visible tail is provably partial:
                                    // say so instead of letting it read as the whole stream.
                                    + ((job.outputLines?.length ?? 0) >= JOBS_MAX_OUTPUT_LINES
                                        ? `${job.outputTotalBytes !== undefined || job.outputDropped === true ? ' · ' : ''}${t('jobs-output-retained-tail', { n: job.outputLines?.length ?? 0 })}`
                                        : '') })] })), job.lastProgress !== undefined && (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Box, { width: 7, flexShrink: 0, children: _jsx(Text, { dimColor: true, children: t('jobs-progress-latest') }) }), _jsxs(Text, { dimColor: true, children: [job.lastProgress, job.lastProgressAt !== undefined ? ` · ${t('jobs-progress-updated-at', { time: timeOf(job.lastProgressAt) })}` : '', ` · ${t('jobs-progress-source', { source: job.kind })}`] })] })), job.spillPaths !== undefined && job.spillPaths.length > 0 && (_jsx(Box, { paddingLeft: 8, children: _jsx(Text, { dimColor: true, children: t('jobs-output-spill', { path: job.spillPaths[job.spillPaths.length - 1] ?? '' }) }) })), (job.outputLines?.length ?? 0) > 0 ? (_jsx(JobSection, { rows: [], color: "success", children: _jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: 2, flexShrink: 0, children: _jsx(Text, { dimColor: true, children: "\u2261 " }) }), _jsx(Box, { flexDirection: "column", flexGrow: 1, children: renderOutputRuns(job).map((run, runIndex) => (_jsxs(Box, { flexDirection: "column", marginTop: runIndex === 0 ? 0 : 1, children: [run.kind === 'gap' && (_jsx(Text, { dimColor: true, italic: true, children: t('jobs-output-gap') })), run.kind === 'markdown' && (_jsx(Markdown, { cacheTokens: true, children: run.text })), run.kind === 'stderr' && (_jsx(Text, { dimColor: true, children: run.text })), run.kind === 'log' && (_jsx(Text, { dimColor: true, italic: true, children: run.text }))] }, `${job.id}-run-${runIndex}`))) })] }) })) : (_jsx(Text, { dimColor: true, children: t('jobs-panel-no-output-yet') })), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { dimColor: true, bold: true, children: t('jobs-timeline') }), (job.timeline?.length ?? 0) === 0 ? (_jsx(Text, { dimColor: true, italic: true, children: t('jobs-timeline-events-unavailable') })) : (_jsxs(_Fragment, { children: [(job.gapCount ?? 0) > 0 && (_jsx(Text, { dimColor: true, italic: true, children: t('jobs-timeline-gap-count', { n: job.gapCount ?? 0 }) })), (job.timeline?.length ?? 0) > JOBS_TIMELINE_DISPLAY && (_jsx(Text, { dimColor: true, children: `… +${(job.timeline?.length ?? 0) - JOBS_TIMELINE_DISPLAY}` })), (job.timeline ?? []).slice(-JOBS_TIMELINE_DISPLAY).map((event, index) => (_jsx(Text, { dimColor: true, children: timelineLine(event) }, index)))] }))] })] }))] }));
}
/** HH:MM:SS wall-clock of an epoch ms value (locale-independent). */
function timeOf(ms) {
    const date = new Date(ms);
    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
/** The rendered form of one timeline observation: `HH:MM:SS <what>`.
 * Progress keeps the producer's own line verbatim (never re-parsed into a
 * percentage); an output drain names its byte advance and channel when the
 * kernel labelled one. */
function timelineLine(event) {
    const time = timeOf(event.at);
    switch (event.kind) {
        case 'started':
            return `${time} ${t('jobs-timeline-started')}`;
        case 'progress':
            return `${time} ${t('jobs-timeline-progress')} ${event.text ?? ''}`;
        case 'output':
            return `${time} ${event.channel === 'stderr' ? 'stderr' : event.channel === 'log' ? 'log' : t('jobs-timeline-output')}${event.bytes === undefined ? '' : ` +${formatBytes(event.bytes)}`}`;
        case 'gap':
            return `${time} ${t('jobs-timeline-gap')}`;
        case 'stopping':
            return `${time} ${t('jobs-status-stopping')}`;
        case 'settled':
            return `${time} ${t('jobs-timeline-settled')}${event.text === undefined || event.text === '' ? '' : ` · ${event.text}`}`;
    }
}
/** Latest timeline slice shown in the focused detail: enough to read the
 * recent shape of the job without the block swallowing the panel. */
const JOBS_TIMELINE_DISPLAY = 8;
/**
 * `/jobs` overlay panel — every background job of the current session with
 * live status, elapsed/total duration and terminal detail (exit code).
 * Keyboard: ↑/↓ move, k kills the focused live job, Esc closes; the focused
 * row expands a detail block (full label, start/finish times, mirrored
 * output tail). The panel is the deep view behind the transcript job cards.
 */
export function JobsPanel({ jobs, onClose, onKill, onSendToChat, initialFocusId, focusRequest, variant = 'default', focused = true, visible = true, onWatchOutput }) {
    const panelMode = variant === 'panel';
    const [expandedJobs, setExpandedJobs] = React.useState(new Set());
    const toggleDetails = (id) => {
        setExpandedJobs(previous => {
            const next = new Set(previous);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const [focusIndex, setFocusIndex] = React.useState(() => {
        if (initialFocusId === undefined)
            return 0;
        const found = jobs.findIndex(job => job.id === initialFocusId);
        return found >= 0 ? found : 0;
    });
    // A card click may race the roster: the id can land after the panel opened
    // (late kernel push), so re-apply once when it first becomes findable.
    const initialFocusApplied = React.useRef(initialFocusId === undefined);
    React.useEffect(() => {
        if (initialFocusApplied.current || initialFocusId === undefined)
            return;
        const found = jobs.findIndex(job => job.id === initialFocusId);
        if (found < 0)
            return;
        initialFocusApplied.current = true;
        setFocusIndex(found);
        scrollRef.current?.scrollTo(Math.max(0, found - 2));
    }, [jobs, initialFocusId]);
    // Panel-variant focus lane: the same "open AT this job" intent, but each
    // request carries a nonce so re-clicking the same card refocuses. The
    // nonce is only consumed once the id resolves against the roster (the
    // late-kernel-push race from initialFocusId applies here too).
    const focusRequestNonceRef = React.useRef(-1);
    React.useEffect(() => {
        if (panelMode === false || focusRequest === undefined || focusRequest === null)
            return;
        if (focusRequestNonceRef.current === focusRequest.nonce)
            return;
        if (focusRequest.id === null) {
            focusRequestNonceRef.current = focusRequest.nonce;
            return;
        }
        const found = jobs.findIndex(job => job.id === focusRequest.id);
        if (found < 0)
            return;
        focusRequestNonceRef.current = focusRequest.nonce;
        initialFocusApplied.current = true;
        setFocusIndex(found);
        scrollRef.current?.scrollTo(Math.max(0, found - 2));
    }, [jobs, focusRequest, panelMode]);
    /** Armed kill: first `k` primes, second within the window confirms; any
     *  navigation or other key disarms. Mirrors the web two-press stop. */
    const [killArmed, setKillArmed] = React.useState(undefined);
    const scrollRef = React.useRef(null);
    // PanelHost overrides the terminal-size context to the panel's own
    // columns/rows, so the same hook reports the panel geometry in panel mode.
    const { columns: terminalColumns, rows } = useTerminalSize();
    // 1s tick keeps live durations counting while the panel is open (a hidden
    // panel variant suspends the clock — zero subscriptions when invisible).
    const [clockRef] = useAnimationFrame(panelMode ? (visible ? 1000 : null) : 1000);
    // Bring an initial deep focus into view on mount (rows are ~1 line each;
    // two rows of headroom above reads better than pinning to the top edge).
    React.useEffect(() => {
        if (initialFocusId === undefined || initialFocusApplied.current === false)
            return;
        if (initialFocusId !== undefined && jobs.findIndex(job => job.id === initialFocusId) > 2) {
            scrollRef.current?.scrollTo(Math.max(0, jobs.findIndex(job => job.id === initialFocusId) - 2));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only scroll placement
    }, []);
    const focus = Math.min(focusIndex, Math.max(0, jobs.length - 1));
    // The focused job's detail shows its output: keep that tail fresh while
    // the panel is open and visible (a hidden side-panel instance keeps its
    // state but reads nothing; a settled job is read once more, then left
    // alone).
    const focusedId = jobs[focus]?.id;
    React.useEffect(() => (focusedId === undefined || onWatchOutput === undefined || !visible ? undefined : onWatchOutput(focusedId)), [focusedId, onWatchOutput, visible]);
    // The armed confirmation decays after 4s so a stray later `k` never kills.
    React.useEffect(() => {
        if (killArmed === undefined)
            return;
        const timer = setTimeout(() => setKillArmed(undefined), 4000);
        return () => clearTimeout(timer);
    }, [killArmed]);
    // Full-screen input stays registered but inactive when the panel dispatcher owns keys.
    useInput((input, key, event) => {
        if (panelMode)
            return;
        if (key.escape || (key.ctrl && input === 'c')) {
            event.stopImmediatePropagation();
            onClose?.();
            return;
        }
        if (key.upArrow) {
            event.stopImmediatePropagation();
            setKillArmed(undefined);
            setFocusIndex(i => Math.max(0, i - 1));
            scrollRef.current?.scrollBy(-1);
            return;
        }
        if (key.downArrow) {
            event.stopImmediatePropagation();
            setKillArmed(undefined);
            setFocusIndex(i => Math.min(jobs.length - 1, i + 1));
            scrollRef.current?.scrollBy(1);
            return;
        }
        if (input === 'k') {
            const selected = jobs[focus];
            if (selected !== undefined && (selected.status === 'running' || selected.status === 'stopping')) {
                event.stopImmediatePropagation();
                if (killArmed === selected.id) {
                    setKillArmed(undefined);
                    onKill(selected.id);
                }
                else {
                    setKillArmed(selected.id);
                }
            }
            return;
        }
        if (input === 'e' && !key.ctrl && !key.meta) {
            event.stopImmediatePropagation();
            setKillArmed(undefined);
            if (focusedId !== undefined)
                toggleDetails(focusedId);
            return;
        }
        // Enter on a live job does nothing extra (the card/panel IS the view);
        // keep the key consumed while the panel owns the keyboard.
        if (isPlainReturnInput(input, key)) {
            event.stopImmediatePropagation();
            return;
        }
        event.stopImmediatePropagation();
    }, { isActive: !panelMode });
    // Panel form: same business keys through the host dispatcher. Esc/Ctrl+C
    // RETURN FALSE — the host fallback then walks the focus back to chat (the
    // panel never closes the sidebar itself); everything unconsumed also
    // returns false so [/]/z/+/-/digits keep working.
    const panelKeyHandler = (input, key) => {
        if (key.escape === true || (key.ctrl === true && input === 'c'))
            return false;
        if (key.upArrow === true) {
            setKillArmed(undefined);
            setFocusIndex(i => Math.max(0, i - 1));
            scrollRef.current?.scrollBy(-1);
            return true;
        }
        if (key.downArrow === true) {
            setKillArmed(undefined);
            setFocusIndex(i => Math.min(jobs.length - 1, i + 1));
            scrollRef.current?.scrollBy(1);
            return true;
        }
        if (input === 'k') {
            const selected = jobs[focus];
            if (selected !== undefined && (selected.status === 'running' || selected.status === 'stopping')) {
                if (killArmed === selected.id) {
                    setKillArmed(undefined);
                    onKill(selected.id);
                }
                else {
                    setKillArmed(selected.id);
                }
            }
            return true;
        }
        if (input === 'e' && !key.ctrl && !key.meta) {
            setKillArmed(undefined);
            if (focusedId !== undefined)
                toggleDetails(focusedId);
            return true;
        }
        // 's' = Send to Chat：焦点任务附为下一次提交的上下文（chip 在输入框
        // 上方，Esc 可撤）。未接通道时让出。
        if (input === 's') {
            if (onSendToChat === undefined)
                return false;
            const selected = jobs[focus];
            if (selected === undefined)
                return true;
            onSendToChat(selected);
            return true;
        }
        // Enter keeps the same "panel owns the keyboard" semantics (no extra
        // action on a live job — the row IS the view).
        if (key.return_ === true)
            return true;
        return false;
    };
    usePanelInput(panelKeyHandler, { active: panelMode && focused && visible });
    const running = jobs.filter(job => job.status === 'running' || job.status === 'stopping').length;
    // One live job with a progress line reserves the column on every row, so the
    // right-hand grid does not shift as jobs start and finish.
    const progressEligible = jobs.some(job => (job.status === 'running' || job.status === 'stopping') && job.progress !== undefined && job.progress !== '');
    // Column allocation: the full-screen form keeps the historical layout
    // (progress eligible as computed, duration and status always shown); the
    // panel form derives everything from the panel width.
    const rowColumns = panelMode
        ? resolveJobsRowColumns(terminalColumns)
        : { showProgress: progressEligible, showDuration: true, showStatus: true, idWidth: 9, statusWidth: 9, labelWrap: true };
    const completed = jobs.filter(job => job.status === 'completed').length;
    const failed = jobs.filter(job => job.status === 'failed' || job.status === 'killed').length;
    if (panelMode) {
        // Panel layout aligned with TodoPanelAdapter: no outer padding beyond
        // one left/right cell, no title divider / exit button / hint footer
        // (PanelBar + the host hint row already carry that chrome), the summary
        // line kept but tightened for narrow widths.
        return (_jsxs(Box, { flexDirection: "column", paddingLeft: 1, paddingRight: 1, paddingTop: 0, flexGrow: 1, ref: clockRef, children: [_jsxs(Box, { flexDirection: "row", gap: 1, marginTop: 0, marginBottom: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "accent", children: running }), _jsxs(Text, { dimColor: true, children: [" ", t('jobs-panel-count-running')] })] }), (terminalColumns >= 34 || failed > 0) && (_jsxs(Text, { children: [_jsx(Text, { color: failed > 0 ? 'error' : 'success', children: failed > 0 ? failed : completed }), _jsxs(Text, { dimColor: true, children: [" ", failed > 0 ? t('jobs-panel-count-failed') : t('jobs-panel-count-completed')] })] }))] }), _jsx(Box, { flexDirection: "column", maxHeight: Math.max(6, rows - 4), marginTop: 0, children: _jsx(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, children: jobs.length === 0 ? (_jsxs(Box, { flexDirection: "column", alignItems: "center", marginTop: 2, children: [_jsx(Text, { dimColor: true, children: '○' }), _jsx(Text, { dimColor: true, children: t('jobs-panel-empty') })] })) : (jobs.map((job, index) => (_jsx(JobRowLine, { job: job, focused: index === focus, armed: killArmed === job.id, columns: rowColumns, expanded: expandedJobs.has(job.id), width: terminalColumns - (panelMode ? 2 : 4), onToggle: () => { setKillArmed(undefined); setFocusIndex(index); toggleDetails(job.id); }, onFocus: () => { setKillArmed(undefined); setFocusIndex(index); } }, job.id)))) }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", paddingX: 2, paddingY: 1, ref: clockRef, children: [_jsx(Divider, { color: "accent", title: t('jobs-panel-title') }), _jsxs(Box, { flexDirection: "row", gap: 3, marginTop: 1, marginBottom: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "accent", children: running }), _jsxs(Text, { dimColor: true, children: [" ", t('jobs-panel-count-running')] })] }), _jsxs(Text, { children: [_jsx(Text, { color: "success", children: completed }), _jsxs(Text, { dimColor: true, children: [" ", t('jobs-panel-count-completed')] })] }), failed > 0 && (_jsxs(Text, { children: [_jsx(Text, { color: "error", children: failed }), _jsxs(Text, { dimColor: true, children: [" ", t('jobs-panel-count-failed')] })] })), _jsx(Box, { flexGrow: 1 }), _jsx(ExitButton, { onClick: () => onClose?.() })] }), _jsx(Box, { flexDirection: "column", maxHeight: Math.max(10, rows - 10), marginTop: 1, children: _jsx(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, children: jobs.length === 0 ? (_jsxs(Box, { flexDirection: "column", alignItems: "center", marginTop: Math.max(2, Math.floor((rows - 16) / 3)), children: [_jsx(Text, { dimColor: true, children: '○' }), _jsx(Text, { dimColor: true, children: t('jobs-panel-empty') }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: t('jobs-panel-empty-hint') }) })] })) : (jobs.map((job, index) => (_jsx(JobRowLine, { job: job, focused: index === focus, armed: killArmed === job.id, columns: rowColumns, expanded: expandedJobs.has(job.id), width: terminalColumns - (panelMode ? 2 : 4), onToggle: () => { setKillArmed(undefined); setFocusIndex(index); toggleDetails(job.id); }, onFocus: () => { setKillArmed(undefined); setFocusIndex(index); } }, job.id)))) }) }), _jsx(Divider, { color: "subtle", title: "" }), _jsx(Box, { marginTop: 0, children: _jsx(Text, { dimColor: true, children: t('jobs-panel-hint') }) })] }));
}
