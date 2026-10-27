import type { AgentSession } from '../../../agent/session.js';
import type { ClaudeSessionDeps } from './types.js';
/** Open one session: start the query, wait for its handshake, start the
 *  consumer loop. Throws (after cleaning up) when the CLI cannot start. */
export declare function openClaudeSession(input: ClaudeSessionDeps): Promise<AgentSession>;
//# sourceMappingURL=lifecycle.d.ts.map