import type { Context } from '@deepseek-ai/cordis';
import { SessionId } from '@deepseek-ai/dsh-session/types';
import type { InstalledSkillList } from '../host/types.js';
import type { SkillDraftRetentions } from './use-skill-drafts.js';
/** Create a fresh Host session: a reusable blank may already hold an unsent draft. */
export declare function newSkillConversation(ctx: Context, originalId: string, revision: string, key: string, signal: AbortSignal, installed: (sessionId: string, revision: string, signal: AbortSignal) => Promise<InstalledSkillList>, drafts: Pick<SkillDraftRetentions, 'preserve'>): Promise<{
    sessionId: SessionId;
    itemKey: string;
}>;
