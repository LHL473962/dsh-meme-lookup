import React from 'react';
import { type ImageTokenSpan } from './composerImageTokens.js';
/**
 * A single-line search input in a round-bordered box: `⌕ ` prefix and a native
 * cursor at `cursorOffset`. Static snapshots retain the theme-painted caret.
 * When empty with a left-aligned placeholder, the caret sits on its first
 * character; text stays in place and IME preedit uses the same native anchor.
 *
 * The query row is strictly single-line: an overlong query is windowed
 * around the caret (horizontal scroll) instead of wrapping, so the native
 * cursor declaration below stays exact for any query length.
 */
export declare function SearchBox({ query, placeholder, isFocused, isTerminalFocused, prefix, width, cursorOffset, borderless, caretBlink, declareCursor, placeholderAlign, imageSpans, }: {
    query: string;
    placeholder?: string;
    isFocused: boolean;
    isTerminalFocused: boolean;
    prefix?: string;
    width?: number | string;
    cursorOffset?: number;
    borderless?: boolean;
    /** Capability-backed image chips, sharing the chat composer's atomic geometry. */
    imageSpans?: readonly ImageTokenSpan[];
    /**
     * 空输入 + 焦点态那一行里占位文案的对齐（2026-10 落地页第四版新增）：
     * `right`（缺省，历史行为）贴框右缘；`left` 紧跟前缀。
     * 共享组件——聊天页/选择器不传此 prop，渲染与从前逐字节一致。
     */
    placeholderAlign?: 'left' | 'right';
    /**
     * 无原生光标的呈现环境使用的闪烁相位（仅切换样式，不增删字符）。
     * TTY 光标的闪烁与动画由终端配置控制。
     */
    caretBlink?: boolean;
    /** Keep the live field styled while another region owns the native caret. */
    declareCursor?: boolean;
}): React.ReactNode;
//# sourceMappingURL=SearchBox.d.ts.map