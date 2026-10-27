import React from 'react';
import type { PluginInstallStep } from '../dsh-adapter/plugin-install.js';
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
export declare function PluginInstallPane({ step, busy }: {
    step: PluginInstallStep;
    busy: boolean;
}): React.ReactNode;
//# sourceMappingURL=PluginInstallPane.d.ts.map