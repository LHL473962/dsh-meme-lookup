import React from 'react';
import type { CommandCompletion } from '../commands.js';
import type { Brand } from '../branding.js';
import { type LaunchpadAction } from '../components/launchpadActions.js';
import { type KernelOption } from '../components/kernelCatalog.js';
import { type SplashEgg } from '../components/splashEggs.js';
import { type ClipboardRead } from '../utils/clipboard.js';
import type { ChannelUi } from '../adapter/channel/ui-policy.js';
import type { InputEvent } from '../ink/events/input-event.js';
/** 动作入口的类型与状态驱动纯函数在 `launchpadActions.ts`（第四版拆出，表驱动回归在那边）。 */
export type { LaunchpadAction } from '../components/launchpadActions.js';
/**
 * 参数行的四段身份（第五版：四段各自可点，点开 Chat 既有的选择器 overlay；
 * 第六版设计 1：`mode` 段换成 `preset`——用户说的"模式"是 Standard/PTC/极简
 * 那套 agent preset（channel.agentPreset + /preset 名册），不是 plan/act）。
 */
export type LaunchpadParamSegment = 'model' | 'effort' | 'preset' | 'permission';
/**
 * Launchpad —— 每次启动的第一屏（取代旧的"只有鲸鱼标题的空白会话"）。
 *
 * 它**不是一个新页面**：整块视觉核心仍然是 `LogoV2`（像素鲸鱼 / 女仆娘立绘、
 * 块体 `DEEPSEEK`/`HARNESS` 大字、节日换词、求 star 彩蛋——一套代码），但走
 * `LogoV2` 的 chrome="minimal" 极简形态并 align="center"：只有立绘与大字，
 * 版号/模型/工作目录/启动提示/欢迎语一概不画（用户实测要求 opencode 式
 * 留白；欢迎语曾经和落地页自己的一行重复，两处一起删）。
 *
 * 版面（2026-10 第三版改版）：**头部 + 输入框 + 框下成组三行**整块水平垂直
 * 双居中，不再把提示行钉到屏幕底部、中间不留大空档：
 *
 *   - 输入框（圆角边框）里**只有输入那一行**；
 *   - 紧贴框下方一行**参数行**（左对齐输入框）：`模型 · 思考深度 · 模式 · 权限`，
 *     四段缺哪段省哪段、全空整行不画；模型段**只显示模型名**（不带 provider/
 *     前缀）且带浅紫主题色（autoAccept）；第五版起四段**各自可点**，点开 Chat
 *     既有的选择器（overlayPanel 盖在本屏之上，选中值就地更新这一行）；
 *   - 隔一行呼吸留白（矮屏阶梯可撤，见 launchpadLayout）再一行**键帽按钮**
 *     （整行右对齐，与输入框右缘对齐）；
 *   - 再下一行 **`● Tips：`**（居中，圆点橙色 warning）。
 *
 * 屏幕最底的双角铭牌（左 `cwd:branch`、右下 `dsh-tui v…` + **内核区**）保留：
 * 第八版起右下第一行仍是 TUI 版本，其后一行一个可选内核——当前内核打 `▸ ` 且
 * 主题蓝，其余行 dim；整块可点（键盘等价操作 = 焦点环末格 + Enter）。
 *
 * **输入框在这一屏是唯一有状态的部件**：用户敲进去的东西必须原样带进聊天页，
 * 否则"第一屏输入的字"就被这一屏吞了。第六版起行首 `/` 会弹出**命令补全面板**
 * （`commands`/`onCommandPick` 两缝，数据与组件都与聊天页 composer 同源），
 * Tab 补全到输入框，Enter/点击执行并清空输入；面板收起时整行原样交给 `onSubmit`，由 `Chat`
 * 走它既有的命令表判定（合并命令表，含 registry 命令）再决定 runCommand 或
 * 发送。Shift/Option+Enter 则交给 Chat 带着草稿继续多行编辑。本地只读一点：
 * 行首是不是 `/`，用来把输入框左边的提示符从 `❯` 换成
 * `⌘`。
 *
 * TTY 输入使用终端原生光标，闪烁与动画继承终端配置。无原生光标的
 * 呈现环境保留约 550ms 的样式闪烁；相位不增删字符、不挪动文本。
 *
 * 居中与降级：宽度走 `resolveSplashLayout` 那一套（与开屏同源，阈值不会漂），
 * 高度走 `resolveLaunchpadLayout`（整块撤：Tips → 键帽行 → 立绘 → 只留输入框）。
 *
 * 鼠标：`onClick`/`onMouseEnter` 只在 `<AlternateScreen>` 里触发，内联模式
 * 天然没有它们，所以每个可点目标都必须有一条键盘路径（这里全部有：焦点 +
 * Enter）。
 */
export declare function Launchpad({ query, cursorOffset, focusIndex, isTerminalFocused, whale, whaleIdle, whaleGirl, brand, companionSkin, fontId, egg, starred, onStarClick, firstRun, actions, overlayPanel, inputPaused, onParamPick, model, effort, preset, permission, commands, onCommandPick, clipboardReader, imageComposer, 
/** Tips 自动轮换间隔（第七版；测试缝：无头回归注入短间隔确定性驱动相位）。 */
tipRotateMs, notice, 
/** 左下角工作目录铭牌被点击/回车时交给 Chat（开既有的 /workspace 工作区菜单）。 */
onOpenWorkspace, 
/** 右下角内核区的目录行（第八版：一行一个内核，当前那个打 ▸）。 */
kernels, 
/** 右下角内核区被点击/焦点环 Enter 时交给 Chat（打开内核选择器）。 */
onKernelPick, cwd, branch, tuiVersion, onFocusChange, onAction, onQueryChange, onSubmit, onNewline, onHandoffInput, onEscape, onBlankClick, }: {
    /** 输入框里的原文（由 Chat 持有——这一屏卸载后它还要活到聊天页）。 */
    query: string;
    /** 光标在 `query` 里的 UTF-16 偏移（`SearchBox` 的 `cursorOffset`）。 */
    cursorOffset?: number;
    /** 快捷入口的焦点行下标；`-1` 表示焦点在输入框。 */
    focusIndex: number;
    isTerminalFocused: boolean;
    whale: boolean;
    whaleIdle: boolean;
    whaleGirl: boolean;
    /** 品牌档（当前后端 → `resolveBrand`；见 `branding.ts`）。 */
    brand?: Brand;
    /**
     * 测试缝：`companion.skin` 的固定值（`deepy` / `whaleGirl`）；undefined 按
     * 设置读。立绘行数预算与 `LogoV2` 的渲染分支**必须同源**，所以这一层既拿它
     * 算 `artRows`、也原样透传给 `LogoV2`（见 `splashArtRows.ts`）。
     */
    companionSkin?: string | undefined;
    fontId?: string | undefined;
    /** 测试缝：固定节日词对；null 关闭换词，undefined 按本地日期选择。 */
    egg?: SplashEgg | null;
    starred: boolean;
    onStarClick?: () => void;
    /** 引导还没跑过：Tips 换成首启那一句（动作表本身已由 resolveLaunchpadActions 状态驱动）。 */
    firstRun: boolean;
    /**
     * 状态驱动的动作表（第四版）：`Chat` 用真实状态快照解出
     * `resolveLaunchpadActions(state)` 再传进来——这一屏只负责画与交互，
     * 不自己猜"下一步是什么"。恒 ≤4 条；`theme`/`lang`/`settings` 永不在表里。
     */
    actions: readonly LaunchpadAction[];
    /**
     * 盖在落地页之上的选择器面板（第五版）：Chat 把它既有的 picker overlay
     * （/model · /effort · /plan · /permission 那套）原样传进来，本屏只负责
     * 挂载位置——OverlayAbove 锚在输入框卡片顶边、向上展开，选择器吃键盘
     *（见 `inputPaused`），Esc 关掉它回到落地页，选中的值就地更新参数行。
     * 不传 = 没有选择器在开（正常落地页形态）。
     */
    overlayPanel?: React.ReactNode;
    /**
     * 选择器盖在落地页之上时为 true：本屏的 useInput 整块让位（选择器的按键
     * 由 Chat 的 overlay 分支处理；未消费的键不许漏进草稿）。
     */
    inputPaused?: boolean;
    /**
     * 参数行四段被点击/回车时交给 Chat 的段身份（第五版）。Chat 把它映射到
     * 既有命令（model→/model、effort→/effort、preset→/preset、permission→
     * /permission），打开的就是聊天页同款选择器——本屏不自己造选择器。
     */
    onParamPick?: ((segment: LaunchpadParamSegment) => void) | undefined;
    /**
     * 框下参数行的四段（第三版：参数行移出输入框、紧贴框下方，左对齐输入框）：
     * 模型（**只显示模型名**，不带 provider/ 前缀——第五版用户要求「两个都放
     * 太长了」）、思考深度（effort）、模式（第六版设计 1：agent preset 的
     * 显示名，如 Standard/PTC/极简——`Chat` 读 `channel.agentPreset` 那套）、
     * 权限（permission preset 当前身份）。任一段拿不到就省掉那一段，全拿不到
     * 就整行不画（成组行矮一行，见 `resolveLaunchpadLayout` 的 `params`）。
     */
    model?: string | undefined;
    effort?: string | undefined;
    /** 当前 agent preset 的显示名（Standard/PTC/极简…）；缺省不画那一段。 */
    preset?: string | undefined;
    /** 当前权限预设名（`Chat` 读 `channel.permissionPresets()` 的当前身份）；缺省不画。 */
    permission?: string | undefined;
    /**
     * 命令补全面板的数据源（第六版 BUG 1）：行首 / 时 Chat 传
     * `channel.commandCompletions(query)` 的结果进来——与聊天页 composer 的
     * 补全**同一个来源、同一个组件**（CommandSuggestions），本屏不另造一套。
     * 不传（或空数组）= 不画面板（孤立回归夹具的默认形态）。
     */
    commands?: readonly CommandCompletion[] | undefined;
    /**
     * 补全面板选中一条（Enter/点击）时交给 Chat 的**完整命令行**
     * （如 /setup）。普通命令经 runCommand 执行，模型路由技能作为消息
     * 提交；拒绝时返回提示并保留草稿。
     */
    onCommandPick?: ((commandLine: string) => string | void) | undefined;
    /**
     * 剪贴板读取缝（测试打桩用；生产走 `utils/clipboard` 的 `readClipboard`，
     * Chat 不传这一项）。签名与 `readClipboard` 一致。
     */
    clipboardReader?: () => Promise<ClipboardRead>;
    /** Chat owns the bindings so attachments survive a full-screen round trip. */
    imageComposer?: {
        channel: ChannelUi;
        bindings: Map<string, string>;
    };
    /** Tips 自动轮换间隔（第七版；测试缝，生产用默认 10s）。 */
    tipRotateMs?: number;
    /** Chat 的最近一条 channel 通知：落地页没有 toast 区，借 Tips 行显示（粘贴提示优先）；过期由 channel 负责。 */
    notice?: {
        readonly text: string;
        readonly color?: 'error' | 'warning' | 'success';
    } | undefined;
    /** 左下角工作目录铭牌被点击/焦点环 Enter 时交给 Chat（开 /workspace 菜单）。 */
    onOpenWorkspace?: (() => void) | undefined;
    /**
     * 右下角内核区的目录行（第八版：`buildKernelCatalog` 的产物，数组顺序即
     * 显示顺序）；缺省（或空数组）= 右侧只有 TUI 版本那一行——绝不编造内核号，
     * 也不再单独传一个内核版本号（版本已经进了每一行）。
     */
    kernels?: readonly KernelOption[] | undefined;
    /**
     * 内核区被点击 / 焦点环 Enter 时交给 Chat（打开内核选择器）。键盘路径是
     * 仓库硬规矩：给了它，焦点环才多出 KERNEL_CORNER_FOCUS 那一格。
     */
    onKernelPick?: (() => void) | undefined;
    /** 双角铭牌：左下角的工作路径与分支。 */
    cwd?: string | undefined;
    branch?: string | undefined;
    /** 双角铭牌：右下第一行的 TUI 版本号（其后是 kernels 的内核区）。 */
    tuiVersion?: string | undefined;
    onFocusChange: (index: number) => void;
    onAction: (action: LaunchpadAction) => void;
    /** 输入框内容变化（含光标位置）。 */
    onQueryChange: (text: string, cursor: number) => void;
    /** 提交：交给 Chat 分派；拒绝时返回提示并保留草稿。 */
    onSubmit: (text: string) => string | void;
    /** Shift/Option+Enter：交给 Chat 在当前光标处换行并继续编辑，保持未发送。 */
    onNewline?: (text: string, cursor: number) => void;
    /** Remaining keys before the composer mounts belong to the handed-off draft. */
    onHandoffInput?: (event: InputEvent) => void;
    /** 空输入时按 Esc / `Ctrl+C`：`sessions` 去看会话，`exit` 走双击退出漏斗。 */
    onEscape: (intent: 'sessions' | 'exit') => void;
    /** 点空白处：把焦点收回输入框（不是提交、不是关闭）。 */
    onBlankClick: () => void;
}): React.ReactNode;
/** 快捷入口之间的间隔列数（与动作行 `gap={2}` 一致，预算必须同源）。 */
export declare const CHIP_GAP = 2;
/**
 * 一行装得下哪几个快捷入口（第四版：纯文字标签）。
 *
 * @param labels - 全部标签（宽度按 `stringWidth` 算，CJK 是双宽）。
 * @param columns - 内容区列数。
 * @returns 保留下来的 `{ index, label }`；装不下就到此为止（绝不切半个）。
 */
export declare function fitChips(labels: readonly string[], columns: number): readonly {
    index: number;
    label: string;
}[];
/**
 * 光标左移一个**码位**（不是 UTF-16 单元）。
 *
 * `Array.from` 迭代码位，所以退格/左移不会把一个 emoji 或代理对劈成两半
 * ——`SearchBox` 的窗口化在同一条假设上工作（它的 `windowQuery` 专门有
 * 一段"中途代理对回退到起点"的代码），两边必须一致，否则光标会落在半
 * 个字符里，然后下一次按键就画出一个碎 emoji。
 *
 * @param text - 全文。
 * @param at - 当前 UTF-16 偏移。
 * @returns 左侧一个码位的偏移（已在 0 时返回 0）。
 */
export declare function prevBoundary(text: string, at: number): number;
/**
 * 光标右移一个码位。见 {@link prevBoundary}。
 * @param text - 全文。
 * @param at - 当前 UTF-16 偏移。
 * @returns 右侧一个码位的偏移（到末尾时返回末长）。
 */
export declare function nextBoundary(text: string, at: number): number;
/** 最小模式这一屏整体不存在（与 `LogoHeader` 同规则）：直接进会话。 */
export declare function launchpadVisible(): boolean;
//# sourceMappingURL=Launchpad.d.ts.map