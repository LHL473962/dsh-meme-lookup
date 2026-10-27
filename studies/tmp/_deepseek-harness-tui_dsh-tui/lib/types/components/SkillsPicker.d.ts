import React from 'react';
import type { SkillInfo } from '../dsh-adapter/channel.js';
/**
 * `/skills` picker (issue #204) in the ModelPicker style: a
 * permission-colored Pane listing the live agent's skill catalog —
 * user-invocable skills lead with `/name`（它们在 / 菜单里也是这个形态），
 * 描述行是「来源 · 简述」。Enter 由 Chat 填回 `/name `，Esc 关闭。
 *
 * 长列表按焦点窗口化（ModelPicker 同款）：picker 经 OverlayAbove 浮层挂载后
 * 有 maxHeight 裁剪，全量渲染会让焦点行被裁掉（看不到焦点按 Enter）。
 */
export declare function SkillsPicker({ skills, focusIndex, onPick, }: {
    skills: readonly SkillInfo[];
    focusIndex: number;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
/** `/skills` while the registry snapshot is still in flight (ModelPickerLoading 同款). */
export declare function SkillsPickerLoading(): React.ReactNode;
//# sourceMappingURL=SkillsPicker.d.ts.map