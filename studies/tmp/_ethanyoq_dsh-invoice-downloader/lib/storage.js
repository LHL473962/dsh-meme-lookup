function createInvoiceUserMessage(inputText) {
    const content = Object.freeze([Object.freeze({ type: 'text', text: inputText })]);
    return Object.freeze({
        id: crypto.randomUUID(),
        role: 'user',
        content,
        source: { kind: 'plugin', plugin: 'invoice-downloader' },
    });
}
export const PRIVACY_DISCLOSURE = {
    defaultChain: '发票文件在本地 OCR；OCR 文本会发送到当前选择的模型以提取字段，并记录在 DSH 会话中。',
    glmChain: '启用 GLM 时，发票图像会发送到 GLM 服务。',
    credentials: '邮箱授权码和 GLM API Key 由 DSH 凭据服务管理，不会写入插件设置。',
    localOnly: '此插件只支持运行在本机的 DSH。',
};
export class ScanSessionManager {
    context = null;
    sessions = new Map();
    projections = new Map();
    setContext(context) {
        this.context = context;
    }
    createSession(jobId) {
        if (!this.context)
            throw new Error('DSH session service is unavailable');
        const sessionId = `invoice-scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const session = this.context.sessions.create(sessionId);
        if (session.id !== sessionId)
            throw new Error('DSH session service returned a different session id');
        this.sessions.set(sessionId, session);
        this.projections.set(jobId, {
            jobId,
            sessionId,
            status: 'active',
            startedAt: new Date().toISOString(),
            invoicesProcessed: 0,
            successCount: 0,
            retainedCount: 0,
            manualReviewCount: 0,
        });
        return { sessionId, jobId };
    }
    logModelVisible(sessionId, event) {
        const message = createInvoiceUserMessage(event.inputText);
        const session = this.sessions.get(sessionId);
        session?.append('user/message', message, { surfaceOp: 'append' });
        return message;
    }
    recordProgress(jobId, event) {
        const projection = this.projections.get(jobId);
        if (projection)
            projection.lastProgress = event;
    }
    complete(jobId, result) {
        const projection = this.projections.get(jobId);
        if (!projection)
            return;
        projection.status = 'completed';
        projection.completedAt = new Date().toISOString();
        projection.invoicesProcessed = result.invoicesProcessed;
        projection.successCount = result.successCount;
        projection.retainedCount = result.retainedCount;
        projection.manualReviewCount = result.manualReviewCount;
        projection.exportArtifactId = result.exportArtifactId;
    }
    fail(jobId) {
        const projection = this.projections.get(jobId);
        if (!projection)
            return;
        projection.status = 'failed';
        projection.completedAt = new Date().toISOString();
    }
    cancel(jobId) {
        const projection = this.projections.get(jobId);
        if (!projection)
            return;
        projection.status = 'cancelled';
        projection.completedAt = new Date().toISOString();
    }
    getProjection(jobId) {
        return this.projections.get(jobId);
    }
}
