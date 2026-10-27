import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type SkillSummary } from '@deepseek-ai/dsh-skill';
import type { LoadedContextEntry, LoadedContextFile, LoadedContextSkill, LoadedContextTool } from './types.js';
import type { ChannelOwner } from './owner.js';
export type SkillRegistry = {
    snapshot(options?: {
        scope?: unknown;
        cwd?: string;
    }): Promise<{
        skills: readonly SkillSummary[];
        complete: boolean;
    }>;
    get(name: string, options?: {
        scope?: unknown;
        cwd?: string;
        signal?: AbortSignal;
    }): Promise<unknown>;
};
/** Assembles the loaded-context panel. A result belongs only to its origin Agent. */
export declare function createLoadedContextRefresher(ctx: Context, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    agent(): Agent;
    cwd(): string;
    publish(context: {
        sections: LoadedContextEntry[];
        contexts: LoadedContextEntry[];
        files: LoadedContextFile[];
        skills: LoadedContextSkill[];
        tools: LoadedContextTool[];
    }): void;
    skillRegistryFor(agent: Agent): SkillRegistry | undefined;
    skillViewOptions(agent: Agent): {
        scope: Agent;
        cwd: string;
    };
}): {
    refresh: () => Promise<void>;
};
//# sourceMappingURL=loaded-context.d.ts.map