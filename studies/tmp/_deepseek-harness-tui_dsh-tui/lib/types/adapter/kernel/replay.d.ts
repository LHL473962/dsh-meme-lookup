/**
 * Passive / Replay shadow harness (P2 minimal).
 *
 * - Passive Shadow: `KernelRuntime.detect()` + `descriptorBuild()` already
 *   produce a read-only diagnostic snapshot without registering, subscribing,
 *   or writing. This module does not add a second passive path.
 * - Replay Shadow: this module defines a JSON-friendly replay input and a real
 *   runnable path that feeds isolated mock upstream services into the same
 *   KernelRuntime/driver used by production. It never connects to a real DSH
 *   host and never writes real plugin state.
 *
 * The replay input is intentionally small and line-protocol-free. It records
 * the minimal host facts needed to exercise the new driver: command catalog,
 * service availability, and DecisionEvents vocabulary.
 */
import type { CapabilityLifecycle } from './lifecycle.js';
import type { TuiChannelSnapshot } from '../spec/index.js';
import { type DshSessionProjectionMeta } from '../channel/session-projection.js';
export declare const REPLAY_SCHEMA_VERSION = "tui-adapter-replay/v1";
export declare const REPLAY_CHANNEL_SCHEMA_VERSION = "tui-adapter-channel-replay/v1";
/**
 * Replay method → feature mapping used by the conformance harness.
 *
 * The DSH Channel RFC requires `invoke.method` to correspond to a feature
 * the provider declared. This is the harness-side recognized map for the live
 * channel methods; unknown method names are rejected instead of pretending
 * success.
 */
export declare const CHANNEL_METHOD_FEATURES: Readonly<Record<string, string>>;
export interface ReplayContractRef {
    readonly apiVersion: string;
    readonly kind: string;
}
export interface ReplayCommand {
    readonly name: string;
    readonly description: string;
}
export interface ReplayInput {
    readonly schemaVersion: 'tui-adapter-replay/v1';
    readonly generationId?: string;
    readonly host?: {
        readonly id?: string;
        readonly version?: string;
        readonly legacyContracts?: readonly ReplayContractRef[];
    };
    readonly commands?: readonly ReplayCommand[];
    readonly storage?: boolean;
    readonly messages?: boolean;
    readonly decisionEvents?: readonly string[];
    /** P5: optional real DSH Channel snapshot/transcript replay. */
    readonly channel?: ReplayChannelInput;
}
/** P5 Channel replay input: recorded `tui.dsh/v1alpha1#Channel` snapshots
 * (a real DSH session projection) and optional transcript/event provenance. */
export interface ReplayChannelInput {
    /** Recorded channel snapshots. If omitted, `sessionEvents` must be given. */
    readonly snapshots?: readonly TuiChannelSnapshot[];
    readonly transcript?: readonly unknown[];
    /** Feature set advertised by this recorded Channel provider. */
    readonly features?: readonly string[];
    /** Optional method handlers, for example `commandCompletions` or
     * `runWorkspaceCommand`, exercised during replay. */
    readonly methods?: Readonly<Record<string, (args: readonly unknown[]) => unknown | Promise<unknown>>>;
    /** Optional real DSH session-event source, projected by the harness. */
    readonly sessionEvents?: readonly unknown[];
    readonly sessionMeta?: DshSessionProjectionMeta;
    /** Which declared method to invoke, if any. */
    readonly invokeMethod?: string;
}
export interface ReplayChannelReport {
    readonly ok: boolean;
    readonly schemaVersion: string;
    readonly channelId: string;
    readonly wireRevision: number;
    readonly versions: readonly number[];
    readonly features: readonly string[];
    readonly transcriptCount: number;
    readonly continuityErrors: readonly string[];
    readonly openVersion: number;
    readonly invokeValueDefined: boolean;
    readonly closed: boolean;
    /** 'dsh-session-events' when snapshots were projected from real DSH events. */
    readonly source: 'snapshots' | 'dsh-session-events';
    readonly sessionEventCount: number;
    readonly featureErrors: readonly string[];
    readonly methodErrors: readonly string[];
}
export interface ReplayReport {
    readonly ok: boolean;
    readonly schemaVersion: string;
    readonly generationId: string;
    readonly mode: 'replay-shadow';
    readonly kernelContracts: readonly string[];
    readonly legacyContracts: readonly string[];
    readonly missing: readonly string[];
    readonly extra: readonly string[];
    readonly matched: readonly string[];
    readonly lifecycles: readonly CapabilityLifecycle[];
    readonly dropped: readonly string[];
    readonly warnings: readonly string[];
    readonly channel?: ReplayChannelReport;
}
export declare class ReplayHarnessError extends Error {
    constructor(message: string);
}
/** Isolated host-context stub backed entirely by the replay input. */
export declare function createReplayContext(input: ReplayInput): unknown;
/**
 * Run a real DSH session snapshot/transcript Channel replay through the
 * protocol Provider/Consumer pair.
 *
 * This path validates the full `tui.dsh/v1alpha1#Channel` envelope:
 * - `open` returns a validated complete snapshot;
 * - `subscribe` streams every recorded snapshot (> afterVersion) in order;
 * - `invoke` accepts JSON arguments, returns a JSON result and always
 *   includes the latest validated snapshot;
 * - `close` acknowledges closure;
 * - monotonic version/wire-revision continuity is checked by the consumer.
 */
export declare function runChannelReplay(input: ReplayChannelInput): Promise<ReplayChannelReport>;
/**
 * Run an isolated replay-shadow comparison through the production KernelRuntime
 * and host-descriptor driver.
 *
 * This is fail-closed: malformed replay input or an unavailable schema aborts
 * with `ReplayHarnessError` rather than silently falling back to a legacy view.
 */
export declare function runReplayShadow(input: ReplayInput): Promise<ReplayReport>;
/** Convenience for the production fail-closed check: a real host cannot run
 * replay-shadow without an explicit isolated replay input. */
export declare function assertReplayShadowProductionUnavailable(): never;
//# sourceMappingURL=replay.d.ts.map