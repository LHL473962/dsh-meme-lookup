/**
 * EffortTierBadge — 输入行尾的档位字样徽标：三幕点焰的第二幕载体
 * （与 EffortInputBorder 的双框扫光同一时间轴、同一触发），切到最高
 * 思考强度档时光带行至中段，输入行居中浮现档名（当前档名大写，字母间距从
 * 10 个空格减速聚拢到 1 个——连续位置逐字母取整保证帧帧有移动，
 * 明亮蓝加粗，由暗渐亮），随后随图层整体渐隐让位——行数恒定，静
 * 止时完全不渲染；输入行有文字时不显示（绝不遮挡内容）。
 *
 * 触发判定在渲染期做（props-变化-调整模式，与边框/充能组件同模
 * 式）；冷启动恢复偏好/单档表/无档位表/无共享时钟均不触发。时钟
 * 复用 Ink core 共享时钟，仅动画窗口订阅（keepAlive），播完归零。
 */
import React from 'react';
export declare function EffortTierBadge({ effort, levels, columns, leadingColumns, }: {
    /** 当前思考强度档 id；`undefined` 表示路线未声明。 */
    effort: string | undefined;
    /** 当前路线的档位表（低→高，末位为最高档）；未知时传 `undefined`。 */
    levels: readonly string[] | undefined;
    /** 终端列数——居中锚点按终端几何中心计算（纯文本流，不引入嵌套 Box）。 */
    columns: number;
    /** badge 文本流之前该行已被占据的列数（❯ 与块光标等）——居中换算成
     *  badge 流内列时要扣掉，否则整体偏右一个前缀宽。 */
    leadingColumns: number;
}): React.ReactNode;
//# sourceMappingURL=EffortTierBadge.d.ts.map