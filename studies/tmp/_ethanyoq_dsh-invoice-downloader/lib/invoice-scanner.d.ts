import type { LlmCallConfig, LlmRuntime, Message } from '@deepseek-ai/dsh-llm';
import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess';
import type { ModelVisibleEvent } from './storage.js';
export interface InvoiceScannerConfig {
    pythonPath: string;
    engineRoot: string;
    adapterRoot: string;
    deadlineMs: number;
    graceMs: number;
    imapFetchTimeoutSeconds: number;
}
export interface ScanRequest {
    jobId: string;
    email: string;
    authCode: string;
    dateFrom: string;
    dateTo: string;
    company: string;
    savePath: string;
    ocrProvider: 'local' | 'glm';
    glmApiKey?: string;
}
export interface ScanProgress {
    event: string;
}
export interface ScanResult {
    status: 'completed' | 'failed' | 'cancelled';
    invoicesProcessed: number;
    successCount: number;
    retainedCount: number;
    manualReviewCount: number;
    exportPath?: string;
}
export interface LlmContext {
    llm: Pick<LlmRuntime, 'prepareCall'>;
    agentDefaultModel: {
        currentSelection(): {
            provider: string;
            model: string;
            reasoningEffort?: LlmCallConfig['reasoningEffort'];
        } | null;
    };
}
export declare class InvoiceScanner {
    private readonly subprocess;
    private readonly config;
    private llmContext;
    private client;
    private running;
    private cancelled;
    private progressHandler;
    constructor(subprocess: SubprocessRuntime, config: InvoiceScannerConfig);
    setLlmContext(context: LlmContext): void;
    setProgressHandler(handler: (progress: ScanProgress) => void): void;
    get isRunning(): boolean;
    startScan(request: ScanRequest, logModelVisible: (event: ModelVisibleEvent) => Message): Promise<ScanResult>;
    stopScan(): void;
    private extractWithModel;
    private withDeadline;
}
