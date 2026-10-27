/**
 * Agent-presets roster integration (issue #8): compose each session's
 * model-facing world (tools, prompt sections, projections) from one preset
 * directory instead of the host composition.
 *
 * Mirrors the official host's integration (dsh-host-apiproxy's
 * `composeAgent`): the preset id is resolved BEFORE create/resume because the
 * session boundary snapshots `meta` (the durable header's `agentPreset`)
 * before asynchronous setup begins; the mount itself runs inside the agent
 * factory's `setup(agentCtx)` hook, where a composition failure rolls the
 * whole creation back instead of publishing a half-configured agent.
 *
 * A deployment without the roster (bare `dsh --config cordis.yml` boots,
 * older CLI without the shipped preset root) composes nothing: callers get
 * no `setup` and every session shares the host composition — the behavior
 * before presets existed.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { AgentSetup } from '@deepseek-ai/dsh-agent';
import type { SessionId } from '@deepseek-ai/dsh-session';
import type { PromptAssembly } from '@deepseek-ai/dsh-system-prompt';
import { type ModelRoute } from '../modelRoute.js';
/** The composition inputs for `agents.create`/`agents.resume`. */
export interface PresetComposition {
    /** Value for the durable header's `meta.agentPreset`; absent without a roster. */
    readonly agentPreset?: string;
    /** Factory setup hook mounting the preset onto the unpublished agent. */
    readonly setup?: AgentSetup;
}
/**
 * Resolve the preset one new/resumed session will run under and the setup
 * that installs it. `requested` undefined adopts the roster default.
 *
 * Resolution failures (unknown/broken preset id, an empty roster that cannot
 * supply even the default) degrade to the rosterless composition with a loud
 * log line: a session that cannot start at all is worse than one running on
 * the host composition.
 *
 * @param ctx - The plugin context (roster lookup + logging).
 * @param requested - The preset id the caller wants, or undefined for the default.
 * @returns The header value + setup hook, or an empty composition.
 */
export declare function composePreset(ctx: Context, requested?: string): Promise<PresetComposition>;
/**
 * The preset a PERSISTED session actually runs, read from its log: the last
 * `agent-preset/selected` event wins over the creation header (a blank
 * session may have switched). undefined when the log records none (sessions
 * from before presets existed → the roster default applies at mount).
 *
 * @param ctx - The plugin context (persistence lookup).
 * @param sessionId - The persisted session to inspect.
 * @returns The running preset id, or undefined when unrecorded/unreadable.
 */
export declare function resolvePersistedPreset(ctx: Context, sessionId: SessionId): Promise<string | undefined>;
/**
 * The preset a LIVE session runs, resolved from its own log (last
 * `agent-preset/selected` wins over the header). Used for fork-style creates
 * (rewind/model switch) and for reading an already-live agent's composition.
 *
 * @param session - The live session.
 * @returns The running preset id, or undefined when the log records none.
 */
export declare function runningPresetOf(session: unknown): string | undefined;
/**
 * The route a PERSISTED session actually ran, read from its log: the last
 * `request/header` snapshot. undefined when the log records none (a session
 * that never started a turn) or the artifact is unreadable.
 *
 * Resume feeds this back into `agents.resume({ agentOptions })` so the
 * resumed agent's `options.model` is populated again — a cordis.yml that
 * pins only `provider` (issue #67: a half-pin never merges) leaves
 * agentOptions.model undefined, which breaks the `{{model}}` persona variable
 * for the resumed agent's own assembly AND for every subagent it spawns
 * (dsh-subagent's `resolveChildAgentOptions` inherits `parent.options.model`).
 *
 * @param ctx - The plugin context (persistence lookup).
 * @param sessionId - The persisted session to inspect.
 * @returns The recorded model route, or undefined when unrecorded/unreadable.
 */
export declare function resolvePersistedRoute(ctx: Context, sessionId: SessionId): Promise<ModelRoute | undefined>;
/**
 * Whether the host-layer `ask_user_question` tool must stay invisible to one
 * preset's model-facing catalog.
 *
 * The official Minimal preset is a single-persistent-shell trajectory
 * (`@deepseek-ai/dsh-web-app/presets/minimal.patch.yml`: `persona` +
 * `persistent-shell`, i.e. bash on POSIX / pwsh on Windows — `str_replace_editor`
 * has been opt-in since 0.1.3-alpha.2), while the TUI mounts
 * ask_user_question at the HOST layer so every other preset (including user
 * presets) can use its questionnaire UI; that host-layer tool otherwise merges
 * into Minimal's scoped catalog as an extra tool.
 *
 * The recorded preset id is the only signal available at the assembly
 * boundary: the composition exposes no per-tool manifest, and a host tool's
 * presence in the tool registry cannot tell whether a preset declared it. This
 * is therefore the ONE preset-id read in the capability path, shared with
 * `resolveAgentCapabilities` so advertisement and assembly agree, and pinned
 * by `verify:minimal-preset-tools`.
 *
 * @param presetId - Preset recorded for the requesting session.
 * @returns True when the host-layer tool must be filtered out of the assembly.
 */
export declare function presetHidesHostAskTool(presetId: string | undefined): boolean;
/**
 * Keep the official Minimal preset's model-facing catalog minimal: it declares
 * exactly one persistent shell tool, and host-layer contributors the person
 * switched on elsewhere must not become extra ones.
 *
 * Two such contributors are carved out here:
 * - the host-mounted `ask_user_question` (see `presetHidesHostAskTool`);
 * - `@deepseek-ai/dsh-experimental-session-search`, which registers five
 *   read-only tools AND a usage-guidance section. The upstream bundle promises
 *   "every preset including minimal"; this app intentionally deviates, because
 *   Minimal's published promise is one persistent shell and a TUI process runs
 *   sessions under several presets at once — hence an assembly-boundary filter
 *   rather than a registry (or shell-whitelist) decision that would leak.
 *
 * This is per-assembly because one TUI process can resume, create, or
 * recompose sessions under different presets. The session log remains the
 * source of truth for the active preset.
 *
 * @param assembly - Fully assembled prompt inputs for one model request.
 * @param presetId - Preset recorded for the requesting session.
 * @returns The original assembly when nothing is carved out, else the filtered copy.
 */
export declare function filterMinimalPresetTools(assembly: PromptAssembly, presetId: string | undefined): PromptAssembly;
/**
 * Read a service the way a joined agent sees it: through the preset scope
 * chain when a roster is mounted (preset realms hide e.g. `compaction` from
 * the root context), falling back to the host context otherwise. Mirrors the
 * official host's `agentPresets.serviceFor(agent, key) ?? ctx.get(key)`.
 *
 * @param ctx - The plugin context (roster + host fallback).
 * @param agent - The live agent whose scope chain resolves first.
 * @param key - The cordis service key.
 * @returns The service instance, or undefined when neither layer provides it.
 */
export declare function serviceForAgent<T>(ctx: Context, agent: {
    ctx: Context;
}, key: string): T | undefined;
//# sourceMappingURL=presets.d.ts.map