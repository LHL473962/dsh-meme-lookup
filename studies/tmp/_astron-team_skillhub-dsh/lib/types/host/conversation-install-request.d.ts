import { z } from 'zod';
/** A historical choice must retain its Host-issued reference, never fall back to coordinates. */
export declare const conversationInstallRequest: z.ZodUnion<readonly [z.ZodObject<{
    selectionRef: z.ZodString;
    scope: z.ZodOptional<z.ZodEnum<{
        user: "user";
        project: "project";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    namespace: z.ZodString;
    slug: z.ZodString;
    scope: z.ZodOptional<z.ZodEnum<{
        user: "user";
        project: "project";
    }>>;
}, z.core.$strict>]>;
export type ConversationInstallRequest = z.infer<typeof conversationInstallRequest>;
declare const invocation: z.ZodObject<{
    hostInstanceId: z.ZodUUID;
    sessionId: z.ZodString;
    callId: z.ZodString;
}, z.core.$strict>;
/** UUID v5 in the persistent Host namespace; request parameters are checked separately by the journal. */
export declare function conversationInstallKey(context: z.infer<typeof invocation>): string;
/** A choice awaiting UI confirmation is not an accepted operation or a fingerprint lock. */
export interface PendingConversationInstall {
    schemaVersion: 1;
    kind: 'skillhub-install';
    status: 'awaiting-confirmation';
    toolCallId: string;
    selectionRef: string;
    namespace: string;
    slug: string;
    version: string;
    sourceLabel: string;
    sourceRevision: string;
    createdAt: string;
}
/** No installation was submitted after a human declined or skipped the scope question. */
export interface CancelledConversationInstall {
    schemaVersion: 1;
    kind: 'skillhub-install';
    status: 'cancelled';
    toolCallId: string;
}
export {};
