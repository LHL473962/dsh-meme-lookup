import { type CommandCompletionNode } from '../../commands.js';
import { listThemeCatalog } from '../../themeCatalog.js';
import type { ChannelState } from './types.js';
/** Owns slash completion composition and cache warming; it has no lifecycle effects. */
export declare function createCommandCompletions(deps: {
    state: () => ChannelState;
    themeHost: Parameters<typeof listThemeCatalog>[0];
    commandTrees?: {
        children(path: readonly string[]): readonly CommandCompletionNode[];
    };
    workspaceCommands(): readonly {
        name: string;
        aliases?: readonly string[];
        description?: string;
    }[];
    /** The bound backend's MCP server names when it controls them
     *  (`/mcp reconnect|toggle`); undefined = `/mcp` takes no arguments. */
    mcpServers?(): readonly string[] | undefined;
    /** `/plugin info <name>`: the profile's added bundles, warm-and-read. */
    plugin?: {
        warmPluginNames(): void;
        pluginNames(): readonly CommandCompletionNode[];
    };
    model: {
        warmModelNodes(): void;
        modelNodes(): readonly CommandCompletionNode[];
        warmPresetOptions(): void;
        presetOptions(): readonly {
            id: string;
            description?: string;
            name?: string;
            isDefault?: boolean;
        }[];
        warmEffortLevels(): void;
    };
}): (input: string) => import("../../commands.js").CommandCompletion[];
//# sourceMappingURL=command-completions.d.ts.map