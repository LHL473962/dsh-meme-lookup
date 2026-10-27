/** A renderer-owned input lease retained until terminal cleanup has settled. */
export type ShutdownInput = {
    readonly stdout: NodeJS.WriteStream;
    ownsInput: () => boolean;
    drain: () => void;
    release: () => void;
};
/** Share TTY input exclusively; input-free roots are independent per output. */
export declare function claimShutdownInput(stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream, drain: () => void, revoke?: () => void): ShutdownInput;
/** Preserve the lease even when a legacy wrapper retains only unmount(). */
export declare function registerShutdownInput(unmount: () => void, input: ShutdownInput): void;
export declare function getShutdownInput(handle: {
    unmount: () => void;
} | undefined): ShutdownInput | undefined;
//# sourceMappingURL=shutdown-input.d.ts.map