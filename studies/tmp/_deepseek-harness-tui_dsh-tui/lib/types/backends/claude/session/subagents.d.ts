import type { AgentSession } from '../../../agent/session.js';
import type { ClaudeAuthPlan } from '../auth.js';
import type { ClaudeTranslator } from '../translate.js';
import type { ClaudeSessionDeps, Run } from './types.js';
export declare function sessionTaskCapabilities(context: {
    readonly deps: ClaudeSessionDeps;
    readonly translator: ClaudeTranslator;
    readonly run: Run;
    readonly disposing: boolean;
    readonly currentSessionId: string;
    readonly authPlan: ClaudeAuthPlan;
}): Pick<AgentSession['capabilities'], 'subagents' | 'tasks'>;
//# sourceMappingURL=subagents.d.ts.map