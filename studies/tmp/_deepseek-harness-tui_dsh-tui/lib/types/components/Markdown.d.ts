import React from 'react';
import { type Token } from 'marked';
/**
 * Markdown 渲染组件：marked 分词 + ANSI 格式化。
 *
 * 表格 token 交给 MarkdownTable 渲染为带边框的 flexbox 布局，mermaid
 * 代码块交给 MermaidDiagram 画成 box-drawing 图，`$$` 公式块交给
 * MathBlock 排成多行 Unicode（三者都需要终端宽度，所以是独立节点而不是
 * ANSI 字符串）；行内公式在 formatToken 里转成单行 Unicode；
 * 其余块级内容由 formatToken 转成 ANSI 字符串，按块边界分批放进
 * Text（只去整段首尾空白）。代码块高亮由 cli-highlight 异步提供，
 * 加载完成后自动触发一次重渲染。无 markdown 语法的纯文本走快速
 * 路径，直接合成段落 token，省掉 lexer 调用。
 */
type Props = {
    children: string;
    /** 为 true 时全部文本内容以 dim 样式呈现 */
    dimColor?: boolean;
    /** 为 false 时跳过 token 缓存（流式尾部的内容逐帧变化，缓存必然失效） */
    cacheTokens?: boolean;
    /**
     * Whether paragraphs may show inline math as images (`mathRendering:
     * image`). Streaming text passes false: a paragraph switching to images
     * mid-stream would re-wrap under the reader; the settled message switches.
     */
    inlineMathImages?: boolean;
    /**
     * Whether to strip the model-internal prompt-analysis tag blocks
     * (`<commit_analysis>`, `<context>`, `<function_analysis>`, `<pr_analysis>`)
     * before lexing. Chat prose keeps the default; the plugin panel's
     * `ui.CodeBlock` passes false so its raw code reaches the screen line for
     * line (that API promises raw code, not the chat's pre-processing).
     */
    stripPromptTags?: boolean;
};
/**
 * Tokens that render as their own layout node (a width-aware component)
 * instead of joining the ANSI text run. StreamingMarkdown consults the same
 * predicate: a standalone node has a fixed one-row gap to its neighbours
 * rather than the newline-derived spacing of text blocks. Top-level
 * fenced code is one too (CodeBlockFrame).
 */
export declare function isStandaloneToken(token: Token): boolean;
/**
 * 混合渲染 Markdown 内容：表格用带边框的 flexbox 组件，其余内容由
 * formatToken 生成 ANSI 字符串放入 Text。高亮对象异步就绪后自动刷新。
 *
 * memo by content: finished transcript blocks render with the SAME string
 * identity for the whole session (StreamingMarkdown keeps its stable prefix
 * identity-stable precisely to hit this); without the memo every parent
 * re-render re-ran the full token→ANSI→yoga pipeline for every settled
 * block — the dominant long-output stall (string-width via wrap-ansi, 60%+
 * of CPU in streaming profiles).
 */
declare function MarkdownImpl({ children, dimColor, cacheTokens, inlineMathImages, stripPromptTags }: Props): React.ReactNode;
/**
 * Memoized Markdown: skips the whole token→ANSI→layout pipeline when the
 * content string is the same reference (see MarkdownImpl's doc comment).
 */
export declare const Markdown: React.MemoExoticComponent<typeof MarkdownImpl>;
export {};
//# sourceMappingURL=Markdown.d.ts.map