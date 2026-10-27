/**
 * panelBridge：ctx.tuiPanels 服务（dsh-adapter，Cordis 侧）与 useSidePanel
 * （Chat 侧控制器）之间的小型 module-level 通道（设计文档 §18.2）。
 *
 * 照 jobsFocusStore 的形状刻意做成两个三行 store，而不是塞进 PanelStore
 * （那是注册表/badge 的家）或 SidePanelRuntimeContext（useSidePanel 不该
 * 知道插件业务）：
 * - state：Chat 每次渲染后回写 { open, activePanelId, focus }，服务侧
 *   close()/focus() 据此判断；
 * - requests：服务侧 open/focus/close 的请求队列（nonce 保证同 id 重复
 *   请求也能重新触发），useSidePanel 订阅并在自己的启用集合里裁决。
 *
 * hasConsumer：没有任何 Chat 挂载（无头夹具 / 侧栏永不渲染）时 open()
 * 必须返回 false 而不是假装成功——attach/detach 由 useSidePanel 的
 * mount effect 维护。
 */
const listeners = new Set();
let consumers = 0;
let requestSnapshot = Object.freeze({ kind: 'open', id: '', nonce: 0 });
export const panelBridgeRequests = {
    subscribe(listener) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },
    /** 服务侧入口：无 Chat 消费者时返回 false（调用方据此向插件返回 false）。 */
    request(kind, id) {
        if (consumers <= 0)
            return false;
        requestSnapshot = Object.freeze({ kind, id, nonce: requestSnapshot.nonce + 1 });
        for (const listener of [...listeners])
            listener(requestSnapshot);
        return true;
    },
    /** useSidePanel mount/unmount 维护；带消费者才允许请求入队。 */
    attach() { consumers += 1; },
    detach() { consumers = Math.max(0, consumers - 1); },
    hasConsumer() { return consumers > 0; },
};
let uiState = Object.freeze({ open: false, activePanelId: undefined, focus: 'chat' });
const stateListeners = new Set();
export const panelBridgeState = {
    subscribe(listener) {
        stateListeners.add(listener);
        return () => { stateListeners.delete(listener); };
    },
    get() {
        return uiState;
    },
    /** 只由 useSidePanel 回写。 */
    set(next) {
        uiState = Object.freeze(next);
        for (const listener of [...stateListeners])
            listener();
    },
};
