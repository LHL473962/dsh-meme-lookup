import type { AgentSession } from '../../../agent/session.js';
import { type Rec } from '../narrow.js';
import type { CodexSessionDeps, OpenedThread } from './state.js';
/** The thread facts of a `thread/start` / `thread/resume` answer. */
export declare function openedThread(response: Rec, fallbackCwd: string): OpenedThread;
/** A JSON-RPC failure of the open as a user-facing sentence (C0 V15). */
export declare function openFailureText(error: unknown, threadId: string | undefined): string;
/** Open (create or resume) a thread and wrap it as a session. Throws a
 *  user-facing sentence when the thread cannot be opened; the hub retain is
 *  released then. */
export declare function openCodexSession(deps: CodexSessionDeps): Promise<AgentSession>;
//# sourceMappingURL=session.d.ts.map