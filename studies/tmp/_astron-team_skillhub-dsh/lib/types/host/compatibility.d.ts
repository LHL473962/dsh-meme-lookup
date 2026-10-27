export declare const supportedDshVersions: readonly ["0.2.0-rc.2", "0.2.1-rc.2"];
export type SupportedDshVersion = typeof supportedDshVersions[number];
/** Retained Host dependency baseline; a match is necessary, not full product acceptance. */
export declare const hostDependencyBaseline: {
    readonly '@deepseek-ai/cordis': "4.0.4";
    readonly '@deepseek-ai/dsh-fs': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-home-paths': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-sandbox': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-sandbox-policy': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-session': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-session-query': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-skill-filesystem': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-tools': "0.2.0-rc.2";
    readonly '@deepseek-ai/dsh-typert-protocol': "0.2.0-rc.2";
};
/** Only combinations exercised together by the native Host smoke are accepted. */
export declare const cordisFamilies: readonly [{
    readonly '@deepseek-ai/cordis': "4.0.4";
    readonly '@deepseek-ai/cordis-plugin-loader': "1.0.5";
    readonly '@deepseek-ai/cordis-plugin-include': "1.0.9";
    readonly '@deepseek-ai/cordis-plugin-timer': "1.1.6";
}, {
    readonly '@deepseek-ai/cordis': "4.0.5";
    readonly '@deepseek-ai/cordis-plugin-loader': "1.0.6";
    readonly '@deepseek-ai/cordis-plugin-include': "1.0.10";
    readonly '@deepseek-ai/cordis-plugin-timer': "1.1.7";
}];
export declare function assertHostDependencies(readManifest?: (name: string) => unknown): SupportedDshVersion;
