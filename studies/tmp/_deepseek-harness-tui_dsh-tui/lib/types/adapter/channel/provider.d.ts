/**
 * TUI Channel Provider (P5).
 *
 * A Channel Provider owns the Agent/Session/Workspace side of
 * `tui.dsh/v1alpha1#Channel`. This module implements an in-memory replay
 * provider used by the replay harness: it does not attach to a real DSH
 * service, but it follows the protocol envelope (open/subscribe/invoke/
 * close), validates inputs/outputs, preserves monotonic channel versions,
 * and can be driven from a real recorded DSH session snapshot/transcript.
 *
 * The replay provider is intentionally protocol-envelope focused:
 * - unknown methods are rejected (never treated as a successful no-op);
 * - feature/support validation happens in the replay harness, not here;
 * - values are bounded in size/depth and deep-frozen before being handed out;
 * - method handlers only run inside the harness-provided replay isolation.
 */
import type { TuiChannelInvokeOutput, TuiChannelSnapshot } from '../spec/index.js';
export interface ChannelProviderOpenInput {
    readonly workspace?: string;
    readonly sessionId?: string;
    readonly options?: unknown;
}
export interface ChannelProvider {
    open(input: ChannelProviderOpenInput): Promise<TuiChannelSnapshot>;
    subscribe(channelId: string, afterVersion: number, listener: (snapshot: TuiChannelSnapshot) => void): Promise<() => void>;
    invoke(channelId: string, method: string, args: readonly unknown[]): Promise<TuiChannelInvokeOutput>;
    close(channelId: string): Promise<{
        readonly closed: true;
    }>;
}
export interface ReplayChannelSnapshotSource {
    /** Monotonic snapshots, oldest first. The provider serves the latest
     * snapshot from `open` and replays newer snapshots through `subscribe`. */
    readonly snapshots: readonly TuiChannelSnapshot[];
    /** Optional transcript/event log carried alongside the snapshots. It is
     * not interpreted by the provider; it exists for replay provenance and
     * for conformance report details. */
    readonly transcript?: readonly unknown[];
    /** Optional method invocation handlers. Unknown methods are rejected with
     * `FEATURE_UNAVAILABLE` (or `INVALID_ARGUMENT` for malformed input). */
    readonly methods?: Readonly<Record<string, (args: readonly unknown[]) => unknown | Promise<unknown>>>;
}
/** Safety bound for replay JSON payloads. */
export declare const REPLAY_JSON_MAX_BYTES: number;
/** Safety bound for replay JSON nesting depth. */
export declare const REPLAY_JSON_MAX_DEPTH = 64;
/** Create an isolated replay Channel Provider over recorded snapshots. */
export declare function createReplayChannelProvider(source: ReplayChannelSnapshotSource): ChannelProvider;
/** Convenience provider over one snapshot (common replay fixture). */
export declare function createReplayChannelProviderFromSnapshot(snapshot: TuiChannelSnapshot, transcript?: readonly unknown[]): ChannelProvider;
export declare const REPLAY_CHANNEL_WIRE_REVISION: 6;
//# sourceMappingURL=provider.d.ts.map