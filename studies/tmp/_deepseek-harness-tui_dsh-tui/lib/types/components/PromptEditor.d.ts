import React from 'react';
import type { Color } from '../ink/styles.js';
import type { Theme } from '../theme.js';
/**
 * 全屏草稿编辑的挂载层。编辑状态（value/caret/选区/折叠）全部住在
 * PromptInput 内部，展开视图却必须盖住整棵 Chat 树的每个后绘兄弟
 * （StatusLine、OverlayAbove、TooltipLayer）——渲染器按树序绘制，
 * absolute 浮层只有作为根 Box 的最后一个孩子才天然压过一切
 * （TooltipLayer 的同款契约）。PromptInput 因此把展开视图的 React
 * 节点发布到这个 module 级 store，`PromptEditorLayer`（挂在 Chat 根
 * Box 末尾）订阅并渲染；节点是 PromptInput 每次渲染的新鲜闭包，
 * 命中/拖拽/按钮 handler 无需任何额外的状态同步管道。
 *
 * 节点写入用 useInsertionEffect；sink 经 store 独立提交。光标在
 * PromptInput 的 layout effect 与编辑区 ref 挂载时声明，编辑层
 * 稍后挂载也能在首帧接管光标。
 */
type EditorNode = React.ReactNode | null;
/** Publish (or withdraw, with null) the fullscreen editor subtree. */
export declare function setPromptEditorNode(node: EditorNode): void;
/** Whether the fullscreen draft editor is currently published (open). */
export declare function usePromptEditorOpen(): boolean;
/**
 * The fullscreen sink, mounted once at the very end of Chat's root Box.
 * The absolute cover is `opaque` so its padding/blank cells never bleed
 * the covered transcript through, and it swallows stray clicks so the
 * conversation underneath cannot react to a click meant for the editor.
 */
export declare function PromptEditorLayer(): React.ReactNode;
/**
 * A mouse-friendly pill button for the editor chrome (send / collapse /
 * the ⤢ close affordance). Hover swaps the surface so the affordance
 * reads at a glance — the same interaction language as the transcript's
 * clickable rows and the session browser's menu items.
 */
export declare function EditorButton({ label, hint, onClick, primary, accent, }: {
    /** Button text, e.g. `⏎ 发送`. */
    label: string;
    /** Dim trailing hint inside the pill, e.g. `Ctrl+Enter`. */
    hint?: string;
    onClick: () => void;
    /** Filled variant (the primary action); default is the outline look. */
    primary?: boolean;
    /** Accent theme token / raw color for the filled variant. */
    accent?: keyof Theme | Color;
}): React.ReactNode;
export {};
//# sourceMappingURL=PromptEditor.d.ts.map