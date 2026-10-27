import { type ExecFileNoThrowResult } from './utils/execFileNoThrow.js';
interface HerdrChannel {
    readonly working: boolean;
    subscribe(listener: () => void): () => void;
}
interface BlockingStore {
    subscribe(listener: () => void): () => void;
    getSnapshot(): unknown | null;
}
type RunCommand = (file: string, args: readonly string[]) => Promise<ExecFileNoThrowResult>;
export interface HerdrIntegration {
    settled(): Promise<void>;
    dispose(): Promise<void>;
}
export interface HerdrIntegrationOptions {
    readonly channel: HerdrChannel;
    readonly questions: BlockingStore;
    readonly approvals: BlockingStore;
    readonly env?: NodeJS.ProcessEnv;
    readonly run?: RunCommand;
    readonly reportTimeoutMs?: number;
    readonly releaseTimeoutMs?: number;
    readonly retryDelaysMs?: readonly number[];
    /** Milliseconds. Tests pin this so a later report can jump ahead of another pane reporter. */
    readonly now?: () => number;
}
/** Report this TUI's lifecycle to the owning Herdr pane when Herdr launches it. */
export declare function attachHerdrIntegration(options: HerdrIntegrationOptions): HerdrIntegration | undefined;
export {};
//# sourceMappingURL=herdr.d.ts.map