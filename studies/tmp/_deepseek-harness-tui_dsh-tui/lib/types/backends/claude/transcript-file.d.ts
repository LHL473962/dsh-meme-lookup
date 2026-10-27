import { type JsonRecord } from '../shared/jsonl.js';
/** The largest transcript file read (larger is refused). */
export declare const MAX_TRANSCRIPT_BYTES: number;
/** Entries one older slice carries at most (extended back to a prompt). */
export declare const MAX_SLICE_ENTRIES = 1000;
/** The CLI's config directory for an environment. */
export declare function claudeConfigDir(env: Readonly<Record<string, string | undefined>>): string;
/**
 * Find `<sessionId>.jsonl` under `<configDir>/projects/*` (the most recently
 * written one if several project directories hold it).
 */
export declare function locateClaudeTranscript(sessionId: string, configDir: string): string | undefined;
/** Every entry of a transcript file (bounded; malformed lines skipped). */
export declare function readTranscriptEntries(path: string, maxBytes?: number): {
    readonly entries: readonly JsonRecord[];
    readonly badLines: number;
};
/** Whether an entry is a compaction boundary. */
export declare function isCompactBoundary(entry: JsonRecord | undefined): boolean;
/** The uuids a boundary preserved, oldest first. */
export declare function preservedUuids(boundary: JsonRecord, byUuid: ReadonlyMap<string, JsonRecord>): string[];
/** Where the next older slice ends (exclusive of what is already shown). */
export interface OlderCursor {
    /** The newest entry of the next slice. */
    readonly end: string;
    /** Entries the newer view already shows (a boundary's preserved ones). */
    readonly exclude: ReadonlySet<string>;
}
/** The cursor before the boundary a view starts at. */
export declare function cursorBefore(boundary: JsonRecord, byUuid: ReadonlyMap<string, JsonRecord>): OlderCursor | undefined;
/** The newest compaction boundary a view starting at `head` began with. */
export declare function headBoundary(entries: readonly JsonRecord[], byUuid: ReadonlyMap<string, JsonRecord>, head: string | undefined): JsonRecord | undefined;
/**
 * One older slice: the entries (oldest first) the replay paints, and the
 * cursor of the slice before it (undefined: this was the oldest).
 */
export declare function olderSlice(byUuid: ReadonlyMap<string, JsonRecord>, cursor: OlderCursor, limit?: number): {
    readonly entries: readonly JsonRecord[];
    readonly next?: OlderCursor;
};
//# sourceMappingURL=transcript-file.d.ts.map