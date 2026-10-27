import React from 'react';
import type { BalanceResult } from '../deepseekBalance.js';
import type { TokenUsage } from '../dsh-adapter/channel.js';
import type { ChannelUi } from '../adapter/channel/ui-policy.js';
/**
 * `/balance` 余额报告行：Divider + 一行安静摘要，hover 展开明细
 * （各币种赠送/充值拆分、本会话 token 与花费估算、失败原因），点击行
 * 重新查询，右上角 × 关闭 —— 与 AutoRecapRow 同一套视觉与交互语言。
 * 报告只活在内存里：不进 transcript、不进会话日志。
 */
export declare function BalanceReportRow({ result, refreshing, tokens, model, provider, mainCost, subagentCost, onRefresh, onDismiss, }: {
    /** null 表示查询仍在途。 */
    result: BalanceResult | null;
    /** 查询在途（刷新时摘要不动，明细区显示加载行）。 */
    refreshing: boolean;
    /** 会话累计 token（hover 明细里的花费估算输入；没有 mainCost 的旧快照
     *  回退到这份总量 + 当前模型）。 */
    tokens: TokenUsage;
    /** 当前模型 id（花费估算的单价匹配）。 */
    model: string;
    /** 当前 provider（主会话用量的官方判定）。 */
    provider: string;
    /** 主会话按模型分桶（费用估算输入；旧快照缺省时回退 tokens）。 */
    mainCost?: ChannelUi['mainCost'];
    /** 子代理按 (provider, model) 分桶（费用估算输入）。 */
    subagentCost?: ChannelUi['subagentCost'];
    /** 点击报告行：重新查询余额。 */
    onRefresh: () => void;
    /** 点击 ×：关闭报告。 */
    onDismiss: () => void;
}): React.ReactNode;
//# sourceMappingURL=BalanceReportRow.d.ts.map