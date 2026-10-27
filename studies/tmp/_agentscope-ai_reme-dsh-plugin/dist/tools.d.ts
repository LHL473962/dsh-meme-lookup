import { defineTool } from "@deepseek-ai/dsh-tools";
import type { ReMeClientLike } from "./reme/types.js";
import type { ReMeConfig } from "./types.js";
export interface ToolRegistryContext {
    tools: {
        register(tool: ReturnType<typeof defineTool>): () => void;
    };
}
export declare function registerReMeTools(ctx: ToolRegistryContext, client: Pick<ReMeClientLike, "search">, config: Pick<ReMeConfig, "searchLimit"> | (() => Pick<ReMeConfig, "searchLimit">)): () => void;
//# sourceMappingURL=tools.d.ts.map