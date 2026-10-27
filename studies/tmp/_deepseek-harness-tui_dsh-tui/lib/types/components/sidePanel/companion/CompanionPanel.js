import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CompanionPanel derives mood, interaction animations and bubbles from the
 * channel state. The companion stays at the bottom while status and activity
 * occupy the space above it. A local visible-only tick advances frames and
 * expires temporary reactions; dragging keeps the skin in normal document flow.
 */
import React from 'react';
import { Box, Text, useAnimationFrame } from '../../../ui.js';
import instances from '../../../ink/instances.js';
import { t } from '../../../i18n.js';
import { wrapTextLines } from '../../../ink/wrap-text.js';
import { truncateWidth } from '../../../trajectory/format.js';
import { panelStore } from '../PanelStore.js';
import { useUnreadSubagentFailures } from '../subagentFailureRead.js';
import { PANEL_MIN_COLUMNS } from '../dimensions.js';
import { getCompanionSkin, subscribeCompanionSkin } from '../../../tuiDisplayPrefs.js';
import { useSidePanelChannel, SidePanelRuntimeContext } from '../SidePanelRuntimeContext.js';
import { usePanelInput } from '../usePanelInput.js';
import { CARRYING_FLASH_MS, CELEBRATE_DWELL_MS, IDLE_ROTATE_MS, NOTIFICATION_BUBBLE_MS, POKE_MS, TICKLE_MIN_CLICKS, TICKLE_WINDOW_MS, WAKING_FLASH_MS, countRunningJobs, countRunningSubagents, countSessionsRunning, createNotificationTracker, deriveCompanionContext, deriveCompanionMood, idleRotationIndex, initialCompanionHoverState, initialCompanionDisplayState, notificationReactionKind, resolveTargetSemantic, stepCompanionDisplay, stepCompanionHover, stepNotificationTracker, } from './mood.js';
import { initialCompanionPoseState, nextCompanionPoseStep } from './pose.js';
import { DeepySkin, resolveCompanionSkin } from './skins.js';
import { DEEPY_IDLE_ROTATION, DEEPY_NOTIFICATION_REACTION, deepyAnimationFor, frameAt, loadDeepyKit, renderedDeepyAnimation, } from './deepy.js';
/** 入睡延迟：Panel 常驻，沿用分文档的 60s（开屏 splash 保持 10s）。 */
const SLEEP_AFTER_MS = 60_000;
/** 单次 poke 反应的展示时长（poke-left/poke-right 帧表一轮 2100ms，取一轮多的头段）。 */
const POKE_REACTION_MS = 1400;
/** Enter 键戳一戳用的反应档。 */
const ENTER_POKE_SIDE = 'poke-right';
/** 气泡最多展示的文本行数（超出按 truncateWidth 截断）。 */
const BUBBLE_MAX_LINES = 3;
/** 松手弹回的插值时长（约两个动画 tick；无弹簧物理，克制优先）。 */
const PET_REBOUND_MS = 360;
/** Local animation tick for the visible companion. */
const TICK_MS = 160;
const TICK_MS_SLEEPING = 1000;
const MOOD_LABEL_KEY = {
    sleeping: 'companion-mood-sleeping',
    idle: 'companion-mood-idle',
    waiting: 'companion-mood-waiting',
    thinking: 'companion-mood-thinking',
    working: 'companion-mood-working',
    responding: 'companion-mood-responding',
    attention: 'companion-mood-attention',
    celebrate: 'companion-mood-celebrate',
    error: 'companion-mood-error',
};
/** 显示语义 → 心情（pose/标签用；whale 皮肤的分层姿态与心情标签同源）。 */
const SEMANTIC_MOOD = {
    thinking: 'thinking',
    typing: 'working',
    notification: 'attention',
    error: 'error',
    happy: 'celebrate',
    sleeping: 'sleeping',
    idle: 'idle',
    music: 'working',
    conducting: 'working',
    building: 'working',
    compacting: 'working',
};
const MOOD_COLOR = {
    sleeping: 'inactive',
    idle: 'accent',
    waiting: 'accent',
    thinking: 'accent',
    working: 'accent',
    responding: 'accent',
    attention: 'warning',
    celebrate: 'success',
    error: 'error',
};
const BUBBLE_COLOR = {
    error: 'error',
    warning: 'warning',
    success: 'success',
};
function formatElapsed(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    if (seconds < 60)
        return seconds + 's';
    return Math.floor(seconds / 60) + 'm' + (seconds % 60) + 's';
}
function hoverSemantic(zone) {
    if (zone === 'pet')
        return 'notice';
    if (zone === 'near' || zone === 'left' || zone === 'right')
        return 'look';
    return undefined;
}
export function CompanionPanel({ width, height, focused, visible }) {
    const channel = useSidePanelChannel();
    const runtimeCtx = React.useContext(SidePanelRuntimeContext);
    const activity = runtimeCtx?.activity;
    const attentionCtx = runtimeCtx?.attention;
    const jobsBadge = React.useSyncExternalStore(panelStore.subscribe, () => panelStore.get('jobs')?.badge ?? null);
    const jobsFailedUnread = jobsBadge !== null && jobsBadge.level === 'error' ? jobsBadge.unread : 0;
    const subagents = channel.subagents ?? [];
    const backgroundJobs = channel.backgroundJobs ?? [];
    const failedSubagents = useUnreadSubagentFailures(channel).size;
    // 本地重渲染驱动（互动/气泡/动画帧都要在事件之外推进）。
    const [, setBump] = React.useState(0);
    const bump = React.useCallback(() => { setBump(n => n + 1); }, []);
    // 活动 = 任何会话动静 + 面板交互；睡眠由这个时钟驱动（60s 无活动）。
    const lastInputAtRef = React.useRef(Date.now());
    React.useEffect(() => {
        lastInputAtRef.current = Date.now();
    }, [channel.version]);
    // 回合完成（working true→false）触发一次庆祝（happy 只在边沿 armed）。
    const [celebrateUntil, setCelebrateUntil] = React.useState(0);
    const prevWorkingRef = React.useRef(channel.working);
    React.useEffect(() => {
        const was = prevWorkingRef.current;
        prevWorkingRef.current = channel.working;
        if (was && !channel.working)
            setCelebrateUntil(Date.now() + CELEBRATE_DWELL_MS);
    }, [channel.working]);
    // --- 覆盖层（互动/反应）与气泡：渲染期 ref 步进，过期由本地 tick 收 ----
    const overrideRef = React.useRef(undefined);
    const bubbleRef = React.useRef(undefined);
    const notifyTrackerRef = React.useRef(null);
    if (notifyTrackerRef.current === null)
        notifyTrackerRef.current = createNotificationTracker();
    const clicksRef = React.useRef([]);
    const carryRef = React.useRef({ branch: undefined, until: 0 });
    const heartPendingRef = React.useRef(false);
    // 真拖动位移（面板层状态，两套皮肤共用）：session 锚住拖起点的屏幕坐标
    // 与宠物当时的面板内位置；dragPos 是当前跟手位置；flyback 是松手后的
    // 时间插值弹回（渲染期按 now 推进，本地 tick 驱动重渲染）。
    const dragSessionRef = React.useRef(undefined);
    const dragPosRef = React.useRef(undefined);
    const flybackRef = React.useRef(undefined);
    const [hoverState, setHoverState] = React.useState(undefined);
    // 悬停展示语义，提交后按驻留时长推进。
    const hoverDisplayRef = React.useRef(initialCompanionHoverState);
    const now = Date.now();
    // 恢复可见的第一帧：语义跳闸对齐 + 通知积压静默吞掉。
    const prevVisibleRef = React.useRef(visible);
    const realignPending = visible && !prevVisibleRef.current;
    prevVisibleRef.current = visible;
    // 通知观察：新条目（比已见的更新）→ 气泡 + 反应动画；不可见或刚恢复
    // 可见（realign）的那一帧只记账不弹——切回来不弹旧账。
    const newestNotify = stepNotificationTracker(notifyTrackerRef.current, channel.notifications ?? [], { silent: !visible || realignPending });
    if (newestNotify !== undefined && visible) {
        const reaction = notificationReactionKind(newestNotify.color);
        overrideRef.current = {
            semantic: DEEPY_NOTIFICATION_REACTION[reaction] ?? 'idle-look',
            since: now,
            until: now + NOTIFICATION_BUBBLE_MS,
        };
        bubbleRef.current = { text: newestNotify.text, color: newestNotify.color, kind: 'notify', until: now + NOTIFICATION_BUBBLE_MS };
    }
    if (!visible) {
        // 面板非 active：清空覆盖层与气泡（切回来不弹旧账）；语义在 realign 对齐。
        overrideRef.current = undefined;
        bubbleRef.current = undefined;
        clicksRef.current = [];
        dragSessionRef.current = undefined;
        dragPosRef.current = undefined;
        flybackRef.current = undefined;
    }
    // --- 派生（纯）→ 目标语义 → 平滑层 --------------------------------------
    const derived = deriveCompanionMood({
        working: channel.working,
        spinnerMode: channel.spinnerMode,
        activity,
        attention: {
            approvalPending: (attentionCtx?.approvals ?? 0) > 0,
            questionPending: (attentionCtx?.questions ?? 0) > 0,
        },
        failures: { failedJobsUnread: jobsFailedUnread, failedSubagents },
        lastInputAt: lastInputAtRef.current,
        celebration: celebrateUntil > now ? { kind: 'turn-done', until: celebrateUntil } : undefined,
        sleepAfterMs: SLEEP_AFTER_MS,
    }, now);
    const context = deriveCompanionContext({
        working: channel.working,
        subagents,
        backgroundJobs,
        compaction: channel.compaction,
    });
    const targetSemantic = resolveTargetSemantic(derived.mood, context);
    // carrying（顶箱子）：gitBranch 变更是「新建/切换分支-工作树」在 channel
    // 上唯一的可见信号，变更时闪现一次。
    const gitBranch = channel.gitBranch;
    if (gitBranch !== undefined) {
        if (carryRef.current.branch === undefined || carryRef.current.branch !== gitBranch) {
            const changed = carryRef.current.branch !== undefined && carryRef.current.until <= now;
            carryRef.current = { branch: gitBranch, until: changed ? now + CARRYING_FLASH_MS : carryRef.current.until };
            if (changed && visible) {
                overrideRef.current = { semantic: 'carrying', since: now, until: now + CARRYING_FLASH_MS };
            }
        }
    }
    const displayRef = React.useRef(initialCompanionDisplayState);
    displayRef.current = stepCompanionDisplay(displayRef.current, targetSemantic, now, { realign: realignPending });
    const display = displayRef.current;
    // 醒来闪现：显示语义刚离开 sleeping → waking（官方 trigger：睡眠中被扰）。
    const prevSemanticRef = React.useRef(initialCompanionDisplayState.semantic);
    if (prevSemanticRef.current === 'sleeping' && display.semantic !== 'sleeping'
        && (overrideRef.current === undefined || overrideRef.current.until <= now)) {
        overrideRef.current = { semantic: 'waking', since: now, until: now + WAKING_FLASH_MS };
    }
    prevSemanticRef.current = display.semantic;
    const activeOverride = overrideRef.current !== undefined && overrideRef.current.until > now ? overrideRef.current : undefined;
    // --- 最终动画键（互动覆盖 > 悬停 > idle 轮换 > 平滑语义）-----------------
    const hover = hoverState !== undefined && visible ? hoverState : undefined;
    // 悬停驻留平滑（mood.stepCompanionHover）：zone 直读是期望值，指针驻留
    // 满窗才真正换脸（快速划过不触发）；tick 档位判定仍用原始 zone。
    const hoverDisplay = hoverDisplayRef.current;
    React.useEffect(() => {
        hoverDisplayRef.current = stepCompanionHover(hoverDisplayRef.current, hoverSemantic(hover?.zone), now);
    }, [hover?.zone, now]);
    let animationSemantic;
    let animSince;
    if (activeOverride !== undefined) {
        animationSemantic = activeOverride.semantic;
        animSince = activeOverride.since;
    }
    else if (display.semantic === 'idle') {
        const hoverSem = hoverDisplay.semantic;
        if (hoverSem !== undefined) {
            animationSemantic = hoverSem;
            animSince = hoverDisplay.since;
        }
        else {
            const index = idleRotationIndex(display.since, now, DEEPY_IDLE_ROTATION.length);
            animationSemantic = DEEPY_IDLE_ROTATION[index] ?? 'idle';
            animSince = display.since + Math.max(0, Math.floor((now - display.since) / IDLE_ROTATE_MS)) * IDLE_ROTATE_MS;
        }
    }
    else {
        animationSemantic = display.semantic;
        animSince = display.since;
    }
    const animationKey = deepyAnimationFor(animationSemantic);
    // Pause the shared clock while this panel is hidden; the local tick drives visible frames.
    const [clockRef] = useAnimationFrame(!visible ? null : display.semantic === 'sleeping' ? 1000 : 120);
    const tickMs = !visible
        ? 0
        : display.semantic === 'sleeping' && activeOverride === undefined && hover === undefined
            ? TICK_MS_SLEEPING
            : TICK_MS;
    React.useEffect(() => {
        if (tickMs <= 0)
            return undefined;
        const id = setInterval(() => setBump(n => n + 1), tickMs);
        return () => { clearInterval(id); };
    }, [tickMs]);
    // --- 皮肤与帧 -------------------------------------------------------------
    const skinId = React.useSyncExternalStore(subscribeCompanionSkin, getCompanionSkin);
    const skin = resolveCompanionSkin(skinId);
    const useDeepy = skinId === DeepySkin.id;
    const kit = useDeepy ? loadDeepyKit() : undefined;
    const rendered = kit !== undefined ? renderedDeepyAnimation(kit, animationKey) : undefined;
    const animation = kit?.byKey[animationKey];
    const petColumns = skin.cells.columns;
    const compact = width < petColumns + 2;
    const deepyRows = useDeepy && rendered !== undefined && animation !== undefined
        ? (rendered[frameAt(animation, Math.max(0, now - animSince))] ?? [])
        : undefined;
    // --- 宠物位移（面板层）：home 几何 + 拖动/弹回放置 ------------------------
    // home = 面板内容盒的底部居中（与原沉底布局同一几何：居中列 + 底行）。
    const petRows = skin.cells.rows;
    const homeLeft = Math.max(0, Math.floor((width - petColumns) / 2));
    const homeTop = Math.max(0, height - petRows);
    const maxLeft = Math.max(0, width - petColumns);
    const maxTop = Math.max(0, height - petRows);
    const clampPet = (left, top) => ({
        left: Math.min(Math.max(0, left), maxLeft),
        top: Math.min(Math.max(0, top), maxTop),
    });
    // 放置优先级：拖动跟手 > 弹回插值 > home。弹回按墙钟确定性推进（渲染
    // 期读 now，本地 tick 驱动重渲染；p>=1 即归位并清档）。petTop 以「距
    // 面板顶的行数」表达，渲染时换算成 home 槽行内的负 marginTop（升起行数）。
    let petLeft = homeLeft;
    let petTop = homeTop;
    if (flybackRef.current !== undefined) {
        const progress = Math.min(1, (now - flybackRef.current.since) / PET_REBOUND_MS);
        const ease = (1 - progress) * (1 - progress);
        petLeft = Math.round(homeLeft + (flybackRef.current.fromLeft - homeLeft) * ease);
        petTop = Math.round(homeTop + (flybackRef.current.fromTop - homeTop) * ease);
        if (progress >= 1)
            flybackRef.current = undefined;
    }
    if (dragPosRef.current !== undefined) {
        petLeft = dragPosRef.current.left;
        petTop = dragPosRef.current.top;
    }
    const petRise = maxTop - petTop;
    // --- 残影防线：位移改位时作废上一帧的 blit 基线 --------------------------
    // 宠物溢出行画压到流内兄弟（状态区/空隙/气泡）上时，差分渲染的两个前
    // 提被打破：clean 节点的 blit 快路径会把 prevScreen 里宠物更早位置的像
    // 素抄回模型（自污染），而移走方的 clear 只记 damage 不写内容——差分看
    // 到 prev==next 就永不发修复，终端留下残影（用户实测：拖到面板中上部
    // 留残影）。renderer 为这类「高覆盖物移动」提供的官方逃生口是
    // App.invalidatePrevFrame()：标记上一帧不可信，下一帧做全损伤差分、
    // 逐格对照真实树重导出——被让出的格子作为变化正常发空格擦除。宠物在
    // 悬空状态下每改一次位（拖动/回弹的一帧）就作废一次；归位的那一帧
    //（rise>0→0 的最后让出）也作废。静止时零开销。
    const ink = instances.get(process.stdout) ?? instances.values().next().value;
    const petDisplaced = petRise > 0;
    const petWasDisplacedRef = React.useRef(false);
    React.useEffect(() => {
        // effect 落在 commit 之后、下一帧之前——正好是两帧之间的窗口（渲染期
        // 调用会被当帧 onRender 复位，等于没调）。悬空期间每次改位、以及归位
        // 的那一次，都作废上一帧的 blit 基线。
        if (petDisplaced || petWasDisplacedRef.current)
            ink?.invalidatePrevFrame();
        petWasDisplacedRef.current = petDisplaced;
    }, [petLeft, petRise, petDisplaced, ink]);
    const poseRef = React.useRef(initialCompanionPoseState(now));
    const poseStep = nextCompanionPoseStep(poseRef.current, { mood: SEMANTIC_MOOD[display.semantic], heart: heartPendingRef.current }, now);
    poseRef.current = poseStep.state;
    heartPendingRef.current = false;
    // --- 键盘：Enter 戳一戳（保留）；'s' → Send to Chat（保留）---------------
    const moodLabel = t(MOOD_LABEL_KEY[SEMANTIC_MOOD[display.semantic]]);
    const runningSubagents = countRunningSubagents(subagents);
    const runningJobs = countRunningJobs(backgroundJobs);
    const sessionsRunning = countSessionsRunning(channel.working, runningSubagents, runningJobs);
    const statsText = (() => {
        if (runningSubagents > 0 || runningJobs > 0) {
            const parts = [];
            if (runningSubagents > 0)
                parts.push(t('companion-stat-subagents', { n: runningSubagents }));
            if (sessionsRunning > 1)
                parts.push(t('companion-stat-sessions', { n: sessionsRunning }));
            return parts.join(' · ');
        }
        if (activity !== undefined && channel.working && activity.phaseStartedAt > 0) {
            const elapsed = formatElapsed(now - activity.phaseStartedAt);
            return activity.toolCount > 0
                ? t('companion-stats-working', { duration: elapsed, count: activity.toolCount })
                : elapsed;
        }
        return moodLabel;
    })();
    usePanelInput((input, key) => {
        if (key.return_ === true || input === '\r') {
            const at = Date.now();
            overrideRef.current = { semantic: ENTER_POKE_SIDE, since: at, until: at + POKE_REACTION_MS };
            if (activity?.line !== undefined && activity.line !== '') {
                bubbleRef.current = { text: activity.line, kind: 'poke', until: at + POKE_MS };
            }
            heartPendingRef.current = true;
            lastInputAtRef.current = at;
            bump();
            return true;
        }
        if (input === 's') {
            if (typeof channel.attachContext !== 'function')
                return false;
            const content = [
                '宠物心情：' + moodLabel,
                activity?.line !== undefined && activity.line !== '' ? '当前活动：' + activity.line : undefined,
                '统计：' + statsText,
            ].filter((line) => line !== undefined).join('\n');
            channel.attachContext({ source: 'panel', sourceId: 'companion', title: t('companion-send-title'), content });
            channel.notify(t('panel-sent-to-chat', { title: t('companion-send-title') }), { color: 'success' });
            lastInputAtRef.current = Date.now();
            return true;
        }
        return false;
    }, { active: focused && visible });
    // --- 鼠标互动 -------------------------------------------------------------
    const registerClick = (side) => {
        const at = Date.now();
        lastInputAtRef.current = at;
        heartPendingRef.current = true;
        clicksRef.current = [...clicksRef.current.filter(ts => ts > at - TICKLE_WINDOW_MS), at];
        overrideRef.current = clicksRef.current.length >= TICKLE_MIN_CLICKS
            ? { semantic: 'tickle', since: at, until: at + TICKLE_WINDOW_MS }
            : { semantic: side, since: at, until: at + POKE_REACTION_MS };
        bump();
    };
    const onPetClick = (event) => {
        event.stopImmediatePropagation();
        registerClick(event.localCol < petColumns / 2 ? 'poke-left' : 'poke-right');
    };
    const onDragStart = (event) => {
        event.stopImmediatePropagation();
        const at = Date.now();
        lastInputAtRef.current = at;
        // 锚在当前显示位置（在家，或上一段弹回的中途被再次抓住）。
        flybackRef.current = undefined;
        const base = dragPosRef.current ?? { left: homeLeft, top: homeTop };
        dragSessionRef.current = {
            baseLeft: base.left,
            baseTop: base.top,
            startCol: event.startCol,
            startRow: event.startRow,
        };
        dragPosRef.current = { left: base.left, top: base.top };
        overrideRef.current = { semantic: 'drag', since: at, until: Number.POSITIVE_INFINITY };
        bump();
    };
    const onDragMove = (event) => {
        event.stopImmediatePropagation();
        lastInputAtRef.current = Date.now();
        const session = dragSessionRef.current;
        if (session === undefined)
            return;
        // 位移 = 指针相对拖起点的位移（绝对坐标差，不依赖渲染帧的缓存矩形），
        // clamp 在面板内容盒内——抓取点保持在指针下，本体不出面板。
        dragPosRef.current = clampPet(session.baseLeft + (event.col - session.startCol), session.baseTop + (event.row - session.startRow));
        bump();
    };
    const onDragEnd = (event) => {
        event.stopImmediatePropagation();
        const at = Date.now();
        lastInputAtRef.current = at;
        dragSessionRef.current = undefined;
        const resting = dragPosRef.current;
        dragPosRef.current = undefined;
        // 有实际位移才弹回（≤1 格的抖动直接归位，克制优先）。
        if (resting !== undefined && (Math.abs(resting.left - homeLeft) > 1 || Math.abs(resting.top - homeTop) > 1)) {
            flybackRef.current = { fromLeft: resting.left, fromTop: resting.top, since: at };
        }
        if (overrideRef.current?.semantic === 'drag')
            overrideRef.current = undefined;
        bump();
    };
    const enterZone = (zone) => {
        const at = Date.now();
        if (zone === 'pet')
            lastInputAtRef.current = at;
        setHoverState(prev => {
            if (prev?.zone === zone)
                return prev;
            // 同档（look）内换侧不重置动画；换档（look↔notice）重开一段。
            const prevSem = hoverSemantic(prev?.zone);
            const nextSem = hoverSemantic(zone);
            return { zone, since: prevSem === nextSem && prev !== undefined ? prev.since : at };
        });
        bump();
    };
    const enterPanelDefault = () => {
        // 只有当前没有更具体的分区时才落 'near'（链上子节点的 enter 先于根）。
        setHoverState(prev => prev ?? { zone: 'near', since: Date.now() });
        bump();
    };
    const leavePanel = () => {
        setHoverState(undefined);
        bump();
    };
    // --- 状态区文案 -----------------------------------------------------------
    const phrase = derived.bubble?.replace(/^\s*[⏵▸]+\s*/u, '');
    const animTitle = (deepyRows !== undefined ? kit?.byKey[animationKey]?.title : undefined) ?? skin.title ?? 'Deepy';
    // --- 气泡（宠物上方；空间不足时让位给宠物本体）---------------------------
    // 裁决：瞬态气泡（通知/Enter 戳，带 until 窗）> 活动自述（派生常驻层）。
    // 活动自述读 runtimeCtx.activity.line——与聊天区 ⏵ 工作行（ActivityLine）
    // 逐字同源；判定条件照 Chat.tsx 的渲染门：working 且 line 非空且
    // phase≠idle。回合结束/面板隐藏时派生层自动消失；瞬态到期后回落。
    // 拖动会话（按住跟手 + 360ms 回弹全程）抑制两层气泡：宠物被拎在半空，
    // 气泡孤零零留在 home 上方既出戏又会被宠物本体遮住（用户实测反馈）；
    // 落定后自然恢复（用户实测诉求：要么跟着走要么不显示——选抑制，简单
    // 可靠）。
    const dragHold = dragSessionRef.current !== undefined || flybackRef.current !== undefined;
    const transientBubble = bubbleRef.current !== undefined && bubbleRef.current.until > now && visible && !dragHold ? bubbleRef.current : undefined;
    const activityNarration = visible && channel.working && activity !== undefined
        && activity.line !== '' && activity.phase !== 'idle' && !dragHold ? activity.line : undefined;
    const bubble = transientBubble !== undefined
        ? transientBubble
        : activityNarration !== undefined
            ? { text: activityNarration, kind: 'poke', until: Number.POSITIVE_INFINITY }
            : undefined;
    const statusRows = 1 /*paddingTop*/ + 3 + (phrase !== undefined && phrase !== '' ? 1 : 0);
    const bubbleRoom = Math.max(0, height - statusRows - skin.cells.rows);
    const bubbleLines = bubbleRoom >= BUBBLE_MAX_LINES + 2
        ? BUBBLE_MAX_LINES
        : bubbleRoom >= 3 ? bubbleRoom - 2 : 0;
    let bubbleNode = null;
    if (bubble !== undefined && bubbleLines > 0 && !compact) {
        const inner = Math.max(4, width - 4);
        const wrapped = wrapTextLines(bubble.text, inner).map(line => line.text);
        const shown = wrapped.length > bubbleLines
            ? [...wrapped.slice(0, bubbleLines - 1), truncateWidth(wrapped[bubbleLines - 1] + '…', inner)]
            : wrapped;
        bubbleNode = (_jsx(Box, { flexDirection: "column", flexShrink: 0, alignSelf: "center", borderStyle: "round", paddingX: 1, borderColor: bubble.kind === 'poke' ? 'accent' : BUBBLE_COLOR[bubble.color ?? ''] ?? 'accent', children: shown.map((line, index) => (_jsx(Text, { wrap: "truncate-end", color: BUBBLE_COLOR[bubble.color ?? ''], children: line }, index))) }));
    }
    // Below the panel minimum, keep only the centered cramped-layout message.
    if (width < PANEL_MIN_COLUMNS) {
        return (_jsx(Box, { ref: clockRef, flexDirection: "column", flexGrow: 1, overflow: "hidden", alignItems: "center", justifyContent: "center", paddingX: 1, children: _jsxs(Text, { wrap: "truncate-end", children: [_jsx(Text, { color: "accent", children: '♥ ' }), _jsx(Text, { dimColor: true, children: t('companion-cramped', { name: skin.title ?? 'Deepy' }) })] }) }));
    }
    if (compact) {
        // Compact panels show mood and status without the skin.
        return (_jsx(Box, { ref: clockRef, flexDirection: "column", flexGrow: 1, overflow: "hidden", children: _jsxs(Box, { flexDirection: "column", paddingX: 1, paddingTop: 1, children: [_jsx(Box, { height: 1, flexShrink: 0, children: _jsxs(Text, { wrap: "truncate-end", children: [_jsx(Text, { color: "accent", children: '♥ ' }), _jsx(Text, { dimColor: true, children: moodLabel }), channel.working && _jsxs(Text, { dimColor: true, children: [' · ', statsText] })] }) }), phrase !== undefined && phrase !== '' && (_jsx(Box, { height: 1, flexShrink: 0, children: _jsxs(Text, { dimColor: true, wrap: "truncate-end", children: ['⏵ ', phrase] }) })), _jsx(Box, { height: 1, flexShrink: 0, children: _jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('companion-hint') }) })] }) }));
    }
    return (_jsxs(Box, { ref: clockRef, flexDirection: "column", flexGrow: 1, overflow: "hidden", onMouseEnter: enterPanelDefault, onMouseLeave: leavePanel, children: [_jsxs(Box, { flexDirection: "column", flexShrink: 0, paddingX: 1, paddingTop: 1, onMouseEnter: () => enterZone('near'), children: [_jsx(Box, { height: 1, flexShrink: 0, children: _jsxs(Text, { wrap: "truncate-end", children: [_jsx(Text, { color: MOOD_COLOR[SEMANTIC_MOOD[display.semantic]], children: '● ' }), _jsx(Text, { children: moodLabel }), statsText !== moodLabel && _jsxs(Text, { dimColor: true, children: [' · ', statsText] })] }) }), phrase !== undefined && phrase !== '' && (_jsx(Box, { height: 1, flexShrink: 0, children: _jsxs(Text, { dimColor: true, wrap: "truncate-end", children: ['⏵ ', phrase] }) })), _jsx(Box, { height: 1, flexShrink: 0, children: _jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('companion-now-playing', { anim: animTitle }) }) }), _jsx(Box, { height: 1, flexShrink: 0, children: _jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('companion-hint') }) })] }), _jsx(Box, { flexGrow: 1, flexShrink: 1, minHeight: 0, onMouseEnter: () => enterZone('near') }), bubbleNode, _jsxs(Box, { flexDirection: "row", flexShrink: 0, height: petRows, children: [_jsx(Box, { width: petLeft, flexShrink: 0, onMouseEnter: () => enterZone('left') }), _jsx(Box, { width: petColumns, height: petRows, marginTop: -petRise, flexShrink: 0, flexDirection: "column", alignItems: "center", onClick: onPetClick, onDragStart: onDragStart, onDragMove: onDragMove, onDragEnd: onDragEnd, onMouseEnter: () => enterZone('pet'), children: deepyRows !== undefined
                            ? deepyRows.map((row, index) => _jsx(Text, { wrap: "truncate-end", children: row }, index))
                            : skin.render({ pose: poseStep.pose, moodSince: animSince, now, width: petColumns, animationSemantic: animationKey }) }), _jsx(Box, { width: Math.max(0, width - petColumns - petLeft), flexShrink: 0, onMouseEnter: () => enterZone('right') })] })] }));
}
export const COMPANION_SKIN_DEFAULT = DeepySkin.id;
