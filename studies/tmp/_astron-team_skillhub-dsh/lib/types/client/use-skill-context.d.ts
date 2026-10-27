import type { Context } from '@deepseek-ai/cordis';
import type { SkillUseCapture } from './use-skill.js';
/** Capture the actual retained session and native shell, not transient service facades. */
export declare function captureSkillUse(ctx: Context, sessionId: string, actions: SkillUseCapture['actions']): SkillUseCapture;
