/**
 * Live app-server notifications of one thread → Agent Domain events
 * (docs/codex-backend-design.md §7.5): the stateful half of the translator.
 * Items go through the shared mapping (`items.ts`); this module adds the
 * stream deltas, turn boundaries, usage, status, settings and notices.
 *
 * Session concerns stay in the session (`session/*`): which inputs a user
 * message claims, approvals, the turn the input queue waits on, `/diff`.
 *
 * Every field is narrowed from `unknown`; an unknown method is ignored
 * (debug-logged), never fatal.
 */
import type { AgentEvent, AgentEventMeta } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import { closeTurn, type ItemContext } from './items.js';
/** The thread settings the status line shows (compared on change). */
export interface SettingsSnapshot {
    model: string;
    effort: string | null;
    modeId: string;
    /** Permission policy and collaboration mode remain orthogonal. */
    permissionMode?: string;
    approvalPolicy?: unknown;
    sandboxPolicy?: unknown;
    collaborationMode?: Rec;
}
export interface LiveTranslator {
    /** Translate one notification for this thread. */
    notification(method: string, params: Rec): AgentEvent[];
    /** Close the open turn without a `turn/completed` (connection lost,
     *  forced settle). */
    forceClose(reason: Parameters<typeof closeTurn>[2]): AgentEvent[];
    readonly ctx: ItemContext;
    readonly settings: SettingsSnapshot;
}
/** Renderer urgency of one notification's batch. */
export declare function wakeOf(method: string, events: readonly AgentEvent[]): AgentEventMeta['wake'];
export declare function createLiveTranslator(ctx: ItemContext, settings: SettingsSnapshot): LiveTranslator;
//# sourceMappingURL=live.d.ts.map