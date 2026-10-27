import type { DeepSeekAccount, AccountBonusOrderId, AccountUserId } from '@deepseek-ai/dsh-deepseek-account';
export interface WhaleCouponNotice {
    readonly accountId: AccountUserId;
    readonly orderId: AccountBonusOrderId;
    readonly amount: string;
    readonly currency: 'CNY' | 'USD';
    readonly expiresAt: string;
}
type BonusAccount = Pick<DeepSeekAccount, 'getUnnotifiedBonuses' | 'ackBonusNotified'>;
/** TUI-only presentation of a Platform-confirmed login grant. */
export declare class WhaleCouponStore {
    private readonly listeners;
    private readonly seen;
    private notice;
    private account;
    private generation;
    readonly subscribe: (listener: () => void) => (() => void);
    readonly getSnapshot: () => WhaleCouponNotice | null;
    refresh(account: BonusAccount): Promise<void>;
    /** Called only after the modal has painted; a read alone never acknowledges. */
    shown(orderId: AccountBonusOrderId): void;
    dismiss(orderId: AccountBonusOrderId): void;
    clear(): void;
    private emit;
}
export {};
//# sourceMappingURL=bonus.d.ts.map