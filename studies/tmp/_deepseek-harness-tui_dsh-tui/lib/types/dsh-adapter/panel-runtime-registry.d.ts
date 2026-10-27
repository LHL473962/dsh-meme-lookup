/**
 * Host-side per-panel owner registry for ctx.tuiPanels (§18.2).
 *
 * The PanelStore owns registration/badges; THIS map owns what only the
 * Cordis side knows: which activation registered a panel id, its plugin id,
 * and the lazy bridges the rendered panel's host API needs (toast, scenes,
 * plugin storage). Kept module-level next to the process-level PanelStore —
 * a WeakMap on the service would die with the service object while the
 * PanelStore (and rendered panels) outlive it.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { TuiPluginStorage } from './plugin-storage.js';
export interface PanelOwnerRecord {
    /** Canonical activation context (kept alive by the bound effect; the panel
     * is unregistered before the activation tears down, so late host-API calls
     * through a disposed ctx degrade, never crash the store). */
    readonly caller: Context;
    /** activationFiber identity — ownership check for every mutating call. */
    readonly owner: object;
    readonly pluginId: string;
    /** open() rate limit: at most one open per plugin per 5s (§18.2). */
    lastOpenAt: number;
    storage?: TuiPluginStorage;
}
export declare function getPanelOwnerRecord(id: string): PanelOwnerRecord | undefined;
export declare function setPanelOwnerRecord(id: string, record: PanelOwnerRecord): void;
export declare function deletePanelOwnerRecord(id: string): void;
export declare function countPanelsOwnedBy(owner: object): number;
export declare function countPluginPanels(): number;
/** Plugin Panel 的 toast：经注册激活自己的 tuiToast 服务（无服务时静默
 * false，与 scenes 降级语义一致）。 */
export declare function pluginPanelToast(id: string, text: string): boolean;
/** 打开自己注册的全屏场景：转 tuiScenes（它自己做 owner 校验与降级）。 */
export declare function pluginPanelOpenScene(id: string, sceneId: string): boolean;
/** 自己的 tuiPluginStorage 句柄（懒开、每 Panel 一次；无服务时 undefined）。 */
export declare function pluginPanelStorage(id: string): TuiPluginStorage | undefined;
/** 侧栏展开且自己是 active 时聚焦（useSidePanel 侧裁决）。 */
export declare function pluginPanelFocus(id: string): boolean;
//# sourceMappingURL=panel-runtime-registry.d.ts.map