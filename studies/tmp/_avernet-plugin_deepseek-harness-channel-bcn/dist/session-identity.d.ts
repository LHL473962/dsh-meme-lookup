import { SessionId } from '@deepseek-ai/dsh-session';
export interface BcnSessionIdentityInput {
    sessionKey: string;
    groupId: string;
    bcsSessionId?: string;
}
/**
 * Resolve the BCN identity that owns one DSH conversation.
 *
 * V3 supplies the canonical session explicitly. V2 keeps a group-scoped
 * `session_key`, but carries the concrete non-legacy session in
 * `bcs_group_id`. Frames without either session discriminator retain the
 * historical `session_key` mapping.
 */
export declare function resolveBcnSessionIdentity(input: BcnSessionIdentityInput): string;
/**
 * Convert the resolved BCN identity to a fixed-size DSH Session ID.
 * Keeping this translation isolated lets a later canonical V3-only adapter
 * change the wire selection without touching DSH persistence.
 */
export declare function dshSessionIdForV2(sessionIdentity: string): SessionId;
//# sourceMappingURL=session-identity.d.ts.map