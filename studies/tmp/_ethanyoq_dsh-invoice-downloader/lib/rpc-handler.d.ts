import type { CredentialProvider } from '@deepseek-ai/dsh-credentials';
import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess';
import { ArtifactRegistry } from './file-security.js';
import { InvoiceScanner } from './invoice-scanner.js';
import { type RuntimeLayout } from './runtime.js';
import { ScanSessionManager } from './storage.js';
export interface InvoiceRpcContext {
    savePath: string;
    profileDir: string;
    graceMs: number;
    subprocess: SubprocessRuntime;
    runtime: RuntimeLayout;
    scanner: InvoiceScanner;
    sessions: ScanSessionManager;
    credentials: CredentialProvider;
    artifacts: ArtifactRegistry;
}
export interface RpcResult {
    ok: boolean;
    value?: unknown;
    error?: {
        code: 'bad-request' | 'internal';
        message: string;
        details: {
            issues: [];
        } | Record<string, never>;
    };
}
export declare function createInvoiceRpcHandler(context: InvoiceRpcContext): (endpoint: string, payload: unknown, signal: AbortSignal) => Promise<RpcResult>;
