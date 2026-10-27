import type { Context } from '@deepseek-ai/cordis';
import { Config, type Config as PluginConfig } from './config.js';
export declare const name = "deepseek-harness-channel-bcn";
export declare const inject: string[];
export { Config };
export type { Config as DeepSeekHarnessBcnConfig } from './config.js';
export declare function apply(ctx: Context, rawConfig: PluginConfig): Promise<() => Promise<void>>;
//# sourceMappingURL=index.d.ts.map