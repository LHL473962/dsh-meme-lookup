/** The credential ref of one channel id (the deriveKeyRef convention:
 *  uppercase, runs of non-alphanumerics → `_`). */
export declare function channelTokenRef(id: string): string;
/** Read/write/erase access (injectable: tests use an in-memory store). */
export interface ChannelTokenStore {
    /** The stored token, or undefined when the ref holds nothing. */
    read(ref: string): string | undefined;
    /** Store `value` under `ref` (best-effort: a failure reports to the
     *  debug log and the session carries on without the token). */
    write(ref: string, value: string): void;
    /** Remove `ref` (a missing ref is fine). */
    erase(ref: string): void;
    /** Whether `ref` is declared (the roster's `hasToken`). */
    declared(ref: string): boolean;
}
/** The file-backed token store under `home` (default the DSH home that owns
 * `~/.dsh/.credentials.yaml`). */
export declare function fileChannelTokens(home?: string, debug?: (message: string) => void): ChannelTokenStore;
/** An in-memory store (tests, embedders). */
export declare function memoryChannelTokens(initial?: Record<string, string>): ChannelTokenStore & {
    readonly data: Readonly<Record<string, string>>;
};
/** @deprecated The pre-D15 name (kept for one phase): {@link ChannelTokenStore}. */
export type ClaudeChannelTokens = ChannelTokenStore;
/** @deprecated The pre-D15 name (kept for one phase): {@link fileChannelTokens}. */
export declare const fileClaudeChannelTokens: typeof fileChannelTokens;
/** @deprecated The pre-D15 name (kept for one phase): {@link memoryChannelTokens}. */
export declare const memoryClaudeChannelTokens: typeof memoryChannelTokens;
//# sourceMappingURL=channel-tokens.d.ts.map