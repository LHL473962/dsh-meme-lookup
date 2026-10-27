import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type RequestFrame } from './protocol.js';
import type { BcnWsClient } from './ws-client.js';
export interface InteractionRun {
    runId: string;
    bcsSessionId: string;
    toolArguments: ReadonlyMap<string, unknown>;
}
/** Agent-scoped answerers; only authenticated BCN downlink can settle a wait. */
export declare class BcnInteractions {
    private client;
    private activeRun;
    private pending;
    private completed;
    constructor(client: BcnWsClient, activeRun: (agent: Agent) => InteractionRun | undefined);
    mount(ctx: Context, agent: Agent): void;
    cancelRun(runId: string): void;
    dispose(): void;
    resolve(frame: RequestFrame): Promise<void>;
    private approve;
    private ask;
    private wait;
    private reject;
}
//# sourceMappingURL=interactions.d.ts.map