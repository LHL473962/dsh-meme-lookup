import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { cleanRenderText, NOTICE_CELLS } from '../channel/sanitize.js';
import { HintLine } from './design-system/HintLine.js';
import { LoadingState } from './design-system/LoadingState.js';
import { Pane } from './design-system/Pane.js';
/** Foreign text on its way to the screen: control sequences stripped, bounded. */
const clean = (value) => cleanRenderText(value, NOTICE_CELLS);
/**
 * The target's identity is the subject of the confirmation, and it is foreign
 * text like everything else here: the name comes from the package's own
 * manifest, so it can carry newlines or thousands of cells. Bounded to what a
 * line can show — at 50 columns an unbounded name buries the title and the key
 * hints, which are exactly what the person needs to answer the question.
 */
const TARGET_CELLS = 80;
/**
 * `/plugin install <spec>`: the pane that asks what the flow cannot answer on
 * its own (Stage C-4).
 *
 * The flow (`dsh-adapter/plugin-install.ts`) writes every line of the install
 * into the transcript as it happens — the inspection, pnpm's phases, the result
 * — so this pane only carries the two things a person must decide before that:
 * gate 1's pre-install notice and gate 3's trust confirmation. It also renders
 * the two "decide and retry" steps (unapproved build scripts, an incompatible
 * version), which are the same kind of question.
 *
 * Presentational only: the step state lives in Chat, keys are handled there
 * (Enter confirms / retries, Esc cancels), exactly like the SDK install wizard.
 */
export function PluginInstallPane({ step, busy }) {
    if (busy) {
        return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "remember", bold: true, children: t('plugins-install-pane-title') }), _jsx(Box, { marginTop: 1, children: _jsx(LoadingState, { message: t('plugins-install-installing') }) })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('plugins-install-key-cancel') }) })] }));
    }
    if (step.kind === 'confirm') {
        const { artifact, trust, notice } = step;
        const spec = artifact.name === undefined
            ? t('plugins-install-unidentified')
            : cleanRenderText(`${artifact.name}${artifact.version === undefined ? '' : `@${artifact.version}`}`, TARGET_CELLS);
        return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('plugins-install-pane-title') }) }), _jsx(Text, { children: t('plugins-install-configure', {
                                spec,
                                kind: artifact.kind,
                                bundle: artifact.bundle === true ? 'bundle' : artifact.bundle === false ? 'not a bundle' : 'unknown',
                            }) }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [trust.kind === 'third-party' && _jsx(Text, { children: t('plugins-install-trust-third-party') }), notice.kind === 'declared' && _jsx(Text, { dimColor: true, children: t('plugins-install-notice-declared') }), notice.kind === 'undeclared' && _jsx(Text, { children: t('plugins-install-notice-undeclared') }), notice.kind === 'invalid' && _jsx(Text, { children: t('plugins-install-notice-invalid', { err: notice.error }) }), notice.kind === 'unjudged' && _jsx(Text, { children: t('plugins-install-notice-unjudged') })] })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('plugins-install-key-confirm') }) })] }));
    }
    if (step.kind === 'build-blocked') {
        return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "remember", bold: true, children: t('plugins-install-pane-title') }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { children: t('plugins-install-builds-title') }), step.builds.map(build => _jsx(Text, { dimColor: true, children: `  ${clean(build)}` }, build))] })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('plugins-install-key-builds') }) })] }));
    }
    if (step.kind === 'incompatible') {
        return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "remember", bold: true, children: t('plugins-install-pane-title') }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { children: t('plugins-install-incompatible-title') }), step.packages.map(entry => _jsx(Text, { dimColor: true, children: describe(entry) }, `${entry.name}@${entry.version}`))] }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { children: t('plugins-install-exemptions-title') }), exemptionLines(step.exemptions).map((line, index) => _jsx(Text, { dimColor: true, children: line }, index))] })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('plugins-install-key-incompatible') }) })] }));
    }
    // `done` never renders: its lines are already in the transcript, so Chat
    // closes the pane instead of leaving an empty box behind.
    return null;
}
/**
 * One package the running host refuses, with the peers it fails.
 *
 * Every field here is foreign text — a package name, a version, a peer range
 * the author wrote — and the pane is a render path like any other, so each one
 * goes through the same sanitizer the rest of the interface uses before it can
 * reach the screen.
 */
function describe(entry) {
    const peers = Object.entries(entry.peers)
        .map(([name, range]) => `${clean(name)} ${clean(range)}`)
        .join(', ');
    return `  ${clean(entry.name)}@${clean(entry.version)} (running ${clean(entry.runtimeVersion)}${peers === '' ? '' : `; needs ${peers}`})`;
}
/**
 * The profile's compatibility file as rows. The file maps `package@version` to
 * the runtime versions exempted for it, and a corrupt one answers warnings
 * instead — both shapes are the person's business here, because this is the
 * step where they decide whether to add another. The file is user-editable and
 * carries whatever somebody typed, so its rows are sanitized too.
 */
function exemptionLines(exemptions) {
    const rows = Object.entries(exemptions.exemptions)
        .map(([packageVersion, runtimes]) => `  ${clean(packageVersion)} → ${runtimes.map(runtime => clean(runtime)).join(', ')}`);
    if (rows.length === 0 && exemptions.warnings.length === 0)
        return [`  ${t('plugins-info-registries-none')}`];
    return [...rows, ...exemptions.warnings.map(warning => `  ${clean(warning)}`)];
}
