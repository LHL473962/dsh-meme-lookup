/**
 * One place that answers "can this agent actually do X?", with the evidence
 * for every answer.
 *
 * The TUI used to answer that question three different ways: `/permission`
 * read the merged command list or the permission-presets snapshot, `/plan`
 * read the command list only, and `/compact` asked nothing at all — so a
 * command could look available (Help, `/` completion) and then fail on use.
 * Every consumer now reads these facts: Chat's command switch, the
 * session-mode actions, and the Help/completion annotation applied where the
 * command list is built (`annotateCommandCapabilities`).
 *
 * Resolution is FACT-based on purpose. Each fact is read from the live service
 * the agent's own scope chain resolves (`presets.serviceForAgent`, which
 * mirrors the official host's `agentPresets.serviceFor(agent, key) ??
 * ctx.get(key)`), never from a preset-id table — a user preset that adds
 * compaction/pruning back gets the full feature set with no TUI change. The
 * single preset-id read left is the official Minimal `ask_user_question`
 * carve-out, and it lives in `presets.ts` (one source, pinned by
 * `verify:minimal-preset-tools`).
 *
 * Evidence per fact:
 *   compaction     `serviceForAgent(ctx, agent, 'compaction')` exposing
 *                  `compactNow` — the same seam the TUI transaction and the
 *                  official `/compact` command both call;
 *   pruner         `serviceForAgent(ctx, agent, 'toolResultPruner')`;
 *   skills         `serviceForAgent(ctx, agent, 'skills')`;
 *   compact/plan   the DSH command registry (`commands.find(agent, name)`,
 *                  scope-correct: same name in another scope is not this
 *                  agent's command). `/compact` prefers the TUI's own
 *                  transaction whenever the compaction service exists, because
 *                  that path owns the `tui/compact` decision event, the
 *                  progress row, Esc cancellation and the session-switch
 *                  settle; it falls back to the registry command only when the
 *                  local path cannot run.
 */
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import type { CommandRuntime } from '@deepseek-ai/dsh-commands';
import type { AgentCapabilities } from '../../adapter/ports/channel-capabilities.js';
import type { LocalCommand } from '../../commands.js';
/**
 * Everything the resolver reads, passed in explicitly so the decision can be
 * driven from fixtures (the focused regression) instead of a live composition.
 */
export interface CapabilityEvidence {
    /** The live agent whose composition is described; undefined before a bind. */
    readonly agent: Agent | undefined;
    /** `ctx.commands` (the DSH command registry), undefined without the row. */
    readonly commandService: CommandRuntime | undefined;
    /** Read one service the way the agent sees it (preset scope chain first). */
    readonly service: (key: string) => unknown;
    /** Whether the agent's scoped tool catalog carries one model-facing tool. */
    readonly toolPresent: (name: string) => boolean;
    /** The preset recorded for the agent (only the Minimal carve-out reads it). */
    readonly presetId: string | undefined;
}
/**
 * Resolve the facts for one agent.
 *
 * @param evidence - The live reads described on {@link CapabilityEvidence}.
 * @returns Facts plus, for a missing route, the i18n key naming the reason.
 */
export declare function resolveAgentCapabilities(evidence: CapabilityEvidence): AgentCapabilities;
/** The live evidence bag for one agent, read through its preset scope chain. */
export declare function agentCapabilityEvidence(ctx: Context, agent: Agent | undefined): CapabilityEvidence;
/**
 * Mark the commands whose capability route is `none` so Help and `/`
 * completion state that instead of advertising a command that can only fail.
 *
 * The marker is a `descriptionKey` override, so `localizedDescription`
 * resolves it at render time (`/lang` applies immediately) and every list
 * consumer — Help menu, suggestion overlay, i18n verifier — picks it up with
 * no new UI mode. The command stays dispatchable: removing it from the list
 * would silently forward `/compact` to the model as a plain message.
 *
 * @param commands - The merged command list (locals + registry).
 * @param capabilities - Facts for the agent the list is built for.
 * @returns The same list, with `none`-route entries re-described.
 */
export declare function annotateCommandCapabilities(commands: readonly LocalCommand[], capabilities: AgentCapabilities): LocalCommand[];
//# sourceMappingURL=capabilities.d.ts.map