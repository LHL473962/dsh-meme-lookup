/**
 * Windows `start` via cmd.exe: `start "" "<target>"` (the empty quoted
 * title is mandatory — start would otherwise treat a quoted target as the
 * window title). Exported for tests: assembly is pure.
 */
export declare function buildWin32StartSpawn(target: string): {
    file: string;
    args: string[];
    verbatim: true;
    detach: true;
};
/** Whether `target` exists on disk as a directory (decides the open
 *  channel: folders bypass the ShellExecute verb and go through the
 *  Shell.Application COM API). Never throws. */
export declare function isDirectory(target: string): boolean;
/**
 * The Windows spawn descriptor for opening `target` (pure, testable):
 * directories go through `powershell (New-Object -ComObject
 * Shell.Application).Open('<dir>')`, everything else (files, URLs) through
 * `start`. Explorer's single-instance forwarding silently swallows
 * "open folder" requests on many systems (diagnosed in the field: `start`,
 * raw explorer, and `/select,` all dead while the COM API works), so the
 * COM channel is the reliable folder opener; single quotes in the path are
 * doubled for the PowerShell literal. The COM descriptor also carries
 * `detach: false` — a DETACHED_PROCESS (console-less) PowerShell silently
 * drops the Shell.Application Open call, so the channel only works with
 * `windowsHide` (CREATE_NO_WINDOW) alone (field-diagnosed spawn matrix:
 * detached+hide → dead, hide-only → works; start keeps working detached).
 */
export declare function buildWin32OpenSpawn(target: string): {
    file: string;
    args: string[];
    verbatim: boolean;
    detach: boolean;
};
/** Open a URL, file or directory with the platform's default handler. */
export declare function openExternal(target: string): void;
/** Open a file with its associated application (openExternal with a file). */
export declare function openFile(path: string): void;
/**
 * Open the folder containing `filePath` in the platform file manager.
 *
 * Windows and Linux open the parent DIRECTORY through openExternal —
 * Windows routes folders through the Shell.Application COM channel (see
 * buildWin32OpenSpawn). macOS uses `open -R` to select the file, degrading
 * to the folder when the file is gone. No-op when neither the file nor its
 * parent exists (a stale/hallucinated path must not spawn error dialogs).
 */
export declare function revealInFileManager(filePath: string): void;
//# sourceMappingURL=openExternal.d.ts.map