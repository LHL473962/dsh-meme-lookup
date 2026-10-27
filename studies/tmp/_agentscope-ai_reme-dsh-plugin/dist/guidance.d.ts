import type { DshSession } from "./types.js";
export declare function memoryGuidance(language?: "en" | "zh"): string;
export declare const REME_PLUGIN_SOURCE = "reme-memory";
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "reme-memory": {
            kind: "reme-memory";
            form: "instructions";
        };
    }
}
export declare function hasGuidance(session: DshSession, pendingMessages?: readonly unknown[]): boolean;
//# sourceMappingURL=guidance.d.ts.map