import type { BackgroundJobOutputChannel, BackgroundJobStatus, BackgroundJobState } from '../adapter/ports/channel-view.js';
export type { BackgroundJobOutputChannel, BackgroundJobOutputLine, BackgroundJobStatus, BackgroundJobState, JobTimelineEvent } from '../adapter/ports/channel-view.js';
/**
 * Structural mirror of the registry's `JobSnapshot` — only the fields the
 * UI reads. Declared locally so no `@deepseek-ai/dsh-jobs` dependency (peer
 * range churn) is introduced; the harness service satisfies this shape.
 */
export interface BackgroundJobSnapshot {
    /** Registry-issued id (`<kind>-N`, e.g. `pwsh-3`). */
    id: string;
    /** Producer kind (`bash`, `pwsh`, `subagent`, `pty-send`, …). */
    kind: string;
    /** One-line label — the command or delegation description. */
    label: string;
    status: BackgroundJobStatus;
    /** Kind-specific status detail, usually terminal ('exit code: 0'). */
    detail?: string;
    /** Live producer progress line (`3/10`, phase name); cleared at settle. */
    progress?: string;
    /** Epoch ms when the job was registered. */
    startedAt: number;
    /** Epoch ms when the job settled; absent while running/stopping. */
    finishedAt?: number;
    /** Output-ring facts when the snapshot came from the real registry:
     *  `total`/`earliest` are absolute byte coordinates; `spillPaths` name
     *  producer-retained files holding the complete stream. */
    output?: {
        total: number;
        earliest: number;
        spillPaths?: readonly string[];
    };
}
/** Kernel `output` event: no payload — observers pull `readAt` themselves. */
export interface KernelJobOutputEvent {
    type: 'output';
    id: string;
    owner?: string;
    total: number;
}
/** Kernel lifecycle event carrying the committed job projection. */
export interface KernelJobLifecycleEvent {
    type: 'registered' | 'progress' | 'stopping' | 'settled' | 'removed';
    job: BackgroundJobSnapshot;
    /** Settlement extras (`settled` only): who ended it, whether a waiter
     *  had already collected it (the UI skips duplicate toasts then). */
    cause?: 'producer' | 'kill' | 'teardown';
    awaited?: boolean;
}
export type KernelJobEvent = KernelJobOutputEvent | KernelJobLifecycleEvent;
/** One kernel output-ring chunk at an absolute byte offset. */
export interface KernelJobChunk {
    at: number;
    text: string;
    channel?: BackgroundJobOutputChannel;
    gapBefore?: true;
}
/** Non-consuming ring read result; `next` is the resume offset. */
export interface KernelJobOutputRead {
    chunks: readonly KernelJobChunk[];
    next: number;
    lossy?: boolean;
}
/**
 * Duck-typed registry surface the channel consumes. `caller` is the owning
 * session id string (`Agent.id`): the kernel fence compares
 * `job.owner.id === caller`, so passing the Agent OBJECT matches nothing —
 * the id string is the only value that opens owned jobs.
 */
export interface JobsRuntime {
    /** Caller-owned + unowned job snapshots in registration order. */
    list(caller?: string): BackgroundJobSnapshot[];
    /** Request cancellation by id; resolves to 'requested'/'already-finished'. */
    kill(id: string, caller?: string, reason?: string): unknown;
    /**
     * Kernel event bus (the real `JobRegistry.events` surface). Present on
     * modern kernels: lifecycle events re-read the roster, `output` events
     * pull `readAt` increments with the UI's own byte cursor. Absent on older
     * kernels and test doubles — the mirror falls back to `onJobsChanged` +
     * `job_output` tails.
     */
    events?: {
        subscribe(filter: {
            owner?: string;
            owners?: 'all' | 'scope';
        }, listener: (event: KernelJobEvent) => void): () => void;
    };
    /** Non-consuming ring read at an absolute byte offset (kernel `readAt`). */
    readAt?(id: string, from: number, caller?: string): KernelJobOutputRead;
    /** Legacy push hooks; absent on the real registry, kept for old doubles. */
    onJobsChanged?(listener: (owner: unknown) => void): () => void;
    onJobDone?(listener: (snapshot: BackgroundJobSnapshot, owner: unknown) => void): () => void;
}
/** Store event hooks the channel injects (toast on settle, emit on change). */
export interface BackgroundJobEvents {
    /** A job the store knew live just settled (or vanished mid-flight). */
    onSettled?(job: BackgroundJobState): void;
    /** The visible set changed; the channel syncs rows and emits. */
    onChanged?(): void;
}
/** Total tracked jobs kept (running plus most recent terminal ones). */
export declare const JOBS_MAX_TRACKED = 40;
/** Output tail lines retained per job (the card waterfall shows the last 3;
 *  the /jobs panel detail shows the whole retained tail). */
export declare const JOBS_MAX_OUTPUT_LINES = 30;
/** Timeline events retained per job: the /jobs detail renders the latest
 *  slice; older observations are dropped, never re-derived. */
export declare const JOBS_MAX_TIMELINE = 40;
export declare class BackgroundJobStore {
    private readonly events;
    private readonly jobs;
    /** Kernel-ring read state per job id (own cursor — never the model's). */
    private readonly kernelReads;
    /** Commands captured from start acks that arrived before the registry
     *  registered the job (the tool/result stream and the registry commit can
     *  race); consumed on registration. */
    private readonly pendingCommands;
    constructor(events?: BackgroundJobEvents);
    /**
     * Diff a fresh `list()` against the tracked set: register new jobs, fold
     * status/detail transitions, and fire `onSettled` for live→terminal moves.
     * Jobs that vanish while live were teardown-cancelled (session swap /
     * owner disposal) and are frozen as `killed` and KEPT as recent history —
     * their transcript rows freeze at a sensible terminal state instead of
     * ticking on, and the panel keeps them alongside other finished work
     * (the tracked bound below trims the oldest terminals).
     */
    replace(snapshots: readonly BackgroundJobSnapshot[]): void;
    /**
     * Record the full command that started a job, captured from its tool
     * call's args via the `started background job <id>` ack. May arrive
     * before the registry registers the job — the command is parked and
     * consumed by the next replace().
     */
    onStarted(id: string, command: string): void;
    /**
     * Mirror the tail of a `job_output` tool result for one job. Appends
     * non-empty lines (excluding the tool's `[status: …]` suffix) and keeps
     * the bounded tail. This is the ONLY output feed — the registry's read is
     * consuming and reserved for the owning agent.
     * @param at - wall-clock receipt time of the read (defaults to now).
     */
    onOutputSeen(id: string, text: string, at?: number): void;
    /**
     * Seed the kernel-ring cursor for one job at its retained head. Called from
     * replace() whenever a snapshot carries ring facts — before any output
     * pull — so the first readAt starts at `earliest`, never at 0 (bytes
     * before `earliest` are already evicted).
     */
    private seedKernelRead;
    /**
     * Pull one non-consuming increment from the kernel ring after an `output`
     * event. Chunks split into lines; a chunk without a trailing newline parks
     * its tail until the next pull (producers append streaming bytes, so line
     * boundaries routinely straddle chunks). `gapBefore`/`lossy` mark bytes
     * lost before the retained tail — surfaced as the dropped banner.
     */
    onKernelOutput(id: string, read: KernelJobOutputRead, at?: number): void;
    /** Kernel read state accessor for tests and cursor diagnostics. */
    kernelCursorOf(id: string): number | undefined;
    /** A fresh snapshot in registration order (newest tracked job last). */
    snapshot(): readonly BackgroundJobState[];
    get(id: string): BackgroundJobState | undefined;
    /**
     * Drop one job's record after the registry announced `removed` — a caller
     * collected the terminal state through its own wait and never handed the id
     * to the model (the shell tool's foreground command). The record left the
     * registry's visible set, so it leaves ours too; `reset()` is the bulk form.
     */
    drop(id: string): void;
    /** Jobs still alive (running or being stopped). */
    runningCount(): number;
    /** Drop everything (session swap / transcript wipe). */
    reset(): void;
}
export { formatJobDuration } from '../channel/job-format.js';
//# sourceMappingURL=jobs.d.ts.map