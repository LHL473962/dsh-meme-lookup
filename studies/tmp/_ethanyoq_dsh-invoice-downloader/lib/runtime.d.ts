export interface RuntimeConfig {
    runtimeRoot?: string;
    engineRoot?: string;
    pythonPath?: string;
    bootstrapPython?: string;
}
export interface RuntimeLayout {
    runtimeRoot: string;
    engineRoot: string;
    pythonPath: string;
    bootstrapPython?: string;
    venvRoot: string;
    adapterRoot: string;
    installerPath: string;
    healthCheckPath: string;
    requirementsPath: string;
    bootstrapArgv: readonly string[];
}
export interface RuntimeStatus {
    installed: boolean;
    enginePresent: boolean;
    platform: 'windows-x64' | 'macos-arm64' | 'unsupported';
}
export declare function resolveRuntimeLayout(config: RuntimeConfig): RuntimeLayout;
export declare function getRuntimeStatus(layout: RuntimeLayout): RuntimeStatus;
