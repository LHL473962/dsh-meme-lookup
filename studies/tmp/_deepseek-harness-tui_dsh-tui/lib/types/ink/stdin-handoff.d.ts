/**
 * Permanently release input to a replacement process without closing the TTY.
 * Closing it would restore this process's saved termios over the child's raw
 * mode. pause()/unref() alone leave readable-mode prefetch able to steal the
 * child's terminal replies, so cancel the native read and prevent refills.
 * Temporary editor handoffs must keep using suspendStdin()/resumeStdin().
 */
export declare function detachHandoffStdin(stdin?: Pick<NodeJS.ReadStream, 'removeAllListeners' | 'pause'> & {
    unref?: () => unknown;
}): void;
//# sourceMappingURL=stdin-handoff.d.ts.map