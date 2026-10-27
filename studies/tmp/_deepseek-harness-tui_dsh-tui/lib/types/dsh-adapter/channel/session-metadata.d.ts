import type { DshChannelBinding } from './binding.js';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import { writeResumeTarget } from '../../sessionHistory.js';
import { type SessionSummary } from '../sessions/index.js';
import type { ChannelOwner } from './owner.js';
import type { CredentialStatus } from './types.js';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-tui-btw': {
            kind: 'dsh-tui-btw';
        };
        'dsh-tui-recap': {
            kind: 'dsh-tui-recap';
        };
    }
}
type Binding = Pick<DshChannelBinding, 'agent' | 'capture' | 'isCurrent'>;
/** Session-scoped metadata, persistence queries, and tool-less LLM reads. */
export declare function createSessionMetadataActions(ctx: Context, deps: {
    owner: Pick<ChannelOwner, 'current' | 'signal' | 'own'>;
    binding: Binding;
    provider(): string;
    model(): string;
    /** The browser's current workspace, prioritized during a cold listing. */
    cwd?(): string;
    emit(): void;
    sessionTitle(): string;
    setSessionTitle(title: string): void;
    setSessionColor(color: string): void;
    forgetAgentView(sessionId: string): void;
    setPersistedSessions(rows: readonly SessionSummary[]): void;
    skillRegistryFor(agent: Agent): {
        snapshot(options: {
            scope: Agent;
            cwd: string;
        }): Promise<{
            skills: readonly {
                name: string;
                description: string;
                source: string;
                invocation: unknown;
            }[];
            complete: boolean;
        }>;
    } | undefined;
    skillViewOptions(agent: Agent): {
        scope: Agent;
        cwd: string;
    };
}): {
    cachedSessions: () => readonly SessionSummary[] | undefined;
    listSessions: (onEnriched?: (summary: SessionSummary) => void, onPartial?: (rows: readonly SessionSummary[]) => void) => Promise<readonly SessionSummary[]>;
    previewSession: (sessionId: string) => Promise<import("../sessions/types.js").PreviewEntry[]>;
    listSkills: () => Promise<{
        name: string;
        description: string;
        userInvocable: boolean;
        source: string;
    }[] | undefined>;
    describeCredential: (ref: string) => Promise<CredentialStatus | undefined>;
    sideQuestion: (question: string, options?: {
        signal?: AbortSignal;
        onText?: (delta: string) => void;
    }) => Promise<import("../sideQuestion.js").SideQuestionOutcome>;
    recapRecent: (options?: {
        signal?: AbortSignal;
        onText?: (delta: string) => void;
    }) => Promise<{
        error?: string | undefined;
        summary: null;
        title?: undefined;
    } | {
        summary: string;
        title?: undefined;
    } | {
        summary: string;
        title: string;
    }>;
    setResumeTarget: typeof writeResumeTarget;
    renameSession: (title: string) => void;
    setSessionColor: (color: string) => void;
    deleteSession: (sessionId: string) => Promise<boolean>;
    renameSessionTo: (sessionId: string, title: string) => Promise<boolean>;
};
export {};
//# sourceMappingURL=session-metadata.d.ts.map