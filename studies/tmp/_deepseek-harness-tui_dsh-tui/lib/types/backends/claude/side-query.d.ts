import type { ClaudeSdkModule } from './sdk.js';
/** One side answer: the text, or why there is none (null + no error =
 *  the caller aborted). */
export interface SideQueryOutcome {
    readonly answer: string | null;
    readonly error?: string;
}
export interface ClaudeSideQueryDeps {
    readonly sdk: Pick<ClaudeSdkModule, 'query'>;
    readonly cwd: string;
    /** The session the side query forks (it changes after a reset). */
    sessionId(): string;
    /** The CLI has written the session's transcript (a fork needs one). */
    persisted(): boolean;
    /** The model the session runs ('' = not known yet: the CLI's default). */
    model(): string;
    /** The session's spawn environment and route pin, as of now. */
    spawn(): {
        readonly env: Record<string, string>;
        readonly settings?: {
            readonly env: Readonly<Record<string, string>>;
        };
        readonly executable: string | undefined;
    };
    debug(message: string): void;
}
export declare function createClaudeSideQuery(deps: ClaudeSideQueryDeps): {
    ask(prompt: string, options?: {
        readonly signal?: AbortSignal;
        readonly onText?: (delta: string) => void;
    }): Promise<SideQueryOutcome>;
};
export type ClaudeSideQuery = ReturnType<typeof createClaudeSideQuery>;
//# sourceMappingURL=side-query.d.ts.map