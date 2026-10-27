import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
export declare const name = "@dsh-novel/openwrite-bridge";
export declare const inject: string[];
export interface Config {
    mode?: 'managed' | 'external';
    runtimeRoot?: string;
    artifacts?: string;
    /** Base URL of the local OpenWrite Studio server. */
    baseUrl: string;
    /** Optional instance token of an externally managed Studio server. */
    authToken?: string;
    /** Per-tool cooperative timeout in ms; chapter writing/review can take minutes. */
    timeoutMs: number;
    /** Directory `novel_export` saves exported files into. */
    outputDir: string;
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
