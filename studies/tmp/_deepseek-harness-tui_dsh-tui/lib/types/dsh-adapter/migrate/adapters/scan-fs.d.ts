import type { Fingerprint, ForeignSessionSummary, LoadSkip, ScanEntry, ScanOptions } from '../types.js';
/** Largest artifact a full load reads (a larger one is reported, not read). */
export declare const MAX_ARTIFACT_BYTES: number;
/** Head windows tried in order: most prompts sit in the first few KB, but a
 *  large preamble (Codex base instructions, Claude snapshots) can push the
 *  first prompt further. */
export declare const HEAD_WINDOWS: readonly number[];
/** One file the walk matched. */
export interface WalkedFile {
    readonly path: string;
    readonly dir: string;
    readonly name: string;
}
export interface WalkOptions {
    readonly maxDepth: number;
    readonly match: (name: string) => boolean;
    /** Directory names never descended into. */
    readonly skipDirs?: readonly string[];
    readonly signal?: AbortSignal;
}
/** Walk roots breadth-unbounded, depth-bounded; unreadable directories cost themselves only. */
export declare function walkFiles(roots: readonly string[], options: WalkOptions): AsyncGenerator<WalkedFile>;
/** mtime + size of one file, or undefined when it vanished. */
export declare function fingerprintOf(path: string): Promise<Fingerprint | undefined>;
/**
 * The first `bytes` of a file as whole lines: a window that ends mid-line
 * drops the partial line (the cut happens on bytes, before decoding, so no
 * character is split either).
 */
export declare function readHead(path: string, bytes: number): Promise<string>;
/** The last `bytes` of a file as whole lines (the partial first line is dropped). */
export declare function readTail(path: string, bytes: number, size: number): Promise<string>;
/**
 * Read growing head windows until `accept` finds what it needs (or the whole
 * file has been seen).
 * @returns The first accepted result, or the result for the largest window.
 */
export declare function withHead<T>(path: string, size: number, accept: (head: string, whole: boolean) => T | undefined): Promise<T | undefined>;
/** Whole text of an artifact for a full load, or the reason it cannot be read. */
export declare function loadText(path: string): Promise<string | LoadSkip>;
/** One candidate artifact of a scan. */
export interface ScanCandidate {
    readonly ref: string;
    readonly fp: Fingerprint;
}
/**
 * The shared scan loop: fingerprint every artifact the walk finds, reuse the
 * cached result for an unchanged one, summarize the rest, and report
 * conversations as they are found.
 *
 * Per-artifact work runs in a bounded pool: a stat or a head read is IO-bound,
 * and doing them one after another made a scan's wall time the sum of
 * thousands of round trips. Entries therefore arrive unordered.
 * @param files - The walk.
 * @param refOf - Locator of the artifact a walked file belongs to (the file
 *   itself, or its session directory); duplicates are scanned once.
 * @param fingerprint - mtime + size of an artifact, undefined when it vanished.
 */
export declare function runScan(files: AsyncIterable<WalkedFile>, refOf: (file: WalkedFile) => string, fingerprint: (ref: string) => Promise<Fingerprint | undefined>, options: ScanOptions | undefined, summarize: (candidate: ScanCandidate) => Promise<ForeignSessionSummary | null>): Promise<ScanEntry[]>;
//# sourceMappingURL=scan-fs.d.ts.map