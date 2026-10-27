import { Context } from '@deepseek-ai/cordis';
import { FileSystem, FsTarget, FsInfo, FsPathInfo, FsDirEntry, FsWriteIntent, FsWriteOutcome, FsEditRequest, FsVersion, FsEditOutcome } from '@deepseek-ai/dsh-fs';

type SandboxPolicy = Parameters<FileSystem['writeText']>[4];
/** Configuration for the mirage filesystem backend. */
interface MirageFsConfig {
    /** Virtual base directory for relative paths. Defaults to `/`. */
    cwd?: string;
    /**
     * Read and write as this named workspace session, so the profile
     * that confines the session's shell confines its file tools too. The
     * workspace's default session otherwise.
     */
    sessionId?: string;
    /** Exclusive byte limit on each overwrite-diff side. Defaults to 10 MiB. */
    diffBasisMaxBytes?: number;
}
/**
 * Mirage-backed implementation of `ctx.fs`. Targets are canonical virtual
 * paths (namespace symlinks followed), every operation walks the workspace
 * dispatcher — session grants, admission policies, cache read-through and
 * post-write invalidation all fire exactly as they do for a shell command —
 * and `processPath` answers in the same virtual path space the mirage shell
 * executes in, so the two providers share one execution world.
 *
 * One limit worth stating: mirage's `ws.vfs` takes no `AbortSignal`, so
 * cancellation is honored at this adapter's own boundaries (before a
 * dispatch, between listing entries) and not inside a single op. A long
 * read from a remote backend therefore runs to completion after the
 * signal fires, and the caller learns of the abort when it returns.
 */
declare class MirageFileSystem extends FileSystem {
    static readonly inject: string[];
    private fsOps;
    private readonly cwd;
    private readonly sessionId;
    private readonly diffBasisMaxBytes;
    private readonly locks;
    constructor(ctx: Context, config?: MirageFsConfig);
    private files;
    /**
     * The namespace as the session this adapter's ops run as sees it: the
     * dispatcher's reader, so a link the session cannot see is never followed
     * (the typed path reaches the dispatcher and is refused as absent, not
     * resolved to the visible target it points at), and never listed.
     */
    private get reader();
    /**
     * The same confinement claim `MirageShellExecutor` makes, off the same
     * fact and for the same reason: with every runtime reaching only the
     * vfs, a mutation cannot land anywhere but a mount, under its mode.
     *
     * The two seams sit over one world, so answering differently here
     * would let dsh fence a bash write and wave an identical `ctx.fs`
     * write straight through.
     */
    get sandboxMode(): FileSystem['sandboxMode'];
    /**
     * Refuse a mutation the call's sandbox policy does not allow.
     *
     * `workspaceRoot` is deliberately not consulted: it is a directory on
     * the harness's own machine, so containment against it says nothing
     * about this world. The mounts and their modes are the boundary, and
     * `read-only` is the one mode that narrows them further. Wording and
     * code mirror `dsh-fs-sandbox`, so the tool layer renders one denial
     * marker whichever backend refused.
     *
     * @param policy the per-call policy, absent for an unguarded mutation.
     * @param displayPath the path to name in the refusal.
     */
    private assertMutable;
    /**
     * The base a relative path resolves against.
     *
     * dsh hands `ctx.fs` either the calling session's cwd or the sandbox
     * policy's workspace root, and both are directories on the harness's
     * own machine that name nothing here. Resolving `notes.txt` against
     * one yields `/Users/.../notes.txt`, which every read then reports as
     * absent. So a base that is not a directory in this world falls back
     * to the configured one, the same rule the shell executor applies to
     * a workdir.
     *
     * An absolute path ignores its base, so it never pays for the probe.
     *
     * @param path the path being resolved.
     * @param cwd the caller's base, if any.
     * @returns the base to resolve against.
     */
    private resolveBase;
    private normalize;
    private follow;
    private withLock;
    resolve(path: string, opts?: {
        cwd?: string;
        signal?: AbortSignal;
    }): Promise<FsTarget>;
    processPath(target: FsTarget): string;
    /**
     * The workspace path naming the same file as `hostPath`, when a mount
     * puts one there.
     *
     * Most of this world has no host spelling at all: an S3 key, a Slack
     * message and a Notion row are not files the harness could open, and
     * claiming otherwise would hand the caller a path that reads as the
     * wrong bytes. A disk mount is the one place the two worlds hold the
     * same file, so it is the one place a host path is answerable; every
     * other mount declines, and so does a workspace still building.
     *
     * @param hostPath absolute path in the harness host filesystem.
     * @returns the virtual path for the same file, or undefined when no
     *   mount maps it.
     */
    processPathFromHostPath(hostPath: string): string | undefined;
    fileUrl(target: FsTarget): string;
    contains(parent: FsTarget, child: FsTarget): boolean;
    stat(target: FsTarget, signal?: AbortSignal): Promise<FsInfo | undefined>;
    lstat(path: string, opts?: {
        cwd?: string;
    }, signal?: AbortSignal): Promise<FsPathInfo | undefined>;
    readText(target: FsTarget, signal?: AbortSignal): Promise<string>;
    streamText(target: FsTarget, signal?: AbortSignal): Promise<AsyncIterable<string>>;
    /**
     * Stat a read target and refuse anything that is not a regular file.
     *
     * A backend read of a directory key surfaces as a missing path, which
     * would report a path that plainly exists as absent.
     *
     * @param target the resolved target about to be read.
     * @param signal aborts the stat.
     * @returns the stat row, or undefined when the mount reports none.
     */
    private statRegularFile;
    readBytes(target: FsTarget, signal: AbortSignal | undefined, maxBytes: number): Promise<Uint8Array>;
    readByteRange(target: FsTarget, range: {
        offset: number;
        length: number;
    }, signal?: AbortSignal): Promise<Uint8Array>;
    listDir(target: FsTarget, signal?: AbortSignal): Promise<FsDirEntry[]>;
    private dirEntry;
    writeText(target: FsTarget, content: string, expected?: FsWriteIntent, signal?: AbortSignal, sandboxPolicy?: SandboxPolicy): Promise<FsWriteOutcome>;
    private diffBasis;
    private versionAfterWrite;
    editText(target: FsTarget, edit: FsEditRequest, expected?: {
        version: FsVersion;
    }, signal?: AbortSignal, sandboxPolicy?: SandboxPolicy): Promise<FsEditOutcome>;
}

export { MirageFileSystem as M, type MirageFsConfig as a };
