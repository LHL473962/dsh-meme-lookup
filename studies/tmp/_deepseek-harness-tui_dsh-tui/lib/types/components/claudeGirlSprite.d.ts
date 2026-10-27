/**
 * Claude 娘精灵表（30 列 × 30 精灵格，半块渲染 → 15 个文本行）。
 *
 * 来源：cc-bridge 项目的 `assets/maid.png`（1024×1024 透明底，开发期占位
 * 素材——授权状态见其 assets/README：自用可，再分发前需确认或替换）。
 * 由 `.local/claude-asset/convert-claude-girl.mjs` 生成：alpha 感知包围盒 →
 * 众数降采样（`convert-maid.mjs` 的管线，去掉白底 flood-fill 与修脸步骤）。
 *
 * 契约：每行 30 格；`null` = 透明；每格是 [r, g, b]。渲染见 `ClaudeGirl.tsx`
 * （与 `WhaleGirl.tsx` 同一套半块技法）。改了源图就重跑脚本，不要手改这个文件。
 */
/** 精灵格数（列）。 */
export declare const CLAUDE_GIRL_COLS = 30;
/** 精灵行数（半块渲染后是 `CLAUDE_GIRL_ROWS / 2` 个文本行）。 */
export declare const CLAUDE_GIRL_SPRITE_ROWS = 30;
/** 精灵表：[行][列] = null（透明）或 [r, g, b]。 */
export declare const CLAUDE_GIRL_SPRITE: readonly (readonly (readonly [number, number, number] | null)[])[];
//# sourceMappingURL=claudeGirlSprite.d.ts.map