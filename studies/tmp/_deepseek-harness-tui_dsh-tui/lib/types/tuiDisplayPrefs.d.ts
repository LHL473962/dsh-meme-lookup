import type { ToolBackground, ScrollGutterMode, PageMarginSetting, PageMarginMode, PageMarginSpec, StatusBarConfig, JobGroupFoldMode } from './adapter/ports/channel-display.js';
export type { ToolBackground, ScrollGutterMode, PageMarginSetting, PageMarginMode, PageMarginSpec, StatusBarConfig, JobGroupFoldMode } from './adapter/ports/channel-display.js';
/** Where a plugin footer field joins the status row, in the list order the
 *  user's `statusBar.pluginFieldsOrder` groups map onto by index. Kept
 *  structurally identical to `TuiStatusFieldSlot` in `dsh-adapter/status.ts`
 *  (a script compares the two literal sets). */
export declare const STATUS_FIELD_SLOTS: readonly ["left-tail", "right-head", "right-tail"];
export type StatusFieldSlot = typeof STATUS_FIELD_SLOTS[number];
/** `statusBar.pluginFieldsOrder`'s "show everything" token — the default. */
export declare const ALL_PLUGIN_FIELDS = "*";
/** Defaults keep the essential route/context information visible. */
export declare const DEFAULT_STATUS_BAR: Readonly<StatusBarConfig>;
/** Parsed `statusBar.pluginFieldsOrder`. `invalid` is what the settings screen
 *  refuses to save; the renderer treats it as `all`. */
export type ParsedPluginFieldsOrder = {
    readonly mode: 'all';
} | {
    readonly mode: 'none';
} | {
    readonly mode: 'groups';
    readonly groups: readonly (readonly string[])[];
} | {
    readonly mode: 'invalid';
    readonly reason: 'groups' | 'token' | 'duplicate' | 'sentinel';
};
/** Strict parse of one `statusBar.pluginFieldsOrder` value:
 *  - `*` — every plugin field (the default);
 *  - `''` (or three empty groups) — none;
 *  - otherwise exactly three `;`-separated groups of comma-separated keys, the
 *    group index picking the slot and the group order the sequence.
 *  Any other shape is `invalid`: the settings screen blocks the save, and the
 *  renderer falls back to `all` so a hand-edited typo can only ever show MORE
 *  than asked, never hide a plugin silently. */
export declare function parsePluginFieldsOrder(value: string): ParsedPluginFieldsOrder;
/** Render parsed groups back to their canonical text (trimmed, lower-cased,
 *  one separator between groups). */
export declare function formatPluginFieldsOrder(groups: readonly (readonly string[])[]): string;
/** Normalize a settings/config-layer value: valid values land in canonical
 *  form, an invalid string is kept (so the settings screen can show and fix
 *  it), and anything that is not a string becomes the default `*`. */
export declare function normalizePluginFieldsOrder(value: unknown): string;
/** The structural minimum the footer renders from — keeps this module free of
 *  a `dsh-adapter` type import. */
export interface StatusFieldOrderEntry {
    readonly key: string;
    readonly slot: StatusFieldSlot;
}
/** Apply the user's list to the live field registry. `all` (and any invalid
 *  value) returns the input array itself — the default mode allocates nothing;
 *  `none` returns the shared empty array; `groups` returns new entries in list
 *  order with the slot taken from the group index (the user's group overrides
 *  the plugin-declared slot). Unknown keys are skipped. */
export declare function applyPluginFieldsOrder<T extends StatusFieldOrderEntry>(fields: readonly T[], order: string): readonly T[];
/** Normalize untrusted/config-layer values without mutating the input. */
export declare function normalizeToolBackground(value: unknown): ToolBackground;
/** Same normalize contract as toolBackground; `auto` is the default. */
export declare function normalizeJobGroupFold(value: unknown): JobGroupFoldMode;
/** Same normalize contract as toolBackground; `timeline` is the default. */
export declare function normalizeScrollGutter(value: unknown): ScrollGutterMode;
/** Merge a partial settings value over the stable status-bar defaults. */
export declare function normalizeStatusBar(value: unknown): StatusBarConfig;
/**
 * Format context-window usage for future status-line consumers.
 * Invalid or unavailable inputs intentionally produce no field.
 */
export declare function formatContextUsage(used: number | undefined, contextWindow: number | undefined, compact?: boolean): string | undefined;
/** Page inset per preset: `{ x }` = blank columns per side, `{ y }` = blank
 *  rows top/bottom. `normal` is the default and matches the original
 *  hard-coded inset (2 columns / 1 row). */
export declare const PAGE_MARGIN_PRESETS: Readonly<Record<PageMarginMode, {
    readonly x: number;
    readonly y: number;
}>>;
export declare const DEFAULT_PAGE_MARGIN: PageMarginMode;
/** Custom-spec bounds: beyond this a layout is either useless (a 40-col
 *  terminal would starve) or pure waste. */
export declare const PAGE_MARGIN_MAX_X = 8;
export declare const PAGE_MARGIN_MAX_Y = 4;
export declare function isPageMarginMode(value: string): value is PageMarginMode;
/** Parse a custom spec (canonicalizes `N` → `Nx1`); undefined when invalid
 *  or out of bounds. */
export declare function parsePageMarginSpec(text: string): PageMarginSpec | undefined;
/** Normalize untrusted/config-layer values without mutating the input:
 *  preset names and valid custom specs pass through, everything else falls
 *  back to the default preset. */
export declare function normalizePageMargin(value: unknown): PageMarginSetting;
/** Resolve a stored setting to its geometry (presets via the table, custom
 *  specs via their numbers; anything unparseable → the default preset). */
export declare function resolvePageMargin(setting: PageMarginSetting): {
    readonly x: number;
    readonly y: number;
};
export declare const subscribePageMargin: (listener: () => void) => () => void;
export declare const getPageMarginSetting: () => PageMarginSetting;
/** Returns the value that ended up applied — the plugin mirrors it into the channel. */
export declare const applyPageMargin: (value: unknown) => PageMarginSetting;
export declare const subscribeMermaidDiagrams: (listener: () => void) => () => void;
export declare const getMermaidDiagrams: () => boolean;
export declare const applyMermaidDiagrams: (value: unknown) => boolean;
/**
 * How fenced code blocks frame themselves (settings
 *  `dsh-tui.codeFrameStyle`): `light` (default) is the open rail frame
 * — corner + language label on top, a left rail with one padding
 * column, no right wall or bottom edge; `full` closes the box with a
 * right wall (continuous across wrapped rows, it rides the layout
 * border) and a bottom edge. The narrow-terminal fallback (net body
 * width < 8) always stays the plain ANSI fence, whatever this says.
 */
export type CodeFrameStyle = 'light' | 'full';
export declare function normalizeCodeFrameStyle(value: unknown): CodeFrameStyle;
export declare const subscribeCodeFrameStyle: (listener: () => void) => () => void;
export declare const getCodeFrameStyle: () => CodeFrameStyle;
export declare const applyCodeFrameStyle: (value: unknown) => CodeFrameStyle;
/**
 * How LaTeX math in replies renders (settings `dsh-tui.mathRendering`):
 * `auto` picks the best available backend (today the Unicode renderer),
 * `image` typesets complete block formulas as terminal images where the
 * terminal supports graphics (Unicode everywhere else; opt-in until it has
 * been validated across terminals, after which `auto` adopts it),
 * `unicode` pins the Unicode renderer, `source` always shows the TeX.
 */
export type MathRendering = 'auto' | 'image' | 'unicode' | 'source';
export declare function normalizeMathRendering(value: unknown): MathRendering;
/**
 * Resolve the effective mode across the settings user layer and cordis.yml.
 * `latexMath` predates `mathRendering` (unreleased main builds wrote it): at a
 * layer without `mathRendering`, `false` means `source` and `true` means
 * `auto`, and either one overrides the layers below.
 */
export declare function resolveMathRendering(user: {
    mathRendering?: unknown;
    latexMath?: unknown;
}, config: {
    mathRendering?: unknown;
    latexMath?: unknown;
}): MathRendering;
export declare const subscribeMathRendering: (listener: () => void) => () => void;
export declare const getMathRendering: () => MathRendering;
export declare const applyMathRendering: (value: unknown) => MathRendering;
/**
 * How large a display formula is set when it renders as an image (settings
 * `dsh-tui.mathImageScale`): `auto` matches the body text, `large` and
 * `xlarge` set display math bigger. Size is the only sharpness lever a
 * terminal image has — the raster is drawn one device pixel per pixel, so a
 * larger formula is literally more pixels per stroke. Inline formulas keep the
 * base scale: their single row of cells caps the resolution.
 */
export type MathImageScale = 'auto' | 'large' | 'xlarge';
export declare function normalizeMathImageScale(value: unknown): MathImageScale;
export declare const subscribeMathImageScale: (listener: () => void) => () => void;
export declare const getMathImageScale: () => MathImageScale;
export declare const applyMathImageScale: (value: unknown) => MathImageScale;
/**
 * What sits behind a formula image (settings `dsh-tui.mathImageBacking`):
 * `transparent` paints only the formula's own pixels, so the terminal
 * background (a wallpaper included) shows through; `terminal` composites it
 * onto the terminal's background colour first, which is the calmer choice on
 * busy backgrounds and the only one that keeps soft anti-aliased edges smooth
 * (Sixel has no partial alpha).
 */
export type MathImageBacking = 'transparent' | 'terminal';
export declare function normalizeMathImageBacking(value: unknown): MathImageBacking;
export declare const subscribeMathImageBacking: (listener: () => void) => () => void;
export declare const getMathImageBacking: () => MathImageBacking;
export declare const applyMathImageBacking: (value: unknown) => MathImageBacking;
/**
 * What sits behind a transcript photo or illustration (settings
 * `dsh-tui.imageBacking`): `transparent` paints only the raster's own
 * pixels, so the terminal background (a wallpaper included) shows through
 * at anti-aliased edges and transparent corners — Sixel's binary alpha
 * drops their softest pixels, so edges trade a little smoothness for the
 * float; `terminal` composites onto the terminal's background colour
 * first (smooth edges on any background). Photographs are mostly opaque,
 * so the visible difference lives at the edges.
 */
export type ImageBacking = 'transparent' | 'terminal';
export declare function normalizeImageBacking(value: unknown): ImageBacking;
export declare const subscribeImageBacking: (listener: () => void) => () => void;
export declare const getImageBacking: () => ImageBacking;
export declare const applyImageBacking: (value: unknown) => ImageBacking;
/** Panel id grammar (plugins register under a `plugin:sub` namespace). */
export declare const SIDE_PANEL_ID_PATTERN: RegExp;
/** Anonymous activations have no durable identity. Three segments cannot
 * collide with a verified Component's two-segment panel address. */
export declare function isTemporarySidePanelId(id: string): boolean;
/** Old anonymous addresses cannot be attributed to a past activation. */
export declare function isLegacyAnonymousSidePanelId(id: string): boolean;
/** Encode only verified registered Component ids when writing preferences.
 * Runtime addresses remain unchanged; bare actN CSV entries stay unclaimed. */
export declare function persistentSidePanelId(id: string): string;
/** Every built-in panel's id in the order the default lays them out. This is
 *  the ordering skeleton of `ALL_SIDE_PANELS`, not a snapshot of what is
 *  enabled: the resolver drops the ids that are not registered. */
export declare const DEFAULT_SIDE_PANEL_IDS = "todo,jobs,agents,info,trajectory,workspace,btw,companion";
/** `sidePanel.panels`'s "show everything" token — the default. Under it the
 *  enabled set follows the registry: plugin panels registered later appear
 *  (and unregistered ones leave) without any settings write, and the picker
 *  reads the same value as "all checked". */
export declare const ALL_SIDE_PANELS = "*";
/** Chat fraction of the content width; junk collapses to the default and
 *  the value is sanity-clamped (geometry clamps further per width). */
export declare function normalizeSidePanelRatio(value: unknown): number;
/** Parsed `sidePanel.panels`. `*` is "every registered panel"; `''` is the
 *  settings screen's clear (use the default); otherwise the exact ids, in
 *  PanelBar order. `invalid` is what every write path refuses: the settings
 *  gate rejects the draft, and `normalizeSidePanelPanels` (the store, and the
 *  settings field's `format`) drops the unusable tokens. `resolveSidePanelIds`
 *  still folds a raw invalid value to `all` for a caller handing it
 *  un-normalized text — the PanelBar and the settings screen never do. */
export type ParsedSidePanelPanels = {
    readonly mode: 'all';
} | {
    readonly mode: 'empty';
} | {
    readonly mode: 'list';
    readonly ids: readonly string[];
} | {
    readonly mode: 'invalid';
    readonly reason: 'sentinel' | 'token' | 'temporary' | 'empty';
};
/** Strict parse of one `sidePanel.panels` value (the settings save gate). */
export declare function parseSidePanelPanels(value: string): ParsedSidePanelPanels;
/** Tolerant normalization for the config/store entry points: `*`, a
 *  non-string, a blank or an all-malformed value fold to `*`; otherwise
 *  tokens are lower-cased, de-duped and order-preserved. Unlike the picker's
 *  strict gate, a malformed token is dropped here — a typo must never wedge
 *  the layout — while unknown-but-well-formed ids survive, because a plugin
 *  may register them later in the session. A temporary address is dropped
 *  too: it is session state, and a stored value may never claim one. */
export declare function normalizeSidePanelPanels(value: unknown): string;
export declare function getHiddenTemporarySidePanels(): readonly string[];
export declare function subscribeHiddenTemporarySidePanels(listener: () => void): () => void;
/** Hide or restore one temporary panel for this run (`hidden` true = off the
 *  bar, i.e. its checkbox is clear). Returns whether anything changed. */
export declare function setTemporarySidePanelHidden(id: string, hidden: boolean): boolean;
/** The one derivation of "which panels are enabled", given the stored value
 *  and the live registry (ids in registry order).
 *
 *  - `*` (and a raw invalid value): the built-ins in their default order,
 *    then every other registered panel in registry order — the same
 *    tail order the old registration-time append produced, so an upgrade
 *    changes no visible tab order.
 *  - an explicit list: its ids, in its order — a `component:`-encoded one
 *    decoded to the panel it names, an id nothing claims yet left as is (it
 *    stays a placeholder until a plugin registers it). A bare `actN:x` is
 *    never honoured: an old anonymous address cannot be attributed to this
 *    run's activation (#1695), so it enables nothing even when a panel
 *    happens to answer to that runtime id. Registered temporary panels join
 *    at the tail unless `hiddenTemporary` names them: a stored value cannot
 *    speak for a panel it cannot name. */
export declare function resolveSidePanelIds(configured: string | undefined, registered: readonly string[], hiddenTemporary?: readonly string[]): readonly string[];
export declare const subscribeSidePanelSplitEnabled: (listener: () => void) => () => void;
export declare const getSidePanelSplitEnabled: () => boolean;
export declare const applySidePanelSplitEnabled: (value: unknown) => boolean;
export declare const subscribeSidePanelOpen: (listener: () => void) => () => void;
export declare const getSidePanelOpen: () => boolean;
export declare const applySidePanelOpen: (value: unknown) => boolean;
export declare const subscribeSidePanelRatio: (listener: () => void) => () => void;
export declare const getSidePanelRatio: () => number;
export declare const applySidePanelRatio: (value: unknown) => number;
export declare const subscribeSidePanelPanels: (listener: () => void) => () => void;
export declare const getSidePanelPanels: () => string;
export declare const applySidePanelPanels: (value: unknown) => string;
/**
 * btw 线程上下文设置（设置 `dsh-tui.btw.*`）：追问携带的最近完成轮数
 * 与总字符预算。clamp 规则与线程 store 的防御性钳制（sidePanel/btw/
 * threads.ts 的 normalizeRecentTurnsLimit / selectContextTurns）一致——
 * 两道闸门同规则，先到者生效；这里管 /settings 与 cordis.yml 的入口，
 * store 侧兜住不经设置的直接调用。
 */
export declare const BTW_CONTEXT_TURNS_MIN = 1;
export declare const BTW_CONTEXT_TURNS_MAX = 8;
export declare const BTW_CONTEXT_TURNS_DEFAULT = 4;
/** 总预算下限护住单答派生（perAnswer = min(8k, budget/2)）：再小就只剩
 *  当前问句本身，上下文功能名存实亡。 */
export declare const BTW_CONTEXT_BUDGET_MIN = 1000;
export declare const BTW_CONTEXT_BUDGET_MAX = 200000;
export declare const BTW_CONTEXT_BUDGET_DEFAULT = 24000;
export declare function normalizeBtwContextTurns(value: unknown): number;
export declare function normalizeBtwContextBudget(value: unknown): number;
export declare const subscribeBtwContextTurns: (listener: () => void) => () => void;
export declare const getBtwContextTurns: () => number;
export declare const applyBtwContextTurns: (value: unknown) => number;
export declare const subscribeBtwContextBudget: (listener: () => void) => () => void;
export declare const getBtwContextBudget: () => number;
export declare const applyBtwContextBudget: (value: unknown) => number;
/**
 * Companion 皮肤（设置 `dsh-tui.companion.skin`）：内置 'deepy'（默认，
 * assets/deepy 素材包）、'whaleGirl'（用户提供的鲸娘素材包，assets/
 * whaleGirl）与 'whale'（开屏像素鲸鱼同款分层动画）；插件
 * 皮肤 id（'plugin:sub' 命名空间）随 Phase 7 开放注册后同样可写——
 * 未注册/未知的 id 一律回退 deepy，不阻断启动。
 */
export type CompanionSkinSetting = string;
export declare const COMPANION_SKIN_IDS: readonly ["deepy", "whaleGirl", "whale"];
export declare const DEFAULT_COMPANION_SKIN: CompanionSkinSetting;
export declare function normalizeCompanionSkin(value: unknown): CompanionSkinSetting;
export declare const subscribeCompanionSkin: (listener: () => void) => () => void;
export declare const getCompanionSkin: () => string;
export declare const applyCompanionSkin: (value: unknown) => string;
//# sourceMappingURL=tuiDisplayPrefs.d.ts.map