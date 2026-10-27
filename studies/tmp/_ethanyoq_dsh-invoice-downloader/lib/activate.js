import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ArtifactRegistry } from './file-security.js';
import { InvoiceScanner } from './invoice-scanner.js';
import { createInvoiceRpcHandler } from './rpc-handler.js';
import { resolveRuntimeLayout } from './runtime.js';
import { ScanSessionManager } from './storage.js';
export const name = 'invoice-downloader';
export const inject = ['subprocess', 'connection', 'sessions', 'llm', 'agentDefaultModel', 'credentials'];
export function apply(context, config) {
    const runtime = resolveRuntimeLayout(config);
    const profileDir = config.profileDir?.trim()
        || path.join(process.env.DSH_HOME || path.join(os.homedir(), '.dsh'), 'invoice-downloader');
    const savePath = config.savePath?.trim() || '';
    fs.mkdirSync(profileDir, { recursive: true });
    fs.mkdirSync(runtime.runtimeRoot, { recursive: true });
    const scanner = new InvoiceScanner(context.subprocess, {
        pythonPath: runtime.pythonPath,
        engineRoot: runtime.engineRoot,
        adapterRoot: runtime.adapterRoot,
        deadlineMs: config.deadlineMs ?? 600_000,
        graceMs: config.graceMs ?? 2_000,
        imapFetchTimeoutSeconds: config.imapFetchTimeoutSeconds ?? 15,
    });
    scanner.setLlmContext({
        llm: context.llm,
        agentDefaultModel: context.agentDefaultModel,
    });
    const sessions = new ScanSessionManager();
    sessions.setContext({ sessions: context.sessions });
    const handler = createInvoiceRpcHandler({
        savePath,
        profileDir,
        graceMs: config.graceMs ?? 2_000,
        subprocess: context.subprocess,
        runtime,
        scanner,
        sessions,
        credentials: context.credentials,
        artifacts: new ArtifactRegistry(),
    });
    context.effect(() => context.connection.rpc.handle('/invoice', handler, { authority: 'loopback' }), 'invoice-downloader: loopback RPC channel');
}
