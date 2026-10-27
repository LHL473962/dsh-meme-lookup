import type { CreateAgentOptions } from '@deepseek-ai/dsh-agent';
import type { Session, SessionEvent, SessionId } from '@deepseek-ai/dsh-session';
/**
 * Snapshot of a live Session log, including any fork-inherited prefix.
 * Reuses upstream's frozen cache when the log has not appended.
 * A missing or non-array snapshot is a live Session contract violation.
 */
export declare function snapshotLiveSessionEvents(session: unknown): readonly SessionEvent[];
/**
 * Exclusive log offset (`seq = log.length`). Empty log is 0, not -1, and this
 * is not the last event's seq.
 */
export declare function liveSessionOffset(session: unknown): number;
/**
 * Physical/wire `seedLength` for a live Session: present whenever an exact
 * copied/inherited prefix is marked as seeded, independently of whether the
 * header records `parentSession`. Fresh unseeded sessions omit it.
 * `isSeeded: true` without `inheritedEventCount` is an unknown cut — never
 * coerced to 0.
 */
export declare function liveSessionPhysicalSeedLength(session: unknown): number | undefined;
/** Listing-shaped fields for overlaying a live Session onto the session tree. */
export declare function liveSessionListingFields(session: unknown): {
    readonly id: string | undefined;
    readonly cwd: string | undefined;
    readonly createdAt: number | undefined;
    readonly parentSession: string | undefined;
    readonly origin: string | undefined;
    readonly delegationDepth: number | undefined;
    readonly agentPreset: string | undefined;
    readonly seedLength: number | undefined;
};
/**
 * Copy of the source log through an inclusive event seq. Omitted boundary
 * means the whole log and still rejects an open turn. Never calls
 * `sessions.fork()`.
 */
export declare function sliceLiveSessionSeed(session: unknown, boundary?: number): SessionEvent[];
export interface LiveSessionSeedMetadata {
    readonly meta: {
        readonly seedLength?: number;
        readonly isSeeded?: boolean;
    };
    readonly inheritedEventCount?: number;
}
/**
 * Create-time seed ownership fields. Every copied source prefix is inherited
 * state for domain projections. Copies of an existing conversation also
 * record `parentSession`, so validators can admit ancestor delivery markers.
 * The exact cut distinguishes copied history from child-owned events. Not every
 * projection skips inherited events: newer inbox folds restore pending input
 * from them, so rewind must cancel that work through the child's Inbox API.
 * A child snapshot length cannot reliably be used as the cut because
 * construction may append `session/end-seed`.
 */
export declare function liveSessionSeedMetadata(session: unknown, inheritedCount: number): LiveSessionSeedMetadata;
/** Close an open turn with the `turn/end` shape a real user cancellation writes. */
export declare function appendInterruptedTurnEnd(seed: SessionEvent[], turn: number): void;
/** Close a V3 fork's open inherited turn as child-owned events, after its marker. */
export declare function closeLiveForkTurn(session: Session, turn: number): void;
export interface LiveSessionCreateRequest {
    readonly sessionId: SessionId;
    readonly seed: readonly SessionEvent[];
    /** Live Session whose shape identifies the active upstream runtime line. */
    readonly runtimeSession: unknown;
    readonly inheritedCount: number;
    readonly cwd: string;
    readonly parentSession?: SessionId;
    readonly agentPreset?: string;
    readonly agentOptions: CreateAgentOptions['agentOptions'];
    readonly setup?: CreateAgentOptions['setup'];
}
/**
 * Dual-runtime seed metadata for `agents.create`. The only
 * CreateAgentOptions assertion lives here: rc.2 meta carries `seedLength`,
 * alpha.4 carries `isSeeded` plus top-level `inheritedEventCount`.
 */
export declare function liveSessionCreateOptions(request: LiveSessionCreateRequest): CreateAgentOptions;
//# sourceMappingURL=liveSession.d.ts.map