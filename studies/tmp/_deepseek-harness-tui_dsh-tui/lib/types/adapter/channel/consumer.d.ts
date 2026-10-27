/**
 * TUI Channel Consumer (P5).
 *
 * A Channel Consumer owns the visible terminal side of
 * `tui.dsh/v1alpha1#Channel`. This module is the conformance-facing client:
 * it opens a provider, subscribes to snapshots, enforces monotonic versions
 * and full-snapshot continuity, invokes JSON-value methods, and closes the
 * channel. It never interprets provider business methods itself.
 *
 * Continuity violations are fail-closed by default: the consumer throws
 * instead of silently retaining a discontinuous snapshot.
 */
import type { TuiChannelInvokeOutput, TuiChannelSnapshot } from '../spec/index.js';
import type { ChannelProvider, ChannelProviderOpenInput } from './provider.js';
export interface ChannelConsumerOptions {
    /** When true (default), a continuity violation throws immediately and the
     * discontinuous snapshot is not retained. */
    readonly failClosed?: boolean;
}
export interface ChannelConsumer {
    open(input: ChannelProviderOpenInput): Promise<TuiChannelSnapshot>;
    subscribe(channelId: string, afterVersion: number, listener: (snapshot: TuiChannelSnapshot) => void): Promise<() => void>;
    invoke(channelId: string, method: string, args: readonly unknown[]): Promise<TuiChannelInvokeOutput>;
    close(channelId: string): Promise<{
        readonly closed: true;
    }>;
    lastSnapshot(): TuiChannelSnapshot | undefined;
    /** Version continuity failures observed while consuming (gap/backwards/
     * wire-revision change). A conformant replay must keep this empty. */
    continuityErrors(): readonly string[];
}
/** Wrap a Channel Provider with the consumer-side protocol envelope checks. */
export declare function createChannelConsumer(provider: ChannelProvider, options?: ChannelConsumerOptions): ChannelConsumer;
//# sourceMappingURL=consumer.d.ts.map