import type { InstallerOptions } from './updateProcess.js';
/** The supervisor owns a private job handle, including after the root exits. */
export declare function runWindowsInstaller(command: string, args: readonly string[], options: InstallerOptions, timeoutMs: number): Promise<number>;
//# sourceMappingURL=windowsInstaller.d.ts.map