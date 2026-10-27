/** Coalesce command output per call at 10 Hz; a result flushes first. */
import type { AgentEvent, AgentEventOf } from '../../../agent/events.js';
import type { RpcClock } from '../rpc/client.js';
export declare function createToolOutputBuffer(emit: (events: readonly AgentEvent[]) => void, clock: RpcClock): {
    push(event: AgentEventOf<"tool.output">): void;
    flush: (callId?: string) => void;
    close(): void;
};
//# sourceMappingURL=tool-output.d.ts.map