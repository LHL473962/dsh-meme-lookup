/**
 * Workspace files and slash completion for every session: the `fs` surface
 * `@` mentions and file completion read (the host fs service, else the local
 * disk where the backend runs on it), the fenced file queries, and the slash
 * completion tree with whatever catalog the composition offers for
 * `/model`, `/preset`, `/effort` and `/workspace` arguments. The backend's
 * own commands join the command list itself (core/session-controls.ts), so
 * completion lists them like any other entry.
 */
import type { ServiceLookup } from '../channel-host.js';
import type { CommandCompletionNode } from '../../../commands.js';
import type { ChannelBinding } from '../binding.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelState, MentionFs } from '../types.js';
import type { CoreHost } from './host.js';
/** Argument catalogs the slash completion tree warms and reads. */
export interface CompletionCatalog {
    workspaceCommands(): readonly {
        name: string;
        aliases?: readonly string[];
        description?: string;
    }[];
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
    /** `/plugin info <name>`: the bundles the profile added (absent = no service). */
    plugin?: {
        warmPluginNames(): void;
        pluginNames(): readonly CommandCompletionNode[];
    };
}
/** No argument catalogs: the tree offers its static nodes only. */
export declare const NO_COMPLETION_CATALOG: CompletionCatalog;
export declare function createCoreFiles(ctx: ServiceLookup, deps: {
    owner: Pick<ChannelOwner, 'current' | 'signal'>;
    binding: Pick<ChannelBinding, 'capture' | 'isCurrent'>;
    state: () => ChannelState;
    host: Pick<CoreHost, 'themeHost' | 'commandTrees'>;
    /** Whether the local disk stands in for a missing host fs service. */
    localFallback(): boolean;
    /** The bound backend's MCP server names (`/mcp` completion). */
    mcpServers?(): readonly string[] | undefined;
}): {
    fallbackFs: () => MentionFs | undefined;
    listFileCandidates: (query: string, options?: {
        signal?: AbortSignal;
        topK?: number;
    }) => Promise<readonly import("../../../utils/fileSuggestions.js").FileCandidate[]>;
    listFiles: () => Promise<readonly string[]>;
    /** The slash completion over the composition's argument catalogs. */
    commandCompletions(catalog: CompletionCatalog): ChannelState["commandCompletions"];
};
//# sourceMappingURL=files.d.ts.map