import type { ReMeMessage } from "./reme/types.js";
import { messagesDay } from "./scheduling.js";
import type { SessionEvent } from "./types.js";
interface MessageLike {
    id?: unknown;
    content?: unknown;
    source?: Record<string, unknown>;
}
export declare function remeSessionId(sessionId: string): string;
export declare function captureMessage(event: SessionEvent, sessionId: string): ReMeMessage | null;
export declare function messageText(message: MessageLike): string;
export { messagesDay };
//# sourceMappingURL=messages.d.ts.map