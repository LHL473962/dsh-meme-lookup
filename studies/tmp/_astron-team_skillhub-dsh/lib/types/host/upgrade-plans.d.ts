import type { SelectionScope } from './conversation-selections.js';
import type { UpgradeBaseline, RemovalBaseline } from './generated/native-contract.js';
import type { ResolvedSkill } from './registry-adapter.js';
export interface UpgradePlanSnapshot {
    baseline: Extract<UpgradeBaseline, {
        status: 'ready';
    }>;
    candidate: ResolvedSkill;
}
/** Pending confirmations only. Accepted requests must be replayed from the durable operation store first. */
declare class ConfirmationPlans<Snapshot> {
    private readonly now;
    private readonly records;
    constructor(now?: () => number);
    clear(): void;
    has(planId: string): boolean;
    issue(context: SelectionScope, snapshot: Snapshot): {
        planId: string;
        expiresAt: string;
    };
    read(planId: string, context: SelectionScope): Snapshot;
    /** Bind this confirmation to one durable request key before any asynchronous acceptance. */
    claim(planId: string, context: SelectionScope, requestKey: string): Snapshot;
    private lookup;
}
export declare class UpgradePlans extends ConfirmationPlans<UpgradePlanSnapshot> {
}
export declare class RemovalPlans extends ConfirmationPlans<Extract<RemovalBaseline, {
    status: 'ready';
}>> {
}
export {};
