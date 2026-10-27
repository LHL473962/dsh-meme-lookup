/**
 * grok-build adapter: `~/.grok/sessions/<encoded-cwd>/<uuid>/` — each session
 * directory holds a `summary.json` and a `chat_history.jsonl`. Discovery and
 * the `GROK_HOME` override live here; both files are parsed by the pure
 * grok-build.parse.ts. A session directory is one browse entry: its
 * fingerprint combines both files, and its summary comes from the whole
 * summary.json plus the head of the history.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/adapters/grok-build
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseGrokSession } from './grok-build.parse.js';
import { countEntries } from './scan.js';
import { fingerprintOf, loadText, runScan, walkFiles, withHead } from './scan-fs.js';
const HISTORY_FILE = 'chat_history.jsonl';
const SUMMARY_FILE = 'summary.json';
const WALK = { maxDepth: 2, match: name => name === HISTORY_FILE };
/** One change token for both files of a session directory. */
async function directoryFingerprint(dir) {
    const history = await fingerprintOf(join(dir, HISTORY_FILE));
    const summary = await fingerprintOf(join(dir, SUMMARY_FILE));
    if (history === undefined || summary === undefined)
        return undefined;
    return { mtimeMs: Math.max(history.mtimeMs, summary.mtimeMs), size: history.size + summary.size };
}
async function summarize({ ref, fp }) {
    const summaryJson = await loadText(join(ref, SUMMARY_FILE));
    const history = await fingerprintOf(join(ref, HISTORY_FILE));
    if (typeof summaryJson !== 'string' || history === undefined)
        return null;
    const session = await withHead(join(ref, HISTORY_FILE), history.size, chatHistory => parseGrokSession({ summaryJson, chatHistory }));
    if (session === undefined)
        return null;
    return {
        agentId: 'grok-build',
        sessionKey: session.sourceId,
        ref,
        title: session.title ?? '',
        cwd: session.cwd,
        lastMessageAt: fp.mtimeMs,
        createdAt: session.startedAt || fp.mtimeMs,
    };
}
function readOne(dir) {
    let summaryJson;
    let chatHistory;
    try {
        summaryJson = readFileSync(join(dir, 'summary.json'), 'utf8');
        chatHistory = readFileSync(join(dir, 'chat_history.jsonl'), 'utf8');
    }
    catch {
        return undefined;
    }
    return parseGrokSession({ summaryJson, chatHistory });
}
export const grokBuildAdapter = {
    id: 'grok-build',
    label: 'Grok Build',
    roots() {
        const grokHome = process.env.GROK_HOME?.trim();
        return [join(grokHome !== undefined && grokHome !== '' ? grokHome : join(homedir(), '.grok'), 'sessions')];
    },
    discover() {
        const roots = this.roots();
        const sessions = [];
        const walk = (dir, depth) => {
            if (depth > 2)
                return;
            let entries;
            try {
                entries = readdirSync(dir, { withFileTypes: true });
            }
            catch {
                return;
            }
            for (const entry of entries) {
                const path = join(dir, entry.name);
                if (entry.isDirectory())
                    walk(path, depth + 1);
                else if (entry.isFile() && entry.name === 'chat_history.jsonl') {
                    try {
                        if (statSync(path).size > 64 * 1024 * 1024)
                            continue;
                    }
                    catch {
                        continue;
                    }
                    const session = readOne(dir);
                    if (session !== undefined)
                        sessions.push(session);
                }
            }
        };
        for (const root of roots)
            walk(root, 0);
        return { roots, sessions };
    },
    count() {
        return countEntries(this.roots(), { maxDepth: WALK.maxDepth, fileMatch: WALK.match });
    },
    walk: WALK,
    async scan(options) {
        const files = walkFiles(this.roots(), { ...WALK, signal: options?.signal });
        return runScan(files, file => file.dir, directoryFingerprint, options, summarize);
    },
    async load(ref) {
        const summaryJson = await loadText(join(ref, SUMMARY_FILE));
        if (typeof summaryJson !== 'string')
            return summaryJson;
        const chatHistory = await loadText(join(ref, HISTORY_FILE));
        if (typeof chatHistory !== 'string')
            return chatHistory;
        return parseGrokSession({ summaryJson, chatHistory }) ?? { skip: 'not-a-session' };
    },
};
