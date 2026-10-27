import React from 'react';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
import type { QuestionStore } from '../channel/questions.js';
import { TuiDialogStore } from '../dsh-adapter/dialogs.js';
import { TuiStatusStore } from '../dsh-adapter/status.js';
import { ActivityStore } from '../dsh-adapter/activity-store.js';
import type { TuiShortcutHost } from '../dsh-adapter/shortcuts.js';
import type { TuiThemeHost } from '../dsh-adapter/themes.js';
import { type PermissionPanelSource } from '../channel/permissions.js';
import { type StarAttempt } from '../components/StarPrompt.js';
import type { WhaleCouponStore } from '../dsh-adapter/oauth/bonus.js';
import { type PromptController } from '../components/PromptInput.js';
import type { InjectController } from '../dsh-adapter/inject-channel.js';
import type { SdkInstallSurface } from '../agent/backend.js';
import type { PluginInstallFlow, PluginInstallSink } from '../dsh-adapter/plugin-install.js';
import type { PluginManageFlow, PluginManageSink } from '../dsh-adapter/plugin-manage.js';
import type { TeamCommandSink } from '../dsh-adapter/team-mode.js';
import type { KernelEntry, KernelStatus } from '../components/kernelCatalog.js';
import type { KernelBackendId } from '../kernelPrefs.js';
export declare function Chat({ channel, questionStore, approvalStore, extensionDialogs, bonusNotices, extensionStatus, activityStore, extensionShortcuts, themeHost, onExit, onUpdate, onRestart, onSwitchBackend, onRestartFreshSession, onProbeKernels, kernelEntries, onResolveSdkInstall, onPluginInstall, onPluginManage, onTeamCommand, kernelPinned, fullscreen, trajectorySeen: trajectorySeenProp, injectControllerRef, promptControllerRef: promptControllerRefProp, renderScene, openHomeOnBoot, launchpadOnBoot, onboardingOnBoot, starPrompt, }: {
    channel: Channel;
    renderScene?: (id: string, channel: Channel) => React.ReactNode;
    questionStore: QuestionStore;
    /**
     * The approval seam's UI store — the DSH `ApprovalStore` or a backend
     * session's shared `PermissionStore`; both present the same panel shape.
     * Optional: hosts without an approval channel (headless scripts, older
     * embeds) render Chat without it and simply never see an approval panel —
     * the question panel keeps its seat.
     */
    approvalStore?: PermissionPanelSource;
    /**
     * The managed plugin dialog queue (tuiDialogs service's store). Optional
     * for the same hosts as approvalStore; absent, plugin dialog requests
     * park unanswered (their `timeoutMs` is the plugin's guard).
     */
    extensionDialogs?: TuiDialogStore;
    /** Server-confirmed login bonuses awaiting presentation in the TUI. */
    bonusNotices?: WhaleCouponStore;
    /** Plugin text and bounded rich status contributions. */
    extensionStatus?: TuiStatusStore;
    /** Session-scoped activity values published by the working-activity plugin. */
    activityStore?: ActivityStore;
    /** Host-only keyboard shortcut dispatch path. */
    extensionShortcuts?: TuiShortcutHost;
    /** Optional runtime theme host; static JSON themes work without it. */
    themeHost?: TuiThemeHost;
    onExit: () => void;
    /** Update the installed package and restart the current TUI process. */
    onUpdate?: () => void;
    /** Restart the current TUI process and resume this session (no update). */
    onRestart?: () => void;
    /**
     * 切换内核（组合根实现：写 kernel.json 记忆 → 通知 → 退出 → 以新内核重启，
     * 新内核开新会话）。启动页「内核」入口与 /kernel 都落到这里；缺省 =
     * 当前宿主没有切换能力（选择器只提示，绝不假装）。
     */
    onSwitchBackend?: (backend: KernelBackendId) => void;
    /**
     * 以新会话重启（组合根实现：走切换内核的同一条退出路径，不写 resume 目标，
     * 内核不变）。/channel 在激活渠道的连接变了时用它：运行中的 CLI 子进程
     * 换不了 baseUrl/token，只能换会话。
     */
    onRestartFreshSession?: (notice: string) => void;
    /**
     * Claude 内核探测（组合根注入；Chat 不 import 任何具体后端）。首次需要时
     * 调一次并缓存结果；探测失败按「未安装」处理。
     */
    onProbeKernels?: () => Promise<Record<string, KernelStatus>>;
    /**
     * The host's projection of the backend registry, in picker order (P0):
     * `{ id, label, shortLabel, alwaysAvailable, product, installable }`.
     *
     * Passed in rather than imported: the UI layers may not import
     * `src/dsh-adapter/**` (values) nor `src/backends/**` at all, and Chat is the
     * one place that fans the list out to the picker, the launchpad corner and the
     * launchpad's action row. Absent (bare embeds, older hosts): no kernel rows.
     */
    kernelEntries?: readonly KernelEntry[];
    /**
     * SDK 安装向导（组合根注入，同上不 import 具体后端）：**按后端 id 现查安装面**——
     * 清单声明"装什么、用哪个执行器"，宿主查表给出动作（resolveTarget 同步、只读
     * argv + 文件系统；start 在 profile 目录跑 `pnpm add` 并返回可取消句柄；
     * preflight 是确认后的预检）。
     *
     * 返回 undefined＝该后端没有安装面（没声明配方，或配方的执行器不是本宿主实现的），
     * 「未安装」行保持死路提示。按 id 查而不是开局定一份：行上的「可装」与这里查的是
     * 同一个派生事实，用户点哪行就装哪行（Stage B / §6 第 12 条）。
     */
    onResolveSdkInstall?: (id: KernelBackendId) => SdkInstallSurface | undefined;
    /**
     * `/plugin install <spec>`: the write path (Stage C-4). The entry builds the
     * flow out of the host plugin service, the packaged first-party feed and the
     * install notice, and answers `undefined` for anything else — an argument
     * that is not an install form, or a launch with no service to install
     * through. The caller then runs the ordinary read-only report.
     *
     * `sink.binding` is the session the flow is fenced to (the flow drops its own
     * output once that session moves on); `sink.onLines` writes its lines into
     * the transcript.
     */
    onPluginInstall?: (args: string, sink: PluginInstallSink) => PluginInstallFlow | undefined;
    /**
     * `/plugin remove|enable|disable <target>` (C-5): the lifecycle write path,
     * wired to `createPluginManageEntry`. `undefined` means the input is none of
     * those three forms, or this launch has no profile plugin service — the screen
     * then runs the read-only report, which is where the CLI route is printed.
     *
     * The sink is the install sink's twin minus cancellation: these three actions
     * have none to offer, so `sink.binding` / `sink.busy` / `sink.onLines` are the
     * whole contract.
     */
    onPluginManage?: (args: string, sink: PluginManageSink) => PluginManageFlow | undefined;
    /**
     * `/team [status]`, wired to `createTeamCommandEntry`: a report, or the
     * enable/migration hint when the team service is not mounted. `undefined`
     * on a backend without it.
     */
    onTeamCommand?: (args: string, sink: TeamCommandSink) => Promise<readonly string[]>;
    /** 启动参数（Config 行 / DSH_TUI_BACKEND）压过了记忆：选择器明说。 */
    kernelPinned?: boolean;
    /**
     * True when the host already wrapped this tree in `<AlternateScreen>`
     * (`fullscreen: true`). Both full-screen surfaces need this — the trajectory
     * scene and the session browser: entering the alt
     * screen a second time is harmless, but the inner unmount's DEC 1049 exit
     * would drop the whole app back to the main screen.
     */
    fullscreen?: boolean;
    /**
     * Whether the trajectory has been opened before on this machine.
     *
     * A prop rather than a filesystem read inside the component: a render
     * initializer touching disk is the wrong layer, and hosts that already know
     * (or tests that need determinism) can simply say. Falls back to the
     * persisted flag when the host does not supply one.
     */
    trajectorySeen?: boolean;
    /**
     * External injection controller (dsh-adapter/inject-channel.ts). When the
     * host runs the injection socket, Chat publishes `{ append, submit }` into
     * this ref every render so the adapter-owned socket drives the prompt input
     * without reaching into React state directly. Absent for hosts that do not
     * open the channel (headless scripts, bare embeds).
     */
    injectControllerRef?: React.RefObject<InjectController | null>;
    /**
     * Show the workspace home screen as this session's first frame.
     *
     * A prop rather than a filesystem read inside the component: the host knows
     * whether this launch was an ordinary one (no `--resume`, no workspace
     * target) and whether the home screen has already been shown on this
     * installation, and tests need it deterministic.
     */
    openHomeOnBoot?: boolean;
    /**
     * Show the Launchpad as this session's first frame.
     *
     * Same shape of decision as `openHomeOnBoot` and answered by the same
     * ordinary-launch test (no `--resume`, no workspace target, no first
     * prompt) — a resumed conversation belongs to a user who already said
     * where they want to be, and a landing page in front of it would be the
     * TUI second-guessing them. Unlike the workspace home this is NOT one-shot:
     * every ordinary launch lands here, because the page is the place where the
     * first sentence gets typed, not a tutorial that retires itself.
     */
    launchpadOnBoot?: boolean;
    /**
     * Offer the first-run guide as this session's first frame.
     *
     * The host owns the decision (it reads `~/.dsh-tui/onboarding.json`); this
     * prop only carries the verdict, exactly like `openHomeOnBoot`. It renders
     * ABOVE the launchpad: the wizard answers "is this thing even wired up",
     * which is upstream of "what do I want to do first".
     */
    onboardingOnBoot?: boolean;
    /**
     * Test seam for the startup star modal (usage milestones 99h / 999
     * launches): `null` disables the modal outright; `dir` points the usage
     * ledger at a fixture directory; overriding the actions keeps it fully
     * interactive without spawning `gh` or a browser. Production leaves it
     * undefined.
     */
    starPrompt?: {
        dir?: string;
        onStar?: () => StarAttempt | Promise<StarAttempt>;
        onOpen?: () => void;
    } | null;
    /**
     * The composer's live controller, published every render. Exposed as a prop
     * so a regression can read the draft the composer HOLDS — the ownership
     * question (does a screen swap lose it?) is about state, not about pixels.
     */
    promptControllerRef?: React.RefObject<PromptController | null>;
}): React.ReactNode;
//# sourceMappingURL=Chat.d.ts.map