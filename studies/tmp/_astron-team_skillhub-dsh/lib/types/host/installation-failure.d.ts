export declare const installationFailureCodes: readonly ["CONTEXT_STALE", "REQUEST_CONFLICT", "SOURCE_NOT_CONFIGURED", "SOURCE_DENIED", "SKILL_UNAVAILABLE", "RATE_LIMITED", "SOURCE_UNAVAILABLE", "TARGET_UNAVAILABLE", "UNCONFIRMED"];
export type InstallationFailureCode = typeof installationFailureCodes[number];
/** Only known codes cross the tool boundary; messages and diagnostic data may contain Host paths. */
export declare function installationFailureCode(error: unknown): InstallationFailureCode;
