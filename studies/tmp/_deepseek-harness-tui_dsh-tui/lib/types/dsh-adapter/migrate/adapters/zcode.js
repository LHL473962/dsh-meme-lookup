/**
 * zcode adapter: `~/.zcode/v2/sessions/<dir>/<taskId>.json`, one JSON object
 * per conversation. Discovery lives here; the document is parsed by the pure
 * zcode.parse.ts. A JSON document has no usable head, so the browse scan
 * parses each changed file whole (they are small; unchanged ones are reused
 * by fingerprint).
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/adapters/zcode
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { countEntries } from './scan.js';
import { fingerprintOf, loadText, runScan, walkFiles } from './scan-fs.js';
import { parseZcodeSession } from './zcode.parse.js';
const WALK = { maxDepth: 3, match: name => name.endsWith('.json') };
async function summarize({ ref, fp }) {
    const raw = await loadText(ref);
    const session = typeof raw === 'string' ? parseZcodeSession(raw) : undefined;
    if (session === undefined)
        return null;
    return {
        agentId: 'zcode',
        sessionKey: session.sourceId,
        ref,
        title: session.title ?? '',
        cwd: session.cwd,
        lastMessageAt: fp.mtimeMs,
        createdAt: session.startedAt || fp.mtimeMs,
    };
}
function readOne(path) {
    try {
        return parseZcodeSession(readFileSync(path, 'utf8'));
    }
    catch {
        return undefined;
    }
}
export const zcodeAdapter = {
    id: 'zcode',
    label: 'zcode',
    roots: () => [join(homedir(), '.zcode', 'v2', 'sessions')],
    discover() {
        const roots = this.roots();
        const sessions = [];
        const walk = (dir, depth) => {
            if (depth > 3)
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
                else if (entry.isFile() && entry.name.endsWith('.json')) {
                    try {
                        if (statSync(path).size > 64 * 1024 * 1024)
                            continue;
                    }
                    catch {
                        continue;
                    }
                    const session = readOne(path);
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
        return runScan(files, file => file.path, fingerprintOf, options, summarize);
    },
    async load(ref) {
        const raw = await loadText(ref);
        if (typeof raw !== 'string')
            return raw;
        return parseZcodeSession(raw) ?? { skip: 'not-a-session' };
    },
};
