import type { Context } from '@deepseek-ai/cordis';
/** Native scope ownership, not a second draft/attachment store. */
export declare class SkillDraftRetentions {
    private ctx;
    private limit;
    private held;
    private disposed;
    constructor(ctx: Context, limit?: number);
    preserve(sessionId: string): () => void;
    dispose(): void;
}
