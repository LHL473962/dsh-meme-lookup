import { join } from 'node:path';
export class EngineIpcClient {
    subprocess;
    pythonPath;
    engineRoot;
    adapterRoot;
    graceMs;
    handle = null;
    buffer = '';
    extractionHandler = null;
    eventHandler = null;
    resultResolve = null;
    resultReject = null;
    constructor(subprocess, pythonPath, engineRoot, adapterRoot, graceMs) {
        this.subprocess = subprocess;
        this.pythonPath = pythonPath;
        this.engineRoot = engineRoot;
        this.adapterRoot = adapterRoot;
        this.graceMs = graceMs;
    }
    onExtraction(handler) {
        this.extractionHandler = handler;
    }
    onEvent(handler) {
        this.eventHandler = handler;
    }
    async startJob(config) {
        const handle = this.subprocess.spawn({
            argv: [
                this.pythonPath,
                '-c',
                'import runpy, sys; sys.path.insert(0, sys.argv[1]); sys.path.insert(0, sys.argv[2]); sys.path.insert(0, sys.argv[3]); runpy.run_module(sys.argv[4], run_name="__main__")',
                join(this.engineRoot, 'src'),
                join(this.engineRoot, 'src', 'invoice_engine'),
                this.adapterRoot,
                'dsh_runner',
            ],
            cwd: this.engineRoot,
            stdio: { stdin: 'pipe', stdout: 'pipe', stderr: { maxBytes: 1024 * 1024 } },
            graceMs: this.graceMs,
        });
        if (!handle.stdin || !handle.stdout) {
            handle.terminate();
            throw new Error('invoice engine did not provide required standard I/O');
        }
        this.handle = handle;
        handle.stdin.write(`${JSON.stringify({
            type: 'job.start',
            protocolVersion: 1,
            timestamp: Date.now(),
            ...config,
        })}\n`);
        void this.readLoop(handle, handle.stdout).then(async () => {
            const outcome = await handle.done;
            this.rejectIfPending(new Error(`invoice engine exited before returning a result (${String(outcome.exitCode)})`));
        }, () => this.rejectIfPending(new Error('invoice engine communication failed')));
        return new Promise((resolve, reject) => {
            this.resultResolve = resolve;
            this.resultReject = reject;
        });
    }
    stopJob() {
        this.handle?.terminate();
    }
    async readLoop(handle, stdout) {
        for await (const chunk of stdout) {
            this.buffer += chunk;
            const lines = this.buffer.split('\n');
            this.buffer = lines.pop() ?? '';
            for (const line of lines) {
                if (!line.trim())
                    continue;
                try {
                    await this.handleFrame(JSON.parse(line), handle);
                }
                catch {
                    continue;
                }
            }
        }
    }
    async handleFrame(frame, handle) {
        switch (frame.type) {
            case 'job.event':
                if (typeof frame.event === 'string')
                    this.eventHandler?.(frame);
                return;
            case 'job.result':
                if (!frame.result)
                    return;
                this.resolveResult(frame.result);
                return;
            case 'job.error':
                this.rejectIfPending(new Error('invoice engine reported a failure'));
                return;
            case 'extraction.request':
                await this.respondToExtraction(frame, handle);
                return;
            default:
                return;
        }
    }
    async respondToExtraction(frame, handle) {
        const requestId = frame.requestId;
        if (!requestId || !this.extractionHandler)
            return;
        try {
            const response = await this.extractionHandler({
                requestId,
                ocrText: frame.ocrText ?? '',
                documentTypeHint: frame.documentTypeHint,
            });
            this.sendFrame(handle, {
                type: 'extraction.response',
                protocolVersion: 1,
                jobId: frame.jobId,
                timestamp: Date.now(),
                ...response,
            });
        }
        catch {
            this.sendFrame(handle, {
                type: 'extraction.error',
                protocolVersion: 1,
                jobId: frame.jobId,
                timestamp: Date.now(),
                requestId,
                errorCode: 'HANDLER_ERROR',
                errorMessage: 'model extraction failed',
                retryable: false,
            });
        }
    }
    sendFrame(handle, frame) {
        if (!handle.stdin)
            throw new Error('invoice engine input stream is unavailable');
        handle.stdin.write(`${JSON.stringify(frame)}\n`);
    }
    resolveResult(result) {
        const resolve = this.resultResolve;
        this.resultResolve = null;
        this.resultReject = null;
        this.handle = null;
        resolve?.(result);
    }
    rejectIfPending(error) {
        const reject = this.resultReject;
        this.resultResolve = null;
        this.resultReject = null;
        this.handle = null;
        reject?.(error);
    }
}
