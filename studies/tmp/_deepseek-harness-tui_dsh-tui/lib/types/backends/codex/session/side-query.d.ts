import { type RpcClock } from '../rpc/client.js';
import type { CodexHub } from '../rpc/hub.js';
import type { SettingsSnapshot } from '../translate/live.js';
export declare function createCodexSideQuery(deps: {
    readonly hub: CodexHub;
    readonly settings: SettingsSnapshot;
    readonly cwd: string;
    readonly clock: RpcClock;
    threadId(): string;
    closed(): boolean;
    debug(message: string): void;
}): {
    capability: {
        ask(prompt: string, options?: {
            readonly signal?: AbortSignal;
            readonly onText?: (delta: string) => void;
        }): Promise<{
            readonly answer: string | null;
            readonly error?: string;
        }>;
    };
    reset: () => void;
    close(): void;
};
//# sourceMappingURL=side-query.d.ts.map