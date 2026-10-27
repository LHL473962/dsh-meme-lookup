/**
 * ctx.tuiPanels — 插件侧栏 Panel 服务（设计文档 §8/§18，v2.1 修订，Phase 6）。
 *
 * 与 tuiStatus/tuiScenes 同一接缝家族：一份 Cordis-free 的进程级 store
 * （components/sidePanel/PanelStore，注册/badge/错误隔离）+ 一层薄的
 * Cordis 服务做准入（requirePluginCaller → activationFiber owner →
 * bindCallerEffect 撤下 → 能力 shadow policy → 重复 id
 * DUPLICATE_CONTRIBUTION_ID → Object.freeze descriptor）。
 *
 * 本阶段范围（§18.2 简化版）：
 * - register：宿主自动加 '<pluginId>:' 前缀；mountPolicy 强制 'active'；
 *   minColumns 默认 28；预算 = 每插件 ≤4 个 / 全局 ≤32 个。
 * - list：只读摘要（id/title/source，不含组件）。
 * - open/close：仅自己注册的 id；open 为 mutate 且限速（每插件每 5s 至多
 *   1 次，超过丢弃并记 ledger）；UI 触达经 panelBridge（useSidePanel 订阅）。
 * - badge：仅自己注册的 id → panelStore.setBadge。
 * - subscribe：仅涉及自己 Panel 的事件（本阶段 registered/unregistered/
 *   badge/error/disabled；opened/closed/focused/blurred/sidebar-toggled 事件
 *   源在 useSidePanel 侧，留 TODO）。
 * - compact：descriptor 校验 + 存档，渲染槽不挂载（TODO §18.1）。
 */
import type React from 'react';
import { Context, Service } from '@deepseek-ai/cordis';
import type { TuiPluginStorage } from './plugin-storage.js';
/** 插件 Panel API 版本（§18.2）：descriptor.apiVersion 必须精确匹配。 */
export declare const TUI_PANEL_API_VERSION = 1;
/** 每插件 Panel 预算（§18.4）。 */
export declare const MAX_PANELS_PER_PLUGIN = 4;
/** 全局插件 Panel 注册预算（§18.4）。 */
export declare const MAX_PLUGIN_PANELS_TOTAL = 32;
/** open() 限速窗口：每插件每窗口至多 1 次。 */
export declare const PANEL_OPEN_RATE_LIMIT_MS = 5000;
type TuiPanelForbiddenBoxProps = 'ref' | 'tabIndex' | 'autoFocus' | 'onContextMenu' | 'onFocus' | 'onFocusCapture' | 'onBlur' | 'onBlurCapture' | 'onKeyDown' | 'onKeyDownCapture';
/** Box 保留 click/hover/drag/onWheel；焦点/键盘/上下文菜单被收走。 */
export type TuiPanelBoxProps = Omit<React.ComponentProps<typeof import('../ui.js').Box>, TuiPanelForbiddenBoxProps>;
export type TuiPanelTextProps = Omit<React.ComponentProps<typeof import('../ui.js').Text>, 'ref'>;
/** Image 走既有图片预算/协议回退路径（与 status view 的 Image 同一通道）。 */
export type TuiPanelImageProps = React.ComponentProps<typeof import('../ui.js').Image>;
export type TuiPanelScrollBoxProps = Omit<React.ComponentProps<typeof import('../ui.js').ScrollBox>, 'ref'>;
export type TuiPanelDividerProps = React.ComponentProps<typeof import('../components/design-system/Divider.js').Divider>;
/**
 * 面板内 markdown 正文：只收字符串。宽度走面板作用域的 TerminalSizeContext
 * （PanelHost 已把 columns 收窄到面板宽），主题走只读 useTheme。
 *
 * 与上面几个**刻意不同**：它们是「直通宿主组件、只砍危险 prop」的 Omit 收窄，
 * 这两个是**新定义的包装面**——只承诺一个字段，宿主组件的 props、实现与依赖
 * 怎么改都不动这里的契约（包装在 components/sidePanel/panelMarkdown.tsx）。
 */
export interface TuiPanelMarkdownProps {
    readonly children: string;
}
/** 面板内单个代码块：收原始文本 + 可选语言标签；围栏长度、语言标签清洗与
 *  语法高亮都由宿主包装层负责，插件拿不到 token 或 highlight 句柄。 */
export interface TuiPanelCodeBlockProps {
    readonly code: string;
    readonly language?: string;
}
/**
 * 面板内 UI kit：宿主 React + 收窄组件 + Panel 尺寸感知。钩子和元素
 * 必须走宿主 React（与 plugin scene 同一 single-React 规则）。
 */
export interface TuiPanelUi {
    readonly Box: React.ComponentType<TuiPanelBoxProps>;
    readonly Text: React.ComponentType<TuiPanelTextProps>;
    readonly Image: React.ComponentType<TuiPanelImageProps>;
    readonly ScrollBox: React.ComponentType<TuiPanelScrollBoxProps>;
    readonly Divider: React.ComponentType<TuiPanelDividerProps>;
    /** 恒等于 Panel 的 { width, height }。 */
    readonly useTerminalSize: () => {
        readonly columns: number;
        readonly rows: number;
    };
    /**
     * 面板内唯一合法定时源：内部是 useAnimationFrame(ms) 的时间值（[1]）。
     * 不暴露 hook 本体是因为其另一个返回值是必须挂到动画元素上的 ref——
     * 插件乱挂会破坏共享时钟的可见性测度；时间值本身已覆盖面板动画的
     * 全部需求（传 null 暂停）。
     */
    readonly useAnimationTime: (intervalMs: number | null) => number;
    /** 只读主题。 */
    readonly useTheme: typeof import('../ui.js').useTheme;
    /** 面板内 markdown 正文（实验性）；只收字符串，拿不到 token/句柄。 */
    readonly Markdown: React.ComponentType<TuiPanelMarkdownProps>;
    /** 面板内单个代码块（实验性）；围栏与高亮由宿主负责。 */
    readonly CodeBlock: React.ComponentType<TuiPanelCodeBlockProps>;
}
export type TuiPanelBadgeLevel = 'info' | 'warning' | 'error';
export type TuiPanelMode = 'split' | 'zoom' | 'fullscreen';
/** v2.1 键盘契约的插件视图：preventDefault() = 阻止宿主回退键。 */
export interface TuiPanelKeyEvent {
    readonly input: string;
    readonly key: import('../components/sidePanel/types.js').SidePanelKeyFlags;
    preventDefault(): void;
}
/** 策展只读会话快照：SidePanelRuntimeContext 的结构拷贝，不含转录
 * 正文/凭证/文件内容（§18.2）。 */
export interface TuiPanelSnapshot {
    readonly sessionId: string;
    readonly cwd: string;
    readonly lang: string;
    readonly working: boolean;
    readonly spinnerMode: string;
    readonly version: number;
    readonly goal: Readonly<{
        readonly objective: string;
        readonly phase: 'active' | 'paused' | 'blocked' | 'complete';
        readonly roundsStarted: number;
        readonly maxGoalRounds: number;
    }> | undefined;
    readonly todos: readonly Readonly<{
        readonly content: string;
        readonly status: string;
    }>[];
    readonly backgroundJobs: readonly Readonly<{
        readonly id: string;
        readonly kind: string;
        readonly label: string;
        readonly status: string;
        readonly progress?: string;
        readonly detail?: string;
        readonly startedAt: number;
    }>[];
    readonly subagents: readonly Readonly<{
        readonly agentId: string;
        readonly description: string;
        readonly status: string;
        readonly mode?: string;
        readonly model?: string;
        readonly startedAt: number;
        readonly completedAt?: number;
    }>[];
    readonly attention: Readonly<{
        readonly approvals: number;
        readonly questions: number;
    }>;
    readonly activity: Readonly<Record<string, unknown>> | undefined;
}
/** 面板内 host API（§18.2；sendToChat 本阶段恒 false——授权未落地）。 */
export interface TuiPanelHostApi {
    /** 策展只读快照（每次调用结构拷贝）。 */
    snapshot(): TuiPanelSnapshot;
    readonly focused: boolean;
    notify(level: TuiPanelBadgeLevel, unread?: number): void;
    clearBadge(): void;
    /** 本阶段返回 false 并 toast 一次：需要 panels.chat.attach 授权（后续版本）。 */
    sendToChat(payload: {
        readonly title: string;
        readonly content: string;
    }): boolean;
    /** 仅打开自己注册的全屏场景（tuiScenes 做 owner 校验）。 */
    openScene(id: string): boolean;
    toast(text: string): boolean;
    /** 自己的 tuiPluginStorage 句柄（服务未挂时 undefined）。 */
    readonly storage: TuiPluginStorage | undefined;
    /** 仅 focused 期间投递（v2.1 分发器）。 */
    onKey(listener: (event: TuiPanelKeyEvent) => void): () => void;
    /** 侧栏展开且自己 active 时聚焦（useSidePanel 侧裁决）。 */
    focus(): boolean;
}
/** 插件 Panel 组件 props。 */
export interface TuiPanelProps {
    /** 宿主 React——所有钩子与元素必须经它（single-React 规则）。 */
    readonly React: typeof React;
    readonly ui: TuiPanelUi;
    readonly host: TuiPanelHostApi;
    readonly width: number;
    readonly height: number;
    readonly focused: boolean;
    readonly visible: boolean;
    readonly mode: TuiPanelMode;
}
/** compact 行 props（本阶段仅校验，不挂载渲染——槽位 TODO §18.1）。 */
export interface TuiPanelCompactProps {
    readonly React: typeof React;
    readonly ui: Pick<TuiPanelUi, 'Box' | 'Text'>;
    readonly width: number;
    readonly badge: {
        readonly level: TuiPanelBadgeLevel;
        readonly unread: number;
    } | null;
}
/** 注册 descriptor（§18.2）。 */
export interface TuiPanelDescriptor {
    readonly apiVersion: typeof TUI_PANEL_API_VERSION;
    /** 单段小写 slug；宿主自动加 '<pluginId>:' 前缀。 */
    readonly id: string;
    readonly title: string;
    /** 显示宽度必须为 1。 */
    readonly icon?: string;
    readonly minColumns?: number;
    readonly order?: number;
    readonly component?: React.ComponentType<TuiPanelProps>;
    readonly compact?: {
        readonly maxRows: 1 | 2 | 3;
        readonly component: React.ComponentType<TuiPanelCompactProps>;
    };
}
/** subscribe 的事件（本阶段：注册/撤下/badge/错误/禁用；opened/closed/
 * focused/blurred/sidebar-toggled 的事件源在 useSidePanel 侧，留 TODO）。 */
export type TuiPanelEvent = {
    readonly type: 'registered';
    readonly id: string;
} | {
    readonly type: 'unregistered';
    readonly id: string;
} | {
    readonly type: 'badge';
    readonly id: string;
} | {
    readonly type: 'error';
    readonly id: string;
} | {
    readonly type: 'disabled';
    readonly id: string;
};
/** list() 的只读摘要（不含组件）。 */
export interface TuiPanelSummary {
    readonly id: string;
    readonly title: string;
    readonly source: 'plugin';
}
/** Host-only facade（driver 探针用；不经插件面导出）。 */
export interface TuiPanelHost {
    register(descriptor: {
        readonly id: string;
        readonly title?: string;
    }): () => void;
    list(): readonly TuiPanelSummary[];
    open(id: string): boolean;
    close(id: string): boolean;
    subscribe(listener: (event: TuiPanelEvent) => void): () => void;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiPanels: TuiPanelRuntime;
    }
}
export declare const name = "dsh-tui-panels";
/**
 * ctx.tuiPanels —— 插件侧栏 Panel 准入服务。拒绝一律 warn + 返回
 * undefined/false（与 tuiStatus.registerView 同语义），绝不抛给插件。
 */
export declare class TuiPanelRuntime extends Service {
    constructor(ctx: Context);
    /**
     * 注册一个侧栏 Panel。成功返回 cleanup-aware disposer；拒绝 warn 并
     * 返回 undefined（feature-detect 可辨）。identity 语义与 tuiStatus
     * 相同（只喂 effect ledger 的 pluginId）。
     */
    register(descriptor: TuiPanelDescriptor, identity?: Context): (() => void) | undefined;
    /** 只读摘要（仅自己注册的 Panel；不含组件）。 */
    list(): readonly TuiPanelSummary[];
    /**
     * 打开自己注册的 Panel（展开侧栏并聚焦）。mutate + 限速：每插件每
     * 5s 至多 1 次，超限丢弃并记 ledger。返回 false = 未注册/不属于自己的
     * id、超限、或没有活的 Chat 控制器消费请求。
     */
    open(id: string): boolean;
    /** 关闭自己注册的 Panel：若它是当前 active Panel，则收起侧栏。 */
    close(id: string): boolean;
    /** 设置/清除自己 Panel 的 badge。 */
    badge(id: string, badge: {
        level: TuiPanelBadgeLevel;
        unread: number;
    } | null): boolean;
    /** 订阅涉及自己 Panel 的事件（本阶段 registered/unregistered/badge/
     * error/disabled；opened/closed/focused/blurred/sidebar-toggled TODO）。 */
    subscribe(listener: (event: TuiPanelEvent) => void): () => void;
}
export declare function getHostPanelRuntime(runtime: TuiPanelRuntime | undefined): TuiPanelHost | undefined;
export default TuiPanelRuntime;
//# sourceMappingURL=panels.d.ts.map