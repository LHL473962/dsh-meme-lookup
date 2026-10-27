/**
 * Codex adapter: `~/.codex/sessions/YYYY/MM/DD/rollout-<id>.jsonl`. File
 * discovery lives here; the rollout format is parsed by the pure
 * codex.parse.ts. The browse scan runs the same parser over the rollout's
 * head: the first session_meta, the first real prompt and the sub-agent
 * marker all sit there.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/adapters/codex
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { parseCodexRollout } from './codex.parse.js';
import { countEntries } from './scan.js';
import { fingerprintOf, loadText, runScan, walkFiles, withHead } from './scan-fs.js';
const isRollout = (name) => name.startsWith('rollout-') && name.endsWith('.jsonl');
const WALK = { maxDepth: 5, match: isRollout };
/** The rollout's stable source id: the uuid in its file name. */
function sourceIdOf(path) {
    const match = /rollout-.*-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.jsonl$/u.exec(path);
    // Fallback is the bare file name, never the whole path: the id is the dedupe
    // key, so an absolute path would make it depend on where the store lives.
    return match?.[1] ?? basename(path);
}
function readOne(path) {
    let raw;
    try {
        raw = readFileSync(path, 'utf8');
    }
    catch {
        return undefined;
    }
    return parseCodexRollout({ raw, sourceId: sourceIdOf(path) });
}
async function summarize({ ref, fp }) {
    const session = await withHead(ref, fp.size, raw => parseCodexRollout({ raw, sourceId: sourceIdOf(ref) }));
    if (session === undefined)
        return null;
    return {
        agentId: 'codex',
        sessionKey: session.sourceId,
        ref,
        title: session.title ?? '',
        cwd: session.cwd,
        lastMessageAt: fp.mtimeMs,
        createdAt: session.startedAt || fp.mtimeMs,
    };
}
export const codexAdapter = {
    id: 'codex',
    label: 'Codex',
    roots: () => [join(homedir(), '.codex', 'sessions')],
    discover() {
        const roots = this.roots();
        const sessions = [];
        const walk = (dir, depth) => {
            if (depth > 5)
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
                else if (entry.isFile() && isRollout(entry.name)) {
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
        return parseCodexRollout({ raw, sourceId: sourceIdOf(ref) }) ?? { skip: 'not-a-session' };
    },
};
