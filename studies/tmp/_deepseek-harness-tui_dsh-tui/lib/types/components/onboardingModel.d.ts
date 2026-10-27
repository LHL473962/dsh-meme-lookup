import type { LlmModelInfo, LlmProviderInfo } from '../adapter/ports/channel-view.js';
import type { BalanceResult } from '../adapter/ports/channel-catalog.js';
/** 引导的四个配置域，按"先解决拦路的事、再解决好不好看、最后解决怎么用"排。 */
export declare const ONBOARDING_STEPS: readonly ["apikey", "look", "model", "keys"];
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
/**
 * 步骤条需要的**最小**尺寸：四步的标题横排（`❯ API Key 与连通性 · ...`）
 * 在 76 列下会被截成残句，在 8 行下会把内容挤没——那时整条不画，进度改由
 * 头部那行"第 N / 4 步"承担（信息不丢，只是换了个地方）。
 */
export declare const STEP_BAR_MIN_COLUMNS = 76;
export declare const STEP_BAR_MIN_ROWS = 10;
/** 第四步（招式卡）里的一张卡。 */
export interface TutorialCard {
    /** 稳定 id（"试过没有"记在它上面）。 */
    readonly id: string;
    readonly titleKey: string;
    readonly descKey: string;
    /**
     * 可试的命令名（不含斜杠）；`undefined` = 只能读的键位卡。
     *
     * 键位卡故意不给"试一下"：`Esc` / `Ctrl+C` 只有在真回合里才有意义，在引导
     * 里按下去要么没反应、要么把引导关掉——那是在骗人。命令卡则真的能开：
     * 交给 Chat 的 `runCommand`，与手敲 `/help` 走同一条路。
     */
    readonly command?: string;
    /** 键位卡的按键动作 id（`utils/keymap` 的 `ShortcutActionId`）。 */
    readonly action?: 'cancel';
    /** 纯字面量的键（`/` / `?` 这类不是可重绑动作的）。 */
    readonly literal?: string;
}
/**
 * 招式卡表：四张能**直接试用**的命令卡 + 两张只能读的键位卡。
 * 顺序 = 使用频率，不按重要性；第一张是用户最先会需要的。
 */
export declare const TUTORIAL_CARDS: readonly TutorialCard[];
/**
 * 某一步的标题 key。
 * @param step - 步骤 id。
 * @returns 该步标题的 i18n key。
 */
export declare function stepTitleKey(step: OnboardingStep): string;
/**
 * 某一步的说明 key。
 * @param step - 步骤 id。
 * @returns 该步说明的 i18n key。
 */
export declare function stepDescKey(step: OnboardingStep): string;
/** provider 分组（首现顺序，名字用注册表的，取不到就退回 route key）。 */
export declare function modelGroupsOf(models: readonly LlmModelInfo[], providers: readonly LlmProviderInfo[]): readonly {
    provider: string;
    label: string;
    count: number;
}[];
/**
 * 余额显示串：取第一条，币种码直接用接口给的（不猜符号）。
 *
 * @param result - `channel.balanceInfo()` 的返回值。
 * @returns `"CNY 110.00"` 这类串；没有可用条目时 `null`。
 */
export declare function formatBalance(result: BalanceResult): string | null;
/**
 * 连通性失败分类 → 可执行的下一步。
 *
 * 分类口径与 `BalanceResult.reason` 一一对应，因为"检查网络"这种话对
 * `unauthorized` 的用户毫无用处——五种原因要指向五个不同的动作，这正是
 * `BalanceResult` 分了五类的原因。
 *
 * @param reason - `BalanceResult.reason`。
 * @param status - 非 2xx 时的状态码。
 * @returns 给用户看的排查方向。
 */
export declare function connFailText(reason: string, status?: number): string;
/**
 * 凭证来源的显示文案。`CredentialStatus.source` 是 adapter 自己的口径
 * （`'env'` / `'config'` / 其他），这里只做展示映射，认不出的值一律走
 * "未知"而不是把原始串丢到界面上——那个串属于 adapter 内部词汇。
 *
 * @param source - `CredentialStatus.source`。
 * @returns 一句中文/英文来源说明。
 */
export declare function credentialSourceText(source: string | undefined): string;
//# sourceMappingURL=onboardingModel.d.ts.map