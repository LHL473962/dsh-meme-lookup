import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { cleanRenderText, NOTICE_CELLS } from '../channel/sanitize.js';
import { HintLine } from './design-system/HintLine.js';
import { LoadingState } from './design-system/LoadingState.js';
import { Pane } from './design-system/Pane.js';
/** Foreign text on its way to the screen: control sequences stripped, bounded. */
const clean = (value) => cleanRenderText(value, NOTICE_CELLS);
/**
 * The target's identity is the subject of the question, and it is foreign text
 * like everything else here: a package name and a module specifier come from
 * somebody else's manifest, so either can carry newlines or thousands of cells.
 * Bounded to what a line can show — at 50 columns an unbounded name buries the
 * title and the key hints, which are exactly what the person needs to answer.
 */
const TARGET_CELLS = 80;
/**
 * `/plugin remove | enable | disable`: the pane that asks what the flow cannot
 * answer on its own (Stage C-5).
 *
 * The flow (`dsh-adapter/plugin-manage.ts`) writes every line of the action into
 * the transcript — what it resolved, why it refused, what the service answered —
 * so this pane only carries the one thing a person must decide before the write.
 * Unlike the install pane there is no progress, no cancellation and no retry:
 * each action is a single call that settles once.
 *
 * Presentational only, and the same three parts as its install sibling
 * (`PluginInstallPane`): the pane, the facts that make the question answerable,
 * and the key hints. Keys are handled in Chat (Enter answers, Esc closes).
 */
export function PluginManagePane({ step, busy }) {
    if (busy) {
        // A write is in flight. Esc closes the pane and the write finishes anyway —
        // the service has no cancellation for these three, and saying "cancelling"
        // here would be a promise nobody can keep.
        return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "remember", bold: true, children: t('plugins-manage-pane-title') }), _jsx(Box, { marginTop: 1, children: _jsx(LoadingState, { message: t('plugins-manage-working') }) })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('plugins-manage-key-busy') }) })] }));
    }
    if (step.kind === 'confirm') {
        return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('plugins-manage-pane-title') }) }), _jsx(Text, { children: t('plugins-manage-configure', {
                                action: t(actionKeyOf(step.target)),
                                target: describe(step.target),
                            }) }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [step.question.kind === 'remove' && (_jsx(Text, { children: t('plugins-manage-remove-facts', {
                                        rows: String(step.target.kind === 'bundle' ? step.target.rows : 0),
                                        overrides: String(step.target.kind === 'bundle' ? step.target.overrides : 0),
                                    }) })), step.question.kind === 'trust' && _jsx(Text, { children: t('plugins-manage-trust-facts') }), step.question.kind === 'host-row' && _jsx(Text, { children: t('plugins-manage-host-row-facts') }), step.question.kind === 'team-active' && (_jsxs(_Fragment, { children: [step.question.members > 0 && _jsx(Text, { children: t('plugins-manage-team-active-facts', { members: String(step.question.members) }) }), step.question.unseen > 0 && _jsx(Text, { children: t('plugins-manage-team-unseen-facts', { members: String(step.question.unseen) }) }), _jsx(Text, { children: t('plugins-manage-team-active-stop') })] }))] })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('plugins-manage-key-confirm') }) })] }));
    }
    // `done` never renders: its lines are already in the transcript, so Chat
    // closes the pane instead of leaving an empty box behind.
    return null;
}
/** Which verb the title asks about. */
function actionKeyOf(target) {
    return target.action === 'remove'
        ? 'plugins-manage-action-remove'
        : target.action === 'enable' ? 'plugins-manage-action-enable' : 'plugins-manage-action-disable';
}
/**
 * The target as one bounded cell. A bundle is named by its package name; a row
 * by the module it loads, which is what the report listed it as and what a
 * person typed to get here.
 */
function describe(target) {
    if (target.kind === 'bundle') {
        const version = target.version === undefined ? '' : `@${target.version}`;
        return cleanRenderText(`${target.name}${version}`, TARGET_CELLS);
    }
    return cleanRenderText(target.moduleName, TARGET_CELLS);
}
