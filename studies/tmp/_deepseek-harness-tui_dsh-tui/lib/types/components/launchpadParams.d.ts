/**
 * 落地页参数行的**三段式宽度分配**（2026-10）。
 *
 * 参数行是输入框下那一行四段值：`模型 · 思考深度 · agent preset 显示名 ·
 * 权限 preset 名`。改造前是「逐段累加、第一个超预算的段直接 break」，于是
 * **从尾部整段消失**（权限 → preset → 思考深度 → 模型）——preset 显示名一长
 * （名册的 `config.name`，长度不可控），最先走的恰好是那一屏唯一的安全读数
 * （`danger-full-access` = 不审批 + 全盘写）。
 *
 * 现在的三档（自顶向下，第一个成立者胜出）：
 *
 *   ① FIT       —— 四段按原样装得下 → **原样返回**（常规场景逐字节不变）；
 *   ② TRUNCATED —— 装不下 → 挑**可缩减量最大**（`宽度 - 下限`）的段做**尾部
 *                   截断**（`truncateToWidth(text, max - 1) + '…'`），一次减掉
 *                   当前超宽量；减到各自的 `PARAM_SEGMENT_MIN_WIDTH` 或装下为止。
 *                   **权限段不被截断**、宽度 ≤ 下限的段不可减（`Max` 这类短段
 *                   因此永不被砍）——所以这一档**四段都在**，被压缩的是最长的
 *                   非权限段；
 *   ③ FALLBACK  —— 非权限段全压到下限仍装不下（**完整权限名放不进预算**时——
 *                   终端 ≥76 列后，再宽也不改变结果；更窄的终端或更长的权限名
 *                   都会更早触发）→ **逐字节复刻改造前的尾部省段**：用**原始宽度**
 *                   按显示顺序累加、首个超预算即 break（权限段最先被省；用户裁决
 *                   这一档"与今天逐字节一致"，决策当时的措辞是"极窄屏"——
 *                   准确条件即上面这条）。
 *
 * 纯函数：不改入参、不读环境、同样输入恒同样输出——`verify-launchpad.tsx`
 * 的 Q 组表驱动回归钉死三档与边界（含"撤实现必红"留证）。
 *
 * **改动本契约时必须同时更新的地方**：本模块顶部的两个常量与三条注释、
 * `Launchpad.tsx` 的接入点、`scripts/verify-launchpad.tsx` 的 Q 组、
 * `docs/interaction{,.en}.md` 与 `docs/user-guide{,.en}.md`（+ `guide/**` 副本）。
 */
/**
 * 段之间的分隔符——**与组件渲染的那串是同一个**（两侧各两格）。导出它是为了让
 * `Launchpad.tsx` 画分隔符时直接用它、别再造一份字面量：这里的宽度记账与那边
 * 画出来的字符必须是同一个决定，否则改一处就悄悄错位。
 */
export declare const PARAM_SEPARATOR = "  \u00B7  ";
/**
 * 每段被压缩后的**显示宽度下限**（含 `…`）：12 格 ≈ 11 个可见字符，仍能读出
 * 段首词（`Standard (G…`、`deepseek-fl…`）；再小就只剩两三个字符，阅读价值不
 * 足以继续挤压别的段——那时让位给兜底档更诚实。量级参照同族常量
 * `LAUNCHPAD_CONTINUE_TITLE_MAX = 16`（`launchpadActions.ts`）。
 */
export declare const PARAM_SEGMENT_MIN_WIDTH = 12;
/**
 * **永不被截断**的段：权限 preset 名是启动第一屏唯一的安全读数（危险权限 =
 * 不审批 + 全盘写），半截的权限名和没有权限名一样不可靠。它是"截断阶段"的
 * 豁免；兜底档仍按改造前的顺序整段省（用户裁决，见模块头注释③）。
 */
export declare const PARAM_UNTRUNCABLE_SEGMENT = "permission";
/**
 * 参数行的一段（与 `Launchpad.tsx` 的 `paramParts` 同形）。
 * `S` 是段的字面量联合（`LaunchpadParamSegment`），泛型原样透传、不丢字面量类型
 * ——Chat 侧按 `segment` 分派选择器。
 */
export interface ParamPart<S extends string = string> {
    /** 段的身份（焦点环、选择器分派都用它）。 */
    readonly segment: S;
    /** 当前显示值（拟合前的原值）。 */
    readonly value: string;
    /** 模型段带主题色（其余 dim）；原样透传给组件。 */
    readonly colored?: boolean;
}
/**
 * 参数行降级的**档位**（T-FIX-05 / REVIEW F-09）：三档契约的机器可读载体。
 *
 * 以前"这一次落在哪一档"只活在模块头注释与回归的推断里，文档一旦漂移（F-02 就是
 * 漂了的那一处）没有任何机制能发现；现在它是 `FittedParamPart.tier`，可以直接断言
 * ——断它比断 `truncated` 或数组长度更贴近契约本身（"哪一档"是契约，"某段是否被截"
 * 只是档内的结果）。
 */
export type ParamFitTier = 'fit' | 'truncated' | 'fallback';
/** 拟合后的一段：显示值 + 是否被截断 + 完整名（tooltip 用）+ 档位。 */
export interface FittedParamPart<S extends string = string> {
    /** 段的身份（原样透传）。 */
    readonly segment: S;
    /** 最终显示值；被截断时以 `…` 结尾，其余与 `fullValue` 逐字节相同。 */
    readonly value: string;
    /** 模型段带主题色（原样透传）。 */
    readonly colored?: boolean;
    /** 完整名（截断前的原值）——hover tooltip 显示它。 */
    readonly fullValue: string;
    /** 本段是否被尾部截断（`value !== fullValue` 的等价标志）。 */
    readonly truncated: boolean;
    /**
     * 本行落在哪一档：`fit` 原样 / `truncated` 尾部截断 / `fallback` 尾部省段。
     * **同一行的各段恒相同**（档位是"行"的决定，不是"段"的）。
     */
    readonly tier: ParamFitTier;
}
/**
 * 参数行的宽度分配（落地页唯一的入口；组件不要再自己写累加循环）。
 *
 * @param parts - 按**显示顺序**给出的段（模型 · 思考深度 · preset · 权限）。
 * @param budget - 这一行的显示宽度预算（`max(24, min(columns - 4, 72)) - 2`）。
 * @returns 拟合后的段（新数组；FIT 档与入参逐字节等值，TRUNCATED 档四段都在）。
 *   每段的 `tier` 标明本行落在哪一档（见 `ParamFitTier`）——同一行的各段恒相同。
 */
export declare function fitParamParts<S extends string>(parts: readonly ParamPart<S>[], budget: number): readonly FittedParamPart<S>[];
//# sourceMappingURL=launchpadParams.d.ts.map