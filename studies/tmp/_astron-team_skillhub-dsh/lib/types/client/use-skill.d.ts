import { type ReactNode } from 'react';
import type { InputActions, SessionInput, InputState } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { InstalledSkillList, SkillUsePreparation, SkillExample, SkillExamples } from '../host/types.js';
type SkillInputActions = Pick<InputActions, 'captureInsertion' | 'insertText'>;
type SkillInput = {
    state: Pick<SessionInput['state'], 'getSnapshot'>;
    focus(): void;
};
export type ExampleSelection = {
    locale: string;
    id: string;
} | {
    custom: true;
};
type ChooseExample = (items: SkillExample[], locale: string, signal: AbortSignal) => Promise<ExampleSelection>;
export declare function selectExampleLocale(examples: Extract<SkillExamples, {
    state: 'ready';
}>, language?: string): string;
export declare function exampleTask(prompt: string, name: string, draft: string): string;
/** Read separator boundaries in the native detect projection; never alter captured coordinates. */
export declare function skillTaskInsertion(task: string, state: Pick<InputState, 'draft' | 'occurrences'>, at: number): string;
type Item = InstalledSkillList['items'][number];
export interface SkillUseServices {
    useSkill(revision: string, itemKey: string | undefined, signal: AbortSignal, resolve?: (signal: AbortSignal) => Promise<string>, choose?: ChooseExample, onHandoff?: () => void): Promise<void>;
}
export interface SkillUseCapture {
    actions: SkillInputActions;
    input: SkillInput;
    assertCurrent(): void;
    dispose?(): void;
}
export interface SkillUseEnvironment {
    capture(sessionId: string, actions: SkillInputActions): SkillUseCapture;
    revision(): Promise<string>;
    prepare(sessionId: string, revision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<SkillUsePreparation>>;
    locale?(): string | undefined;
    subscribeLocale?(listener: () => void): () => void;
    reveal(): void;
    newConversation?(sessionId: string, revision: string, itemKey: string, signal: AbortSignal): Promise<{
        sessionId: string;
        itemKey: string;
    }>;
    subscribeContext?(listener: () => void): () => void;
    current?(sessionId: string): boolean;
}
/** One path for every entry. All edits use native revision comparison; no whole-draft replacement. */
export interface SkillCasePanel {
    sessionId: string;
    name: string;
    items: SkillExample[];
    locale: string;
    busy: boolean;
    error?: string;
    finish(selection?: ExampleSelection): void;
}
export declare class SkillUseController {
    private environment;
    private activeSessions;
    private panel;
    private catalogRequest;
    private routeAbort;
    readonly casePanel: () => SkillCasePanel | undefined;
    private publishPanel;
    private choose;
    private waitForComposer;
    catalogServices(sessionId: string): SkillUseServices;
    private leases;
    private listeners;
    private pendingFocus;
    private disposed;
    private inFlight;
    bind(sessionId: string, actions: SkillInputActions): () => void;
    constructor(environment: SkillUseEnvironment);
    readonly subscribe: (listener: () => void) => () => void;
    readonly focusRequest: () => {
        sessionId: string;
        capture: SkillUseCapture;
    } | undefined;
    focus(sessionId: string): void;
    services(sessionId: string): SkillUseServices;
    private use;
    dispose(): void;
}
/** Standard native slot props supply actions; no editor DOM/private controller access. */
export declare function SkillUseBinding({ controller, sessionId, actions, children }: {
    controller: SkillUseController;
    sessionId?: string;
    actions?: InputActions;
    children?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/** Runs after the resident native composer mounts, including when returning from the catalog. */
export declare function SkillUseFocus({ controller, sessionId }: {
    controller: SkillUseController;
    sessionId: string;
}): null;
export declare function exactInstalledSkill(inventory: InstalledSkillList, identity: Pick<Item, 'namespace' | 'slug' | 'version' | 'scope'>): Item | undefined;
/** Request ownership survives renders but is revoked when the entry's target changes. */
export declare class SkillUseButtonRequests {
    private current;
    private snapshot;
    private listeners;
    readonly subscribe: (listener: () => void) => () => void;
    readonly getSnapshot: () => {
        busy: boolean;
        error: string;
    };
    private update;
    reset(): void;
    run(action: (signal: AbortSignal) => Promise<void>, onUsed?: () => void): Promise<void>;
}
/** Resident full-width native dock; catalog teardown cannot remove the pending choice. */
export declare function SkillCaseChoices({ controller, sessionId }: {
    controller: SkillUseController;
    sessionId: string;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function UseSkillButton({ services, revision, itemKey, resolve, onUsed, onHandoff, onError }: {
    services?: SkillUseServices;
    revision: string;
    itemKey?: string;
    resolve?(signal: AbortSignal): Promise<string>;
    onUsed?(): void;
    onHandoff?(): void;
    onError?(message: string): void;
}): import("react/jsx-runtime").JSX.Element;
export {};
