/**
 * 输入粘贴的**共享语义**（PromptInput 与 Launchpad 复用；2026-10 方案 B）。
 *
 * 只抽两条输入真正同源的东西：
 * 1. **粘贴管线**——载荷清洗（win32 输入记录残渣、终端控制字节、\r 规整、
 *    bracketed paste 标记字节）与单行折叠；
 * 2. **组合键匹配**——`paste` 动作经 keymap 的生效组合键（可重映射），
 *    谁都不许再硬编码 `ctrl+v` 字符串。
 *
 * 明确**不**统一的语义（边界见 Launchpad/PromptInput 各自注释）：
 * - 多行/历史/chip 折叠是聊天页编辑器的能力，落地页是单行
 *   首屏输入——多行内容在落地页折叠成一行（{@link collapseToSingleLine}），
 *   PromptInput 保留换行；
 * - 异步落点守则**同一条**（读回时必须用当下最新的文本/光标，闭包旧值一律
 *   不许用），实现各自落地：PromptInput 用 revision lease（与会话代次、图片
 *   租约耦合，搬动会改变聊天页行为），Launchpad 用每次渲染刷新的 current-ref
 *   （受控组件，props 即最新值）与粘贴租约。
 */
import { type ComboKeyFlags } from './keymap.js';
/**
 * Normalize editable text so no terminal control characters remain in state.
 */
export declare function sanitizeEditableText(text: string): string;
/**
 * Paste-payload ingress: consume a split record's ESC-less tail before
 * normalizing. The tail is printable, so it would survive
 * `sanitizeEditableText`'s control probe untouched; typed text keeps it
 * because only a paste payload can carry a partial record.
 *
 * The five separators only prove the *shape*, not that a record was split:
 * a user can legitimately paste the literal `[13;28;13;1;0;1_`. The tail rule
 * therefore keeps its two evidence requirements — the payload must carry a
 * complete ESC-bearing record, and the shape must stand alone as its own token
 * ({@link WIN32_RECORD_RESIDUE_TAIL}) — and, when they do not hold, the bytes
 * stay exactly as pasted (ADR-0002 zero-harm / ADR-0008 "keep it visible").
 */
export declare function sanitizePastedText(text: string): string;
/**
 * Strip literal bracketed-paste marker bytes (`\x1b[200~` / `\x1b[201~`).
 * ink's parser normally consumes them before `useInput` sees the payload;
 * this is the belt-and-braces pass for any path that receives raw bytes
 * (a flush boundary splitting marker from payload leaves them printable-side).
 */
export declare function stripBracketedPasteMarkers(text: string): string;
/**
 * Single-line paste fold (Launchpad 语义)：清洗后把换行折叠成一个空格——
 * 单行编辑器里 Enter 是提交，多行内容不许拼出换行。
 */
export declare function collapseToSingleLine(text: string): string;
/**
 * 按键是否命中 `paste` 动作的**生效**组合键（默认 Ctrl+V/Cmd+V + Alt+V 别名，
 * 可经 /settings 重映射）。唯一的组合键判定入口——调用方不许自己比键字符串。
 */
export declare function matchesPasteShortcut(input: string, key: ComboKeyFlags): boolean;
/**
 * 单行插入的纯计算：把已清洗文本落在给定光标处，返回新的文本与光标。
 * 调用方负责拿**当下最新**的 query/caret（异步落点守则），这里不做 IO。
 */
export declare function insertSingleLineAt(query: string, caret: number, text: string): {
    text: string;
    caret: number;
};
//# sourceMappingURL=inputPaste.d.ts.map