/**
 * PanelStore：Panel 定义 + 运行时状态（badge / 最近错误）一个 store
 * （设计文档 §6.4 / §16.2——注册即有 badge 槽，释放即清，没有第二条
 * 内置专用路径；插件 API 只是给它加准入外壳）。
 *
 * 通知不轮询：各业务 store（channel / BackgroundJobStore / …）的订阅
 * 回调里由 Adapter 调 setBadge。有界：每 Panel 一条 badge，无历史列表，
 * unread 饱和到 99。
 */
import type { PanelBadge, PanelDefinition, PanelEntry, PanelOwner } from './types.js';
export declare const PANEL_UNREAD_CAP = 99;
/** 连续崩溃禁用阈值（会话内，时间窗内累计；设计文档 §18.4）。 */
export declare const PANEL_CRASH_DISABLE_THRESHOLD = 3;
/** 崩溃计数的滑动时间窗。 */
export declare const PANEL_CRASH_WINDOW_MS = 60000;
/** PanelStore 对外事件（subscribe 的 listener 参数；useSyncExternalStore
 *  的 () => void 订阅者可安全忽略）。opened/closed/focused/blurred 等
 *  useSidePanel 侧的事件本阶段尚未接入（TODO §18.3）。 */
export type PanelStoreEvent = {
    readonly type: 'registered';
    readonly id: string;
} | {
    readonly type: 'unregistered';
    readonly id: string;
} | {
    readonly type: 'badge';
    readonly id: string;
} | {
    readonly type: 'hint';
    readonly id: string;
} | {
    readonly type: 'error';
    readonly id: string;
} | {
    readonly type: 'disabled';
    readonly id: string;
};
export declare class PanelStore {
    private entries;
    private listeners;
    private snapshot;
    private sequence;
    /** source='plugin' 的连续崩溃时间戳（会话内；注册/重注册即清零）。 */
    private crashTimes;
    /** 重复 id → DUPLICATE_CONTRIBUTION_ID（与 tuiStatus 同一约定）。 */
    register(definition: PanelDefinition, owner: PanelOwner): () => void;
    list(): readonly PanelEntry[];
    get(id: string): PanelEntry | undefined;
    /** 只允许 owner 或宿主调用（调用侧自律，与 tuiStatus 相同）。
     *  level/unread 都没变时不通知：适配器在每次 channel 变化（流式时每个
     *  delta）都会调这里，每次通知都会让订阅 list() 的宿主重渲染。 */
    setBadge(id: string, badge: Omit<PanelBadge, 'latestAt'> | null): void;
    /**
     * 面板广告自己当前的键位片段（见 PanelEntry.hint）。每次 channel delta 都会
     * 有适配器调 setBadge，这里同理按值短路：没变就不通知宿主重渲染。
     */
    setHint(id: string, hint: string): void;
    clearBadge(id: string): void;
    reportError(id: string, error: unknown): void;
    subscribe: (listener: (event: PanelStoreEvent) => void) => (() => void);
    private emit;
}
/** 进程级单例（内置经 registerBuiltinPanels，插件经 Phase 6 的准入外壳）。 */
export declare const panelStore: PanelStore;
//# sourceMappingURL=PanelStore.d.ts.map