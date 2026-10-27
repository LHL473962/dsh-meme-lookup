import type { Context } from '@deepseek-ai/cordis';
import type { TuiRewindMode } from '../extension-events.js';
import type { ChatRow, ChannelState } from './types.js';
/** Narrow decision-only session action; fork mechanics remain separate. */
export declare function createRewindPromptAction(ctx: Context, deps: {
    agent(): object;
    state(): Pick<ChannelState, 'agentId' | 'cwd'>;
    withDecisionPending<T>(name: string, pending: Promise<T>): Promise<T>;
    notify: ChannelState['notify'];
}): (row: ChatRow) => Promise<{
    modes: readonly TuiRewindMode[];
} | "cancel" | null>;
//# sourceMappingURL=session-actions.d.ts.map