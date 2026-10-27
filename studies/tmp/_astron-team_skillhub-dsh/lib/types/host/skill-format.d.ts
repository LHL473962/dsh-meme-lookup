import type { Context } from '@deepseek-ai/cordis';
/** Use the pinned DSH parser without registering a provider or watching staging directories. */
export declare function validateDshSkill(ctx: Context, directory: string, signal: AbortSignal): Promise<void>;
