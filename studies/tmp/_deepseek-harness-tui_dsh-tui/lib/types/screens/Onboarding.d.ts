import React from 'react';
import { type Lang } from '../i18n.js';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
import type { TuiThemeHost } from '../dsh-adapter/themes.js';
/**
 * Onboarding —— 首次运行的引导向导（`~/.dsh-tui/onboarding.json` 走一次性记账）。
 *
 * 身为一个屏幕，它跟 `SessionSupervisor` 同规矩：所有 hook 先跑完，再由
 * `Chat` 的渲染链提前 return。它**自己读 channel**（`describeCredential` /
 * `balanceInfo` / `listModels` / `listWorkspaces`…），不把十几份数据从 Chat
 * 传进来——那正是 supervisor 的做法。
 *
 * 键盘归它独占（`Chat` 在 `supervisorOpen` 那一层之前让位），所以每一步
 * 的 picker 都能借用同一份 `focusIndex`，不需要各自注册 `useInput`。
 *
 * **凭证永远只报"有没有"，不报值**：`describeCredential` 回的是不含秘密的
 * 元数据，界面上也照它的原样画。
 */
export declare function Onboarding({ channel, themeHost, onClose, onRunCommand, onApplyLang, initialStep, externalNotice, }: {
    channel: Channel;
    themeHost?: TuiThemeHost;
    /** 跳过 / 完成：把状态交回 Chat（它负责记账与切屏）。 */
    onClose: (outcome: 'skipped' | 'done') => void;
    /** 招式卡的"试一下"：交给 Chat 的 `runCommand`（与手敲 `/help` 同一条路）。 */
    onRunCommand: (name: string) => void;
    /**
     * 语言切换：交给 Chat 的 `applyLang`（写 `~/.dsh-tui/lang.json`、通知
     * settings 层、再 `setLang` 热换整棵 UI）。引导不自己写偏好文件——那套
     * 优先级（env > cordis.yml > 持久化）只有 Chat 手里那一份。
     */
    onApplyLang: (lang: Lang) => void;
    /** 测试缝：直接落在某一步（探针不重复走前几步）。 */
    initialStep?: number;
    /** 测试缝：外部注入一句提示（真机不传）。 */
    externalNotice?: string;
}): React.ReactNode;
//# sourceMappingURL=Onboarding.d.ts.map