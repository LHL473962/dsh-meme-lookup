/**
 * The DSH extensions of the channel core: everything only a DSH session can
 * serve, attached when the bound session carries `native.dsh`. The
 * specialists live in their own modules; this file only wires them up.
 *
 * - transcript: the synchronous seed replay of the DSH log (subagent catalog
 *   included), `/trace`, "load earlier" restored from the log, the DeepSeek
 *   rate window for usage pricing, the job registry feed;
 * - subagents and background jobs: projections, child listeners, controls;
 * - sessions: `/resume`, `/home` and the agent view (MRU, background
 *   sessions, `/bg`), rewind, the session tree, fork, the DSH `/new` create
 *   path (preset, route, mount reservation, workspace ownership);
 * - session metadata: recap and auto-recap on open, `/btw`, `/rename`,
 *   `/color`, loaded context, skills, plugin (registry) commands;
 * - controls: permission modes and presets, model / preset / effort, manual
 *   compaction, the model-selection waterfalls and the child-route fill;
 * - reports: `/doctor`, `/export` (from the log), `/mcp`, `/init`, `/balance`,
 *   `/plugin`, `/login` credential descriptions.
 *
 * Construction order matters where it is observable: the job feed and
 * pricing are installed before the seed replay, the replay runs before the
 * model / mode actions read the replayed state, the child-route
 * `agent/request` listener registers before the first bind's own, and the
 * runtime starts keep their order around the core's host subscriptions.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { DshNative } from '../../agent/capabilities.js';
import type { CoreChannel } from './core/compose.js';
import { type ChannelLaunchOptions } from './state.js';
/**
 * Attach the DSH specialists to a core whose bound session is a DSH session.
 * Called inside `createChannel`'s construction transaction, or inside the
 * adoption that binds a placeholder's DSH session (`core.extendOnAdopt`); a
 * throw fails either. The binding already holds the DSH session.
 */
export declare function attachDshExtensions(core: CoreChannel, ctx: Context, initialNative: DshNative, options: ChannelLaunchOptions): void;
//# sourceMappingURL=extensions.d.ts.map