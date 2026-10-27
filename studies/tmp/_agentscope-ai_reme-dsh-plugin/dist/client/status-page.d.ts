import type { ReMeSettings } from "../types.js";
export declare const statusEn: {
    nav: string;
    title: string;
    description: string;
    workspace: string;
    overview: string;
    autoMemory: string;
    autoDream: string;
    components: string;
    journal: string;
    knowledge: string;
    website: string;
    openReMe: string;
    runDream: string;
    runningDream: string;
    loading: string;
    unavailable: string;
    connected: string;
    disconnected: string;
    healthy: string;
    unhealthy: string;
    enabled: string;
    disabled: string;
    running: string;
    idle: string;
    stopping: string;
    version: string;
    endpoint: string;
    lastRefresh: string;
    serviceHealth: string;
    processMemory: string;
    componentMemory: string;
    activeSessions: string;
    queuedTurns: string;
    runningTasks: string;
    queuedTasks: string;
    everyTurns: string;
    turnsUnit: string;
    turnUnit: string;
    recentTasks: string;
    capturePipeline: string;
    conversationTurns: string;
    submissionQueue: string;
    longTermMemory: string;
    pipelineReady: string;
    activity: string;
    noTasks: string;
    taskQueued: string;
    taskRunning: string;
    taskCompleted: string;
    taskFailed: string;
    taskCancelled: string;
    messages: string;
    turns: string;
    lastError: string;
    schedule: string;
    consolidationFlow: string;
    journalSource: string;
    organizeKnowledge: string;
    knowledgeOutput: string;
    nextConsolidation: string;
    timezone: string;
    nextRun: string;
    lastRun: string;
    never: string;
    noSchedule: string;
    dreamCompleted: string;
    dreamFailed: string;
    componentDetails: string;
    healthyComponents: string;
    infrastructure: string;
    noInstances: string;
    started: string;
    notStarted: string;
    instance: string;
    fileGraph: string;
    fileStore: string;
    keywordIndex: string;
    embeddingStore: string;
    modelName: string;
    dimensions: string;
    cacheSize: string;
    nodes: string;
    edges: string;
    virtualNodes: string;
    pendingNodes: string;
    chunks: string;
    embeddedChunks: string;
    documents: string;
    vocabulary: string;
    memoryUsage: string;
    serverConfig: string;
    fileListLoading: string;
    fileListEmpty: string;
    fileListLimited: string;
    fileCount: string;
    fileUnit: string;
    searchFiles: string;
    noSearchResults: string;
    documentMetadata: string;
    documentContent: string;
    selectFile: string;
    fileLoadFailed: string;
    copyCode: string;
    copiedCode: string;
    footnotes: string;
    journalDescription: string;
    knowledgeDescription: string;
};
export declare const statusZh: typeof statusEn;
export type StatusTranslator = (key: keyof typeof statusEn) => string;
interface SettingsSnapshot<T> {
    status: "loading" | "ready" | "unavailable";
    value: T | undefined;
}
export interface StatusSettingsScope<T> {
    getSnapshot(): SettingsSnapshot<T>;
    subscribe(listener: () => void): () => void;
}
export interface StatusRpc {
    call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{
        ok: true;
        value?: unknown;
    } | {
        ok: false;
        error: {
            code: string;
            message: string;
        };
    }>;
}
export interface ReMeStatusPageProps {
    scope: StatusSettingsScope<ReMeSettings>;
    rpc: StatusRpc;
    t: StatusTranslator;
}
/** Render the independent ReMe monitoring and workspace page. */
export declare function ReMeStatusPage({ scope, rpc, t, }: ReMeStatusPageProps): JSX.Element | null;
export {};
//# sourceMappingURL=status-page.d.ts.map