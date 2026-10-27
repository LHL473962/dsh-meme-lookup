import type { Context } from '@deepseek-ai/cordis';
import { type LoadedSkill } from './skill-discovery.js';
import type { RemovalBaseline } from './generated/native-contract.js';
import type { SkillAvailability } from './types.js';
export interface AvailabilityReader {
    snapshot?(): Promise<{
        complete: boolean;
        skills: readonly {
            name: string;
        }[];
    }>;
    get(name: string): Promise<LoadedSkill | undefined>;
}
export declare const skillNamePattern: RegExp;
/** Whitelisted observations only. Neither a successful check nor a name lookup authorizes changes. */
export declare function inspectSkillAvailability(input: {
    ctx: Context;
    reader?: AvailabilityReader;
    signal: AbortSignal;
    valid(): void;
    name?: string;
    managed?: {
        directory: string;
        fingerprint?: string;
        baseline(): Promise<RemovalBaseline>;
    };
}): Promise<SkillAvailability>;
