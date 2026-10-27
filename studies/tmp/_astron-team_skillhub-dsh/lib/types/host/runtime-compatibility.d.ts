import { type SupportedDshVersion } from './compatibility.js';
/** Candidate runtime range, validated at its lower bound and current Node 24 release. */
export declare const nodeRuntimeRange = ">=24.2.0 <25";
export declare function assertNodeRuntime(version?: string): void;
export declare const runtimePackageBaseline: {
    '@deepseek-ai/cordis-plugin-loader': string;
    '@deepseek-ai/cordis-plugin-include': string;
    '@deepseek-ai/cordis-plugin-timer': string;
    '@deepseek-ai/cordis': "4.0.4";
    '@deepseek-ai/dsh-fs': "0.2.0-rc.2";
    '@deepseek-ai/dsh-home-paths': "0.2.0-rc.2";
    '@deepseek-ai/dsh-sandbox': "0.2.0-rc.2";
    '@deepseek-ai/dsh-sandbox-policy': "0.2.0-rc.2";
    '@deepseek-ai/dsh-session': "0.2.0-rc.2";
    '@deepseek-ai/dsh-session-query': "0.2.0-rc.2";
    '@deepseek-ai/dsh-skill-filesystem': "0.2.0-rc.2";
    '@deepseek-ai/dsh-tools': "0.2.0-rc.2";
    '@deepseek-ai/dsh-typert-protocol': "0.2.0-rc.2";
    '@deepseek-ai/dsh': string;
    '@deepseek-ai/dsh-app-boot': string;
};
export declare const clientPackageBaseline: readonly ["@deepseek-ai/dsh-api-gateway", "@deepseek-ai/dsh-client-ui-layout", "@deepseek-ai/dsh-client-ui-sidebar", "@deepseek-ai/dsh-client-ui-settings", "@deepseek-ai/dsh-client-ui-plugin-manager", "@deepseek-ai/dsh-client-ui-tool", "@deepseek-ai/dsh-api-session-controller", "@deepseek-ai/dsh-client-ui-session", "@deepseek-ai/dsh-client-ui-conversation", "@deepseek-ai/dsh-api-workspace-controller", "@deepseek-ai/dsh-client-ui-workspace"];
interface RuntimeServices {
    packageOf(name: string, parentURL: string): {
        name: string;
        version?: string;
        manifestPath?: string;
    } | undefined;
    clientPath(name: string): string | undefined;
}
/** Read the current Host resolution and Client graph on each new write; never cache acceptance. */
export declare function assertRuntimeCompatibility(services: RuntimeServices, parentURL: string, readClientManifest?: (file: string, name: string) => unknown, readHostManifest?: (file: string) => unknown): SupportedDshVersion;
export {};
