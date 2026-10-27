/**
 * Minimal real DSH session-event → TuiChannelSnapshot projection.
 *
 * This is the P5 "real DSH replay" bridge: instead of only counting a
 * transcript, it reads `agent.session.events`-shaped records and projects the
 * visible rows/status into protocol-envelope `TuiChannelSnapshot` objects.
 *
 * It intentionally stays small and does not copy the full production
 * `src/dsh-adapter/channel.ts` projection (which is still the live Channel
 * implementation source). It is a durable-session *minimal transcript
 * replay* projection used by the harness and documentation, not a complete
 * RFC 0007 TUI Channel state projection.
 *
 * Unknown event types are fail-closed unless the event marks itself
 * top-level `ignorable: true`, so a newer required DSH event cannot be
 * silently skipped. Prefix-based recognition is deliberately not used.
 */
import type { TuiChannelSnapshot } from '../spec/index.js';
export interface DshSessionProjectionMeta {
    readonly channelId: string;
    readonly sessionTitle?: string;
    readonly homeDir?: string;
    readonly pathCaseInsensitive?: boolean;
    /** Optional RFC-adjacent Channel state fields carried through when known. */
    readonly model?: string;
    readonly mode?: string;
    readonly agentPreset?: string;
    readonly settingsSections?: readonly unknown[];
    readonly scene?: unknown;
    readonly diagnostic?: unknown;
    readonly trace?: readonly unknown[];
    readonly context?: unknown;
    readonly pending?: readonly unknown[];
}
export declare class DshSessionProjectionError extends Error {
    constructor(message: string);
}
/**
 * Explicit DSH session event types this minimal projection recognizes.
 *
 * This is NOT a prefix list: `user/unknown-required` is not recognized unless
 * the exact type is present. Unknown types must be marked top-level
 * `ignorable: true` to be skipped.
 */
export declare const KNOWN_DSH_EVENT_TYPES: Set<string>;
/**
 * Project DSH session events to strictly-increasing channel snapshots.
 *
 * The returned snapshots are plain JSON-safe objects suitable for
 * `createReplayChannelProvider`. If `events` is empty, one initial snapshot
 * is returned so a replay can still open/subscribe cleanly.
 *
 * Unknown non-ignorable event types cause a `DshSessionProjectionError`.
 */
export declare function projectDshSessionEventsToSnapshots(events: readonly unknown[], meta: DshSessionProjectionMeta): readonly TuiChannelSnapshot[];
//# sourceMappingURL=session-projection.d.ts.map