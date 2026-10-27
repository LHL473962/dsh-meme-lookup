import type { MigrationAdapter } from './types.js';
/** How recent the newest source activity must be to earn a hint. */
export declare const RECENT_ACTIVITY_WINDOW_MS: number;
/** One source's last-activity sample. `newestMtimeMs: null` = no data. */
export interface ActivitySample {
    readonly agentId: string;
    readonly label: string;
    readonly newestMtimeMs: number | null;
}
/** A source that was active inside the window. */
export interface RecentAgent {
    readonly agentId: string;
    readonly label: string;
    /** Minutes since the newest activity, rounded down (≥ 0). */
    readonly minutesAgo: number;
}
/**
 * Pure judgment: which samples count as recent, newest first.
 * @param samples - one per source, `null` mtime = no data (never recent).
 * @param nowMs - the current epoch milliseconds (injected for testability).
 * @param windowMs - activity window, default 20 minutes.
 */
export declare function recentAgentsFrom(samples: readonly ActivitySample[], nowMs: number, windowMs?: number): RecentAgent[];
/**
 * Newest file mtime under one set of roots, name-matched only (the counter's
 * walk shape — no parsing). Returns null when nothing matches or IO fails;
 * failures must read as "no data", never as "long ago".
 */
export declare function collectNewestMtime(roots: readonly string[], fileMatch: (name: string) => boolean, maxDepth: number): number | null;
/** The file-name matcher and walk depth an adapter's count() uses. */
export interface AdapterScanSpec {
    readonly maxDepth: number;
    readonly fileMatch: (name: string) => boolean;
}
/**
 * Collect one sample per adapter that can describe its scan; adapters
 * without count() (no name-only scan shape) are skipped, not guessed.
 */
export declare function collectActivitySamples(adapters: readonly MigrationAdapter[], scanOf: (adapter: MigrationAdapter) => AdapterScanSpec | undefined): ActivitySample[];
//# sourceMappingURL=recent-agents.d.ts.map