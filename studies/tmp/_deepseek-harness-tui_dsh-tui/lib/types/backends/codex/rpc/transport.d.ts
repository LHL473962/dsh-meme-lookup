/** 96 Mi code units: covers the declared 50 MiB image payload after base64. */
export declare const MAX_LINE_BYTES: number;
/** How the child ended (`error` = it never started, e.g. ENOENT). */
export interface TransportExit {
    readonly code: number | null;
    readonly signal: string | null;
    readonly error?: Error;
}
export interface TransportOptions {
    /** The resolved executable (`rpc/binary.ts`). */
    readonly executable: string;
    /** Arguments after the executable (`['app-server', ...overrides]`). */
    readonly args: readonly string[];
    readonly env: Readonly<Record<string, string>>;
    readonly cwd: string;
    readonly onLine: (line: string) => void;
    readonly onStderr: (line: string) => void;
    readonly onExit: (info: TransportExit) => void;
}
export interface Transport {
    /** Send one JSON-RPC message in the transport's framing. */
    write(line: string): void;
    /** End the child (stdin EOF, then signals); resolves once it exited. */
    close(): Promise<void>;
    readonly pid: number | undefined;
}
/** Builds a transport (the hub's injection seam). */
export type TransportFactory = (options: TransportOptions) => Transport;
/** Grace periods of {@link Transport.close}: EOF → SIGTERM → SIGKILL. */
export declare const CLOSE_GRACE_MS = 2000;
/** A line splitter with the size bound (shared with the fake transport). */
export declare function createLineSplitter(onLine: (line: string) => void, onOversize: (bytes: number) => void, maxLine?: number): {
    push(chunk: string): void;
    end(): void;
};
/** Spawn the app-server child. Never throws: a spawn failure is reported
 *  through `onExit` with `error` set. */
export declare function spawnTransport(options: TransportOptions): Transport;
//# sourceMappingURL=transport.d.ts.map