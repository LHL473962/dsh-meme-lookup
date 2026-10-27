import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, useTerminalImages, useTerminalSize } from '../ui.js';
import { getLang, subscribeLang, t } from '../i18n.js';
import { Divider } from './design-system/Divider.js';
import { HintLine } from './design-system/HintLine.js';
import { ListItem } from './design-system/ListItem.js';
import { CLAUDE_GIRL_ASSETS, MAID_ASSETS, MaidPortrait, useMaidPortraits } from './maidPortrait.js';
import { getActiveBrand } from '../branding.js';
import { WhaleGirlHappyArt } from './WhaleGirl.js';
import { useTerminalBackground } from './design-system/ThemeProvider.js';
import { STANDARD_FRAME_INDEX, WhaleArt } from './Whale.js';
import { OPENING_SEQUENCES, WHALE_FRAME_INDEX } from './whaleFrames.js';
/** Art slot width — the pixel whale fallback is 40 columns wide, and the
 * raster portrait fits inside the same slot so the card width never moves. */
const ART_COLUMNS = 40;
/** Art slot height: 18 rows (confetti 3 + whale 13 in the celebration), and
 * the text column is pinned to the same height (see the column's comment). */
const ART_ROWS = 18;
/** Text column width: every copy line, button and hint stays on ONE row
 * (the "排版不舒适" report: no stranded `⭐`, no mid-sentence breaks). */
const TEXT_COLUMNS = 48;
/** Portrait + text side by side need this many columns (art 40 + gap 2 +
 * text 48 + card chrome 6); below that the card drops the art and stacks
 * text at the narrower width. */
const MIN_ART_COLUMNS = 98;
/** Card height with the art (18 art rows + 2 border rows); terminals shorter
 * than this + 2 margin rows get the text-only card. */
const MIN_ART_ROWS = 23;
/** Dwell on the standard pose before the fallback whale's intro loops. */
const WHALE_REST_MS = 3000;
/** How long the celebration stays before the card closes itself. */
const CELEBRATION_MS = 4200;
/**
 * The one-time "asks for a star" startup modal (usage milestones `99h` /
 * `999 launches`, see `usageStats.ts`). Chat mounts it over a dimmed
 * click-catcher on boot when `dueStarModal()` says the moment arrived —
 * never mid-turn, at most one milestone per boot, `Esc`/click-outside
 * closes, and unmounting hands the keyboard straight back (nothing is left
 * registered, so it cannot steal keys after closing).
 *
 * Composition follows the house design system: the milestone title sits in
 * the card's top border, the two actions are `ListItem` rows (pointer,
 * focus colour, hover background — the same component every picker uses),
 * a `Divider` separates the footer, and the hint line is a `HintLine` with
 * its bold key. The art slot shows the raster maid first, the animated
 * pixel whale otherwise.
 *
 * A successful star switches the card into a short CELEBRATION instead of
 * closing silently: confetti falls over the whale, which spouts on a loop,
 * with a thank-you line — then the card closes itself. A failed attempt
 * keeps the card open with the reason and the browser escape hatch.
 */
export function StarPrompt({ milestone, actions, onClose, initialPhase = 'ask', }) {
    React.useSyncExternalStore(subscribeLang, getLang);
    const { columns, rows } = useTerminalSize();
    const imagesAvailable = useTerminalImages();
    // 立绘跟品牌档走（branding.ts）：claude 内核的橙界面里放鲸鱼娘会跳戏。
    const portraits = useMaidPortraits(imagesAvailable, getActiveBrand() === 'claude' ? CLAUDE_GIRL_ASSETS : MAID_ASSETS);
    const maidSource = portraits?.normal;
    // 卡片底色用**终端真底色**（OSC 11）而不是主题的卡片色：后者是一整块
    // 与终端背景无关的实色板，压在带背景图的终端上很僵硬；用真底色时卡片
    // 与终端同色、只靠边框和暗化的背景区分层次，同时它也是真图立绘的不透明
    // 衬底（Sixel 没有 alpha，透明像素得合成到某个实色上）。
    const terminalBackground = useTerminalBackground();
    const withArt = columns >= MIN_ART_COLUMNS && rows >= MIN_ART_ROWS;
    const [phase, setPhase] = React.useState(initialPhase);
    const [failure, setFailure] = React.useState('');
    const [selected, setSelected] = React.useState(0);
    // Some terminals report one Enter twice (parsed Return then raw CR); the
    // modal must not fire its action twice for one press.
    const lastEnterRef = React.useRef(0);
    const live = React.useRef(true);
    React.useEffect(() => () => { live.current = false; }, []);
    const runStar = () => {
        if (phase === 'working' || phase === 'done')
            return;
        setPhase('working');
        void Promise.resolve(actions.onStar()).then(attempt => {
            if (!live.current)
                return;
            if (attempt.kind === 'starred') {
                setPhase('done');
                return;
            }
            setFailure(attempt.kind === 'failed'
                ? t('star-failed', { detail: attempt.detail, url: attempt.url })
                : t(attempt.kind === 'no-gh' ? 'star-no-gh' : 'star-not-authed', { url: attempt.url }));
            // gh 缺失/未登录这类"本机没法一键"的结局：光标直接落到浏览器那一行，
            // 用户按一下 Enter 就打开浏览器自己去点（不必先按 ↓）。
            if (attempt.kind === 'no-gh' || attempt.kind === 'not-authed')
                setSelected(1);
            setPhase('failed');
        }, (error) => {
            if (!live.current)
                return;
            setFailure(t('star-failed', { detail: String(error), url: '' }));
            setPhase('failed');
        });
    };
    // The celebration bows out on its own; a key press closes it early.
    React.useEffect(() => {
        if (phase !== 'done')
            return;
        const timer = setTimeout(onClose, CELEBRATION_MS);
        return () => { clearTimeout(timer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在进入庆祝时起表
    }, [phase]);
    useInput((input, key) => {
        if (phase === 'done') {
            onClose();
            return;
        }
        if (key.escape) {
            onClose();
            return;
        }
        if (key.upArrow || key.downArrow || key.tab) {
            setSelected(previous => (previous + 1) % 2);
            return;
        }
        if (key.return) {
            const now = Date.now();
            if (now - lastEnterRef.current < 50)
                return;
            lastEnterRef.current = now;
            if (selected === 0)
                runStar();
            else
                actions.onOpen();
        }
    });
    const textColumns = withArt ? TEXT_COLUMNS : Math.max(24, Math.min(TEXT_COLUMNS, columns - 6));
    const cardColumns = withArt ? 96 : Math.min(columns, textColumns + 6);
    // 卡片 = 艺术槽 + 上下边框。absolute 卡片的高度上限由**根节点高度**决定：
    // 根只有内容高（内联模式的夹具）时，卡片顶端会被裁掉——夹具因此把 Chat
    // 包在视口大小的 Box 里（真机 alt-screen 的根就是整屏）。
    const cardRows = withArt ? ART_ROWS + 2 : 18;
    const left = Math.max(0, Math.floor((columns - cardColumns) / 2));
    const bottom = Math.max(0, Math.min(Math.floor((rows - cardRows) / 2), rows - cardRows));
    const celebrating = phase === 'done';
    const title = celebrating
        ? t('star-modal-thanks-title')
        : milestone.hours !== undefined
            ? t('star-modal-title-hours', { hours: milestone.hours })
            : t('star-modal-title-launches', { launches: milestone.launches ?? 0 });
    return (_jsxs(_Fragment, { children: [_jsx(Box, { position: "absolute", bottom: 0, left: 0, width: "100%", height: rows, flexShrink: 0, backdrop: "dim", onClick: onClose }), _jsx(Box, { position: "absolute", left: left, bottom: bottom, width: cardColumns, height: cardRows, flexDirection: "column", flexShrink: 0, overflow: "hidden", backgroundColor: terminalBackground, opaque: true, onClick: event => { event.stopImmediatePropagation(); }, children: _jsxs(Box, { flexDirection: "row", gap: 2, alignItems: "center", justifyContent: "center", borderStyle: "round", borderColor: "inactive", paddingX: 2, backgroundColor: terminalBackground, children: [withArt && (_jsx(ArtSlot, { celebrating: celebrating, phase: phase, imagesAvailable: imagesAvailable, maidSource: maidSource, maidHappy: portraits?.happy, background: terminalBackground })), _jsxs(Box, { flexDirection: "column", width: textColumns, ...(withArt ? { height: ART_ROWS } : {}), children: [_jsx(Box, { height: 1, flexShrink: 0, children: _jsx(Text, { color: "accent", bold: true, wrap: "truncate-end", children: title }) }), _jsx(Box, { height: 1 }), celebrating ? (_jsxs(_Fragment, { children: [_jsx(Text, { wrap: "wrap", children: t('star-modal-thanks-1') }), _jsx(Box, { height: 1 }), _jsx(Text, { wrap: "wrap", children: t('star-modal-thanks-2') }), _jsx(Text, { wrap: "wrap", children: t('star-modal-thanks-3') }), _jsx(Text, { wrap: "wrap", children: t('star-modal-thanks-4') }), _jsx(Box, { flexGrow: 1 }), _jsx(Divider, { width: textColumns }), _jsx(Box, { height: 1 }), _jsx(Text, { dimColor: true, wrap: "wrap", children: _jsx(HintLine, { text: t('star-modal-thanks-hint') }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Text, { wrap: "wrap", children: t('star-modal-body-1') }), _jsx(Box, { height: 1 }), _jsx(Text, { wrap: "wrap", children: t('star-modal-body-2') }), _jsx(Text, { wrap: "wrap", children: t('star-modal-body-3') }), _jsx(Text, { wrap: "wrap", children: t('star-modal-body-4') }), _jsx(Text, { wrap: "wrap", children: t('star-modal-body-5') }), _jsx(Text, { wrap: "wrap", children: t('star-modal-body-6') }), _jsx(Box, { height: 1 }), _jsx(ListItem, { isFocused: selected === 0, disabled: phase === 'working', declareCursor: false, onClick: event => {
                                                event.stopImmediatePropagation();
                                                setSelected(0);
                                                runStar();
                                            }, children: phase === 'working' ? t('star-modal-working') : t('star-modal-star') }), _jsx(ListItem, { isFocused: selected === 1, declareCursor: false, onClick: event => {
                                                event.stopImmediatePropagation();
                                                setSelected(1);
                                                actions.onOpen();
                                            }, children: t('star-modal-open') }), phase === 'failed' && (_jsxs(_Fragment, { children: [_jsx(Box, { height: 1 }), _jsx(Text, { color: "error", wrap: "wrap", children: failure })] })), phase !== 'failed' && (_jsxs(_Fragment, { children: [_jsx(Box, { height: 1 }), _jsx(Divider, { width: textColumns })] })), _jsx(Box, { height: 1 }), _jsx(Text, { dimColor: true, wrap: "wrap", children: _jsx(HintLine, { text: t('star-modal-hint') }) })] }))] })] }) })] }));
}
/** The star modal's card and maid art, used only for a confirmed login grant. */
function couponExpiry(expiresAt) {
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime()))
        return null;
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(date);
    const part = (type) => parts.find(item => item.type === type)?.value;
    const month = part('month');
    const day = part('day');
    const hour = part('hour');
    const minute = part('minute');
    return month === undefined || day === undefined || hour === undefined || minute === undefined
        ? null : { month, day, time: `${hour}:${minute}` };
}
export function WhaleCouponPrompt({ notice, onShown, onClose, }) {
    const lang = React.useSyncExternalStore(subscribeLang, getLang);
    const { columns, rows } = useTerminalSize();
    const imagesAvailable = useTerminalImages();
    const portraits = useMaidPortraits(true, getActiveBrand() === 'claude' ? CLAUDE_GIRL_ASSETS : MAID_ASSETS);
    const background = useTerminalBackground();
    const withArt = columns >= MIN_ART_COLUMNS && rows >= MIN_ART_ROWS;
    const textColumns = withArt ? TEXT_COLUMNS : Math.max(1, Math.min(TEXT_COLUMNS, columns - 6));
    const cardColumns = withArt ? 96 : Math.min(columns, textColumns + 6);
    const cardRows = withArt ? ART_ROWS + 2 : Math.min(rows, 15);
    const left = Math.max(0, Math.floor((columns - cardColumns) / 2));
    const bottom = Math.max(0, Math.min(Math.floor((rows - cardRows) / 2), rows - cardRows));
    const amount = notice.amount.replace(/(\.\d*?)0+$/u, '$1').replace(/\.$/u, '');
    const unit = lang === 'zh' ? notice.currency === 'CNY' ? '元' : '美元' : notice.currency;
    const expiry = couponExpiry(notice.expiresAt);
    React.useEffect(() => {
        const timer = setTimeout(() => onShown(notice.orderId), 0);
        return () => { clearTimeout(timer); };
    }, [notice.orderId, onShown]);
    useInput((_input, key) => {
        if (key.return || key.escape)
            onClose();
    });
    return (_jsxs(_Fragment, { children: [_jsx(Box, { position: "absolute", bottom: 0, left: 0, width: "100%", height: rows, flexShrink: 0, backdrop: "dim", onClick: onClose }), _jsx(Box, { position: "absolute", left: left, bottom: bottom, width: cardColumns, height: cardRows, flexDirection: "column", flexShrink: 0, overflow: "hidden", backgroundColor: background, opaque: true, onClick: event => { event.stopImmediatePropagation(); }, children: _jsxs(Box, { flexDirection: "row", gap: 2, alignItems: "center", justifyContent: "center", borderStyle: "round", borderColor: "inactive", paddingX: 2, backgroundColor: background, children: [withArt && (_jsxs(Box, { width: ART_COLUMNS, height: ART_ROWS, flexShrink: 0, flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: background, opaque: true, children: [_jsx(Confetti, { width: ART_COLUMNS }), imagesAvailable && portraits?.happy !== undefined
                                    ? _jsx(MaidPortrait, { source: portraits.happy, maxColumns: ART_COLUMNS, maxRows: ART_ROWS - CONFETTI_ROWS, presentation: "preview" })
                                    : _jsx(WhaleGirlHappyArt, { source: portraits?.happy, width: ART_COLUMNS })] })), _jsxs(Box, { flexDirection: "column", width: textColumns, ...(withArt ? { height: ART_ROWS } : {}), children: [_jsx(Text, { color: "accent", bold: true, wrap: "truncate-end", children: t('coupon-modal-title') }), _jsx(Box, { height: 1 }), _jsx(Text, { color: "success", bold: true, wrap: "wrap", children: t('coupon-modal-received', { amount, unit }) }), expiry !== null && (_jsxs(_Fragment, { children: [_jsx(Box, { height: 1 }), _jsx(Text, { wrap: "wrap", children: t('coupon-modal-expiry', expiry) })] })), _jsx(Box, { flexGrow: 1 }), _jsx(Divider, { width: textColumns }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: _jsx(HintLine, { text: t('coupon-modal-hint') }) })] })] }) })] }));
}
/**
 * The card's art column: the raster maid first, the animated pixel whale
 * otherwise. While celebrating it shows the **happy maid** (raster→raster in
 * the same pixel canvas, so the swap is a clean erase+draw) under the star
 * field; without image protocols the whale spouts instead — character
 * blocks never take this slot.
 */
function ArtSlot({ celebrating, phase, imagesAvailable, maidSource, maidHappy, background, }) {
    const raster = imagesAvailable && maidSource !== undefined;
    const frame = useWhaleFrames(celebrating && !raster ? 'celebrate' : raster || phase === 'working' ? 'none' : 'intro');
    if (celebrating && raster) {
        return (_jsxs(Box, { width: ART_COLUMNS, height: ART_ROWS, flexShrink: 0, flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: background, children: [_jsx(Confetti, { width: ART_COLUMNS }), _jsx(MaidPortrait, { source: maidHappy ?? maidSource, maxColumns: ART_COLUMNS, maxRows: ART_ROWS - CONFETTI_ROWS, presentation: "preview" })] }));
    }
    if (celebrating) {
        return (_jsxs(Box, { width: ART_COLUMNS, height: ART_ROWS, flexShrink: 0, flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: background, opaque: true, children: [_jsx(Confetti, { width: ART_COLUMNS }), _jsx(WhaleArt, { frameIndex: frame, width: ART_COLUMNS })] }));
    }
    if (raster) {
        return (_jsx(Box, { width: ART_COLUMNS, height: ART_ROWS, flexShrink: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", children: _jsx(MaidPortrait, { source: maidSource, maxColumns: ART_COLUMNS, maxRows: ART_ROWS, presentation: "preview" }) }));
    }
    return (_jsx(Box, { width: ART_COLUMNS, height: ART_ROWS, flexShrink: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", children: _jsx(WhaleArt, { frameIndex: frame, width: ART_COLUMNS }) }));
}
/**
 * Drive the art slot's frame: `intro` loops the classic opener with a rest
 * on the standard pose, `celebrate` loops the water spout (the thank-you
 * animation), `none` parks on the standard pose with no timer at all.
 */
function useWhaleFrames(mode) {
    const [frame, setFrame] = React.useState(STANDARD_FRAME_INDEX);
    React.useEffect(() => {
        if (mode === 'none') {
            setFrame(STANDARD_FRAME_INDEX);
            return;
        }
        const sequence = mode === 'celebrate' ? CELEBRATION_FRAMES : OPENING_SEQUENCES.classic;
        let step = 0;
        let timer;
        const tick = () => {
            const current = sequence[step] ?? sequence[0];
            setFrame(current.frame);
            const last = step === sequence.length - 1;
            step = (step + 1) % sequence.length;
            const rest = mode === 'celebrate' ? 0 : WHALE_REST_MS;
            timer = setTimeout(tick, last ? (rest || current.ms) : current.ms);
            timer.unref?.();
        };
        tick();
        return () => { if (timer !== undefined)
            clearTimeout(timer); };
    }, [mode]);
    return frame;
}
/**
 * The celebration loop, paced instead of frantic: the spout blooms up with
 * easing (130→100ms), falls back slower (110→180ms), rests, then ONE gentle
 * tail wag, then rests again——约 3.2s 一轮，与卡片的关闭时间同量级。
 */
const CELEBRATION_FRAMES = [
    { frame: WHALE_FRAME_INDEX.spout1, ms: 130 },
    { frame: WHALE_FRAME_INDEX.spout2, ms: 120 },
    { frame: WHALE_FRAME_INDEX.spout3, ms: 110 },
    { frame: WHALE_FRAME_INDEX.spout4, ms: 100 },
    { frame: WHALE_FRAME_INDEX.spout5, ms: 100 },
    { frame: WHALE_FRAME_INDEX.spout6, ms: 110 },
    { frame: WHALE_FRAME_INDEX.spout5, ms: 120 },
    { frame: WHALE_FRAME_INDEX.spout4, ms: 130 },
    { frame: WHALE_FRAME_INDEX.spout3, ms: 150 },
    { frame: WHALE_FRAME_INDEX.spout2, ms: 170 },
    { frame: WHALE_FRAME_INDEX.spout1, ms: 190 },
    { frame: STANDARD_FRAME_INDEX, ms: 620 },
    { frame: WHALE_FRAME_INDEX.tail1, ms: 180 },
    { frame: WHALE_FRAME_INDEX.tail2, ms: 200 },
    { frame: WHALE_FRAME_INDEX.tail3, ms: 200 },
    { frame: WHALE_FRAME_INDEX.tail4, ms: 180 },
    { frame: STANDARD_FRAME_INDEX, ms: 520 },
];
/** 星光两行、稀疏：主星（常亮，金色）+ 闪烁星（各列相位不同，同一帧只有
 *  三分之一亮着）——比随机撒点安静，也比满屏星星精致。 */
const CONFETTI_GLYPHS = ['✦', '✧'];
const CONFETTI_COLORS = ['warning', 'accent', 'activity'];
const CONFETTI_FRAMES = 3;
const CONFETTI_ROWS = 2;
/** 每几列一颗主星（常亮）。 */
const CONFETTI_ANCHOR_STRIDE = 7;
const CONFETTI = Array.from({ length: CONFETTI_FRAMES }, (_, frameIndex) => Array.from({ length: CONFETTI_ROWS }, (_, row) => {
    const runs = [];
    let current = undefined;
    let buffer = '';
    for (let column = 0; column < ART_COLUMNS; column++) {
        const anchor = column % CONFETTI_ANCHOR_STRIDE === 0;
        // 闪烁星：每列一个固定相位，逐帧轮到自己亮一次（在 3 帧里亮 1 帧）。
        const twinkle = !anchor
            && column % 2 === 0
            && (column / 2 + row) % CONFETTI_FRAMES === frameIndex;
        const glyph = anchor ? CONFETTI_GLYPHS[0] : twinkle ? CONFETTI_GLYPHS[1] : ' ';
        const color = anchor
            ? CONFETTI_COLORS[0]
            : twinkle
                ? (column / 2) % 2 === 0 ? CONFETTI_COLORS[1] : CONFETTI_COLORS[2]
                : undefined;
        if (color !== current) {
            if (buffer !== '')
                runs.push({ text: buffer, color: current });
            buffer = '';
            current = color;
        }
        buffer += glyph;
    }
    if (buffer !== '')
        runs.push({ text: buffer, color: current });
    return runs;
}));
/** One confetti band, advancing a frame every 160ms while it is mounted. */
function Confetti({ width }) {
    const frame = useConfettiFrame();
    const rows = CONFETTI[frame] ?? CONFETTI[0];
    return (_jsx(Box, { flexDirection: "column", flexShrink: 0, width: width, children: rows.map((runs, index) => (_jsx(Text, { wrap: "truncate-end", children: runs.map((run, runIndex) => (_jsx(Text, { color: run.color, children: run.text }, runIndex))) }, index))) }));
}
function useConfettiFrame() {
    const [frame, setFrame] = React.useState(0);
    React.useEffect(() => {
        const timer = setInterval(() => {
            setFrame(previous => (previous + 1) % CONFETTI_FRAMES);
        }, 220);
        timer.unref?.();
        return () => { clearInterval(timer); };
    }, []);
    return frame;
}
