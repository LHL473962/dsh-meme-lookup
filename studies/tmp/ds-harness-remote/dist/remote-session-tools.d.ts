import { z } from 'zod';
import type { ConnectedRemote } from './client-runtime-contract.js';
declare const session: z.ZodObject<{
    hostId: z.ZodString;
    backend: z.ZodLiteral<"harness">;
    workspaceId: z.ZodString;
} & {
    sessionId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    backend: "harness";
    sessionId: string;
    workspaceId: string;
    hostId: string;
}, {
    backend: "harness";
    sessionId: string;
    workspaceId: string;
    hostId: string;
}>;
export declare const sessionToolInputs: {
    remote_upload_file: z.ZodObject<{
        hostId: z.ZodString;
        backend: z.ZodLiteral<"harness">;
        workspaceId: z.ZodString;
    } & {
        sessionId: z.ZodString;
    } & {
        operationId: z.ZodString;
        localPath: z.ZodEffects<z.ZodString, string, string>;
        name: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strict", z.ZodTypeAny, {
        backend: "harness";
        sessionId: string;
        workspaceId: string;
        hostId: string;
        operationId: string;
        localPath: string;
        name?: string | undefined;
    }, {
        backend: "harness";
        sessionId: string;
        workspaceId: string;
        hostId: string;
        operationId: string;
        localPath: string;
        name?: string | undefined;
    }>;
    remote_download_file: z.ZodObject<{
        hostId: z.ZodString;
        backend: z.ZodLiteral<"harness">;
        workspaceId: z.ZodString;
    } & {
        sessionId: z.ZodString;
    } & {
        path: z.ZodEffects<z.ZodString, string, string>;
    }, "strict", z.ZodTypeAny, {
        backend: "harness";
        sessionId: string;
        path: string;
        workspaceId: string;
        hostId: string;
    }, {
        backend: "harness";
        sessionId: string;
        path: string;
        workspaceId: string;
        hostId: string;
    }>;
    remote_list_sessions: z.ZodObject<{
        hostId: z.ZodString;
        backend: z.ZodLiteral<"harness">;
        workspaceId: z.ZodString;
    } & {
        offset: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        backend: "harness";
        workspaceId: string;
        limit: number;
        offset: number;
        hostId: string;
    }, {
        backend: "harness";
        workspaceId: string;
        hostId: string;
        limit?: number | undefined;
        offset?: number | undefined;
    }>;
    remote_read_session: z.ZodObject<{
        hostId: z.ZodString;
        backend: z.ZodLiteral<"harness">;
        workspaceId: z.ZodString;
    } & {
        sessionId: z.ZodString;
    } & {
        cursor: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            throughSeq: z.ZodNumber;
            beforeSeq: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            beforeSeq: number;
            throughSeq: number;
        }, {
            beforeSeq: number;
            throughSeq: number;
        }>, {
            beforeSeq: number;
            throughSeq: number;
        }, {
            beforeSeq: number;
            throughSeq: number;
        }>>;
        maxMessages: z.ZodDefault<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        backend: "harness";
        sessionId: string;
        workspaceId: string;
        maxMessages: number;
        hostId: string;
        cursor?: {
            beforeSeq: number;
            throughSeq: number;
        } | undefined;
    }, {
        backend: "harness";
        sessionId: string;
        workspaceId: string;
        hostId: string;
        cursor?: {
            beforeSeq: number;
            throughSeq: number;
        } | undefined;
        maxMessages?: number | undefined;
    }>;
    remote_create_session: z.ZodObject<{
        hostId: z.ZodString;
        backend: z.ZodLiteral<"harness">;
        workspaceId: z.ZodString;
    } & {
        operationId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        backend: "harness";
        workspaceId: string;
        hostId: string;
        operationId: string;
    }, {
        backend: "harness";
        workspaceId: string;
        hostId: string;
        operationId: string;
    }>;
    remote_send_message: z.ZodObject<{
        hostId: z.ZodString;
        backend: z.ZodLiteral<"harness">;
        workspaceId: z.ZodString;
    } & {
        sessionId: z.ZodString;
    } & {
        operationId: z.ZodString;
        message: z.ZodEffects<z.ZodString, string, string>;
    }, "strict", z.ZodTypeAny, {
        backend: "harness";
        sessionId: string;
        message: string;
        workspaceId: string;
        hostId: string;
        operationId: string;
    }, {
        backend: "harness";
        sessionId: string;
        message: string;
        workspaceId: string;
        hostId: string;
        operationId: string;
    }>;
    remote_interrupt_session: z.ZodObject<{
        hostId: z.ZodString;
        backend: z.ZodLiteral<"harness">;
        workspaceId: z.ZodString;
    } & {
        sessionId: z.ZodString;
    } & {
        operationId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        backend: "harness";
        sessionId: string;
        workspaceId: string;
        hostId: string;
        operationId: string;
    }, {
        backend: "harness";
        sessionId: string;
        workspaceId: string;
        hostId: string;
        operationId: string;
    }>;
    remote_wait_sessions: z.ZodObject<{
        targets: z.ZodArray<z.ZodObject<{
            hostId: z.ZodString;
            backend: z.ZodLiteral<"harness">;
            workspaceId: z.ZodString;
        } & {
            sessionId: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            backend: "harness";
            sessionId: string;
            workspaceId: string;
            hostId: string;
        }, {
            backend: "harness";
            sessionId: string;
            workspaceId: string;
            hostId: string;
        }>, "many">;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        timeoutMs: number;
        targets: {
            backend: "harness";
            sessionId: string;
            workspaceId: string;
            hostId: string;
        }[];
    }, {
        targets: {
            backend: "harness";
            sessionId: string;
            workspaceId: string;
            hostId: string;
        }[];
        timeoutMs?: number | undefined;
    }>;
    remote_get_operation: z.ZodObject<{
        operationId: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        operationId: string;
    }, {
        operationId: string;
    }>;
};
export type SessionToolOperation = keyof typeof sessionToolInputs;
export type SessionTarget = z.infer<typeof session>;
export type RemoteToolConnection = <T>(hostId: string, signal: AbortSignal, query: (remote: ConnectedRemote, signal: AbortSignal) => Promise<T>) => Promise<T>;
export declare class RemoteSessionToolError extends Error {
}
/** Fixed native operations over the existing carrier. No alternate Harness wire API. */
export declare class RemoteSessionTools {
    private readonly connect;
    private readonly ledger;
    private generation;
    constructor(connect: RemoteToolConnection);
    invalidate(): void;
    run(operation: SessionToolOperation, input: unknown, signal: AbortSignal): Promise<unknown>;
    private execute;
    private onHost;
    private requireWorkspace;
    private catalog;
    private requireSession;
    private mutate;
    private wait;
}
export {};
//# sourceMappingURL=remote-session-tools.d.ts.map