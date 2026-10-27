#!/usr/bin/env node
export interface ConfigureProfileOptions {
    profile: string;
    endpoint: string;
    botName: string;
    dshHome?: string;
    dshBin?: string;
}
export interface ConfigureProfileDependencies {
    validate?: (profile: string, dshHome: string, dshBin: string) => void;
}
export interface ConfigureProfileResult {
    profile: string;
    patchPath: string;
    endpoint: string;
}
export declare function configureProfile(options: ConfigureProfileOptions, dependencies?: ConfigureProfileDependencies): ConfigureProfileResult;
interface CliOptions {
    profile: string;
    endpoint: string;
    botName: string;
}
export declare function parseArgs(args: string[]): CliOptions;
export {};
//# sourceMappingURL=configure.d.ts.map