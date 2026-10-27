import { stringWidth } from '../ink/stringWidth.js';
/** Continue 标题的截断上限（显示宽度，含截断省略号）。 */
export const LAUNCHPAD_CONTINUE_TITLE_MAX = 16;
/**
 * 截断会话标题：按显示宽度（CJK 双宽）从头部取，超宽补 `…`。
 * 纯函数、无副作用，表驱动回归直接钉它的边界。
 */
export function truncateContinueTitle(title, max = LAUNCHPAD_CONTINUE_TITLE_MAX) {
    const clean = title.replace(/[\r\n]+/gu, ' ').trim();
    if (stringWidth(clean) <= max)
        return clean;
    let width = 0;
    let out = '';
    for (const ch of Array.from(clean)) {
        const w = stringWidth(ch);
        if (width + w > max - 1)
            break;
        out += ch;
        width += w;
    }
    return out + '…';
}
/** Continue（不带标题时的短标签）。 */
const CONTINUE = {
    id: 'continue',
    labelKey: 'launchpad-action-continue',
    command: 'continue',
};
/**
 * 会话与工作区（第七版合并入口）：历史会话与工作区本来就是同一个界面
 * （`/home` 的会话名册 = 工作区首页，见 Chat 的 resume/home/agentview 合一
 * 注释），两个按钮进同一个页面——用户实测后要求合并只留一个。命令用
 * 既有的 `home` 那条。
 */
const SESSIONS_WORKSPACE = {
    id: 'sessions-workspace',
    labelKey: 'launchpad-action-sessions-workspace',
    command: 'home',
};
/** Settings（用户拍板的第三格）。 */
const SETTINGS = {
    id: 'settings',
    labelKey: 'launchpad-action-settings',
    command: 'settings',
};
/**
 * 内核（第四格，固定入口）：打开内核选择器。当前内核已知时带名
 * （「内核 · Claude」），未知（接线前）用短标签——kernelCatalog 的
 * displayName 是品牌名的唯一来源。
 */
const BACKEND = {
    id: 'backend',
    labelKey: 'launchpad-action-backend',
    // 命令名 = /kernel（LOCAL_COMMANDS 的登记名，requirement 'any'）：入口、
    // 手敲命令与 Chat 的 case 'kernel' 三条路同一个名字，不给第二个别名。
    command: 'kernel',
};
/** 条件位①：有后台任务在跑。 */
const JOBS = {
    id: 'jobs',
    labelKey: 'launchpad-action-jobs',
    command: 'jobs',
};
/** 条件位②：检测到可用更新。 */
const UPDATE = {
    id: 'update',
    labelKey: 'launchpad-action-update',
    command: 'update',
};
/** 条件位③：用量到档且从未 star。 */
const STAR = {
    id: 'star',
    labelKey: 'launchpad-action-star',
    command: 'star',
};
/** Help（? 快捷键与命令）——条件位的兜底。 */
const HELP = {
    id: 'help',
    labelKey: 'launchpad-action-help',
    command: 'help',
};
/**
 * 落地页第七版的核心纯函数：按状态快照决定入口行放什么。
 *
 * 版面（用户拍板的四格 + 内核入口；第一格条件性缺席，最多五格）：
 *
 *   1. `继续「<标题>」` —— 有可继续会话才画（无历史不放假动作）；
 *      快捷键 Alt+R（keymap 的 `continue` 动作，见 utils/keymap.ts）。
 *   2. `会话与工作区` —— 历史会话 + 工作区合并入口；命令用既有 `home`。
 *   3. `设置` —— /settings。
 *   4. `内核` —— 打开内核选择器（backendId 已知时「内核 · Claude」；选择
 *      器本体在 Chat 侧渲染）。窄屏装不下时它排在条件位**之后**被裁——
 *      fitChips 整条取舍，条件位先让位。
 *   5. 条件位，**按优先级取第一个成立者**（同时成立时高优先级胜出，
 *      回归按这张优先级表驱动）：
 *        ① jobsRunning → `后台任务`（/jobs）
 *        ② updateAvailable → `有新版本`（/update，走既有更新路径）
 *        ③ starDue → `投喂一颗 Star`（/star）
 *        ④ 都不成立 → `帮助`（/help）兜底。
 *
 * 第六版的 doctor 入口已删（第七版）：它的输出属于转录区，天然把人带进
 * 对话页，不适合留在"Esc 必须回启动页"的这一屏；首启/配置问题专属按钮
 * 也随之退役——首启由引导向导（盖在落地页之上）承担，provider 配置经
 * 向导或 /settings 可达。输出恒 ≤5 条。
 *
 * 纯函数：不改入参、不读环境、同样输入恒同样输出——表驱动回归钉死每个状态。
 */
export function resolveLaunchpadActions(state) {
    const conditional = state.jobsRunning
        ? JOBS
        : state.updateAvailable
            ? UPDATE
            : state.starDue
                ? STAR
                : HELP;
    // 内核入口：当前内核已知 → 带名（「内核 · Claude」）；未知（Chat 侧接线
    // 前）→ 短标签。名字来自 manifest 的 shortLabel（state.backendLabel），与
    // 选择器、落地页铭牌和重启通知同源；没有就退回原样 id（不猜品牌名）。
    const backendName = state.backendLabel ?? state.backendId;
    const backend = backendName === undefined || backendName === ''
        ? BACKEND
        : { ...BACKEND, labelKey: 'launchpad-action-backend-named', values: { name: backendName } };
    const title = truncateContinueTitle(state.lastSessionTitle ?? '');
    if (title !== '') {
        return [
            { ...CONTINUE, labelKey: 'launchpad-action-continue-titled', values: { title } },
            SESSIONS_WORKSPACE,
            SETTINGS,
            backend,
            conditional,
        ];
    }
    return [SESSIONS_WORKSPACE, SETTINGS, backend, conditional];
}
