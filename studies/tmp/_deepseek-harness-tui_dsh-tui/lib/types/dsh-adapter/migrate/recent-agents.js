/**
 * Recent foreign-agent activity detection for the migration hint.
 *
 * "Did the user just come from another coding agent?" is answered from file
 * mtimes inside each source store: an active conversation appends to its
 * log in real time (claude-code updates within the same minute), so the
 * NEWEST file mtime per source is a faithful last-activity signal with good
 * separation (measured on a real machine: 0min vs 117min vs 5867min across
 * sources). Parent-directory mtimes would miss appends to existing
 * conversations, so the scan is file-level — bounded by the same
 * name-matching walk as the list-mode counter (sub-second at ~3000 files)
 * and meant for a BACKGROUND pass, never the render path.
 *
 * Split: `recentAgentsFrom` is a pure judgment over collected samples
 * (directly testable with fixture mtimes); `collectNewestMtime` is the IO
 * collector; `detectRecentAgents` binds them for the TUI.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/recent-agents
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
/** How recent the newest source activity must be to earn a hint. */
export const RECENT_ACTIVITY_WINDOW_MS = 20 * 60 * 1000;
/**
 * Pure judgment: which samples count as recent, newest first.
 * @param samples - one per source, `null` mtime = no data (never recent).
 * @param nowMs - the current epoch milliseconds (injected for testability).
 * @param windowMs - activity window, default 20 minutes.
 */
export function recentAgentsFrom(samples, nowMs, windowMs = RECENT_ACTIVITY_WINDOW_MS) {
    const recent = [];
    for (const sample of samples) {
        if (sample.newestMtimeMs === null)
            continue;
        const age = nowMs - sample.newestMtimeMs;
        if (age < 0 || age > windowMs)
            continue;
        recent.push({ agentId: sample.agentId, label: sample.label, minutesAgo: Math.floor(age / 60_000) });
    }
    recent.sort((a, b) => a.minutesAgo - b.minutesAgo);
    return recent;
}
/**
 * Newest file mtime under one set of roots, name-matched only (the counter's
 * walk shape — no parsing). Returns null when nothing matches or IO fails;
 * failures must read as "no data", never as "long ago".
 */
export function collectNewestMtime(roots, fileMatch, maxDepth) {
    const match = fileMatch;
    let newest = null;
    const walk = (dir, depth) => {
        if (depth > maxDepth)
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
            if (entry.isDirectory()) {
                walk(path, depth + 1);
                continue;
            }
            if (!entry.isFile() || !match(entry.name))
                continue;
            try {
                const mtimeMs = statSync(path).mtimeMs;
                if (newest === null || mtimeMs > newest)
                    newest = mtimeMs;
            }
            catch {
                // A stat race on one file costs that file, not the scan.
            }
        }
    };
    for (const root of roots)
        walk(root, 0);
    return newest;
}
/**
 * Collect one sample per adapter that can describe its scan; adapters
 * without count() (no name-only scan shape) are skipped, not guessed.
 */
export function collectActivitySamples(adapters, scanOf) {
    const samples = [];
    for (const adapter of adapters) {
        const spec = scanOf(adapter);
        if (spec === undefined)
            continue;
        samples.push({
            agentId: adapter.id,
            label: adapter.label,
            newestMtimeMs: collectNewestMtime(adapter.roots(), spec.fileMatch, spec.maxDepth),
        });
    }
    return samples;
}
