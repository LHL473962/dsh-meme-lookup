interface Status {
    phase: string;
    message?: string;
    error?: string;
    downloadedBytes?: number;
    totalBytes?: number;
}
export declare function runtimeAction(action: string): Promise<Status>;
export declare function LaunchOpenWrite({ wide, openWorkspace }: {
    wide: boolean;
    openWorkspace: (path?: string) => Promise<boolean>;
}): import("react").JSX.Element;
export {};
