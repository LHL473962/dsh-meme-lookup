import type { BalanceResult } from './adapter/ports/channel-catalog.js';
export type { BalanceResult, BalanceInfo } from './adapter/ports/channel-catalog.js';
/** 查询选项；fetchImpl 供无头回归注入。 */
export interface BalanceQueryOptions {
    /** 覆盖全局 fetch（测试注入）。 */
    fetchImpl?: typeof fetch;
    /** 覆盖 API 根地址（测试或镜像）。 */
    baseUrl?: string;
    /** 超时毫秒数，默认 8000。 */
    timeoutMs?: number;
}
export declare const DEEPSEEK_BALANCE_ENDPOINT = "https://api.deepseek.com/user/balance";
/**
 * 查询 DeepSeek 官方账户余额。
 * @param apiKey - `DEEPSEEK_API_KEY` 值；空字符串返回 no-key。
 * @param options - 查询选项。
 */
export declare function fetchBalance(apiKey: string, options?: BalanceQueryOptions): Promise<BalanceResult>;
//# sourceMappingURL=deepseekBalance.d.ts.map