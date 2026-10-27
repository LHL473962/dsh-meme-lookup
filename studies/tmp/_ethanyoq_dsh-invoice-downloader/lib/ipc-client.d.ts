import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess';
export interface JobConfig {
    jobId: string;
    email: string;
    authCode: string;
    dateFrom: string;
    dateTo: string;
    company: string;
    savePath: string;
    ocrProvider: 'local' | 'glm';
    imapFetchTimeoutSeconds: number;
    glmApiKey?: string;
}
export interface JobEvent {
    event: string;
    [key: string]: unknown;
}
export interface JobResult {
    status: 'completed';
    invoicesProcessed: number;
    successCount?: number;
    retainedCount?: number;
    manualReviewCount?: number;
    exportPath?: string;
}
export interface ExtractionRequest {
    requestId: string;
    ocrText: string;
    documentTypeHint?: string;
}
export interface ExtractionResponse {
    requestId: string;
    extractedFields: Record<string, unknown>;
    rawModelOutput?: string;
}
export interface ExtractionError {
    requestId: string;
    errorCode: string;
    errorMessage: string;
    retryable: boolean;
}
export type ExtractionHandler = (request: ExtractionRequest) => Promise<ExtractionResponse | ExtractionError>;
export declare class EngineIpcClient {
    private readonly subprocess;
    private readonly pythonPath;
    private readonly engineRoot;
    private readonly adapterRoot;
    private readonly graceMs;
    private handle;
    private buffer;
    private extractionHandler;
    private eventHandler;
    private resultResolve;
    private resultReject;
    constructor(subprocess: SubprocessRuntime, pythonPath: string, engineRoot: string, adapterRoot: string, graceMs: number);
    onExtraction(handler: ExtractionHandler): void;
    onEvent(handler: (event: JobEvent) => void): void;
    startJob(config: JobConfig): Promise<JobResult>;
    stopJob(): void;
    private readLoop;
    private handleFrame;
    private respondToExtraction;
    private sendFrame;
    private resolveResult;
    private rejectIfPending;
}
