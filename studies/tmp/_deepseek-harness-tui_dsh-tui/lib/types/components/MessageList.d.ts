import React from 'react';
import { type ScrollBoxHandle } from '../ui.js';
import type { ChatRow } from '../dsh-adapter/channel.js';
import type { JobGroupFoldMode } from '../tuiDisplayPrefs.js';
import type { TranscriptImage } from '../dsh-adapter/transcript-images.js';
import type { DOMElement } from '../ink/dom.js';
import type { Brand } from '../branding.js';
import { type TimelineSnapshot } from '../ink/timeline-rail.js';
import type { ToolBackground } from '../tuiDisplayPrefs.js';
/**
 * Display form of an IDE-selection path (T-FIX-01): when the path lives
 * under the session cwd, strip that prefix so the indicator line reads
 * `src/a.ts` instead of a long absolute path (UAT finding — the extension
 * anchors at its workspace root while the TUI session cwd is the git
 * worktree root, so raw paths are long and redundant). Pure display layer:
 * the `<attached-file>` block keeps its absolute path for the model.
 *
 * Comparison reuses normalizeIdePath (the ide-channel lock matcher's
 * normalizer: backslashes folded to forward slashes, trailing slashes
 * stripped, case folded on case-insensitive filesystems) so Windows forms
 * like `d:/x` vs `D:\X` still match. Prefix hits return the remainder
 * (`src/a.ts`); everything else — outside cwd, empty/undefined cwd, or the
 * path being the cwd itself — returns the input unchanged. NOT basename:
 * that would drop the directory context and collide on same-named files.
 * `caseInsensitive` is parameterized so verifiers can pin either mode on
 * any host.
 */
export declare function displaySelectionPath(path: string, sessionCwd: string | undefined, caseInsensitive?: boolean): string;
export declare function MessageList({ rows, expanded, expandedRows, selectedId, onToggleRow, streamViewToggledRows, onToggleStreamView, model, diffLayout, thinkingFold, jobGroupFold, toolBackground, foldTerminalCommand, turnUsageRow, smoothStreaming, activityFrames, showAll, onToggleAll, onLoadOlder, olderHistory, thinkingVisible, historyPaintEnabled, fullscreen, registerRowRef, scrollHandle, forceMountRowId, newSinceRowId, onUnseenCount, onTimeline, failureHintRowId, failureHint, onOpenSubagent, onOpenSubagentView, onOpenJobs, onWatchJobOutput, onOpenFile, sessionCwd, onPreviewImage, suppressImageGraphics, }: {
    rows: readonly ChatRow[];
    expanded: boolean;
    expandedRows: ReadonlySet<number>;
    selectedId: number | null;
    onToggleRow: (rowId: number) => void;
    /** 流式 reasoning 行相对 thinkingFold 默认视图的逐行切换。 */
    streamViewToggledRows?: ReadonlySet<number>;
    onToggleStreamView?: (rowId: number) => void;
    model: string;
    /** Edit/Write diff presentation preference (forwarded to tool cards). */
    diffLayout?: 'auto' | 'split' | 'unified';
    /** Thinking-block display mode from channel (`preview`/`full`). */
    thinkingFold?: 'preview' | 'full';
    /** Grouping/folding of consecutive job-card runs (settings
     *  `dsh-tui.jobGroupFold`): `auto` folds a settled run of ≥3 into its
     *  summary header, `always` folds any run of ≥2, `never` leaves runs open
     *  (a header click still folds one by hand). */
    jobGroupFold?: JobGroupFoldMode;
    /** Tool-card background treatment from the live channel settings. */
    toolBackground?: ToolBackground;
    /** Terminal-card header folding from the live channel settings. */
    foldTerminalCommand?: boolean;
    /** Turn-usage ledger row from the live channel settings (default off):
     *  off filters the rows out of the visible window BEFORE virtualization —
     *  the ledger itself keeps feeding `turnUsage`, /tokens, /status and the
     *  footer hover. */
    turnUsageRow?: boolean;
    /** Smooth streaming reveal from the live channel settings (default off at
     *  this layer — embedders and verify harnesses keep exact-paint behavior;
     *  Chat passes the channel's `dsh-tui.smoothStreaming` value). */
    smoothStreaming?: boolean;
    /** Working-activity preset name from the channel; drives the subagent
     *  card's running glyph so both indicators follow one setting. */
    activityFrames?: string;
    showAll: boolean;
    onToggleAll: () => void;
    /** Restore folded-away older rows from the session log; shown only when
     *  rows were folded (or `olderHistory` says more exists before them). */
    onLoadOlder?: () => void;
    /** The session has history older than the first row (a compaction cut it
     *  off before a resume): the "load earlier" divider shows without any
     *  folded row. */
    olderHistory?: boolean;
    /** A job card on screen keeps its output tail fresh (returns the unwatch). */
    onWatchJobOutput?: (id: string) => () => void;
    thinkingVisible?: boolean;
    /**
     * Whether rows outside the virtualization window must still be painted
     * once (main-screen mode: unpainted rows leave NO copy in the terminal
     * scrollback, so preset history would vanish). The alt-screen has no
     * scrollback — passing false skips the mount-everything-on-open
     * expansion there (a 300-row fold window of markdown otherwise costs
     * seconds of lex/highlight/layout before first paint).
     */
    historyPaintEnabled?: boolean;
    /** Fullscreen layout: running tool cards show more live output lines. */
    fullscreen?: boolean;
    /** Transcript search: register each row's DOM element for scroll-to-match. */
    registerRowRef?: (rowId: number, el: DOMElement | null) => void;
    /** Scroll viewport the list virtualizes against. */
    scrollHandle?: ScrollBoxHandle | null;
    /** Row that must be mounted this pass (seek target for scrollToElement). */
    forceMountRowId?: number | null;
    /** "Seen up to" anchor for the new-messages pill: rows with id greater
     *  than this are new. Null when pinned to the bottom (nothing unseen). */
    newSinceRowId?: number | null;
    /** Reports how many new rows still sit below the viewport bottom edge. */
    onUnseenCount?: (count: number) => void;
    /**
     * Reports the conversation timeline snapshot for the sticky prompt
     * header AND the transcript's turn rail: one entry per user turn
     * (stable row id + content-space text top + preview line), plus the
     * viewport-derived navigation targets, all computed from the same
     * offsets[]/base geometry the mount window uses:
     *
     *  - active: the LAST turn whose prompt top is at-or-above the viewport
     *    top (the turn whose content owns the top row — the one being
     *    read); the FIRST turn stands in while pre-turn content (logo /
     *    loaded-context) owns the top. Never null while any turn exists.
     *    Top-anchored on purpose (Grok timeline semantics), not
     *    "topmost visible prompt": the highlight moves only when a turn
     *    boundary crosses the viewport top, so it never leaps when nudging
     *    off the bottom, and the header/rail can never disagree.
     *  - upId: nearest turn STRICTLY above the viewport top (▲ target).
     *  - downId: nearest turn below the top whose top ≤ maxScroll — turns
     *    past maxScroll can never own the top row (the renderer clamps
     *    there), so naming them would make ▼ repeat itself forever.
     *
     * Reported post-commit, only when the signature changes.
     */
    onTimeline?: (state: TimelineSnapshot) => void;
    /**
     * Row id that should carry the trajectory footnote — the newest unseen
     * failure, or null. Exactly one row ever carries it: repeating the pointer
     * under every historical failure is the clutter this design avoids.
     */
    failureHintRowId?: number | null;
    /** Footnote text, e.g. `ctrl+t for the full trajectory`. */
    failureHint?: string;
    /** 打开子代理详情场景（transcript 内点击子代理卡）。 */
    onOpenSubagent?: (agentId: string) => void;
    /** 从转录里的子代理卡打开主屏只读 Agent View。 */
    onOpenSubagentView?: (agentId: string, rowId: number) => void;
    /** 打开 /jobs 后台任务面板（transcript 内点击任务卡）。 */
    onOpenJobs?: (focusId?: string) => void;
    /** 点击工具卡内的文件路径（打开文件操作菜单）。 */
    onOpenFile?: (path: string) => void;
    /** Session working directory (fs path, `channel.cwd`): the IDE-selection
     *  indicator line strips this prefix for display (T-FIX-01). Optional —
     *  repro/verify harnesses that predate the field render unchanged with
     *  raw paths. The real fs cwd, NOT displayCwd: remote URI display forms
     *  can't prefix-match selection paths. */
    sessionCwd?: string | undefined;
    /** 点击 transcript 缩略图（打开共享的大图预览 overlay）。 */
    onPreviewImage?: (image: TranscriptImage) => void;
    /** Modal preview owns the terminal-image frame budget while open. */
    suppressImageGraphics?: boolean;
}): React.JSX.Element;
/**
 * The header block pinned above the transcript: the DeepSeek pixel whale
 * with the wordmark, tagline, model/effort and cwd (`LogoV2`), plus the
 * welcome line. It scrolls away with the transcript once the conversation
 * fills the viewport.
 */
export declare function LogoHeader({ model, effort, cwd, fontId, whale, whaleIdle, whaleGirl, brand, starred, onStarClick, working, skipIntro, }: {
    model: string;
    effort?: string | undefined;
    cwd: string;
    /** Big-text face pin (settings `dsh-tui.splashFont`; `undefined` leaves
     *  `LogoV2` on its date rotation). Passed through to LogoV2. */
    fontId?: string | undefined;
    whale?: boolean;
    /** Idle whale behaviors + working signal (passed through to LogoV2). */
    whaleIdle?: boolean;
    /** Maid portrait swap (passed through to LogoV2; settings `dsh-tui.whaleGirl`). */
    whaleGirl?: boolean;
    /** 品牌档（当前后端 → `resolveBrand`；见 `branding.ts`）。 */
    brand?: Brand;
    /** 求 star 标语行被点击（一键 star；host 不传则不可点）。 */
    onStarClick?: () => void;
    /** 本次会话已 star（彩蛋换「捡到星星」版）。 */
    starred?: boolean;
    working?: boolean;
    /** Jump straight to the settled header (long-session resume: the ~3.4s
     *  opening animation competes with transcript mount batches). */
    skipIntro?: boolean;
}): React.ReactNode;
//# sourceMappingURL=MessageList.d.ts.map