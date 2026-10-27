import React from 'react';
/**
 * 浮层内列表可用的行数：最近一层 OverlayAbove 的有效高度减去面板自身的
 * 框架行（Pane 边框、标题、页脚、挂载包裹的 margin）。
 *
 * 以前各 picker 按 `terminalRows - N` 预算，假设锚点上方有整屏空间；短会话
 * + 高终端下浮层被锚点上方的空间钳住，窗口却仍按整屏切，焦点行落在被裁
 * 区（#493/#698）。预算从浮层拿，窗口永远装得进浮层。
 *
 * @param frameRows - 面板框架占用的行数（不含列表项）。
 * @returns 列表区可用行数（≥2，listWindow 至少放得下焦点项及一个邻居）。
 */
export declare function useOverlayListRows(frameRows: number): number;
/**
 * 瞬态面板的浮层容器：absolute 定位 + bottom:'100%' 把面板底边钉在锚点
 * （父元素）顶边，向上覆盖转录尾部行，自身**不占布局高度**。
 *
 * 为什么必须这样：inline 模式下整帧是内容高度。瞬态面板（picker/补全/
 * 对话框）若以 in-flow 方式挂载，帧高随之增长——终端滚动把帧顶行（splash、
 * 历史）推进 scrollback；面板关闭时的收缩重绘又把这些行重新写回视口，同一
 * 行在 scrollback 和视口各存一份（"每切一次 /model 多一份启动画"的真机报
 * 告）。浮层只改写既有行的单元格内容（帧高不变、零滚动、零沉积），关闭时
 * 原样写回，全程无重复。
 *
 * 先例：PromptInput 通知行（position=absolute marginTop={-1}）。
 *
 * 高度契约：渲染器对探出帧顶（y<0）的行只裁不移（render-node-to-output.ts
 * 刻意不把浮层下移压住 composer），所以本容器负责把 maxHeight 钳到锚点
 * 上方真正可画的行数：每次 commit 后沿祖先累加 yoga computedTop 得到锚点
 * 在帧内的绝对 top（inline 溢出时再减掉滚进 scrollback 的帧顶），与声明的
 * maxHeight 取小。量到的是上一帧的布局——浮层零高度不改变锚点位置，转录
 * 涨落至多晚一帧收敛；layout effect 里的 setState 在推迟到 microtask 的
 * onRender 之前落地，不多画一帧。有效高度经 useOverlayListRows 交给面板做
 * 焦点窗口化，窗口永远装得进浮层。
 *
 * 锚点纪律（防止浮层漂到 todo 上方的回归）：底部 chrome 里，凡是瞬态面板
 * 必须挂载在「输入簇」内——Chat 输入簇（可替换输入行链 + StatusLine +
 * 本浮层，见 Chat.tsx 底部 chrome），或 PromptInput 自身的输入行容器。绝不
 * 直接把 OverlayAbove 挂到包含 GoalTodoPanel 的外层 chrome Box 上：那里的
 * bottom:'100%' 会把面板顶到 todo 之上，远离输入框。in-flow 面板（问卷/
 * 对话框/提示等）走输入簇的替换链，天然落在输入行位置，同样不会越过 todo。
 */
export declare function OverlayAbove({ children, maxHeight, transparent, }: {
    children: React.ReactNode;
    /** 调用方声明的上限；实际还会被钳到锚点上方的可画行数。 */
    maxHeight?: number | undefined;
    /**
     * 透明宿主（第七版：落地页侧专用）：**干净的镂空，不是混合**——只关掉
     * occlusionColor（那是立绘图像在浮层后面时触发的 toolCardBackground 整块
     * 白底，用户截图报的「整块白底」就是它），**保留 opaque 的空格垫底**：
     * 浮层矩形内每一格都被空格占位（宿主屏的字形——大字/立绘字符画——被完全
     * 遮掉，绝不重影），但不发任何背景色 SGR（终端默认背景；Kitty 负 z 立绘
     * 图像仍从默认背景格里透出来，这正是「透出启动页」想要的）。
     * 聊天页姿态不变：那边的底是转录文本，遮挡图像的 occlusion 语义仍然需要。
     */
    transparent?: boolean;
}): React.ReactNode;
//# sourceMappingURL=OverlayAbove.d.ts.map