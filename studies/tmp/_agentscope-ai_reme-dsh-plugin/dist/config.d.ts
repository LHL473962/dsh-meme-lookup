import z from "@deepseek-ai/schemastery";
import type { ReMeConfig, ReMeConfigInput } from "./types.js";
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    endpoint: z<string, string, "volatile-defined">;
    requestTimeoutMs: z<number, number, "volatile-defined">;
    backgroundTimeoutMs: z<number, number, "volatile-defined">;
    shutdownTimeoutMs: z<number, number, "volatile-defined">;
    autoMemoryEnabled: z<boolean, boolean, "volatile-defined">;
    autoMemoryInterval: z<number, number, "volatile-defined">;
    autoDreamEnabled: z<boolean, boolean, "volatile-defined">;
    dreamCron: z<string, string, "volatile-defined">;
    dreamHint: z<string, string, "volatile-defined">;
    dreamIntervalMs: z<number, number, "defined">;
    rootAgentsOnly: z<boolean, boolean, "volatile-defined">;
    language: z<"en" | "zh", "en" | "zh", "volatile-defined">;
    searchLimit: z<number, number, "volatile-defined">;
    timezone: z<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    endpoint: z<string, string, "volatile-defined">;
    requestTimeoutMs: z<number, number, "volatile-defined">;
    backgroundTimeoutMs: z<number, number, "volatile-defined">;
    shutdownTimeoutMs: z<number, number, "volatile-defined">;
    autoMemoryEnabled: z<boolean, boolean, "volatile-defined">;
    autoMemoryInterval: z<number, number, "volatile-defined">;
    autoDreamEnabled: z<boolean, boolean, "volatile-defined">;
    dreamCron: z<string, string, "volatile-defined">;
    dreamHint: z<string, string, "volatile-defined">;
    dreamIntervalMs: z<number, number, "defined">;
    rootAgentsOnly: z<boolean, boolean, "volatile-defined">;
    language: z<"en" | "zh", "en" | "zh", "volatile-defined">;
    searchLimit: z<number, number, "volatile-defined">;
    timezone: z<string, string, "volatile-defined">;
}>>, "plain">;
export declare function resolveConfig(input?: ReMeConfigInput, env?: Record<string, string | undefined>): ReMeConfig;
//# sourceMappingURL=config.d.ts.map