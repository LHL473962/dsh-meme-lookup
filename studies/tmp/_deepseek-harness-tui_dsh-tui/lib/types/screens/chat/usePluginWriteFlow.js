/**
 * `/plugin` 的两个写入浮层共用的骨架（C-5 抽自 C-4 的安装六件套）。
 *
 * 两处浮层（`plugin-install` 与 `plugin-manage`）的**差异**只有三条：关掉浮层时
 * 要不要停掉已经交给服务的写入、Enter 该调流程的哪个方法、以及未预料到的异常用
 * 哪一行报。其余全是同一件事：
 *
 * - 异步步骤态住在 Chat 里（ref 是回调里的真源，state 只驱动重绘）——浮层只渲染它；
 * - 流程自己把每一行写进转录（按发起时的 binding 加栅栏），这里只保存「下一步问什么」；
 * - `busy` 表示正在跑一次写入/取消，此时除 Esc 外不接键；
 * - `done` 没有可问的：先把 `busy` 摘掉再收浮层，否则收尾清理会去取消一个已经结算的
 *   写入，并打出一行与刚发生的事矛盾的说明；
 * - 迟到的回答属于**已经不在场的那次流程**（取消 A、另起 B，A 的 inspect 才回来）：
 *   既不能改当前这次的状态，也不能替它收起浮层。
 *
 * 抽出来的理由是这两处必须**逐字同款**：栅栏与收尾的每一条都是踩过的坑
 * （C-4 的自审与两轮独立审查各修过其中一处），复制一份就等于给下一次修正留两个
 * 落点。行为面由 `verify-plugin-manager-chat.tsx` 的三段（无头 / 真面板 / 生产接线）
 * 兜住。
 */
import React from 'react';
export function usePluginWriteFlow(options) {
    const ref = React.useRef(undefined);
    const [view, setView] = React.useState(undefined);
    const paneOpen = options.overlay?.kind === options.overlayKind;
    /** 浮层状态的真源：回调里读它，state 只负责重绘。 */
    const store = (next) => {
        ref.current = next;
        setView(next);
    };
    /** 浮层关闭即收尾：在途写入该停的必须停，否则 profile 会停在半写状态。 */
    React.useEffect(() => {
        if (!paneOpen)
            return;
        return () => {
            const closing = ref.current;
            store(undefined);
            closing?.flow.dispose();
            if (closing?.busy === true && options.cancelOnClose !== undefined)
                void options.cancelOnClose(closing.flow);
        };
    }, [paneOpen]);
    const close = () => {
        options.dispatchOverlay({ type: 'close' });
    };
    /** 流程的下一步：`done` 没有可问的，直接收起浮层。 */
    const settle = (flow, step) => {
        const current = ref.current;
        // 迟到的回答属于已经不在场的那次流程：既不能改当前这次的状态，也不能替它收起
        // 浮层——那会让在跑的写入失去它的取消入口。
        if (current === undefined || current.flow !== flow)
            return;
        if (step.kind === 'done') {
            // 收尾前先把「在跑」摘掉：浮层 effect 的清理据此决定要不要取消——结算完了
            // 还留着 busy，清理就会去取消一个服务那边早已删掉的请求，并打出一行
            // 「没有在跑的写入」，与刚发生的事矛盾。
            store({ ...current, step, busy: false });
            close();
            return;
        }
        store({ ...current, step, busy: false });
    };
    /**
     * 流程自己兜住每一次服务调用；这里再兜一层，是防「没预料到的抛出」把进程
     * 带走（未处理的 rejection 会杀掉进程守卫），代价是一行说明加收起浮层。
     */
    const guard = (flow, next) => {
        void next.then(step => settle(flow, step)).catch((error) => {
            // 异常路径同样核对身份：一次早已被取代的流程不该收起现在的浮层。
            if (ref.current?.flow !== flow)
                return;
            options.pushLocal([options.failureLine(error)]);
            close();
        });
    };
    return {
        view,
        start: (flow, begin) => {
            options.dispatchOverlay({ type: 'open', overlay: { kind: options.overlayKind } });
            store({ flow, step: options.initialStep, busy: true });
            guard(flow, begin);
        },
        run: (next) => {
            const current = ref.current;
            if (current === undefined)
                return;
            store({ ...current, busy: true });
            guard(current.flow, next);
        },
        close,
    };
}
