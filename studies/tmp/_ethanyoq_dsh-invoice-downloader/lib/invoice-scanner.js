import { EngineIpcClient, } from './ipc-client.js';
/** Collects the text-only stream result used by invoice field extraction. */
class TextResponseAssembler {
    textByIndex = new Map();
    closed = new Set();
    finishKind;
    push(chunk) {
        switch (chunk.type) {
            case 'text-delta':
                if (!this.closed.has(chunk.index)) {
                    this.textByIndex.set(chunk.index, `${this.textByIndex.get(chunk.index) || ''}${chunk.text}`);
                }
                return;
            case 'block-end':
                if (!this.closed.has(chunk.index) && chunk.block.type === 'text') {
                    this.textByIndex.set(chunk.index, chunk.block.text);
                    this.closed.add(chunk.index);
                }
                return;
            case 'finish':
                this.finishKind = chunk.reason.kind;
                return;
            default:
                return;
        }
    }
    failed() {
        return this.finishKind === 'error' || this.finishKind === 'aborted';
    }
    text() {
        return [...this.textByIndex.entries()]
            .sort(([left], [right]) => left - right)
            .map(([, text]) => text)
            .join('\n');
    }
}
export class InvoiceScanner {
    subprocess;
    config;
    llmContext = null;
    client = null;
    running = false;
    cancelled = false;
    progressHandler = null;
    constructor(subprocess, config) {
        this.subprocess = subprocess;
        this.config = config;
    }
    setLlmContext(context) {
        this.llmContext = context;
    }
    setProgressHandler(handler) {
        this.progressHandler = handler;
    }
    get isRunning() {
        return this.running;
    }
    async startScan(request, logModelVisible) {
        if (this.running)
            throw new Error('an invoice scan is already running');
        this.running = true;
        this.cancelled = false;
        this.client = new EngineIpcClient(this.subprocess, this.config.pythonPath, this.config.engineRoot, this.config.adapterRoot, this.config.graceMs);
        this.client.onEvent(event => this.progressHandler?.({ event: event.event }));
        this.client.onExtraction(request => this.extractWithModel(request, logModelVisible));
        try {
            const result = await this.withDeadline(this.client.startJob({
                jobId: request.jobId,
                email: request.email,
                authCode: request.authCode,
                dateFrom: request.dateFrom,
                dateTo: request.dateTo,
                company: request.company,
                savePath: request.savePath,
                ocrProvider: request.ocrProvider,
                imapFetchTimeoutSeconds: this.config.imapFetchTimeoutSeconds,
                ...(request.glmApiKey ? { glmApiKey: request.glmApiKey } : {}),
            }));
            return toScanResult(result);
        }
        catch {
            if (this.cancelled)
                return emptyResult('cancelled');
            return emptyResult('failed');
        }
        finally {
            this.client = null;
            this.running = false;
        }
    }
    stopScan() {
        this.cancelled = true;
        this.client?.stopJob();
    }
    async extractWithModel(request, logModelVisible) {
        const selection = this.llmContext?.agentDefaultModel.currentSelection();
        if (!selection || !this.llmContext) {
            return {
                requestId: request.requestId,
                errorCode: 'MODEL_NOT_CONFIGURED',
                errorMessage: '请选择可用模型后再开始扫描。',
                retryable: false,
            };
        }
        try {
            const prepared = await this.llmContext.llm.prepareCall({
                provider: selection.provider,
                model: selection.model,
                temperature: 0,
                maxTokens: 500,
                ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }),
            });
            const message = logModelVisible({
                inputText: JSON.stringify({
                    type: 'invoice.field-extraction',
                    requestId: request.requestId,
                    instruction: '从 OCR 文本提取发票字段，并仅返回合法 JSON。',
                    modelConfig: prepared.config,
                    ocrText: request.ocrText,
                }),
            });
            const assembler = new TextResponseAssembler();
            for await (const chunk of prepared.stream({ ...prepared.config, messages: [message] }))
                assembler.push(chunk);
            if (assembler.failed()) {
                return {
                    requestId: request.requestId,
                    errorCode: 'LLM_ERROR',
                    errorMessage: '模型提取失败。',
                    retryable: false,
                };
            }
            const responseText = assembler.text();
            if (!responseText) {
                return {
                    requestId: request.requestId,
                    errorCode: 'LLM_EMPTY_RESPONSE',
                    errorMessage: '模型未返回可用文本。',
                    retryable: false,
                };
            }
            return {
                requestId: request.requestId,
                extractedFields: extractJson(responseText),
                rawModelOutput: responseText,
            };
        }
        catch {
            return {
                requestId: request.requestId,
                errorCode: 'LLM_ERROR',
                errorMessage: '模型提取失败。',
                retryable: false,
            };
        }
    }
    async withDeadline(result) {
        let timer;
        try {
            return await new Promise((resolve, reject) => {
                timer = setTimeout(() => {
                    this.client?.stopJob();
                    reject(new Error('invoice scan deadline exceeded'));
                }, this.config.deadlineMs);
                void result.then(resolve, reject);
            });
        }
        finally {
            if (timer)
                clearTimeout(timer);
        }
    }
}
function extractJson(responseText) {
    try {
        const match = responseText.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : { raw: responseText };
    }
    catch {
        return { raw: responseText };
    }
}
function toScanResult(result) {
    return {
        status: 'completed',
        invoicesProcessed: result.invoicesProcessed || 0,
        successCount: result.successCount || 0,
        retainedCount: result.retainedCount || 0,
        manualReviewCount: result.manualReviewCount || 0,
        ...(typeof result.exportPath === 'string' ? { exportPath: result.exportPath } : {}),
    };
}
function emptyResult(status) {
    return {
        status,
        invoicesProcessed: 0,
        successCount: 0,
        retainedCount: 0,
        manualReviewCount: 0,
    };
}
