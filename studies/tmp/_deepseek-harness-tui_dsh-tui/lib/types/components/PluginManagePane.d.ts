import React from 'react';
import type { PluginManageStep } from '../dsh-adapter/plugin-manage.js';
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
export declare function PluginManagePane({ step, busy }: {
    step: PluginManageStep;
    busy: boolean;
}): React.ReactNode;
//# sourceMappingURL=PluginManagePane.d.ts.map