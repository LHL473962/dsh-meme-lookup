import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { unlink } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { Box, Text, useInput, useTerminalSize, useNativeCursor } from '../ui.js';
import { SearchBox } from '../components/SearchBox.js';
import { OverlayAbove } from '../components/OverlayAbove.js';
import { CommandSuggestions } from '../components/CommandSuggestions.js';
import { LogoV2 } from '../components/LogoV2.js';
import { resolveLaunchpadLayout } from '../components/launchpadLayout.js';
import { kernelSubtitle } from '../components/kernelCatalog.js';
import { fitParamParts, PARAM_SEPARATOR } from '../components/launchpadParams.js';
import { useTooltip } from '../components/Tooltip.js';
import { resolveSplashTitleFont, pickSplashFont, splashFontById } from '../components/splashFonts.js';
import { pickSplashEgg } from '../components/splashEggs.js';
import { resolveSplashArtForm, splashArtRows } from '../components/splashArtRows.js';
import { useSplashMascotSkin, useSplashMascotBox } from '../components/sidePanel/companion/SplashMascot.js';
import { t } from '../i18n.js';
import { isMinimalUiMode } from '../minimalUiMode.js';
import { stringWidth } from '../ink/stringWidth.js';
import { isMod, isPlainReturn } from '../utils/modifiers.js';
import { wordBoundaryLeft, wordBoundaryRight } from '../utils/inputWordBoundary.js';
import { actionMatches } from '../utils/keymap.js';
import { formatClipboardInsert, readClipboard } from '../utils/clipboard.js';
import { imagePathMediaType, parsePastedImagePath, readBoundedRegularFile, stageClipboardFilePaths } from '../utils/pastedImagePath.js';
import { resolveBindingGeneration } from '../components/promptDraftCache.js';
import { imageTokenSpans, snapOffImageToken, expandImageTokenRange } from '../components/composerImageTokens.js';
import { collapseToSingleLine, insertSingleLineAt, matchesPasteShortcut, stripBracketedPasteMarkers, } from '../utils/inputPaste.js';
/** 光标闪烁一个相位的毫秒数（用户要求 500–600ms 一相位）。 */
const CARET_BLINK_MS = 550;
/**
 * 纯文字入口（2026-10 第六版修订：用户否掉了背景方块高亮——"高光有点 low 而且
 * 鼠标移开之后居然不会消失，我希望换成字体高光，比如移到字体上变蓝加粗"）。
 *
 * - 入口只渲染**一个标签文本**（无键位前缀、无边框、无指针字符 ❯）；
 * - 悬停/焦点 = **文字高光**：主题蓝（suggestion）+ 加粗，不再铺背景方块；
 *   未悬停时就是普通 dim 文字；
 * - **移入/移出都要复原**（上一版的真 bug）：`onMouseEnter` 悬停并带焦点，
 *   `onMouseLeave` 撤悬停；焦点是悬停带进来的（`focused` 为真）就一并交还
 *   输入框——否则"hover 设了焦点、离开没人清"，高亮就赖着不走了；
 * - **恒 1 行高**：标签是纯字符串、单个 Text 渲染，绝无"键帽一行/标签一行"
 *   上下分离（上一版嵌套 span 在真终端上被实测抓到竖排成两行）；
 * - 鼠标契约照仓库规矩：挂得上 `onClick` 才给 hover 反馈；点击
 *   `stopImmediatePropagation`（整页有"点空白收回焦点"的兜底 handler，
 *   不拦住会既执行动作又清焦点）。
 */
function ActionChip({ label, focused, onActivate, onHover, onHoverLeave, }) {
    const [hovered, setHovered] = React.useState(false);
    const active = hovered || focused;
    return (_jsx(Box, { flexShrink: 0, height: 1, onMouseEnter: () => { setHovered(true); onHover(); }, onMouseLeave: () => { setHovered(false); onHoverLeave(); }, onClick: (event) => {
            event.stopImmediatePropagation();
            onActivate();
        }, children: _jsx(Text, { color: active ? 'suggestion' : undefined, bold: active, dimColor: !active, children: ` ${label} ` }) }));
}
/** 焦点环里参数段的编码：-2 起按显示顺序递减（-1 是输入框，0.. 是动作入口）。 */
const paramFocusOf = (segment) => -2 - PARAM_SEGMENT_ORDER.indexOf(segment);
/** 焦点值反解参数段；-1（输入框）与动作入口（≥0）都返回 undefined。 */
function segmentOfFocus(focus) {
    return focus <= -2 && focus > TIPS_FOCUS ? PARAM_SEGMENT_ORDER[-2 - focus] : undefined;
}
/**
 * Tips 行在焦点环里的编码（第六版设计 2）：参数段最深到 -5，Tips 取 -6。
 * 键盘路径是仓库硬规矩——Tips 可点击轮换，就必须有不含鼠标的等价操作
 * （焦点落到 Tips 行 + Enter = 切下一条，与点击同一条 rotateTip）。
 */
const TIPS_FOCUS = -6;
/**
 * 左下角工作目录铭牌在焦点环里的编码（第七版）：Tips 之后、环的最后一格。
 * 铭牌可点开工作区切换，键盘路径走焦点环 + Enter（仓库硬规矩：每个可点
 * 目标都要有不含鼠标的等价操作；复用环而不是另绑一个键，焦点环的语义
 * （↑/↓/Tab 与版面顺序一致）自动覆盖它）。
 */
const CWD_CORNER_FOCUS = -7;
/**
 * 右下角内核区在焦点环里的编码（第八版）：目录铭牌之后再一格，环的最后一格。
 * 内核区整块可点（点开内核选择器），键盘路径走同一格 + Enter——仓库硬规矩：
 * 每个可点目标都要有不含鼠标的等价操作。它在版面上就在最底（比目录铭牌更靠
 * 右下），所以排在 CWD_CORNER_FOCUS 之后。
 */
const KERNEL_CORNER_FOCUS = -8;
/** Tips 自动轮换的默认间隔（第七版：用户要「呼吸感」；手动切换后计时重置）。 */
const TIP_ROTATE_MS = 10_000;
/** 参数段固定显示顺序（模型 · 思考深度 · 模式(preset) · 权限）。 */
const PARAM_SEGMENT_ORDER = ['model', 'effort', 'preset', 'permission'];
/**
 * 参数行的一个可点段（第五版；第六版与 ActionChip 同步改成文字高光）：
 * 同一套鼠标契约——挂得上 onClick 才给 hover 提亮；点击
 * stopImmediatePropagation（不触发整页的收回焦点兜底）；悬停/焦点 =
 * 该段文字变主题蓝 + 加粗（不铺背景方块），宽度不变（不加内边距，
 * 参数行的宽度预算按原文算）；onMouseLeave 复原并交还悬停带进的焦点
 * （与 ActionChip 的 BUG 2 修复同一条规则）。
 *
 * AC-4（第八版）：段被**尾部截断**时（`…` 在屏上、完整名看不见），hover
 * 走仓库既有的 Tooltip 单例层——dwell 600ms 后弹出完整名。两个鼠标手势
 * **手动组合**（`useTooltip` 只返回它自己的一对 handler，直接覆盖会丢掉
 * 高亮与焦点收回）：进入 = 高亮 + 记焦点 +（被截断才）起计时，离开 =
 * 复原高亮 + 交还焦点 + 撤卡片——成对写在一起，第五版 BUG 2「高亮赖着
 * 不走」那类回归没有缝隙可钻。未截断的段手势照旧（高亮/点击/焦点）但
 * **连计时都不起**（与 Tooltip.tsx 头部「只给真的被隐藏的文本挂」同一条
 * 契约），所以完整名在屏上时不会有浮层风险。
 *
 * F-04（T-FIX-03）：撤卡**不只**挂在 pointer-leave 上——**激活**也显式撤
 * （点击，以及键盘焦点环上的 Enter 走 `onParamPick` 的那条）。否则 hover 出卡
 * 后换一段激活，卡片会停在选择器之上、内容还是上一段的完整名（误导）。指针
 * **仍停在段上**时的保留属 tooltip 的既有语义，这里不动：撤的是"这一次激活"
 * 留下的卡片，下一次真正的 mouseenter 照常按 dwell 出卡。
 */
function ParamChip({ label, fullValue, truncated, colored, focused, activationNonce, onActivate, onHover, onHoverLeave, }) {
    const [hovered, setHovered] = React.useState(false);
    const active = hovered || focused;
    // 内容恒为完整名，**是否接手势**由 `truncated` 自己门控（见下面的 handler）：
    // 未截断的段连 dwell 计时都不起，不依赖单例层"空内容不画卡片"的内部约定
    // ——那条约定改天变了也不该由本屏承担。
    const tooltip = useTooltip(fullValue);
    // F-04：键盘激活的撤卡。首渲染把当前值记为基准（`nonce === 基准` 时不动），
    // 之后只在**变化**时撤一次——连续两次 Enter 也各算一次变化。`tooltip` 是
    // `useTooltip` 的 memo 返回值（依赖 `[owner, delayMs]`），所以这条 effect
    // 不会每次渲染都跑。
    const lastActivation = React.useRef(activationNonce ?? 0);
    React.useEffect(() => {
        const nonce = activationNonce ?? 0;
        if (nonce === lastActivation.current)
            return;
        lastActivation.current = nonce;
        tooltip.onMouseLeave();
    }, [activationNonce, tooltip]);
    return (_jsx(Box, { flexShrink: 0, height: 1, onMouseEnter: (event) => {
            setHovered(true);
            onHover();
            // 只有被截断的段才起计时（AC-4：完整名已在屏上时挂卡片是噪音）。
            if (truncated)
                tooltip.onMouseEnter(event);
        }, onMouseLeave: () => {
            setHovered(false);
            onHoverLeave();
            // 离开**恒**撤：进出的两个手势成对，任何误挂的卡片都不许赖着不走
            // （第五版 BUG 2 的同族失败模式）。
            tooltip.onMouseLeave();
        }, onClick: (event) => {
            event.stopImmediatePropagation();
            // F-04：激活即撤卡——只挂 pointer-leave 时，点开这一段的选择器后卡片
            // 会停在它之上（且内容可能还是上一段的完整名）。指针仍停在段上时的
            // 保留属 tooltip 既有语义，这里撤的是"这一次激活"留下的卡片。
            tooltip.onMouseLeave();
            onActivate();
        }, children: _jsx(Text, { color: active ? 'suggestion' : colored ? 'autoAccept' : undefined, bold: active || colored === true, dimColor: !active && colored !== true, children: label }) }));
}
/**
 * 左下角工作目录铭牌（第七版：可点开工作区切换）。样式契约与 ActionChip/
 * ParamChip 同一套——悬停/焦点 = **文字高光**（主题蓝 + 加粗，不铺背景方块），
 * 恒 1 行高，截断仍走 truncate-middle（窄屏不撑爆）；点击拦住冒泡（不是
 * 「点空白」）；键盘路径 = 焦点环（环的末格）+ Enter，与点击同一条回调。
 */
function CornerChip({ label, focused, onActivate, onHover, onHoverLeave, }) {
    const [hovered, setHovered] = React.useState(false);
    const active = hovered || focused;
    return (_jsx(Box, { flexShrink: 1, height: 1, onMouseEnter: () => { setHovered(true); onHover(); }, onMouseLeave: () => { setHovered(false); onHoverLeave(); }, onClick: (event) => {
            event.stopImmediatePropagation();
            onActivate();
        }, children: _jsx(Text, { color: active ? 'suggestion' : undefined, bold: active, dimColor: !active, wrap: "truncate-middle", children: label }) }));
}
/**
 * 右下角内核区（第八版）：列出可选内核并标出记住的那个。第一行 TUI 版本不动，其后一行一个内核
 * ——当前内核打 `▸ ` 前缀、保持主题蓝；其余行前缀两格空格、文字 dim（前缀等宽
 * 让名字对齐）。行文本 = `短品牌名 · 副标题`（名字取 manifest 的 shortLabel：DSH /
 * Claude——全名 40 列会挤掉左下角的目录铭牌；副标题 = 版本 / 置灰原因，缺席就
 * 只画名字，见 kernelCatalog 的 kernelSubtitle）。目标形状：
 *
 *     ```text
 *                                              dsh-tui v0.12.0
 *                                ▸ DSH · dsh-core v0.2.0-rc.2
 *                                  Claude · claude-code v2.1.284
 *     ```
 *
 * **整块是一个可点目标**（点开内核选择器）：点击 stopImmediatePropagation——
 * 这一屏有「点空白收回焦点」的 handler，不拦住会既开选择器又清焦点；
 * 悬停/焦点高亮照 CornerChip 那套（主题蓝 + 加粗，未激活时只有当前内核行是
 * 主题蓝、其余行 dim）。键盘路径 = 焦点环的 KERNEL_CORNER_FOCUS + Enter，与
 * 点击同一条回调。没接 onKernelPick 时整块不挂鼠标事件（挂得上 onClick 才给
 * hover 反馈，与 ActionChip/CornerChip 一致），也不进焦点环。
 */
function KernelCorner({ rows, focused, onActivate, onHover, onHoverLeave, }) {
    const [hovered, setHovered] = React.useState(false);
    const interactive = onActivate !== undefined;
    const active = interactive && (hovered || focused);
    return (_jsx(Box, { flexShrink: 0, flexDirection: "row", justifyContent: "flex-end", children: _jsx(Box, { flexDirection: "column", alignItems: "flex-end", ...(interactive
                ? {
                    onMouseEnter: () => { setHovered(true); onHover(); },
                    onMouseLeave: () => { setHovered(false); onHoverLeave(); },
                    onClick: (event) => {
                        event.stopImmediatePropagation();
                        onActivate?.();
                    },
                }
                : {}), children: rows.map(row => (_jsx(Box, { flexDirection: "row", height: 1, children: _jsx(Text, { color: row.current ? 'suggestion' : undefined, bold: active, dimColor: !row.current && !active, wrap: "truncate-middle", children: (row.current ? '\u25b8 ' : '  ') + row.label }) }, row.id))) }) }));
}
/**
 * Launchpad —— 每次启动的第一屏（取代旧的"只有鲸鱼标题的空白会话"）。
 *
 * 它**不是一个新页面**：整块视觉核心仍然是 `LogoV2`（像素鲸鱼 / 女仆娘立绘、
 * 块体 `DEEPSEEK`/`HARNESS` 大字、节日换词、求 star 彩蛋——一套代码），但走
 * `LogoV2` 的 chrome="minimal" 极简形态并 align="center"：只有立绘与大字，
 * 版号/模型/工作目录/启动提示/欢迎语一概不画（用户实测要求 opencode 式
 * 留白；欢迎语曾经和落地页自己的一行重复，两处一起删）。
 *
 * 版面（2026-10 第三版改版）：**头部 + 输入框 + 框下成组三行**整块水平垂直
 * 双居中，不再把提示行钉到屏幕底部、中间不留大空档：
 *
 *   - 输入框（圆角边框）里**只有输入那一行**；
 *   - 紧贴框下方一行**参数行**（左对齐输入框）：`模型 · 思考深度 · 模式 · 权限`，
 *     四段缺哪段省哪段、全空整行不画；模型段**只显示模型名**（不带 provider/
 *     前缀）且带浅紫主题色（autoAccept）；第五版起四段**各自可点**，点开 Chat
 *     既有的选择器（overlayPanel 盖在本屏之上，选中值就地更新这一行）；
 *   - 隔一行呼吸留白（矮屏阶梯可撤，见 launchpadLayout）再一行**键帽按钮**
 *     （整行右对齐，与输入框右缘对齐）；
 *   - 再下一行 **`● Tips：`**（居中，圆点橙色 warning）。
 *
 * 屏幕最底的双角铭牌（左 `cwd:branch`、右下 `dsh-tui v…` + **内核区**）保留：
 * 第八版起右下第一行仍是 TUI 版本，其后一行一个可选内核——当前内核打 `▸ ` 且
 * 主题蓝，其余行 dim；整块可点（键盘等价操作 = 焦点环末格 + Enter）。
 *
 * **输入框在这一屏是唯一有状态的部件**：用户敲进去的东西必须原样带进聊天页，
 * 否则"第一屏输入的字"就被这一屏吞了。第六版起行首 `/` 会弹出**命令补全面板**
 * （`commands`/`onCommandPick` 两缝，数据与组件都与聊天页 composer 同源），
 * Tab 补全到输入框，Enter/点击执行并清空输入；面板收起时整行原样交给 `onSubmit`，由 `Chat`
 * 走它既有的命令表判定（合并命令表，含 registry 命令）再决定 runCommand 或
 * 发送。Shift/Option+Enter 则交给 Chat 带着草稿继续多行编辑。本地只读一点：
 * 行首是不是 `/`，用来把输入框左边的提示符从 `❯` 换成
 * `⌘`。
 *
 * TTY 输入使用终端原生光标，闪烁与动画继承终端配置。无原生光标的
 * 呈现环境保留约 550ms 的样式闪烁；相位不增删字符、不挪动文本。
 *
 * 居中与降级：宽度走 `resolveSplashLayout` 那一套（与开屏同源，阈值不会漂），
 * 高度走 `resolveLaunchpadLayout`（整块撤：Tips → 键帽行 → 立绘 → 只留输入框）。
 *
 * 鼠标：`onClick`/`onMouseEnter` 只在 `<AlternateScreen>` 里触发，内联模式
 * 天然没有它们，所以每个可点目标都必须有一条键盘路径（这里全部有：焦点 +
 * Enter）。
 */
export function Launchpad({ query, cursorOffset, focusIndex, isTerminalFocused, whale, whaleIdle, whaleGirl, brand, companionSkin, fontId, egg, starred, onStarClick, firstRun, actions, overlayPanel, inputPaused = false, onParamPick, model, effort, preset, permission, commands, onCommandPick, clipboardReader = readClipboard, imageComposer, 
/** Tips 自动轮换间隔（第七版；测试缝：无头回归注入短间隔确定性驱动相位）。 */
tipRotateMs = TIP_ROTATE_MS, notice, 
/** 左下角工作目录铭牌被点击/回车时交给 Chat（开既有的 /workspace 工作区菜单）。 */
onOpenWorkspace, 
/** 右下角内核区的目录行（第八版：一行一个内核，当前那个打 ▸）。 */
kernels, 
/** 右下角内核区被点击/焦点环 Enter 时交给 Chat（打开内核选择器）。 */
onKernelPick, cwd, branch, tuiVersion, onFocusChange, onAction, onQueryChange, onSubmit, onNewline, onHandoffInput, onEscape, onBlankClick, }) {
    const { columns, rows } = useTerminalSize();
    // `columns`/`rows` 已经是**内容区**尺寸（PageMargin 收窄过 context），
    // 所以这里不再减页边距——与 splashLayout 的约法一致。
    // 光标偏移只在"输入框有焦点"时才有意义；未给（或焦点在快捷入口行）时
    // 一律按行尾算——这与 `SearchBox` 自己的 `cursorOffset ?? query.length`
    // 同一条约定，两处必须一致，否则退格会从"看不见的位置"删字。
    const boundImageSpans = (text) => imageTokenSpans(text).filter(span => imageComposer?.bindings.has(span.token) === true);
    const imageSpans = boundImageSpans(query);
    const caret = snapOffImageToken(imageSpans, focusIndex === -1 ? (cursorOffset ?? query.length) : query.length, 'nearest');
    /** 焦点是否在输入框上（-1）；参数段（≤-2）与动作入口（≥0）都不算。 */
    const inputFocused = focusIndex === -1;
    // ── 命令补全面板（第六版 BUG 1）──────────────────────────────────────────
    // 与聊天页 composer 同一套契约：行首 / + 有候选 → 面板上屏；↑/↓ 移选中、
    // Tab 补全到输入框，Enter/点击执行并清空输入、Esc 只收面板（用户可能只是想
    // 看一眼）。`dismissedFor` 记住"这条 query 被收过"：Esc 之后继续打字
    // （query 变了）面板自然回来，与 PromptInput 的补全行为同源。
    const [paletteIndex, setPaletteIndex] = React.useState(0);
    const [paletteDismissedFor, setPaletteDismissedFor] = React.useState('');
    const paletteInput = query;
    const paletteCommands = commands !== undefined && query.startsWith('/') && query !== paletteDismissedFor
        ? commands
        : [];
    const paletteOpen = inputFocused && paletteCommands.length > 0 && onCommandPick !== undefined;
    const paletteSelectedIndex = Math.min(paletteIndex, Math.max(0, paletteCommands.length - 1));
    const paletteSelected = paletteCommands[paletteSelectedIndex];
    const pickCommand = (commandLine) => {
        setPaletteDismissedFor('');
        setPaletteIndex(0);
        // Edits earlier in the same stdin batch update the mirror before props
        // and completion rows can render again. A stale row must not replace them.
        const notice = onCommandPick?.(queryRef.current === query ? commandLine : queryRef.current);
        if (typeof notice === 'string')
            showPasteNotice(notice);
        else
            pasteRevisionRef.current += 1;
    };
    // ── Tips 轮换（第六版设计 2）─────────────────────────────────────────────
    // 轮换顺序（注释即契约）：launchpad-tip → launchpad-tip-2 → launchpad-tip-3
    // → 回到 launchpad-tip。首启（launchpad-first-run）**优先级最高**：firstRun
    // 为真时整行只显示那一句、不参与轮换（引导没跑完之前别的 Tips 都是噪音）。
    // 点击 Tips 行或把焦点落到 Tips（Enter）都切下一条。
    const TIP_KEYS = ['launchpad-tip', 'launchpad-tip-2', 'launchpad-tip-3'];
    const [tipIndex, setTipIndex] = React.useState(0);
    const rotateTip = () => { setTipIndex(index => (index + 1) % TIP_KEYS.length); };
    // 粘贴的异步落点：剪贴板读回是异步的，读取期间用户可能继续打字——插入必须
    // 用**当时最新**的 query/caret（PromptInput 用 revision 守同一条；这里没有
    // 本地 state，用每次渲染刷新的 refs 守），不能吃按键那一刻的闭包旧值。
    const queryRef = React.useRef(query);
    queryRef.current = query;
    const caretRef = React.useRef(caret);
    caretRef.current = caret;
    const changeQuery = (text, offset) => {
        const nextCaret = snapOffImageToken(boundImageSpans(text), offset, offset < caretRef.current ? 'start' : offset > caretRef.current ? 'end' : 'nearest');
        queryRef.current = text;
        caretRef.current = nextCaret;
        onQueryChange(text, nextCaret);
    };
    const deleteRange = (start, end) => {
        const text = queryRef.current;
        const range = expandImageTokenRange(boundImageSpans(text), start, end);
        changeQuery(text.slice(0, range.start) + text.slice(range.end), range.start);
    };
    const clipboardBusyRef = React.useRef(false);
    const pasteRevisionRef = React.useRef(0);
    const mountedRef = React.useRef(true);
    const imageChainRef = React.useRef(Promise.resolve());
    React.useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);
    const capturePasteLease = () => {
        const revision = pasteRevisionRef.current;
        const channel = imageComposer?.channel;
        const agentId = channel?.agentId;
        const generation = channel === undefined ? 0 : resolveBindingGeneration(channel);
        const imageGeneration = channel?.stagedImageGeneration?.() ?? 0;
        return {
            imageGeneration,
            isCurrent: () => mountedRef.current && revision === pasteRevisionRef.current
                && (channel === undefined || (channel.agentId === agentId
                    && resolveBindingGeneration(channel) === generation
                    && (channel.stagedImageGeneration?.() ?? 0) === imageGeneration)),
        };
    };
    /** 粘贴提示：落地页没有 toast 基础设施，借 Tips 行显示 4 秒（失败不能静默）。 */
    const [pasteNotice, setPasteNotice] = React.useState(undefined);
    const noticeTimerRef = React.useRef(null);
    const showPasteNotice = (message) => {
        setPasteNotice(message);
        if (noticeTimerRef.current !== null)
            clearTimeout(noticeTimerRef.current);
        const timer = setTimeout(() => {
            noticeTimerRef.current = null;
            setPasteNotice(undefined);
        }, 4000);
        timer.unref?.();
        noticeTimerRef.current = timer;
    };
    React.useEffect(() => () => {
        if (noticeTimerRef.current !== null)
            clearTimeout(noticeTimerRef.current);
    }, []);
    /** Tips 行此刻被哪条提示占用（粘贴提示优先于 channel 通知）。 */
    const rowNotice = pasteNotice !== undefined
        ? { text: pasteNotice, color: 'warning' }
        : notice;
    /** 单行插入（粘贴）：换行折叠成空格、`\r` 去掉——落地页是单行编辑器，
     *  多行内容不许拼出换行（Enter 才是提交）。落在当下光标处。 */
    const insertSingleLine = (text) => {
        const clean = collapseToSingleLine(text);
        if (clean === '')
            return;
        // 异步落点守则：读回那一刻的 query/caret 才算数（refs 每次渲染刷新）。
        const next = insertSingleLineAt(queryRef.current, caretRef.current, clean);
        changeQuery(next.text, next.caret);
        onFocusChange(-1);
    };
    const pasteImagePaths = (paths, lease, bitmap = false) => {
        const work = async () => {
            if (!lease.isCurrent())
                return;
            if (imageComposer === undefined) {
                showPasteNotice(t('input-image-paste-failed', { err: 'image attachments are unavailable in this profile' }));
                return;
            }
            const { channel, bindings } = imageComposer;
            const limits = channel.stagedImageLimits?.();
            const { parts, staged, failure, failureCode } = await stageClipboardFilePaths(paths, async (path) => {
                if (!lease.isCurrent())
                    throw new Error('the draft changed while the image was being staged');
                if (limits === undefined)
                    throw new Error('image attachments are unavailable in this profile');
                const data = await readBoundedRegularFile(path, limits.maxImageBytes);
                if (!lease.isCurrent())
                    throw new Error('the draft changed while the image was being staged');
                return channel.stageComposerImage({
                    data,
                    mediaType: imagePathMediaType(path) ?? 'image/png',
                    name: basename(path),
                    path: resolve(path),
                }, lease.imageGeneration);
            }, path => formatClipboardInsert({ kind: 'files', paths: [path] }), Math.max(0, (limits?.maxImagesPerMessage ?? 0) - bindings.size));
            if (!lease.isCurrent() || staged.some(handle => channel.hasStagedImage(handle.stageId) !== true)) {
                for (const handle of staged)
                    channel.discardStagedImage(handle.stageId);
                return;
            }
            let number = 1;
            const reserved = new Set(queryRef.current.match(/\[Image #\d+\]/gu) ?? []);
            const text = parts.map(part => {
                if (part.kind === 'text')
                    return part.value;
                while (reserved.has(`[Image #${number}]`))
                    number += 1;
                const token = `[Image #${number++}]`;
                bindings.set(token, part.value.stageId);
                return token;
            }).join(' ');
            // A failed bitmap export is temporary and must never become a path reference.
            if (!bitmap || staged.length > 0)
                insertSingleLine(`${text} `);
            if (failure !== '') {
                showPasteNotice(t('input-image-paste-failed', { err: failureCode === 'image-limit' ? t('input-image-paste-limit') : failure }));
            }
            else if (staged.length > 0) {
                const adapted = staged.filter(handle => handle.adjustment !== undefined).length;
                showPasteNotice(adapted > 0
                    ? t('input-images-staged-adapted', { count: staged.length, adapted })
                    : t('input-images-staged', { count: staged.length }));
            }
        };
        const queued = imageChainRef.current.then(work, work);
        imageChainRef.current = queued.catch(() => undefined);
        return queued;
    };
    // 光标闪烁相位（第四版修订：**自动呼吸**，不要求终端 focus 事件）。开关只看
    // 「输入框是这一屏的焦点目标」（focusIndex < 0）——`isTerminalFocused` 依赖
    // The native caret owns blinking in TTYs; only the painted fallback needs
    // a timer. Do not gate it on terminal focus events, which can arrive late.
    const nativeCursor = useNativeCursor();
    const inputActive = inputFocused && !nativeCursor;
    const [caretPhase, setCaretPhase] = React.useState(true);
    React.useEffect(() => {
        if (!inputActive) {
            setCaretPhase(true);
            return;
        }
        const timer = setInterval(() => { setCaretPhase(phase => !phase); }, CARET_BLINK_MS);
        timer.unref?.();
        return () => { clearInterval(timer); };
    }, [inputActive]);
    // F-04（T-FIX-03）：键盘激活参数段（焦点环 Enter → onParamPick）与点击同一条
    // 语义——**激活即撤卡**。点击的撤卡在 `ParamChip.onClick` 里就地做（它自己
    // 持有 tooltip owner）；键盘路径的 Enter 由下面的屏级 useInput 处理，这里用
    // 一枚自增信号把"刚被激活的是哪一段"传给对应的 ParamChip（`segment` 定位、
    // `nonce` 让连续两次 Enter 也各算一次变化）。指针**仍停在段上**时的保留属
    // tooltip 既有语义，不动。
    const [paramActivation, setParamActivation] = React.useState(null);
    // 参数行（第五版；第六版设计 1 改 preset 段）：**只画值、不画字段名**；
    // 模型段**只显示模型名**（去掉 provider/ 前缀——用户原话「两个都放的话就
    // 太长了」）：`glm-5.3  ·  Max  ·  Standard  ·  default`。模式段显示 agent
    // preset 的显示名（Standard/PTC/极简…，Chat 从 preset 名册解析后传入）；
    // 模型值带浅紫主题色，其余 dim。四段各自可点（onParamPick → Chat 既有的
    // /model · /effort · /preset · /permission 选择器）。
    const paramParts = (() => {
        const parts = [];
        if (model !== undefined && model !== '')
            parts.push({ segment: 'model', value: model, colored: true });
        if (effort !== undefined && effort !== '') {
            parts.push({ segment: 'effort', value: effort.charAt(0).toUpperCase() + effort.slice(1) });
        }
        if (preset !== undefined && preset !== '') {
            parts.push({ segment: 'preset', value: preset });
        }
        if (permission !== undefined && permission !== '')
            parts.push({ segment: 'permission', value: permission });
        return parts;
    })();
    // 宽度自适应：参数行是**单行**（折行会把 F 组的「整句要么完整要么不出现」不
    // 变量打碎）。拟合走纯函数 `fitParamParts`（三段式：装得下 → 四段原样；装不下
    // → 按「可缩减量最大」把超长段**尾部截断**（权限段一字不减，`Max` 这类宽度
    // ≤ 下限的短段也不减）；压到各自下限仍超 → 今天的尾部省段），组件不再自己写
    // 累加循环——宽度记账、降级语义与 `…` 的形态都在 `components/launchpadParams.ts`，
    // 纯函数层与屏幕层的回归在 `scripts/verify-launchpad.tsx` 的 Q / R 组。
    const paramBudget = Math.max(24, Math.min(columns - 4, 72)) - 2;
    const fittedParams = fitParamParts(paramParts, paramBudget);
    const hasParams = fittedParams.length > 0;
    // 双角铭牌：像两枚低调的机械铭牌，把整块界面扎在终端底边上。
    const cornerLeft = [cwd, branch].filter(part => part !== undefined && part !== '').join(':');
    // 右下角铭牌带（第八版）：第一行 TUI 版本，其后一行一个内核。
    // 行文本 = `名字 · 副标题`——副标题（版本 / 置灰原因）与选择器同源
    // （kernelSubtitle），读不到就只画名字，绝不编造。**登录状态不进铭牌**：
    // 铭牌只报「有哪些内核、各自什么版本」，未登录在选择器里看（切换时才需要，
    // noteKey 在那边走副标题），右下角保持只有名字与版号的干净两列。
    const tuiPart = tuiVersion === undefined || tuiVersion === '' ? undefined : `dsh-tui v${tuiVersion}`;
    // 名字用**短品牌名**（option.shortLabel，来自 manifest：DSH / Claude，与启动页
    // 「内核 · DSH」那个 chip 同源）：这一格与左下角的 `工作目录:分支` 共用底边，
    // 全名（DeepSeek Harness · … = 40 列）在窄终端里会把左边的目录铭牌挤掉。
    // 选择器那一屏有地方，仍用全名（label）。
    const kernelRows = (kernels ?? []).map(option => {
        const { noteKey: _loginNote, ...rest } = option;
        const subtitle = kernelSubtitle(rest, key => t(key));
        const name = option.shortLabel;
        return { id: option.id, current: option.current, label: subtitle === undefined ? name : name + ' \u00b7 ' + subtitle };
    });
    /** 内核区进不进焦点环：画得出来**且**接了回调（可点才需要键盘等价操作）。 */
    const kernelCornerFocusable = kernelRows.length > 0 && onKernelPick !== undefined;
    const cardWidth = Math.max(24, Math.min(columns - 4, 72));
    // 当天字体与节日只在 mount 时选一次，并交给 Logo，避免预算与渲染各自读日期。
    // 立绘槽的吉祥物皮肤（`companion.skin`）同理：这一层与 `LogoV2` 读同一个
    // 源（同一份 `useSyncExternalStore` 订阅），预算与渲染不会各看各的。
    const mascotSkin = useSplashMascotSkin(companionSkin);
    const mascotBox = useSplashMascotBox(mascotSkin, (brand ?? 'deepseek') === 'deepseek' && (whale || whaleGirl));
    const [dailyFont] = React.useState(() => pickSplashFont());
    const [dailyEgg] = React.useState(() => egg === undefined ? pickSplashEgg() : egg);
    const font = fontId === undefined ? dailyFont : splashFontById(fontId);
    const titleFont = resolveSplashTitleFont(font, brand, dailyEgg);
    // 预算与 LogoV2 共享形态、图片槽：紧凑图片已缩减占位时不能仍按侧栏的15行算。
    const splashArtForm = resolveSplashArtForm({ brand, whaleGirl, mascotSkin });
    const artRows = splashArtRows(splashArtForm, mascotBox);
    const layout = resolveLaunchpadLayout(columns, rows, {
        params: hasParams,
        whale,
        whaleGirl,
        font: titleFont,
        artRows,
        // 右下角铭牌自身行数：第一行（目录 + TUI 版号）+ 一行一个内核（第八版）。
        cornerRows: 1 + kernelRows.length,
    });
    // Tips 自动轮换（第七版，用户要「呼吸感」）：约 10s 一换，与点击/焦点+Enter
    // 的手动切换**并存**——手动切换改 tipIndex，本 effect 以 tipIndex 为依赖，
    // 重臂即计时重置（刚点完不会立刻被自动轮换跳走）。只在 Tips 行真的在画、
    // 且不是首启句/粘贴提示时跑；本组件被整屏盖住时随之卸载，定时器自然停。
    // 切换只改那一行文本（TIP_KEYS 查表），行高与居中位置不变——无布局抖动。
    const tipsAutoRotatable = layout.showTip && rowNotice === undefined && !firstRun;
    React.useEffect(() => {
        if (!tipsAutoRotatable)
            return;
        const timer = setInterval(() => { setTipIndex(index => (index + 1) % TIP_KEYS.length); }, tipRotateMs);
        timer.unref?.();
        return () => { clearInterval(timer); };
    }, [tipsAutoRotatable, tipRotateMs, tipIndex]);
    // 一行装得下几个动作：装不下的**不画**（不是截断）——半个标签比少一个
    // 入口更难懂。键盘仍能走到全部入口，丢掉的只是鼠标的礼貌。
    // 第四版标签就是**纯文字**（无键帽/键位前缀）；带插值的（Continue 标题）由 t() 解。
    const chips = fitChips(actions.map(action => t(action.labelKey, action.values)), columns);
    /**
     * 键帽行放不放得下：`fitChips` 已经按宽度整条取舍（绝不切半个标签），
     * 这里只回答「一条都放不下时还画不画」——不画，省下一行给留白。
     */
    const hintsFit = chips.length > 0;
    /**
     * 这一屏独占键盘（`Chat` 在 `supervisorOpen` 那一层之前让位），所以输入
     * 在这里自持——把按键转发给 Chat 反而要多绕一层 state 往返。
     *
     * 编辑能力刻意只做单行编辑器该有的那几样：退格 / Delete / 左右移动 /
     * Home / End / 粘贴。首屏不是编辑器，用户在上面打的第一句通常就一两个
     * 词；多行与 `@` 补全属于聊天页，图片经同一 channel 暂存。
     *
     * `↑/↓` 与 `Tab` 在键帽行上移动焦点；焦点在 `-1` 时这两组键无操作
     * （首屏没有可滚的东西）。
     */
    const handingOffRef = React.useRef(false);
    useInput((input, key, event) => {
        // 选择器盖在这一屏之上时键盘整块让位（Chat 的 overlay 分支处理；Esc 关
        // 选择器回到这里）。没有这道闸，选择器分支没消费的键会漏进草稿。
        if (inputPaused)
            return;
        if (handingOffRef.current) {
            onHandoffInput?.(event);
            event.stopImmediatePropagation();
            return;
        }
        const query = queryRef.current;
        const caret = caretRef.current;
        const composing = key.ctrl || key.meta || key.super;
        // 终端原生粘贴（bracketed paste：Ctrl+Shift+V / 右键 / Shift+Insert）：
        // ink 把载荷标成 isPasted 交给 useInput；标记字节（\x1b[200~ / 201~）在
        // 解析层已被剥掉，这里的 input 就是纯载荷。换行折叠成单行（见上）。
        if (event?.isPasted === true && input.length > 0) {
            const text = stripBracketedPasteMarkers(input);
            const path = parsePastedImagePath(text);
            if (path !== null && imageComposer !== undefined) {
                const lease = capturePasteLease();
                void pasteImagePaths([path], lease).catch(error => {
                    if (lease.isCurrent())
                        showPasteNotice(t('input-image-paste-failed', { err: String(error) }));
                });
            }
            else
                insertSingleLine(text);
            event.stopImmediatePropagation();
            return;
        }
        // Ctrl+V / Cmd+V（keymap 的 paste 动作，可经 /settings 重映射；照
        // PromptInput 的做法用 actionMatches，不硬编码键字符串）读系统剪贴板。
        // 曾经的 bug：组合键兜底把 Ctrl+V 一口吞掉，粘贴永远是死的。
        if (matchesPasteShortcut(input, key)) {
            if (!clipboardBusyRef.current) {
                const lease = capturePasteLease();
                clipboardBusyRef.current = true;
                void clipboardReader()
                    .then(async (content) => {
                    const temporaryPath = content?.kind === 'image' ? content.path : undefined;
                    try {
                        if (!lease.isCurrent())
                            return;
                        if (content === null) {
                            showPasteNotice(t('input-clipboard-empty'));
                            return;
                        }
                        if (content.kind === 'unavailable') {
                            showPasteNotice(t(content.wsl === true ? 'input-clipboard-unavailable-wsl' : 'input-clipboard-unavailable'));
                            return;
                        }
                        if (content.kind === 'image') {
                            if (imagePathMediaType(content.path) === undefined) {
                                showPasteNotice(t('input-image-format-unsupported'));
                                return;
                            }
                            await pasteImagePaths([content.path], lease, true);
                            return;
                        }
                        if (content.kind === 'files' && imageComposer !== undefined) {
                            await pasteImagePaths(content.paths, lease);
                            return;
                        }
                        const text = formatClipboardInsert(content);
                        const path = parsePastedImagePath(text);
                        if (path !== null && imageComposer !== undefined)
                            await pasteImagePaths([path], lease);
                        else
                            insertSingleLine(text);
                    }
                    finally {
                        if (temporaryPath !== undefined)
                            await unlink(temporaryPath).catch(() => undefined);
                    }
                })
                    .catch(() => {
                    if (lease.isCurrent())
                        showPasteNotice(t('input-clipboard-read-failed'));
                })
                    .finally(() => {
                    clipboardBusyRef.current = false;
                });
            }
            event.stopImmediatePropagation();
            return;
        }
        // 第七版：Continue 的专属快捷键（keymap 的 `continue` 动作，默认 Alt+R，
        // 可经 /settings → Shortcuts 重映射）。只在这一屏生效（聊天页不绑这条）；
        // actions 里没有 continue（无可继续会话）时不放假动作——按下即忽略。
        if (actionMatches('continue', input, key)) {
            const continueAction = actions.find(action => action.id === 'continue');
            if (continueAction !== undefined) {
                onAction(continueAction);
                event.stopImmediatePropagation();
                return;
            }
        }
        if (inputFocused && onNewline !== undefined
            && key.return && (key.shift || key.meta) && !key.ctrl && !key.super) {
            pasteRevisionRef.current += 1;
            handingOffRef.current = true;
            onNewline(query, caret);
            event.stopImmediatePropagation();
            return;
        }
        // 命令补全面板（第六版 BUG 1）：面板开着时 ↑/↓/Enter/Tab/Esc 全归面板——
        // 与聊天页 composer 的补全菜单同一套键位。Tab 补全；Enter/点击执行选中命令
        // （onCommandPick → Chat 的 runCommand，绝不 submit）；Esc 只收面板，
        // 草稿一字不动（用户可能只是想看一眼有什么命令）。
        if (paletteOpen && paletteSelected !== undefined) {
            if (key.upArrow || key.downArrow) {
                const count = paletteCommands.length;
                setPaletteIndex(previous => (previous + (key.downArrow ? 1 : -1) + count) % count);
                event.stopImmediatePropagation();
                return;
            }
            if (key.tab) {
                if (!key.shift && query === paletteInput) {
                    const replacement = paletteSelected.replacement;
                    setPaletteIndex(0);
                    changeQuery(replacement, replacement.length);
                }
                event.stopImmediatePropagation();
                return;
            }
            if (isPlainReturn(key)) {
                pickCommand(paletteSelected.commandLine);
                event.stopImmediatePropagation();
                return;
            }
            if (key.escape) {
                setPaletteDismissedFor(query);
                event.stopImmediatePropagation();
                return;
            }
        }
        if (key.escape) {
            pasteRevisionRef.current += 1;
            // 空输入时 Esc 去看会话（首屏最常见的下一步）；已经有字就只清空它,
            // 免得辛苦打的半句话被一次性丢掉。
            if (query !== '')
                changeQuery('', 0);
            else
                onEscape('sessions');
            event.stopImmediatePropagation();
            return;
        }
        if (key.ctrl && (input === 'c' || input === 'd')) {
            pasteRevisionRef.current += 1;
            if (query !== '')
                changeQuery('', 0);
            else
                onEscape('exit');
            event.stopImmediatePropagation();
            return;
        }
        if (isPlainReturn(key)) {
            // 焦点画在哪一格，Enter 就归谁：Tips 行（-6）切下一条 Tip、参数段（≤-2）
            // 点开它对应的选择器、动作入口（≥0）激活那一条，输入框有焦点（`-1`）时
            // 才把整行原文交回 Chat。键盘路径是仓库硬规矩（每个可点目标都要有），
            // 四段参数、可点击的 Tips 行与两个角标（目录铭牌/内核区）也不例外。
            const focusedSegment = segmentOfFocus(focusIndex);
            if (focusIndex === TIPS_FOCUS) {
                rotateTip();
            }
            else if (focusIndex === KERNEL_CORNER_FOCUS && onKernelPick !== undefined) {
                // 右下角内核区（第八版）：Enter = 打开内核选择器（与点击同一条回调）。
                onKernelPick();
            }
            else if (focusIndex === CWD_CORNER_FOCUS && onOpenWorkspace !== undefined) {
                // 左下角工作目录铭牌（第七版）：Enter = 打开既有 /workspace 菜单。
                onOpenWorkspace();
            }
            else if (focusedSegment !== undefined && onParamPick !== undefined) {
                // 激活即撤卡（F-04）：先记信号——ParamChip 的 effect 在这次提交后撤掉
                // 可能挂着的卡片；键盘路径与点击路径落在同一个 onParamPick 上。
                const activated = focusedSegment;
                setParamActivation(prev => ({ segment: activated, nonce: (prev?.nonce ?? 0) + 1 }));
                onParamPick(activated);
            }
            else {
                const focused = focusIndex >= 0 ? actions[focusIndex] : undefined;
                if (focused === undefined) {
                    const notice = onSubmit(query);
                    if (typeof notice === 'string')
                        showPasteNotice(notice);
                    else
                        pasteRevisionRef.current += 1;
                }
                else
                    onAction(focused);
            }
            event.stopImmediatePropagation();
            return;
        }
        if (key.tab || key.upArrow || key.downArrow) {
            if (actions.length === 0)
                return;
            const step = key.upArrow || (key.tab && key.shift) ? -1 : 1;
            // `-1`（输入框）从下方进入：向"上"回到输入框，向"下"落到第一格——
            // Tab 在输入框上则直接进第一格。
            // 焦点环 = 输入框（`-1`）+ **画出来的**参数段（第五版，先于入口行——
            // 参数行在版面上就在入口行上方，↓ 的空间顺序与环顺序一致）+ **画出来的**
            // 入口 + Tips 行（第六版设计 2，环的最后一格——它在版面上就在入口行下方）。
            // 窄终端里 `fitChips`/参数行的宽度裁剪会丢掉放不下的那几个，按
            // 整张表绕圈会让焦点指着一个看不见的目标、Enter 触发一个看不见的动作。
            const tipsFocusable = layout.showTip && rowNotice === undefined && !firstRun;
            // 左下角铭牌（第七版）：画得出来且接了 onOpenWorkspace 才进环。
            const cornerFocusable = layout.showCorners && cornerLeft !== '' && onOpenWorkspace !== undefined;
            // 环的顺序 = 版面顺序（↓ 一路向下）：…→ Tips → 左下目录铭牌 → 右下内核区。
            const ring = [
                -1,
                ...fittedParams.map(part => paramFocusOf(part.segment)),
                ...chips.map(chip => chip.index),
                ...(tipsFocusable ? [TIPS_FOCUS] : []),
                ...(cornerFocusable ? [CWD_CORNER_FOCUS] : []),
                ...(kernelCornerFocusable ? [KERNEL_CORNER_FOCUS] : []),
            ];
            const at = ring.indexOf(focusIndex);
            const next = ring[((at >= 0 ? at : 0) + step + ring.length) % ring.length];
            onFocusChange(next);
            event.stopImmediatePropagation();
            return;
        }
        if (key.leftArrow || key.rightArrow || key.home || key.end) {
            if (!inputFocused)
                return;
            const at = caret;
            const byWord = isMod(key) || key.meta;
            const next = key.home ? 0
                : key.end ? query.length
                    : key.leftArrow ? byWord ? wordBoundaryLeft(query, at) : Math.max(0, prevBoundary(query, at))
                        : byWord ? wordBoundaryRight(query, at) : Math.min(query.length, nextBoundary(query, at));
            changeQuery(query, next);
            event.stopImmediatePropagation();
            return;
        }
        if ((key.backspace && !key.meta) || key.delete) {
            if (!inputFocused)
                return;
            const at = caret;
            if (key.backspace) {
                if (at === 0)
                    return;
                deleteRange(prevBoundary(query, at), at);
            }
            else {
                if (at >= query.length)
                    return;
                deleteRange(at, nextBoundary(query, at));
            }
            event.stopImmediatePropagation();
            return;
        }
        if ((isMod(key) && input === 'w') || (key.meta && key.backspace)) {
            if (!inputFocused)
                return;
            deleteRange(wordBoundaryLeft(query, caret), caret);
            event.stopImmediatePropagation();
            return;
        }
        if (isMod(key) && input === 'u') {
            if (!inputFocused)
                return;
            const lineStart = caret === 0 ? 0 : query.lastIndexOf('\n', caret - 1) + 1;
            deleteRange(lineStart, caret);
            event.stopImmediatePropagation();
            return;
        }
        if (composing || key.return)
            return;
        // 可打印输入（含粘贴整段）：接到光标处，交给 SearchBox 的窗口化去滚。
        const typed = input.replace(/[\r\n]+/gu, '');
        if (typed === '')
            return;
        const at = caret;
        changeQuery(query.slice(0, at) + typed + query.slice(at), at + typed.length);
        onFocusChange(-1);
        event.stopImmediatePropagation();
    });
    return (_jsxs(Box, { flexDirection: "column", width: columns, height: rows, onClick: onBlankClick, children: [_jsxs(Box, { flexDirection: "column", flexGrow: 1, alignItems: "center", justifyContent: "center", children: [layout.showHero && (_jsx(LogoV2, { fontId: font.id, egg: dailyEgg, whale: layout.showWhale && whale, whaleIdle: whaleIdle, whaleGirl: layout.showWhale && whaleGirl, brand: brand, companionSkin: companionSkin, mascotBox: mascotBox, starred: starred, onStarClick: onStarClick, skipIntro: true, align: "center", chrome: "minimal", arrangement: "column" })), _jsxs(Box, { flexDirection: "column", width: cardWidth, marginTop: layout.heroGapRows, children: [_jsx(Box, { flexDirection: "column", borderStyle: "round", borderColor: inputFocused ? 'suggestion' : 'inactive', paddingX: 1, width: cardWidth, children: _jsx(SearchBox, { query: query, placeholder: t('launchpad-placeholder'), 
                                    // 第七版（用户原话「光标永远不消失 哪怕焦点没了也不消失」）：
                                    // 只要这一屏在，输入光标**常在**——焦点挪到参数段/入口行只影响
                                    // 外框提亮（inputFocused），不再当光标的开关。
                                    isFocused: true, isTerminalFocused: inputFocused ? true : isTerminalFocused, 
                                    // 占位紧跟 ❯ 之后左对齐（用户实测要求；只影响落地页这一处）。
                                    placeholderAlign: "left", 
                                    // 边框由外层卡片画——SearchBox 自己那圈收起来，否则就是框套框。
                                    borderless: true, prefix: query.startsWith('/') ? '⌘' : '❯', width: cardWidth - 4, cursorOffset: caret, imageSpans: imageSpans, caretBlink: inputFocused ? caretPhase : true }) }), hasParams && (_jsx(Box, { paddingLeft: 2, height: 1, flexDirection: "row", children: fittedParams.map((part, index) => (_jsxs(React.Fragment, { children: [index > 0 && _jsx(Text, { dimColor: true, children: PARAM_SEPARATOR }), onParamPick === undefined ? (_jsx(Text, { color: part.colored === true ? 'autoAccept' : undefined, bold: part.colored === true, dimColor: part.colored !== true, children: part.value })) : (_jsx(ParamChip, { label: part.value, fullValue: part.fullValue, truncated: part.truncated, colored: part.colored, focused: focusIndex === paramFocusOf(part.segment), activationNonce: paramActivation?.segment === part.segment ? paramActivation.nonce : 0, onActivate: () => onParamPick(part.segment), onHover: () => onFocusChange(paramFocusOf(part.segment)), onHoverLeave: () => {
                                                if (focusIndex === paramFocusOf(part.segment))
                                                    onFocusChange(-1);
                                            } }))] }, part.segment))) })), overlayPanel !== undefined && (_jsx(OverlayAbove, { maxHeight: Math.max(rows - 8, 1), transparent: true, children: _jsx(Box, { onClick: (event) => { event.stopImmediatePropagation(); }, children: overlayPanel }) })), overlayPanel === undefined && paletteOpen && paletteSelected !== undefined && (_jsx(OverlayAbove, { maxHeight: Math.max(rows - 8, 1), transparent: true, children: _jsx(Box, { onClick: (event) => { event.stopImmediatePropagation(); }, children: _jsx(CommandSuggestions, { commands: paletteCommands, selectedIndex: paletteSelectedIndex, columns: cardWidth, query: query, onPick: (index) => {
                                            const command = paletteCommands[index];
                                            if (command !== undefined) {
                                                pickCommand(command.commandLine);
                                            }
                                        } }) }) }))] }), hasParams && layout.showHints && hintsFit && layout.hintsGapRows > 0 && (_jsx(Box, { flexShrink: 0, height: 1 })), layout.showHints && hintsFit && (_jsx(Box, { flexShrink: 0, flexDirection: "row", gap: 2, alignSelf: "center", width: columns, justifyContent: "flex-end", paddingRight: Math.max(0, Math.floor((columns - cardWidth) / 2)), children: chips.map(({ index, label }) => (_jsx(ActionChip, { label: label, focused: focusIndex === index, onActivate: () => onAction(actions[index]), onHover: () => onFocusChange(index), onHoverLeave: () => {
                                if (focusIndex === index)
                                    onFocusChange(-1);
                            } }, actions[index].id))) })), (layout.showTip || rowNotice !== undefined) && (_jsx(Box, { flexShrink: 0, alignSelf: "center", marginTop: layout.tipGapRows, ...(rowNotice === undefined && !firstRun
                            ? { onClick: (event) => { event.stopImmediatePropagation(); rotateTip(); } }
                            : {}), children: rowNotice === undefined ? (_jsxs(_Fragment, { children: [_jsxs(Text, { color: "warning", children: ["\u25CF ", t('launchpad-tip-prefix')] }), _jsx(Text, { color: focusIndex === TIPS_FOCUS ? 'suggestion' : undefined, bold: focusIndex === TIPS_FOCUS, dimColor: focusIndex !== TIPS_FOCUS, children: firstRun ? t('launchpad-first-run') : t(TIP_KEYS[tipIndex]) })] })) : (_jsxs(Text, { color: rowNotice.color ?? 'warning', children: ["\u25CF ", rowNotice.text] })) }))] }), layout.showCorners && (_jsxs(Box, { flexShrink: 0, flexDirection: "column", children: [_jsxs(Box, { flexShrink: 0, flexDirection: "row", justifyContent: "space-between", height: 1, children: [cornerLeft !== '' && onOpenWorkspace !== undefined ? (_jsx(CornerChip, { label: cornerLeft, focused: focusIndex === CWD_CORNER_FOCUS, onActivate: onOpenWorkspace, onHover: () => onFocusChange(CWD_CORNER_FOCUS), onHoverLeave: () => {
                                    if (focusIndex === CWD_CORNER_FOCUS)
                                        onFocusChange(-1);
                                } })) : (_jsx(Text, { dimColor: true, wrap: "truncate-middle", children: cornerLeft })), _jsx(Text, { dimColor: true, wrap: "truncate-middle", children: tuiPart ?? '' })] }), kernelRows.length > 0 && (_jsx(KernelCorner, { rows: kernelRows, focused: focusIndex === KERNEL_CORNER_FOCUS, onActivate: onKernelPick, onHover: () => onFocusChange(KERNEL_CORNER_FOCUS), onHoverLeave: () => {
                            if (focusIndex === KERNEL_CORNER_FOCUS)
                                onFocusChange(-1);
                        } }))] }))] }));
}
/** 快捷入口之间的间隔列数（与动作行 `gap={2}` 一致，预算必须同源）。 */
export const CHIP_GAP = 2;
/**
 * 一行装得下哪几个快捷入口（第四版：纯文字标签）。
 *
 * @param labels - 全部标签（宽度按 `stringWidth` 算，CJK 是双宽）。
 * @param columns - 内容区列数。
 * @returns 保留下来的 `{ index, label }`；装不下就到此为止（绝不切半个）。
 */
export function fitChips(labels, columns) {
    // 每项画成高亮矩形：` 标签 `（背景铺两侧各 1 格内边距）——预算按
    // `标签宽 + 2` 算；行内 gap 2 格由 CHIP_GAP 同步。
    const budget = Math.max(0, columns - 4);
    const out = [];
    let used = 0;
    for (let index = 0; index < labels.length; index++) {
        const label = labels[index];
        const width = stringWidth(label) + 2;
        const next = used === 0 ? width : used + CHIP_GAP + width;
        if (next > budget)
            break;
        used = next;
        out.push({ index, label });
    }
    return out;
}
/**
 * 光标左移一个**码位**（不是 UTF-16 单元）。
 *
 * `Array.from` 迭代码位，所以退格/左移不会把一个 emoji 或代理对劈成两半
 * ——`SearchBox` 的窗口化在同一条假设上工作（它的 `windowQuery` 专门有
 * 一段"中途代理对回退到起点"的代码），两边必须一致，否则光标会落在半
 * 个字符里，然后下一次按键就画出一个碎 emoji。
 *
 * @param text - 全文。
 * @param at - 当前 UTF-16 偏移。
 * @returns 左侧一个码位的偏移（已在 0 时返回 0）。
 */
export function prevBoundary(text, at) {
    if (at <= 0)
        return 0;
    const before = Array.from(text.slice(0, at));
    before.pop();
    return before.join('').length;
}
/**
 * 光标右移一个码位。见 {@link prevBoundary}。
 * @param text - 全文。
 * @param at - 当前 UTF-16 偏移。
 * @returns 右侧一个码位的偏移（到末尾时返回末长）。
 */
export function nextBoundary(text, at) {
    if (at >= text.length)
        return text.length;
    const rest = Array.from(text.slice(at));
    const first = rest[0] ?? '';
    return at + first.length;
}
/** 最小模式这一屏整体不存在（与 `LogoHeader` 同规则）：直接进会话。 */
export function launchpadVisible() {
    return !isMinimalUiMode();
}
