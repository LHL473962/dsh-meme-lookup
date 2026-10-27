import type { QuestionAnswers, SessionCapabilities } from '../../../agent/capabilities.js';
import type { AgentEvent } from '../../../agent/events.js';
import { type CodexAuthRuntime } from './external-tokens.js';
export interface CodexAuthCapabilityBridge {
    readonly capability: NonNullable<SessionCapabilities['auth']> & {
        login(loginOAuth?: () => Promise<boolean>): Promise<void>;
    };
    /** True means this was our prompt, so do not pass it to native approvals. */
    respondQuestion(requestId: string, answers: QuestionAnswers): boolean;
    cancelQuestion(requestId: string): boolean;
    /** Withdraw current prompts without preventing login after a reconnect. */
    withdrawAll(): void;
    dispose(): void;
}
export declare function createCodexAuthCapability(runtime: CodexAuthRuntime, emit: (events: readonly AgentEvent[]) => void): CodexAuthCapabilityBridge;
//# sourceMappingURL=status.d.ts.map