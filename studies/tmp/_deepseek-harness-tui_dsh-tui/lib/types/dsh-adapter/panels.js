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
import { Service } from '@deepseek-ai/cordis';
import { cleanScalarText } from './sanitize.js';
import { activationFiber, assertCallerContext, bindCallerEffect, compositionRoot, concreteService, requirePluginCaller } from './host-access.js';
import { componentIdentityOf } from './component-identity.js';
import { assertCapabilityShadowPolicy, } from '../adapter/kernel/runtime.js';
import { adapterRuntimeFor } from '../adapter/kernel/runtime-context.js';
import { panelStore } from '../components/sidePanel/PanelStore.js';
import { makePluginPanelComponent } from '../components/sidePanel/pluginPanelAdapter.js';
import { panelBridgeRequests } from '../components/sidePanel/panelBridge.js';
import { isTemporarySidePanelId, setTemporarySidePanelHidden } from '../tuiDisplayPrefs.js';
import { stringWidth } from '../ink/stringWidth.js';
import { countPanelsOwnedBy, countPluginPanels, deletePanelOwnerRecord, getPanelOwnerRecord, setPanelOwnerRecord, } from './panel-runtime-registry.js';
/** 插件 Panel API 版本（§18.2）：descriptor.apiVersion 必须精确匹配。 */
export const TUI_PANEL_API_VERSION = 1;
// 单段小写 slug（宿主自动加 '<pluginId>:' 前缀形成最终 panel id）。
const SUB_ID_PATTERN = /^[a-z][a-z0-9_-]*$/u;
const TITLE_CELLS = 80;
const MIN_COLUMNS_FLOOR = 12;
const MIN_COLUMNS_CEIL = 64;
const DEFAULT_MIN_COLUMNS = 28;
/** 每插件 Panel 预算（§18.4）。 */
export const MAX_PANELS_PER_PLUGIN = 4;
/** 全局插件 Panel 注册预算（§18.4）。 */
export const MAX_PLUGIN_PANELS_TOTAL = 32;
/** open() 限速窗口：每插件每窗口至多 1 次。 */
export const PANEL_OPEN_RATE_LIMIT_MS = 5_000;
export const name = 'dsh-tui-panels';
const panelStates = new WeakMap();
function panelStateFor(runtime) {
    const state = panelStates.get(concreteService(runtime));
    if (state === undefined)
        throw new Error('tuiPanels host state is unavailable');
    return state;
}
/** Anonymous activation ids are session-only, never persistent identities. */
const fallbackPluginIds = new WeakMap();
let fallbackSeq = 0;
function pluginIdFor(caller, owner) {
    const identity = componentIdentityOf(caller);
    if (identity !== undefined && /^[a-z][a-z0-9_-]*$/u.test(identity.componentId)) {
        return identity.componentId;
    }
    let fallback = fallbackPluginIds.get(owner);
    if (fallback === undefined) {
        fallbackSeq += 1;
        fallback = 'session:act' + String(fallbackSeq);
        fallbackPluginIds.set(owner, fallback);
    }
    return fallback;
}
/**
 * ctx.tuiPanels —— 插件侧栏 Panel 准入服务。拒绝一律 warn + 返回
 * undefined/false（与 tuiStatus.registerView 同语义），绝不抛给插件。
 */
export class TuiPanelRuntime extends Service {
    constructor(ctx) {
        super(ctx, 'tuiPanels');
        compositionRoot(ctx);
        const state = {
            runtime: adapterRuntimeFor(ctx),
            host: undefined,
        };
        state.host = Object.freeze({
            register(descriptor) {
                const finalId = String(descriptor.id ?? '');
                if (!finalId.includes(':') || panelStore.get(finalId) !== undefined) {
                    throw new Error('invalid or duplicate host panel id: ' + finalId);
                }
                const definition = {
                    id: finalId,
                    title: String(descriptor.title ?? finalId),
                    source: 'plugin',
                    pluginId: 'dsh-tui-host',
                    mountPolicy: 'active',
                    minColumns: DEFAULT_MIN_COLUMNS,
                    component: () => null,
                };
                return panelStore.register(definition, 'builtin');
            },
            list() {
                return panelStore.list()
                    .filter(entry => entry.definition.source === 'plugin')
                    .map(entry => Object.freeze({ id: entry.definition.id, title: entry.definition.title ?? entry.definition.id, source: 'plugin' }));
            },
            open(id) {
                return panelBridgeRequests.request('open', id);
            },
            close(id) {
                return panelBridgeRequests.request('close', id);
            },
            subscribe(listener) {
                return panelStore.subscribe(event => {
                    // hint 是宿主底栏的内部 chrome（面板自己广告键位），不进插件事件面。
                    if (event.type === 'hint')
                        return;
                    const entry = panelStore.get(event.id);
                    if (entry?.definition.source === 'plugin')
                        listener(event);
                });
            },
        });
        panelStates.set(this, state);
    }
    /**
     * 注册一个侧栏 Panel。成功返回 cleanup-aware disposer；拒绝 warn 并
     * 返回 undefined（feature-detect 可辨）。identity 语义与 tuiStatus
     * 相同（只喂 effect ledger 的 pluginId）。
     */
    register(descriptor, identity) {
        assertCapabilityShadowPolicy('host.panels.register', panelStateFor(this).runtime.mode, panelStateFor(this).runtime.slices);
        let caller;
        try {
            caller = requirePluginCaller(this.ctx, 'tuiPanels.register', this);
        }
        catch {
            this.ctx.logger.warn('dsh-tui: tuiPanels.register requires a live non-root plugin activation');
            return undefined;
        }
        if (identity !== undefined) {
            try {
                assertCallerContext(caller, identity, 'tuiPanels.register');
            }
            catch {
                caller.logger.warn('dsh-tui: tuiPanels.register rejected an identity belonging to another activation');
                return undefined;
            }
        }
        const owner = activationFiber(caller);
        if (owner === undefined) {
            caller.logger.warn('dsh-tui: tuiPanels.register requires a live activation owner');
            return undefined;
        }
        const ledger = caller.get('tuiEffectLedger');
        const raw = descriptor;
        if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected an invalid descriptor');
            return undefined;
        }
        const d = raw;
        if (d.apiVersion !== TUI_PANEL_API_VERSION) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected a descriptor with apiVersion ' + String(d.apiVersion) + ' (expected ' + TUI_PANEL_API_VERSION + ')');
            return undefined;
        }
        if (typeof d.id !== 'string' || !SUB_ID_PATTERN.test(d.id)) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected an invalid panel id');
            return undefined;
        }
        if (typeof d.title !== 'string' || cleanScalarText(d.title, TITLE_CELLS).length === 0) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — title must be a non-empty string');
            return undefined;
        }
        if (d.icon !== undefined && (typeof d.icon !== 'string' || stringWidth(d.icon) !== 1)) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — icon display width must be 1');
            return undefined;
        }
        if (d.component !== undefined && typeof d.component !== 'function') {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — component must be a function');
            return undefined;
        }
        let compactMaxRows;
        let compactComponent;
        if (d.compact !== undefined) {
            if (typeof d.compact !== 'object' || d.compact === null) {
                caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — invalid compact descriptor');
                return undefined;
            }
            const rows = d.compact.maxRows;
            if (typeof rows !== 'number' || !Number.isInteger(rows) || rows < 1 || rows > 3) {
                caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — compact.maxRows must be an integer from 1 to 3');
                return undefined;
            }
            compactComponent = d.compact.component;
            if (typeof compactComponent !== 'function') {
                caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — compact.component must be a function');
                return undefined;
            }
            compactMaxRows = rows;
        }
        if (d.component === undefined && d.compact === undefined) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — at least one of component/compact is required');
            return undefined;
        }
        if (d.minColumns !== undefined
            && (typeof d.minColumns !== 'number' || !Number.isInteger(d.minColumns) || d.minColumns < MIN_COLUMNS_FLOOR || d.minColumns > MIN_COLUMNS_CEIL)) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — minColumns must be an integer from ' + MIN_COLUMNS_FLOOR + ' to ' + MIN_COLUMNS_CEIL);
            return undefined;
        }
        if (d.order !== undefined && (typeof d.order !== 'number' || !Number.isFinite(d.order))) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + d.id + '" — order must be a finite number');
            return undefined;
        }
        const pluginId = pluginIdFor(caller, owner);
        const finalId = pluginId + ':' + d.id;
        if (panelStore.get(finalId) !== undefined) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + finalId + '" — already registered');
            ledger?.record({ operation: 'bind', resource: { kind: 'panel', id: finalId }, result: 'failed', errorCode: 'DUPLICATE_CONTRIBUTION_ID' }, identity);
            return undefined;
        }
        if (countPanelsOwnedBy(owner) >= MAX_PANELS_PER_PLUGIN) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + finalId + '" — a plugin may register at most ' + MAX_PANELS_PER_PLUGIN + ' panels');
            ledger?.record({ operation: 'bind', resource: { kind: 'panel', id: finalId }, result: 'failed', errorCode: 'PANEL_BUDGET_EXCEEDED' }, identity);
            return undefined;
        }
        if (countPluginPanels() >= MAX_PLUGIN_PANELS_TOTAL) {
            caller.logger.warn('dsh-tui: tuiPanels.register rejected "' + finalId + '" — ' + MAX_PLUGIN_PANELS_TOTAL + ' plugin panels are already registered');
            ledger?.record({ operation: 'bind', resource: { kind: 'panel', id: finalId }, result: 'failed', errorCode: 'PANEL_BUDGET_EXCEEDED' }, identity);
            return undefined;
        }
        const title = cleanScalarText(d.title, TITLE_CELLS);
        const definition = Object.freeze({
            id: finalId,
            title,
            icon: d.icon,
            order: d.order,
            minColumns: d.minColumns ?? DEFAULT_MIN_COLUMNS,
            source: 'plugin',
            pluginId,
            // v2.1：插件 Panel 强制 active 挂载（防常驻面板烧资源）。
            mountPolicy: 'active',
            component: makePluginPanelComponent(finalId, (d.component ?? (() => null))),
            // compact 本阶段只校验不挂载（渲染槽 TODO §18.1）。
            compact: compactMaxRows === undefined ? undefined : { maxRows: compactMaxRows, component: () => null },
        });
        const ownerTag = { pluginId, activation: owner };
        const unregister = panelStore.register(definition, ownerTag);
        setPanelOwnerRecord(finalId, { caller, owner, pluginId, lastOpenAt: 0 });
        // 注册只动注册表：启用集合由 `sidePanel.panels` 的值派生
        // （`*` = 全部已注册面板），注册路径绝不改写设置或 live store。
        let disposed = false;
        let ownerCleanup;
        const dispose = () => {
            if (disposed)
                return;
            disposed = true;
            // 先撤 store（unregistered 事件还需 owner record 做订阅过滤），再清
            // owner 数据。
            unregister();
            deletePanelOwnerRecord(finalId);
            // 临时面板的「本次运行隐藏」随这一次注册一起结束：同一个 activation
            // 再次注册拿到的是同一个 session:actN:x，重新注册是一次新的贡献
            // （与旧机制在注册时清掉显式移除同义），不能让它一出生就被藏住。
            if (isTemporarySidePanelId(finalId))
                setTemporarySidePanelHidden(finalId, false);
            caller.get('tuiEffectLedger')?.record({ operation: 'release', resource: { kind: 'panel', id: finalId }, result: 'applied' }, identity);
            const cleanup = ownerCleanup;
            ownerCleanup = undefined;
            cleanup?.();
        };
        const bound = bindCallerEffect(caller, dispose, cleanup => {
            ownerCleanup = cleanup;
        });
        if (!bound)
            return undefined;
        ledger?.record({ operation: 'bind', resource: { kind: 'panel', id: finalId }, result: 'applied' }, identity);
        return dispose;
    }
    /** 只读摘要（仅自己注册的 Panel；不含组件）。 */
    list() {
        assertCapabilityShadowPolicy('host.panels.list', panelStateFor(this).runtime.mode, panelStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiPanels.list', this);
        const owner = activationFiber(caller);
        if (owner === undefined)
            return [];
        return panelStore.list()
            .filter(entry => entry.definition.source === 'plugin' && getPanelOwnerRecord(entry.definition.id)?.owner === owner)
            .map(entry => Object.freeze({
            id: entry.definition.id,
            title: entry.definition.title ?? entry.definition.id,
            source: 'plugin',
        }));
    }
    /**
     * 打开自己注册的 Panel（展开侧栏并聚焦）。mutate + 限速：每插件每
     * 5s 至多 1 次，超限丢弃并记 ledger。返回 false = 未注册/不属于自己的
     * id、超限、或没有活的 Chat 控制器消费请求。
     */
    open(id) {
        assertCapabilityShadowPolicy('host.panels.open', panelStateFor(this).runtime.mode, panelStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiPanels.open', this);
        const owner = activationFiber(caller);
        if (owner === undefined)
            return false;
        const record = getPanelOwnerRecord(String(id ?? ''));
        if (record === undefined || record.owner !== owner) {
            caller.logger.warn('dsh-tui: tuiPanels.open rejected "' + String(id) + '" — not registered by this activation');
            return false;
        }
        // 无 Chat 消费者：直接 false，不消耗限速窗口（请求从未送达）。
        if (!panelBridgeRequests.hasConsumer())
            return false;
        const now = Date.now();
        if (now - record.lastOpenAt < PANEL_OPEN_RATE_LIMIT_MS) {
            caller.logger.warn('dsh-tui: tuiPanels.open dropped "' + String(id) + '" — rate limited to one open per ' + PANEL_OPEN_RATE_LIMIT_MS + 'ms');
            caller.get('tuiEffectLedger')?.record({ operation: 'bind', resource: { kind: 'panel', id: String(id) }, result: 'failed', errorCode: 'RATE_LIMITED' });
            return false;
        }
        if (!panelBridgeRequests.request('open', String(id)))
            return false;
        record.lastOpenAt = now;
        return true;
    }
    /** 关闭自己注册的 Panel：若它是当前 active Panel，则收起侧栏。 */
    close(id) {
        assertCapabilityShadowPolicy('host.panels.close', panelStateFor(this).runtime.mode, panelStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiPanels.close', this);
        const owner = activationFiber(caller);
        if (owner === undefined)
            return false;
        const record = getPanelOwnerRecord(String(id ?? ''));
        if (record === undefined || record.owner !== owner) {
            caller.logger.warn('dsh-tui: tuiPanels.close rejected "' + String(id) + '" — not registered by this activation');
            return false;
        }
        return panelBridgeRequests.request('close', String(id));
    }
    /** 设置/清除自己 Panel 的 badge。 */
    badge(id, badge) {
        assertCapabilityShadowPolicy('host.panels.badge', panelStateFor(this).runtime.mode, panelStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiPanels.badge', this);
        const owner = activationFiber(caller);
        if (owner === undefined)
            return false;
        const record = getPanelOwnerRecord(String(id ?? ''));
        if (record === undefined || record.owner !== owner) {
            caller.logger.warn('dsh-tui: tuiPanels.badge rejected "' + String(id) + '" — not registered by this activation');
            return false;
        }
        if (badge === null) {
            panelStore.clearBadge(String(id));
            return true;
        }
        if (typeof badge !== 'object' || !['info', 'warning', 'error'].includes(String(badge.level))
            || typeof badge.unread !== 'number') {
            caller.logger.warn('dsh-tui: tuiPanels.badge rejected an invalid badge');
            return false;
        }
        panelStore.setBadge(String(id), {
            level: badge.level,
            unread: badge.unread,
        });
        return true;
    }
    /** 订阅涉及自己 Panel 的事件（本阶段 registered/unregistered/badge/
     * error/disabled；opened/closed/focused/blurred/sidebar-toggled TODO）。 */
    subscribe(listener) {
        assertCapabilityShadowPolicy('host.panels.subscribe', panelStateFor(this).runtime.mode, panelStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiPanels.subscribe', this);
        const owner = activationFiber(caller);
        if (owner === undefined || typeof listener !== 'function')
            return () => { };
        const wrapped = (event) => {
            // 同上：hint 只是宿主底栏的 chrome，不派发给插件订阅者。
            if (event.type === 'hint')
                return;
            const record = getPanelOwnerRecord(event.id);
            if (record === undefined || record.owner !== owner)
                return;
            try {
                listener(event);
            }
            catch (error) {
                caller.logger.warn('dsh-tui: tuiPanels listener failed: ' + (error instanceof Error ? error.message : String(error)));
            }
        };
        const dispose = panelStore.subscribe(wrapped);
        bindCallerEffect(caller, dispose);
        return dispose;
    }
}
export function getHostPanelRuntime(runtime) {
    if (runtime === undefined)
        return undefined;
    try {
        return panelStateFor(runtime).host ?? undefined;
    }
    catch {
        return undefined;
    }
}
export default TuiPanelRuntime;
