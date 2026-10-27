/** Selection, Preset, approval, and completed-tool observation for the novel workbench. */
import type { SessionId, WorkspaceId } from '@deepseek-ai/dsh-client-runtime/client';
import type { NovelWorkbenchController } from './workbench-store.ts';
interface Observable<T> {
    getSnapshot(): T;
    subscribe(listener: () => void): () => void;
}
interface ConversationNodeView {
    readonly kind: string;
    readonly seq: number;
    readonly call?: {
        readonly name: string;
        readonly argsRaw?: string;
    } | null;
    readonly isError?: boolean;
    readonly error?: {
        readonly code: string;
    };
    readonly meta?: unknown;
    readonly content?: readonly {
        readonly type: string;
        readonly text?: string;
    }[];
}
interface ConversationQueueMessageView {
    readonly text: string | null;
    readonly content: readonly {
        readonly type: string;
        readonly text?: string;
    }[];
}
/** Minimal browser-runtime sources needed without exposing Workspace paths to the RPC caller. */
export interface NovelContextSelectionSources {
    readonly sessions: {
        readonly list: Observable<{
            readonly current: SessionId | undefined;
            readonly byId?: Readonly<Record<SessionId, {
                readonly agentPreset?: string;
                readonly projectionValues?: Readonly<Record<string, unknown>>;
            }>>;
        }>;
        binding(sessionId: SessionId): {
            readonly session: Observable<{
                readonly nodes: readonly ConversationNodeView[];
                readonly turnEnds?: ReadonlyMap<number, number>;
                readonly queue?: readonly ConversationQueueMessageView[];
                readonly running?: boolean;
            }>;
        } | undefined;
    };
    readonly workspaces: {
        readonly list: Observable<{
            readonly items: ReadonlyArray<{
                readonly workspaceId: WorkspaceId;
                readonly sessionIds: readonly SessionId[];
            }>;
        }>;
    };
}
/**
 * Follow the current registered Workspace and refresh after new completed novel mutations.
 *
 * @param sources Browser runtime selection and conversation observables.
 * @param controller Context controller receiving opaque ids and refresh signals.
 * @returns A disposer that removes every root and per-session subscription.
 */
export declare function observeNovelContextSources(sources: NovelContextSelectionSources, controller: NovelWorkbenchController): () => void;
export {};
