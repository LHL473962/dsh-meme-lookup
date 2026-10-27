import Schema from '@deepseek-ai/schemastery';
export declare const DEFAULT_ONBOARDING_TOKEN_REF = "BCN_ONBOARDING_TOKEN";
export declare const DEFAULT_BOT_SESSION_REF = "BCN_BOT_SESSION";
export interface Config {
    enabled: boolean;
    /** HTTP(S) base URL whose path is the BCN API prefix, for example https://bcn.example.com/bcn/. */
    endpoint: string;
    /** Bot display name used only for first registration. */
    botName: string;
    summary: string;
    domains: string[];
    skills: string[];
    scopes: string[];
    onboardingTokenRef: string;
    botSessionRef: string;
    connectionTimeoutMs: number;
    heartbeatIntervalMs: number;
    reconnectInitialMs: number;
    reconnectMaxMs: number;
}
export declare const Config: Schema<Config>;
export declare function normalizeConfig(config: Config): Config;
//# sourceMappingURL=config.d.ts.map