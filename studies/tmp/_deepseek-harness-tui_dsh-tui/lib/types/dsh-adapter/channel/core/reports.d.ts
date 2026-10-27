import type { ChannelBinding } from '../binding.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelState } from '../types.js';
export declare function createCoreReports(deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<ChannelBinding, 'session' | 'capture' | 'isCurrent'>;
    state: () => Pick<ChannelState, 'rows' | 'model' | 'cwd' | 'contextWindow' | 'agentId' | 'backendCapabilities'>;
}): {
    doctorInfo: () => string[];
    exportSession: () => string | null;
};
//# sourceMappingURL=reports.d.ts.map