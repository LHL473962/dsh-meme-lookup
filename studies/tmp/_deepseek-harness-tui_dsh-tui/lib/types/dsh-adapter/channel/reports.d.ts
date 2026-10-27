import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { readGrantStore } from '../../adapter/standard/grants.js';
import type { AdapterRuntimeOptions } from '../../adapter/kernel/runtime.js';
import type { ChannelOwner } from './owner.js';
/** Local reports and filesystem actions, fenced to the originating binding. */
export declare function createReportActions(ctx: Context, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    capture(): {
        readonly agent: Agent;
        readonly generation: number;
    };
    current(capture: {
        readonly agent: Agent;
        readonly generation: number;
    }): boolean;
    cwd(): string;
    model(): string;
    provider(): string;
    contextWindow(): number | undefined;
    sessionTitle(): string;
    runtime: AdapterRuntimeOptions;
    grantStore(): ReturnType<typeof readGrantStore>;
}): {
    balanceInfo: () => Promise<import("../../deepseekBalance.js").BalanceResult>;
    mcpStatus: () => string[];
    exportSession: () => string | null;
    initWorkspace: () => string | "exists" | null;
    doctorInfo: () => string[];
    pluginsInfo: (args: string) => Promise<string[]>;
};
//# sourceMappingURL=reports.d.ts.map