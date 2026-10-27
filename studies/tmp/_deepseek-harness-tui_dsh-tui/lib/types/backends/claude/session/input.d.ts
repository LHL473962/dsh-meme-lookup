/** Streaming inbox, input placement and renderer wake policy. */
import type { SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import type { AgentEvent, AgentEventMeta } from '../../../agent/events.js';
import type { SubmitPlacement } from '../../../agent/session.js';
/** A minimal push-based async iterable: the session's stdin. */
export declare function createInbox<T>(): {
    push(value: T): void;
    close(): void;
    readonly closed: boolean;
    [Symbol.asyncIterator](): AsyncIterator<T>;
};
/** Renderer urgency of one translated message. */
export declare function wakeOf(message: unknown, events: readonly AgentEvent[]): AgentEventMeta['wake'];
/** `SDKUserMessage.priority` for a channel placement. */
export declare function priorityOf(placement: SubmitPlacement, turnOpen: boolean): SDKUserMessage['priority'];
//# sourceMappingURL=input.d.ts.map