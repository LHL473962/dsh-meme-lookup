import type { Message } from '@deepseek-ai/dsh-llm';
import type { SessionStore } from '@deepseek-ai/dsh-session';
export interface ModelVisibleEvent {
    inputText: string;
}
export interface RunProjection {
    jobId: string;
    sessionId: string;
    status: 'active' | 'completed' | 'failed' | 'cancelled';
    startedAt: string;
    completedAt?: string;
    invoicesProcessed: number;
    successCount: number;
    retainedCount: number;
    manualReviewCount: number;
    exportArtifactId?: string;
    lastProgress?: string;
}
export interface ScanSessionManagerContext {
    sessions: SessionStore;
}
export declare const PRIVACY_DISCLOSURE: {
    readonly defaultChain: "发票文件在本地 OCR；OCR 文本会发送到当前选择的模型以提取字段，并记录在 DSH 会话中。";
    readonly glmChain: "启用 GLM 时，发票图像会发送到 GLM 服务。";
    readonly credentials: "邮箱授权码和 GLM API Key 由 DSH 凭据服务管理，不会写入插件设置。";
    readonly localOnly: "此插件只支持运行在本机的 DSH。";
};
export declare class ScanSessionManager {
    private context;
    private readonly sessions;
    private readonly projections;
    setContext(context: ScanSessionManagerContext): void;
    createSession(jobId: string): {
        sessionId: string;
        jobId: string;
    };
    logModelVisible(sessionId: string, event: ModelVisibleEvent): Message;
    recordProgress(jobId: string, event: string): void;
    complete(jobId: string, result: {
        invoicesProcessed: number;
        successCount: number;
        retainedCount: number;
        manualReviewCount: number;
        exportArtifactId?: string;
    }): void;
    fail(jobId: string): void;
    cancel(jobId: string): void;
    getProjection(jobId: string): RunProjection | undefined;
}
