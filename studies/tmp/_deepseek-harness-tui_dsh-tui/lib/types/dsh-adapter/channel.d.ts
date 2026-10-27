/**
 * Channel composition root: one backend-neutral core for every
 * `AgentSession` (`channel/core/compose.ts`), plus the DSH extensions when the
 * bound session is a DSH session (`channel/extensions.ts`). A new backend
 * needs no channel code; its session's typed capabilities decide what the
 * core serves. See docs/agent-backend-design.md.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { AgentSession } from '../agent/session.js';
import type { ChannelLaunchOptions } from './channel/state.js';
import type { ChannelState } from './channel/types.js';
export type { SubagentState } from './subagents.js';
/**
 * Create the live channel state for one agent session: replay the durable
 * transcript, subscribe to the session's events, and expose every TUI action.
 * @internal
 * @param ctx - The plugin context; optional services are resolved via ctx.get.
 * @param initial - The session the channel renders; rewinds and resumes
 *   replace it, while model switches keep it. A raw DSH agent (direct embedders, fixtures) is
 *   wrapped as a DSH session together with `options.handle`.
 * @param options - Boot options: model route, cwd, provider, and the
 *   reasoning-effort / working-activity preferences.
 * @returns The live channel state, subscribed and ready to render.
 */
export declare function createChannel(ctx: Context, initial: AgentSession | Agent, options: ChannelLaunchOptions): ChannelState;
export type { ChannelLaunchOptions } from './channel/state.js';
export { expandMentions } from './channel/mentions.js';
export { sessionCwdMatches } from './channel/paths.js';
export type { AgentViewDispatchResult, AgentViewRow, AgentViewStatus, BackgroundResult, BackendModeOption, BackendChannelOption, Channel, ChannelGoal, ChannelState, ChatRow, ComposerImageRef, ComposerSubmission, CredentialStatus, EffortOption, ExternalCommandOutcome, JobControl, JobGroupRow, JobRow, LoadedContext, LoadedContextEntry, LoadedContextFile, LoadedContextSkill, LoadedContextTool, MentionAttachments, MentionExpansion, MentionFs, NotificationItem, PendingMessage, PermissionPresetAvailability, PermissionPresetCurrent, PermissionPresetOption, PermissionPresetSnapshot, PresetOption, ResumeResult, SkillInfo, StagedImageHandle, StagedImageInput, SubagentControl, SubagentRow, TodoPanelItem, TokenBucket, TokenUsage, ToolCallView, ToolFileDiff, ToolResultView, ToolRow, ToolViewPresenter, TranscriptImage } from './channel/types.js';
export { emptyTokenUsage } from './channel/usage.js';
//# sourceMappingURL=channel.d.ts.map