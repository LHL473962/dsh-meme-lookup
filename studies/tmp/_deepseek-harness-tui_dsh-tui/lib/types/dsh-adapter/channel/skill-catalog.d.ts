import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type UserMessage } from '@deepseek-ai/dsh-llm';
import type { CommandRuntime } from '@deepseek-ai/dsh-commands';
import { type LocalCommand, type LocalizedDescriptions } from '../../commands.js';
import type { ChannelOwner } from './owner.js';
import type { SkillRegistry } from './loaded-context.js';
/** Owns the merged catalog, host registrations, retry timer and all skill reads. */
export declare function createSkillCatalog(ctx: Context, deps: {
    owner: Pick<ChannelOwner, 'current' | 'own'>;
    commandService: CommandRuntime | undefined;
    agent(): Agent;
    cwd(): string;
    setCommands(commands: LocalCommand[]): void;
    commandDescriptions(name: string): LocalizedDescriptions | undefined;
    /** Whether a turn is currently running. A skill gesture typed mid-turn
     *  must stay IMMEDIATE (steer at the next step boundary) instead of
     *  degrading into a turn-end followup (issue #1072). */
    working(): boolean;
    /** Submit a user line through the channel's delivery pipeline. The
     *  fallback skill path rides this same entry point and attaches the
     *  rendered body, so the line stays a plain user message (fence, pending
     *  preview and `@` expansion included) and the body is appended to that
     *  message's step batch — never a turn of its own. */
    deliverUserText(text: string, placement: 'steer' | 'followup', attach?: UserMessage): void;
}): {
    start: () => void;
    release: () => void;
    refreshCommands: () => void;
    refreshSkillCommands: (fromRetry?: boolean) => Promise<void>;
    registryFor: (agent: Agent) => SkillRegistry | undefined;
    viewOptions: (agent: Agent) => {
        scope: Agent;
        cwd: string;
    };
};
//# sourceMappingURL=skill-catalog.d.ts.map