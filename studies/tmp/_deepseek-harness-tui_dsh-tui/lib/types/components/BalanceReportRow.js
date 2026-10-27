import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from '../ui.js';
import { Divider } from './design-system/Divider.js';
import { t } from '../i18n.js';
import { estimateSessionCostSnapshotCny, isPeakHour, priceForModel } from '../deepseekPricing.js';
import { formatTokens } from '../terminal-utils/format.js';
/**
 * `/balance` 余额报告行：Divider + 一行安静摘要，hover 展开明细
 * （各币种赠送/充值拆分、本会话 token 与花费估算、失败原因），点击行
 * 重新查询，右上角 × 关闭 —— 与 AutoRecapRow 同一套视觉与交互语言。
 * 报告只活在内存里：不进 transcript、不进会话日志。
 */
export function BalanceReportRow({ result, refreshing, tokens, model, provider, mainCost, subagentCost, onRefresh, onDismiss, }) {
    const [hovered, setHovered] = React.useState(false);
    const summary = (() => {
        if (result === null)
            return t('balance-summary-loading');
        if (!result.ok)
            return t('balance-summary-fail');
        // 主币种：CNY 优先，否则第一项。
        const primary = result.balances.find(info => info.currency === 'CNY')
            ?? result.balances[0];
        if (primary === undefined)
            return t('balance-summary-fail');
        return t('balance-summary-ok', {
            total: primary.total.toFixed(2),
            state: result.isAvailable
                ? t('balance-summary-state-ok')
                : t('balance-summary-state-off'),
        });
    })();
    const estimate = estimateSessionCostSnapshotCny({
        provider,
        main: mainCost,
        subagents: subagentCost,
        fallbackTokens: tokens,
        fallbackModel: model,
    });
    const detailLines = (() => {
        if (result === null)
            return [];
        if (!result.ok) {
            const reason = (() => {
                switch (result.reason) {
                    case 'no-key': return t('balance-no-key');
                    case 'unauthorized': return t('balance-unauthorized');
                    case 'network': return t('balance-network-error');
                    case 'http': return t('balance-http-error', { status: result.status ?? '?' });
                    case 'invalid': return t('balance-invalid');
                }
            })();
            return [reason, t('balance-fail-hint')];
        }
        const lines = result.balances.map(info => t('balance-currency', {
            currency: info.currency,
            total: info.total.toFixed(2),
            granted: info.granted.toFixed(2),
            toppedUp: info.toppedUp.toFixed(2),
        }));
        // 当前计费时段 + 该时段单价（高峰=梁文峰，低谷=梁文谷）。
        const price = priceForModel(model);
        if (price !== undefined) {
            const peakNow = isPeakHour();
            const rateIndex = peakNow ? 1 : 0;
            lines.push(t('balance-current-rate', {
                name: peakNow ? t('cost-peak-name') : t('cost-idle-name'),
                input: price.inputMiss[rateIndex].toFixed(1),
                output: price.output[rateIndex].toFixed(1),
            }));
        }
        if (estimate !== undefined && estimate.total > 0) {
            lines.push(t('balance-hover-tokens', {
                input: formatTokens(tokens.input),
                output: formatTokens(tokens.output),
                cost: estimate.total.toFixed(2),
                peak: estimate.peak.toFixed(2),
                idle: estimate.idle.toFixed(2),
                peakName: t('cost-peak-name'),
                idleName: t('cost-idle-name'),
            }));
        }
        // 拆解口径（DESIGN D6）：主会话 / 子代理各按自身模型分组计价；无法计价
        // 的用量只报 token，让"估算偏低"变成可见事实而不是静默少算。
        if (estimate !== undefined) {
            lines.push(`${t('cost-split-main', { cost: estimate.main.toFixed(2) })} · ${t('cost-split-subagent', { cost: estimate.subagent.toFixed(2) })}`);
            if (estimate.unpricedTokens > 0) {
                lines.push(t('cost-unpriced', { tokens: formatTokens(estimate.unpricedTokens) }));
            }
        }
        return lines;
    })();
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Divider, {}), _jsxs(Box, { flexDirection: "column", marginTop: 1, marginLeft: 1, onClick: onRefresh, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: [_jsx(Text, { dimColor: !hovered, children: refreshing ? t('balance-summary-loading') : summary }), hovered && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [detailLines.map((line, index) => (_jsx(Text, { dimColor: true, wrap: "truncate", children: line }, index))), result !== null && (_jsxs(Box, { flexDirection: "row", marginTop: 1, children: [_jsxs(Text, { color: "success", children: [" [", result.ok ? t('balance-refresh') : t('balance-retry'), "]"] }), _jsx(Box, { onClick: (event) => {
                                            // 阻止冒泡到外层 Box 的 onRefresh——Ink 的 dispatchClick
                                            // 从最深节点向上触发所有祖先 onClick，仅
                                            // stopImmediatePropagation 能中断；否则关闭会立刻被
                                            // 刷新结果拉回来（外层整行点击 = 重新查询）。
                                            event.stopImmediatePropagation();
                                            onDismiss();
                                        }, children: _jsxs(Text, { color: "warning", children: [" [\u00D7 ", t('balance-close'), "]"] }) })] })), _jsx(Text, { dimColor: true, children: t('balance-hint') })] }))] })] }));
}
