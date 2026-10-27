import type { Context } from "@deepseek-ai/cordis";
import type { ReMeConfigInput } from "./types.js";
export declare const name = "reme-memory";
export declare const inject: string[];
export declare function apply(ctx: Context, input?: ReMeConfigInput): void;
export type { ReMeConfig, ReMeConfigInput, ReMeSettings } from "./types.js";
export type { ReMeRuntimeSnapshot, ReMeRuntimeTask, ReMeRuntimeTaskPhase, } from "./runtime-status.js";
export { Config } from "./config.js";
//# sourceMappingURL=index.d.ts.map