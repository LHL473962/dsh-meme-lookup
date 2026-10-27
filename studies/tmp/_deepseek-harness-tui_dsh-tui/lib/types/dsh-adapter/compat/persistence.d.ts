import type { SessionEvent, SessionHeader, SessionId } from '@deepseek-ai/dsh-session';
interface StoredSession {
    readonly meta: SessionHeader;
    readonly events: readonly SessionEvent[];
    readonly inheritedEventCount?: number;
}
/** Read-only persistence seam for legacy services and per-session handles. */
export interface SessionReader {
    load?(id: SessionId): Promise<StoredSession>;
    open?(id: SessionId, access: 'read'): Promise<{
        readonly header: SessionHeader;
        readonly inheritedEventCount?: number;
        read(): Promise<{
            readonly events: readonly SessionEvent[];
        }>;
        close(): Promise<void>;
    }>;
}
export declare function readPersistedSession(source: SessionReader, id: SessionId): Promise<StoredSession>;
export {};
//# sourceMappingURL=persistence.d.ts.map