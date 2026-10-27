import React from 'react';
/**
 * The SDK install wizard (the kernel picker's installable row, Enter): one
 * pane, one step machine. The phase lives in Chat — it is async process
 * state, which stays out of the overlay union by design (chatOverlay.ts
 * note 3); this component renders it and never touches useInput, exactly
 * like the pickers. Keys (Chat): Enter confirms / returns, Esc backs out to
 * the kernel picker, `r` retries a failed install.
 */
export type SdkInstallPhase = {
    readonly kind: 'idle';
} | {
    readonly kind: 'confirm';
    readonly dir: string;
    readonly version: string;
    readonly specifier: string;
    readonly foundCli?: string;
} | {
    readonly kind: 'checking';
} | {
    readonly kind: 'running';
} | {
    readonly kind: 'done';
    readonly rebuiltStore?: boolean;
} | {
    readonly kind: 'failed';
    readonly exitCode: number;
    readonly tail: readonly string[];
    readonly dir: string;
    readonly version: string;
    readonly specifier: string;
} | {
    readonly kind: 'pnpm-missing';
    readonly dir: string;
    readonly version: string;
    readonly specifier: string;
} | {
    readonly kind: 'cancelled';
} | {
    readonly kind: 'no-target';
    readonly reason: 'standalone' | 'no-profile';
};
export declare function SdkInstallWizard({ phase }: {
    phase: SdkInstallPhase;
}): React.ReactNode;
//# sourceMappingURL=SdkInstallWizard.d.ts.map