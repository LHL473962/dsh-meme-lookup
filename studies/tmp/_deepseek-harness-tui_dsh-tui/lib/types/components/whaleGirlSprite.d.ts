/**
 * 女仆娘精灵表（30 列 × 30 精灵格，半块渲染 → 15 个文本行）。
 *
 * 来源：本项目作者设计的像素画 `等面积像素格 鲸鱼娘.png`（464×464，透明底），
 * 由 `.local/convert-maid.mjs` 生成：去白底 → 众数降采样 → 眼睛对称化 + 嘴巴/脖子微调。
 * **原创作品、非第三方素材，无需 THIRD_PARTY_LICENSES 条目。**
 *
 * 契约：每行 30 格；`null` = 透明；每格是 [r, g, b]。渲染见 `whaleGirl.ts`。
 * 改了源图就重跑那份脚本，不要手改这个文件。
 */
/** 精灵格数（列）。 */
export declare const WHALE_GIRL_COLS = 30;
/** 精灵行数（半块渲染后是 `WHALE_GIRL_ROWS / 2` 个文本行）。 */
export declare const WHALE_GIRL_SPRITE_ROWS = 30;
/** 精灵表：[行][列] = null（透明）或 [r, g, b]。 */
export declare const WHALE_GIRL_SPRITE: readonly (readonly (readonly [number, number, number] | null)[])[];
//# sourceMappingURL=whaleGirlSprite.d.ts.map