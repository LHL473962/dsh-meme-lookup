/**
 * DSH to Agent Domain translator: decodes durable DSH `SessionEvent`s and
 * transient `agent/assistant-stream` frames into `AgentEvent`s for the shared
 * projector (`src/channel/projection.ts`). All DSH-specific knowledge the
 * projector needs lives here: message source kinds, compaction checkpoint
 * sources, the 0.1.7 tool result payload shape, goal payloads,
 * `request/header` model/effort, the optional todo/preset/colour/compaction
 * plugin events, subagent and `ask_user_question` tool names, `job_output`
 * reads and background-start acks, durable image attachments and the
 * dsh-tools presenters.
 *
 * State is kept small: the frame revision fence (transport-level dedupe) and
 * the open calls whose results still need a presenter. Attempt binding and
 * `seq` idempotency belong to the projector, so a projector reset (`/clear`)
 * does not depend on translator state.
 */
import type { AssistantStreamFrame } from '@deepseek-ai/dsh-agent';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { type AgentEvent, type AgentEventType } from '../../agent/events.js';
import type { PricingWindow } from '../../channel/usage.js';
import type { ToolCallView, ToolResultView, ToolsRegistryLike } from '../channel/types.js';
export interface DshTranslatorDeps {
    /** The host-plane tools registry (dsh-tools); absent in bare embedders,
     *  where every presenter call falls back to a plain text card. Read per
     *  presenter call (a session wrapper memoizes it). */
    tools(): ToolsRegistryLike | undefined;
    /** Presenter scope: the live agent, so preset-owned tool definitions
     *  resolve (the dsh-host-apiproxy presenter pattern). Read per call. */
    scope(): unknown;
    /** DSH attachment service, resolved at call time (a late-mounted provider
     *  must still serve images for rows projected earlier). */
    attachments(): unknown;
}
/**
 * DeepSeek's rate windows, injected into the shared projector as its
 * `pricingWindow`: each usage buckets by the time its request ran.
 */
export declare function dshPricingWindow(time: number): PricingWindow;
/**
 * The DSH backend's decision for every Agent Domain event type: whether this
 * translator (or its session, for the bus-derived `session.status`,
 * `pending.changed` and `compaction.progress`) ever emits it. The exhaustive
 * switch is the point: a new `AgentEvent` variant fails `tsc` here until the
 * DSH side decides, and `verify:agent-domain` checks every translated fixture
 * event against it.
 */
export declare function dshEmits(type: AgentEventType): boolean;
/** Create one translator; it serves exactly one session's event stream. */
export declare function createDshTranslator(deps: DshTranslatorDeps): {
    translateEvent: (event: SessionEvent) => readonly AgentEvent[];
    translateFrame: (frame: AssistantStreamFrame) => readonly AgentEvent[];
    translateReplay: (events: readonly SessionEvent[]) => readonly AgentEvent[];
    reset: () => void;
    presentCallView: (name: string, rawArgs: string) => ToolCallView | undefined;
    presentResultView: (name: string, rawArgs: string, data: SessionEvent<"tool/result">["data"]) => ToolResultView | undefined;
};
export type DshTranslator = ReturnType<typeof createDshTranslator>;
//# sourceMappingURL=translate.d.ts.map