import { type FileCandidate } from '../../utils/fileSuggestions.js';
import type { FileSuggestionFs } from './types.js';
/** Trailing path segment (`C:/a/b` → `b`). */
export declare function basename(path: string): string;
/** Normalize a cwd for comparison: forward slashes, no trailing slash; case
 *  folded when the platform's filesystem semantics are case-insensitive. */
export declare function normalizeCwd(path: string, caseInsensitive: boolean): string;
/**
 * `/resume` project filter (issue #96): exact cwd match, PLUS sessions
 * recorded in a subdirectory — pre-upgrade launches recorded the launch
 * subdirectory as the header cwd, and with the cwd default now resolving to
 * the git worktree root an exact match would hide those sessions forever.
 * They belong to the same workspace, so they stay listed. Comparison follows
 * the platform's filesystem semantics (case-insensitive on Windows — a
 * pre-upgrade header may record `C:\Repo` where the current launch resolves
 * `c:\repo`). `caseInsensitive` is a parameter (not a platform read) so the
 * verifier can exercise both modes on any host. Exported for
 * scripts/verify-session-cwd.mjs.
 *
 * Boundary rule (issue #153): container directories are nobody's workspace.
 * $HOME and the Windows root forms — plain drive roots (`C:`), UNC share
 * roots (`//server/share`), and extended-length roots (`//?/C:`,
 * `//?/UNC/server/share`) — are ancestors of unrelated projects, so the
 * descendant rules below would list every session on the machine from `~`
 * (and every session on the drive/share from those roots). At these
 * boundaries, in either direction, only an exact match passes.
 */
export declare function sessionCwdMatches(stateCwd: string, headerCwd: string, caseInsensitive?: boolean): boolean;
export declare function listPathCandidates(fs: FileSuggestionFs, cwd: string, query: string, signal: AbortSignal | undefined, topK: number): Promise<FileCandidate[]>;
export declare function listFilesDeepCandidates(fs: FileSuggestionFs | undefined, root: string, signal?: AbortSignal): Promise<FileCandidate[]>;
//# sourceMappingURL=paths.d.ts.map