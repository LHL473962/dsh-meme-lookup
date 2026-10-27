import React from 'react';
import type { AgentMessageView } from './agentTeam.js';
/**
 * One row of the Detail Messages page: sender, target, body, transport,
 * state and sourceRef, newest last. Without both endpoints it shows the
 * unknown-relation line and no arrow.
 */
export declare function AgentMessageFlowRow({ message, selfAgentId }: {
    message: AgentMessageView;
    selfAgentId: string;
}): React.ReactNode;
/**
 * The newest message as one dim `⇄ from → to · state` line under an agent's
 * dashboard card (no unread count: that is the panel badge's job).
 */
export declare function AgentMessagesSummary({ messages, selfAgentId }: {
    messages: readonly AgentMessageView[];
    selfAgentId: string;
}): React.ReactNode;
//# sourceMappingURL=AgentMessageFlow.d.ts.map