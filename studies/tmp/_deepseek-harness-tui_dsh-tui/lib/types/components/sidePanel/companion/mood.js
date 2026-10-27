// ---------------------------------------------------------------------------
// 量级常量（回归直接引用，勿在测试/组件里硬编码另一份）
// ---------------------------------------------------------------------------
/** 离开活跃族的防抖窗：目标稳定非工作这么久才切走（规则 3）。 */
export const LEAVE_WORKING_SETTLE_MS = 1500;
/** 任何非抢占切换后的最短停留（规则 4）。 */
export const MIN_MOOD_DWELL_MS = 1000;
/** 回合完成庆祝（happy）的停留窗；由 Panel 在 working→false 边沿armed。 */
export const CELEBRATE_DWELL_MS = 2500;
/** idle 族动画的轮换周期（规则 5）。 */
export const IDLE_ROTATE_MS = 8000;
/** 狂点判定窗口：窗口内 ≥TICKLE_MIN_CLICKS 次点击 → tickle。 */
export const TICKLE_WINDOW_MS = 900;
export const TICKLE_MIN_CLICKS = 3;
/** 通知气泡的展示时长（约数，按动画 tick 粒度收回）。 */
export const NOTIFICATION_BUBBLE_MS = 5000;
/** 醒来（waking）反应的闪现时长。 */
export const WAKING_FLASH_MS = 1800;
/** 顶箱子（carrying，gitBranch 变更闪现）时长。 */
export const CARRYING_FLASH_MS = 2500;
/** Enter 戳一戳时完整活动行气泡的时长。 */
export const POKE_MS = 3000;
/** 工作态细分：activity 投影优先，缺省时 spinnerMode 兜底。 */
function workingMood(inputs) {
    const activity = inputs.activity;
    if (activity !== undefined && activity.phase !== 'idle' && activity.phase !== 'done') {
        if (activity.phase === 'waiting')
            return 'waiting';
        if (activity.phase === 'thinking')
            return 'thinking';
        return 'working';
    }
    switch (inputs.spinnerMode) {
        case 'requesting':
            return 'waiting';
        case 'thinking':
            return 'thinking';
        case 'responding':
            return 'responding';
        case 'tool-use':
        case 'tool-input':
            return 'working';
    }
}
/** 纯派生（规则 1 的第一层）：attention > error > working > celebrate >
 *  sleeping > idle。 */
export function deriveCompanionMood(inputs, now) {
    let mood;
    if (inputs.attention.approvalPending || inputs.attention.questionPending)
        mood = 'attention';
    else if (inputs.failures.failedJobsUnread > 0 || inputs.failures.failedSubagents > 0)
        mood = 'error';
    else if (inputs.working)
        mood = workingMood(inputs);
    else if (inputs.celebration !== undefined && now < inputs.celebration.until)
        mood = 'celebrate';
    else if (inputs.sleepAfterMs > 0 && now - inputs.lastInputAt >= inputs.sleepAfterMs)
        mood = 'sleeping';
    else
        mood = 'idle';
    const bubble = mood === 'sleeping' || mood === 'idle' ? undefined : bubbleOf(inputs);
    return { mood, bubble };
}
function bubbleOf(inputs) {
    const activity = inputs.activity;
    if (activity === undefined)
        return undefined;
    if (activity.phrase !== undefined && activity.phrase !== '')
        return activity.phrase;
    const label = activity.label ?? '';
    const detail = activity.detail ?? '';
    const combined = (label + (label !== '' && detail !== '' ? ' ' : '') + detail).trim();
    return combined === '' ? undefined : combined;
}
/** 子代理在跑数（starting/running）。 */
export function countRunningSubagents(subagents) {
    return subagents.filter(s => s.status === 'starting' || s.status === 'running').length;
}
/** 后台任务在跑数（running/stopping 都算活着）。 */
export function countRunningJobs(jobs) {
    return jobs.filter(j => j.status === 'running' || j.status === 'stopping').length;
}
/** 「会话」口径：主回合（working 计 1）+ 在跑子代理 + 在跑后台任务。 */
export function countSessionsRunning(working, runningSubagents, runningJobs) {
    return (working ? 1 : 0) + runningSubagents + runningJobs;
}
/** 素材包官方表：conducting=2+ 子代理；building=3+ 会话；music=1 子代理或
 *  2 会话；compacting=上下文压缩进行中（ChannelUi.compaction 是现成信号）。
 *  优先级：compacting > conducting > building > music（子代理专属动画最具体）。
 *  carrying（新建工作树/分支）没有推送信号，走 gitBranch 变更闪现（Panel 接线）。 */
export function deriveCompanionContext(inputs) {
    if (inputs.compaction !== undefined && inputs.compaction !== null)
        return 'compacting';
    const runningSubagents = countRunningSubagents(inputs.subagents);
    const sessions = countSessionsRunning(inputs.working, runningSubagents, countRunningJobs(inputs.backgroundJobs));
    if (runningSubagents >= 2)
        return 'conducting';
    if (sessions >= 3)
        return 'building';
    if (runningSubagents >= 1 || sessions >= 2)
        return 'music';
    return undefined;
}
export const initialCompanionDisplayState = {
    semantic: 'idle',
    since: 0,
    activeLeftAt: 0,
};
/** 活跃族 = working 细分 + 并行上下文（离开它们进 idle 族要防抖）。 */
const ACTIVE_SEMANTICS = new Set([
    'thinking', 'typing', 'music', 'conducting', 'building', 'compacting',
]);
/** working 细分（进入它不防抖——有信息量）。 */
const WORKING_SEMANTICS = new Set(['thinking', 'typing']);
/** idle 族（settle 闸只对它们生效）。 */
const IDLE_FAMILY = new Set(['idle', 'sleeping']);
/** 允许立刻打断的语义（规则 2）。 */
const IMMEDIATE_SEMANTICS = new Set(['notification', 'error', 'happy']);
/** 目标心情 + 上下文 → 目标显示语义（纯函数）。attention/error/happy 直通；
 *  working 细分与 idle/sleeping 在有并行上下文时让位（music=官方表的
 *  juggling：主回合 + 子代理同时在跑时宠物该演"分身"而不是敲代码）。 */
export function resolveTargetSemantic(mood, context) {
    if (mood === 'attention')
        return 'notification';
    if (mood === 'error')
        return 'error';
    if (mood === 'celebrate')
        return 'happy';
    if (mood === 'waiting' || mood === 'thinking')
        return context ?? 'thinking';
    if (mood === 'working' || mood === 'responding')
        return context ?? 'typing';
    return context ?? (mood === 'sleeping' ? 'sleeping' : 'idle');
}
/** 平滑器（规则 2/3/4，近纯步进）：输入目标语义流 + 时钟，输出显示语义流。
 *
 * - 目标 == 当前显示：什么都不动（since 保留 → 动画 elapsed 连续）。
 * - 抢占（notification/error/happy）或进入 working 族：立刻切。
 * - 其余切换：settle（离开活跃族进 idle 族需 LEAVE_WORKING_SETTLE_MS 稳定）
 *   与 dwell（显示语义已停留 MIN_MOOD_DWELL_MS）双闸全开才切。
 * - realign：visible=false→true 时跳过闸门对齐当前目标（隐藏期间没走 tick）。
 */
export function stepCompanionDisplay(prev, target, now, opts) {
    const targetActive = ACTIVE_SEMANTICS.has(target);
    const activeLeftAt = targetActive ? 0 : prev.activeLeftAt === 0 ? now : prev.activeLeftAt;
    if (opts?.realign === true)
        return { semantic: target, since: now, activeLeftAt };
    if (target === prev.semantic) {
        return { semantic: prev.semantic, since: prev.since, activeLeftAt };
    }
    const immediate = IMMEDIATE_SEMANTICS.has(target) ||
        (WORKING_SEMANTICS.has(target) && !WORKING_SEMANTICS.has(prev.semantic));
    if (immediate)
        return { semantic: target, since: now, activeLeftAt };
    const settleOk = !IDLE_FAMILY.has(target) || now - activeLeftAt >= LEAVE_WORKING_SETTLE_MS;
    const dwellOk = now - prev.since >= MIN_MOOD_DWELL_MS;
    if (settleOk && dwellOk)
        return { semantic: target, since: now, activeLeftAt };
    return { semantic: prev.semantic, since: prev.since, activeLeftAt };
}
// ---------------------------------------------------------------------------
// 悬停驻留（hover dwell）：指针停够一会儿才换成悬停动画
// ---------------------------------------------------------------------------
/** 指针驻留多久才切到悬停动画（enter dwell）：400ms 内移开的划过不触发
 *  切换。约为 poke 动画（~70ms/帧）半轮的时长。 */
export const HOVER_ENTER_DWELL_MS = 400;
/** 指针移开多久才切回非悬停档（leave settle）：短暂滑出面板（跨分区、
 *  贴边抖动）不打断动画。比 LEAVE_WORKING_SETTLE_MS（1500）短，悬停只是
 *  装饰，可以恢复得快一些。 */
export const HOVER_LEAVE_SETTLE_MS = 800;
export const initialCompanionHoverState = {
    semantic: undefined,
    since: 0,
    desired: undefined,
    desiredSince: 0,
};
/** 悬停驻留平滑器（近纯步进，与 stepCompanionDisplay 同模式）：输入期望
 *  语义流（指针 zone 直读）+ 时钟，输出展示中的悬停语义流。
 *
 * - 期望 == 展示：什么都不动（since 保留 → 动画 elapsed 连续）。
 * - 移入/换档（look↔notice）：驻留满 HOVER_ENTER_DWELL_MS 才切；快速划过
 *  （enter 后未满窗就移开）全程不触发。
 * - 移开：迟滞满 HOVER_LEAVE_SETTLE_MS 才切回；窗口内折返 = 期望回到当前
 *  展示值 → 动画无缝续播（since 不重置）。
 * - 互动覆盖层（poke/tickle/爱心）不经过本函数：点击反馈即时性不受影响。
 */
export function stepCompanionHover(prev, desired, now) {
    const desiredSince = desired === prev.desired ? prev.desiredSince : now;
    if (desired === prev.semantic) {
        return { semantic: prev.semantic, since: prev.since, desired, desiredSince };
    }
    if (desired === undefined) {
        // 移开：迟滞窗外保持展示（指针折返不打断）；满窗切回非悬停档。
        if (now - desiredSince >= HOVER_LEAVE_SETTLE_MS) {
            return { semantic: undefined, since: prev.since, desired, desiredSince };
        }
        return { ...prev, desired, desiredSince };
    }
    // 移入/换档：驻留满窗才真正切到悬停动画（快速划过不触发）。
    if (now - desiredSince >= HOVER_ENTER_DWELL_MS) {
        return { semantic: desired, since: now, desired, desiredSince };
    }
    return { ...prev, desired, desiredSince };
}
// ---------------------------------------------------------------------------
// idle 族轮换（规则 5：按时间，不跟信号边沿）
// ---------------------------------------------------------------------------
/** idle 显示语义下的动画轮换槽序号：由进入 idle 的时刻与当前时钟决定，
 *  与信号无关；同一 idle 期内确定，跨 idle 期自然错开。 */
export function idleRotationIndex(idleSince, now, length) {
    if (length <= 1 || idleSince <= 0)
        return 0;
    const slot = Math.max(0, Math.floor((now - idleSince) / IDLE_ROTATE_MS));
    const offset = Math.abs(Math.floor(idleSince / 997)) % length;
    return (slot + offset) % length;
}
/** NotificationItem.color → 反应档（error/warning/success/default）。
 *  没有更多语义字段可判（如"已打断"），default 档用 idle-look——见交付说明。 */
export function notificationReactionKind(color) {
    if (color === 'error' || color === 'warning' || color === 'success')
        return color;
    return 'default';
}
export function createNotificationTracker() {
    return { seen: new Set(), armed: false };
}
/** 渲染期步进：从尾部扫描未见过的条目（notify 追加在最后），返回最新一条
 *  （旧的让位——气泡同时只留最新）；首次调用只记账不发射（不弹历史旧账）。
 *  重建数组（slice/filter）但条目对象同引用时不会误报；条目被摘除时顺手
 *  清理 seen，防泄漏。 */
export function stepNotificationTracker(tracker, notifications, opts) {
    let newest;
    let scanned = 0;
    for (let index = notifications.length - 1; index >= 0 && scanned < 16; index -= 1) {
        const item = notifications[index];
        if (item === undefined)
            break;
        scanned += 1;
        if (tracker.seen.has(item))
            break;
        tracker.seen.add(item);
        newest = newest ?? item;
    }
    if (tracker.seen.size > notifications.length + 8) {
        const live = new Set(notifications);
        for (const item of tracker.seen) {
            if (!live.has(item))
                tracker.seen.delete(item);
        }
    }
    if (!tracker.armed || opts?.silent === true) {
        tracker.armed = true;
        return undefined;
    }
    return newest;
}
