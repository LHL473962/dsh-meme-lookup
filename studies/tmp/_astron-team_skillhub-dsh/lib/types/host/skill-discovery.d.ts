import type { Context } from '@deepseek-ai/cordis';
import { FileSystemSkillProvider } from '@deepseek-ai/dsh-skill-filesystem';
export type LoadedSkill = NonNullable<Awaited<ReturnType<FileSystemSkillProvider['get']>>>;
export type DshSkillObservation = {
    status: 'ready';
    skill: LoadedSkill;
} | {
    status: 'unavailable' | 'shadowed';
};
/** Load the exact local package and compare it with the current session's registry winner. */
export declare function inspectDshSkill(ctx: Context, directory: string, signal: AbortSignal, lookup: (name: string) => Promise<LoadedSkill | undefined>): Promise<DshSkillObservation>;
/** Preserve the operation observer's boolean contract without registering another provider. */
export declare function observeDshInstallation(ctx: Context, paths: readonly string[], signal: AbortSignal, lookup: (name: string) => Promise<LoadedSkill | undefined>): Promise<boolean>;
/** Compare the winner again after filesystem inspection, without loading another provider. */
export declare function sameDshSkill(actual: LoadedSkill, expected: LoadedSkill, directory: string): boolean;
