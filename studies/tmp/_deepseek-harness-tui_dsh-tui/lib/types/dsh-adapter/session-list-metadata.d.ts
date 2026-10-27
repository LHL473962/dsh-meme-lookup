/**
 * Mirror dsh-api-session-controller's sessionListMetadata projection (0.2.0-rc.2).
 * The web sidebar treats a missing row as nonblank, so TUI checkpoints need the
 * same key, stateVersion, schema and fold. verify-session-list-metadata checks
 * the installed host definition for drift.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
export declare const SESSION_LIST_METADATA_KEY = "sessionListMetadata";
export declare const SESSION_LIST_METADATA_STATE_VERSION = 1;
export interface SessionListMetadataState {
    readonly blank: boolean;
    readonly lastPromptAt: number | null;
}
export declare function initSessionListMetadata(): SessionListMetadataState;
/** Match the host fold, including reference identity when neither field changes. */
export declare function applySessionListMetadata(state: SessionListMetadataState, event: SessionEvent): SessionListMetadataState;
/** Register before creating the boot agent, so its first checkpoint has the key. */
export declare function attachSessionListMetadata(ctx: Context): void;
//# sourceMappingURL=session-list-metadata.d.ts.map