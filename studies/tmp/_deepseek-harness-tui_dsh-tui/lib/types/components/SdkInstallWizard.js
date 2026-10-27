import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { HintLine } from './design-system/HintLine.js';
import { LoadingState } from './design-system/LoadingState.js';
import { Pane } from './design-system/Pane.js';
/** The pnpm output tail we show on failure — enough to identify the error,
 *  not enough to push the pane past OverlayAbove's height budget. */
const TAIL_LINES = 6;
function manualLine(dir, specifier) {
    return `cd ${dir} && pnpm add ${specifier}`;
}
/** Detection's first line is install guidance; only its optional note belongs
 *  in the confirmation pane. */
function noteAfterGuidance(hint) {
    const note = hint?.split('\n').slice(1).join('\n').trim();
    return note === undefined || note === '' ? undefined : note;
}
export function SdkInstallWizard({ phase }) {
    const cliNote = phase.kind === 'confirm' ? noteAfterGuidance(phase.foundCli) : undefined;
    return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('sdk-install-title') }) }), phase.kind === 'confirm' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: t('sdk-install-confirm-what', { specifier: phase.specifier, version: phase.version }) }), _jsx(Text, { children: t('sdk-install-confirm-where', { dir: phase.dir }) }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: t('sdk-install-confirm-note') }), cliNote !== undefined && _jsx(Text, { dimColor: true, children: cliNote })] })] })), (phase.kind === 'checking' || phase.kind === 'running') && (_jsx(Box, { flexDirection: "column", children: _jsx(LoadingState, { message: phase.kind === 'checking' ? t('sdk-install-checking') : t('sdk-install-running'), subtitle: phase.kind === 'running' ? t('sdk-install-running-sub') : undefined }) })), phase.kind === 'done' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: t('sdk-install-done') }), phase.rebuiltStore === true && _jsx(Text, { dimColor: true, children: t('sdk-install-rebuilt') })] })), phase.kind === 'failed' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: t('sdk-install-failed', { code: String(phase.exitCode) }) }), _jsx(Text, { dimColor: true, children: t('sdk-install-manual', { command: manualLine(phase.dir, phase.specifier) }) }), phase.tail.slice(-TAIL_LINES).map((line, index) => (_jsx(Text, { dimColor: true, wrap: "truncate-end", children: line }, index)))] })), phase.kind === 'pnpm-missing' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: t('sdk-install-pnpm-missing') }), _jsx(Text, { dimColor: true, children: t('sdk-install-manual', { command: manualLine(phase.dir, phase.specifier) }) })] })), phase.kind === 'cancelled' && _jsx(Text, { children: t('sdk-install-cancelled') }), phase.kind === 'no-target' && (_jsx(Text, { children: t(phase.reason === 'standalone' ? 'sdk-install-no-target-standalone' : 'sdk-install-no-target-no-profile') }))] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: phase.kind === 'confirm' ? t('sdk-install-confirm-hint')
                        : phase.kind === 'done' ? t('sdk-install-done-hint')
                            : phase.kind === 'failed' ? t('sdk-install-failed-hint')
                                : t('sdk-install-exit-hint') }) })] }));
}
