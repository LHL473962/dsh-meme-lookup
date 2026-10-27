import { type StreamChunk } from '@deepseek-ai/dsh-llm';
import { emptyTokenUsage, estimateTokens } from '../../channel/usage.js';
export { emptyTokenUsage, estimateTokens };
/** Whether one stream chunk advances the first-token/decode boundary. */
export declare function isTokenDelta(chunk: StreamChunk): boolean;
/** Character payload of one token-bearing stream delta for the live fallback. */
export declare function tokenDeltaChars(chunk: StreamChunk): number;
/** DSH-shaped (`outputTokens`) output count when usable; durable imports may predate strict validation. */
export declare function usageOutputTokens(usage: unknown): number | undefined;
//# sourceMappingURL=usage.d.ts.map