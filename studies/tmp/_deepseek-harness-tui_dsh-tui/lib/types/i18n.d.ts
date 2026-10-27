/**
 * dsh-tui localization — UI strings for Chinese (`zh`, the default) and
 * English (`en`).
 *
 * Resolution order mirrors the `/theme` mechanism (see themePrefs.ts):
 *
 *   1. `DSH_TUI_LANG` env var (`en` / `zh`) — pinned at process start
 *   2. `lang` cordis.yml config key (see Config in index.ts)
 *   3. the persisted `/lang` choice in `~/.dsh-tui/lang.json`
 *   4. the OS locale guess (`LC_ALL` / `LC_MESSAGES` / `LANG`)
 *   5. `zh` (the original hard-coded language)
 *
 * `/lang` switches at runtime and hot-swaps the whole UI. The dictionary is
 * a flat key → per-language text map; `t(key, params)` substitutes
 * `{{name}}` placeholders with the given params. A per-language value is
 * either a plain template or `{ one, other }` plural forms selected via
 * `Intl.PluralRules` on the `count` param (zh has no grammatical number and
 * always resolves to `other`). Missing keys render the key itself so a typo
 * is visible in the UI instead of silently blank.
 *
 * The dictionary shape is enforced at compile time (`satisfies` below):
 * every entry carries zh, and en is optional only for the `cmd-desc-*`
 * family whose en truth lives in the command registry (see {@link tOr}).
 * scripts/verify-i18n.ts adds the checks types cannot express: placeholder
 * parity between languages, single-brace typos, dead keys, and English
 * UI-copy literals outside the dictionary (issue #980's leak shape).
 *
 * ## Adding a language (e.g. `ja`) — the full checklist
 *
 * The architecture is the standard flat-dict shape; a new language is
 * translation work plus this mechanical touchpoint list (the compiler and
 * verify-i18n fail until every step is done — partial translations cannot
 * ship silently):
 *
 *   1. `Lang` union + `LANGS` display order (this file).
 *   2. `isLang()` — add the literal.
 *   3. `pluralRules` — add `new Intl.PluralRules('<tag>')`; if the language
 *      uses CLDR categories beyond one/other (ru/pl/ar…), widen `I18nText`
 *      to carry them and extend `pickText` accordingly.
 *   4. Dictionary type below: add `ja?: I18nText` to the `satisfies` shape.
 *      Decide optionality deliberately: required = compile error per missing
 *      key (recommended — a half-translated UI is worse than none); optional
 *      = `t()` renders the raw key for gaps, so also give `t()`/`tOr()` an
 *      explicit fallback order (e.g. ja → en → key) if you go optional.
 *   5. scripts/verify-i18n.ts: the completeness loop (§1) hardcodes the
 *      ['zh','en'] pair — extend it, and re-review FORBIDDEN_LITERALS
 *      (English sentences stay banned outside the dict; add the new
 *      language's equivalents only if the leak shape repeats).
 *   6. Translate the dictionary (~1k keys today); zh comments above each
 *      key family describe tone/register — keep them.
 *   7. `detectLocaleLang()` — map the new tag in the OS-locale guess.
 *   8. Rendered-output regression: extend scripts/verify-toolcard-i18n.tsx
 *      style fixtures' language passes so the localized strings are proven
 *      on screen, not just present in the dict.
 */
export type Lang = 'zh' | 'en';
/** The languages shipped with the plugin, in display order. */
export declare const LANGS: readonly ["zh", "en"];
/**
 * One dictionary value in one language: a plain `{{name}}` template, or
 * plural forms picked by the `count` param through `Intl.PluralRules`.
 * Only `one`/`other` exist because those are the only CLDR categories zh
 * and en use; a third shipped language may need more.
 */
export type I18nText = string | {
    one: string;
    other: string;
};
declare const dict: {
    readonly 'spinner-verb-analyzing': {
        readonly zh: "分析中";
        readonly en: "Analyzing";
    };
    readonly 'spinner-verb-thinking': {
        readonly zh: "思考中";
        readonly en: "Thinking";
    };
    readonly 'spinner-verb-working': {
        readonly zh: "工作中";
        readonly en: "Working";
    };
    readonly 'spinner-verb-considering': {
        readonly zh: "斟酌中";
        readonly en: "Considering";
    };
    readonly 'spinner-verb-reviewing': {
        readonly zh: "审阅中";
        readonly en: "Reviewing";
    };
    readonly 'spinner-verb-planning': {
        readonly zh: "规划中";
        readonly en: "Planning";
    };
    readonly 'spinner-verb-checking': {
        readonly zh: "检查中";
        readonly en: "Checking";
    };
    readonly 'spinner-verb-reading': {
        readonly zh: "读取中";
        readonly en: "Reading";
    };
    readonly 'spinner-verb-searching': {
        readonly zh: "检索中";
        readonly en: "Searching";
    };
    readonly 'spinner-verb-building': {
        readonly zh: "构建中";
        readonly en: "Building";
    };
    readonly 'spinner-verb-testing': {
        readonly zh: "测试中";
        readonly en: "Testing";
    };
    readonly 'spinner-verb-connecting': {
        readonly zh: "连接中";
        readonly en: "Connecting";
    };
    readonly 'spinner-verb-preparing': {
        readonly zh: "准备中";
        readonly en: "Preparing";
    };
    readonly 'spinner-verb-exploring': {
        readonly zh: "探索中";
        readonly en: "Exploring";
    };
    readonly 'spinner-verb-reasoning': {
        readonly zh: "推理中";
        readonly en: "Reasoning";
    };
    readonly 'spinner-verb-summarizing': {
        readonly zh: "总结中";
        readonly en: "Summarizing";
    };
    readonly 'spinner-verb-resolving': {
        readonly zh: "解析中";
        readonly en: "Resolving";
    };
    readonly 'spinner-verb-responding': {
        readonly zh: "回应中";
        readonly en: "Responding";
    };
    readonly 'activity-indicator-already': {
        readonly zh: "指示器已是：{{name}}";
        readonly en: "Indicator already set: {{name}}";
    };
    readonly 'activity-indicator-switched': {
        readonly zh: "指示器已切换：{{name}}（已保存）";
        readonly en: "Indicator switched: {{name}} (saved)";
    };
    readonly 'activity-pref-write-failed': {
        readonly zh: "无法写入 ~/.dsh-tui/working-activity.json，切换未保存";
        readonly en: "Cannot write ~/.dsh-tui/working-activity.json, switch not saved";
    };
    readonly 'model-pref-write-failed': {
        readonly zh: "无法写入 ~/.dsh-tui/model.json，模型选择不会保存到重启后";
        readonly en: "Cannot write ~/.dsh-tui/model.json, the model choice will not survive a restart";
    };
    readonly 'model-route-invalid': {
        readonly zh: "持久化的模型路由 {{provider}}/{{model}} 不在该 provider 的模型列表中，已整体回退到 {{fallback}}";
        readonly en: "Persisted model route {{provider}}/{{model}} is not advertised by that provider; fell back to {{fallback}}";
    };
    readonly 'unknown-activity-preset': {
        readonly zh: "未知预设「{{name}}」· /activity frames 查看全部";
        readonly en: "Unknown preset \"{{name}}\" · /activity frames to view all";
    };
    readonly 'preset-unavailable': {
        readonly zh: "Preset 不可用——当前组合未挂载 agent-presets 名册";
        readonly en: "Preset unavailable — the agent-presets roster is not mounted";
    };
    readonly 'preset-agent-running': {
        readonly zh: "Agent 运行中，无法切换 preset";
        readonly en: "Agent is running, cannot switch preset";
    };
    readonly 'preset-not-found': {
        readonly zh: "Preset「{{id}}」不存在 · {{err}}";
        readonly en: "Preset \"{{id}}\" not found · {{err}}";
    };
    readonly 'preset-load-failed': {
        readonly zh: "Preset「{{id}}」无法加载 · {{broken}}";
        readonly en: "Preset \"{{id}}\" failed to load · {{broken}}";
    };
    readonly 'preset-already-current': {
        readonly zh: "当前 preset 已是：{{id}}";
        readonly en: "Current preset already: {{id}}";
    };
    readonly 'preset-pref-write-failed': {
        readonly zh: "无法写入 ~/.dsh-tui/agent-preset.json，选择未保存";
        readonly en: "Cannot write ~/.dsh-tui/agent-preset.json, selection not saved";
    };
    readonly 'preset-locked-saved-default': {
        readonly zh: "会话已开始，preset 已锁定（当前：{{current}}）· 已保存为默认：{{id}}（/new 或下次启动生效）";
        readonly en: "Session already started, preset locked (current: {{current}}) · Saved as default: {{id}} (applies on /new or next start)";
    };
    readonly 'preset-switch-failed': {
        readonly zh: "Preset 切换失败 · {{err}}";
        readonly en: "Preset switch failed · {{err}}";
    };
    readonly 'preset-switched-pref-failed': {
        readonly zh: "Preset 已切换：{{id}}，但默认偏好写入失败（重启后不保留）";
        readonly en: "Preset switched: {{id}}, but writing the default preference failed (won't persist after restart)";
    };
    readonly 'preset-switched-saved': {
        readonly zh: "Preset 已切换：{{id}}（已保存为默认）";
        readonly en: "Preset switched: {{id}} (saved as default)";
    };
    readonly 'preset-name-standard': {
        readonly zh: "标准模式";
        readonly en: "Standard";
    };
    readonly 'preset-desc-standard': {
        readonly zh: "功能完整的编码 Agent，支持文件编辑、Shell、文件与网页检索、Skills、计划、目标、子代理和工作流。";
        readonly en: "Full-featured coding agent: file editing, shell, file & web search, skills, plans, goals, subagents and workflows.";
    };
    readonly 'preset-name-minimal': {
        readonly zh: "极简模式";
        readonly en: "Minimal";
    };
    readonly 'preset-desc-minimal': {
        readonly zh: "内核 Agent 预设（极简模式）：只暴露一个持久 shell 工具（POSIX 为 bash，Windows 为 pwsh），不带 compaction、计划模式与运行时上下文。";
        readonly en: "Kernel agent preset (Minimal): a single persistent-shell tool (bash on POSIX, pwsh on Windows), with no compaction, no plan mode and no runtime context.";
    };
    readonly 'preset-name-code': {
        readonly zh: "PTC 模式";
        readonly en: "PTC";
    };
    readonly 'preset-desc-code': {
        readonly zh: "具备标准模式的全部能力，并通过 Code Mode SDK 呈现工具，让模型用一个 TypeScript 程序组合多步操作。";
        readonly en: "Everything standard mode offers, with tools exposed through the Code Mode SDK so the model composes multi-step operations in one TypeScript program.";
    };
    readonly 'preset-name-cordis': {
        readonly zh: "创造模式";
        readonly en: "Creation";
    };
    readonly 'preset-desc-cordis': {
        readonly zh: "用于创建自定义 Agent preset：具备标准模式的全部能力，并提供运行时检查、插件实验和 preset 创作指导。";
        readonly en: "For authoring custom agent presets: everything standard mode offers plus runtime inspection, plugin experiments and preset-authoring guidance.";
    };
    readonly 'preset-name-liangshen': {
        readonly zh: "梁神模式";
        readonly en: "Liangshen mode";
    };
    readonly 'preset-desc-liangshen': {
        readonly zh: "主 Agent 与子 Agent 首轮均保持极简模式的最小工具面，首次工具调用后开放完整目录，压缩后重新锚定。";
        readonly en: "Root and delegated agents keep the Minimal preset's minimal tool surface on the first turn; the full catalog opens after the first tool call and re-anchors after compaction.";
    };
    readonly 'preset-picker-title': {
        readonly zh: "内核 Agent 预设";
        readonly en: "Kernel agent preset";
    };
    readonly 'mcp-none-configured': {
        readonly zh: "未配置 MCP 服务器。";
        readonly en: "No MCP servers configured.";
    };
    readonly 'mcp-insert-hint': {
        readonly zh: "在 profile 补丁层（~/.dsh/profiles/dsh-tui/cordis.patch.yml）insert 一行即可，例：";
        readonly en: "Insert one line in the profile patch layer (~/.dsh/profiles/dsh-tui/cordis.patch.yml), e.g.:";
    };
    readonly 'mcp-readme-hint': {
        readonly zh: "详见仓库 README 的 MCP 章节。";
        readonly en: "See the MCP section of the repo README.";
    };
    readonly 'mcp-server-tools': {
        readonly zh: "{{server}}（{{count}} 个工具）: {{tools}}";
        readonly en: "{{server}} ({{count}} tools): {{tools}}";
    };
    readonly 'child-stderr-line': {
        readonly zh: "子进程 stderr: {{line}}";
        readonly en: "Subprocess stderr: {{line}}";
    };
    readonly 'child-stderr-line-repeat': {
        readonly zh: "子进程 stderr: {{line}}（重复 {{count}} 次）";
        readonly en: "Subprocess stderr: {{line}} (repeated {{count}}×)";
    };
    readonly 'export-title': {
        readonly zh: "# dsh-tui 会话导出";
        readonly en: "# dsh-tui session export";
    };
    readonly 'export-time': {
        readonly zh: "- 导出时间: {{time}}";
        readonly en: "- Exported: {{time}}";
    };
    readonly 'export-model': {
        readonly zh: "- 模型: {{model}}";
        readonly en: "- Model: {{model}}";
    };
    readonly 'export-session': {
        readonly zh: "- 会话: {{id}}";
        readonly en: "- Session: {{id}}";
    };
    readonly 'export-dir': {
        readonly zh: "- 目录: {{cwd}}";
        readonly en: "- Directory: {{cwd}}";
    };
    readonly 'mentions-image-adjusted': {
        readonly zh: "@{{path}} 已适配：{{detail}}";
        readonly en: "@{{path}} adapted: {{detail}}";
    };
    readonly 'mentions-image-failed': {
        readonly zh: "@{{path}} 无法附加：{{reason}}";
        readonly en: "@{{path}} could not be attached: {{reason}}";
    };
    readonly 'mentions-attached': {
        readonly zh: "已附加 {{count}} 个文件引用";
        readonly en: {
            readonly one: "Attached {{count}} file reference";
            readonly other: "Attached {{count}} file references";
        };
    };
    readonly 'mentions-missing': {
        readonly zh: "未找到引用: {{paths}}";
        readonly en: "References not found: {{paths}}";
    };
    readonly 'team-message-label': {
        readonly zh: "团队消息";
        readonly en: "team message";
    };
    readonly 'selection-attached': {
        readonly zh: "已选中 {{lines}} 行 · {{path}}";
        readonly en: {
            readonly one: "Selected {{lines}} line from {{path}}";
            readonly other: "Selected {{lines}} lines from {{path}}";
        };
    };
    readonly 'prompt-attached-context-chip': {
        readonly zh: "⧉ {{title}}";
        readonly en: "⧉ {{title}}";
    };
    readonly 'transcript-image': {
        readonly zh: "图片";
        readonly en: "Image";
    };
    readonly 'image-preview-previous': {
        readonly zh: "上一张";
        readonly en: "Previous image";
    };
    readonly 'image-preview-next': {
        readonly zh: "下一张";
        readonly en: "Next image";
    };
    readonly 'image-preview-open-original': {
        readonly zh: "打开原图";
        readonly en: "Open original";
    };
    readonly 'image-preview-opening': {
        readonly zh: "正在打开原图…";
        readonly en: "Opening original...";
    };
    readonly 'image-preview-open-failed': {
        readonly zh: "原图打开失败，点击重试";
        readonly en: "Could not open original; retry";
    };
    readonly 'image-preview-fit': {
        readonly zh: "适应";
        readonly en: "Fit";
    };
    readonly 'image-preview-actual': {
        readonly zh: "100% 原像素";
        readonly en: "Actual pixels (100%)";
    };
    readonly 'image-preview-no-metrics': {
        readonly zh: "终端未报告字符格像素尺寸";
        readonly en: "Terminal cell pixel size unavailable";
    };
    readonly 'image-preview-zoom-in': {
        readonly zh: "放大";
        readonly en: "Zoom in";
    };
    readonly 'image-preview-zoom-out': {
        readonly zh: "缩小";
        readonly en: "Zoom out";
    };
    readonly 'image-preview-left': {
        readonly zh: "向左平移";
        readonly en: "Pan left";
    };
    readonly 'image-preview-right': {
        readonly zh: "向右平移";
        readonly en: "Pan right";
    };
    readonly 'image-preview-up': {
        readonly zh: "向上平移";
        readonly en: "Pan up";
    };
    readonly 'image-preview-down': {
        readonly zh: "向下平移";
        readonly en: "Pan down";
    };
    readonly 'transcript-image-loading': {
        readonly zh: "正在加载 {{name}}";
        readonly en: "Loading {{name}}";
    };
    readonly 'transcript-image-ready': {
        readonly zh: "图片 · {{name}}";
        readonly en: "Image · {{name}}";
    };
    readonly 'transcript-image-unavailable': {
        readonly zh: "无法预览 {{name}}";
        readonly en: "Cannot preview {{name}}";
    };
    readonly 'transcript-image-message': {
        readonly zh: "{{count}} 张图片";
        readonly en: {
            readonly one: "{{count}} image";
            readonly other: "{{count}} images";
        };
    };
    readonly 'input-image-token-stale': {
        readonly zh: "{{token}} 已失效，发送时不会附带图片";
        readonly en: "{{token}} is no longer staged; no image will attach";
    };
    readonly 'input-images-staged': {
        readonly zh: "已附加 {{count}} 张图片";
        readonly en: {
            readonly one: "Attached {{count}} image";
            readonly other: "Attached {{count}} images";
        };
    };
    readonly 'input-images-staged-adapted': {
        readonly zh: "已附加 {{count}} 张图片 · {{adapted}} 张已适配";
        readonly en: {
            readonly one: "Attached {{count}} image · {{adapted}} adapted";
            readonly other: "Attached {{count}} images · {{adapted}} adapted";
        };
    };
    readonly 'send-failed': {
        readonly zh: "发送失败 · {{err}}";
        readonly en: "Send failed · {{err}}";
    };
    readonly 'input-not-accepted': {
        readonly zh: "后端没有接受这条消息，请重试或检查会话状态";
        readonly en: "The backend did not accept this message; retry or check the session state";
    };
    readonly 'agent-message-native-envelope': {
        readonly zh: "请通过 {{tool}} 将下面的消息发送给子代理 {{name}}（id: {{id}}）。不要代替子代理回复。\n\n{{text}}";
        readonly en: "Use {{tool}} to send the following message to subagent {{name}} (id: {{id}}). Do not answer on behalf of the subagent.\n\n{{text}}";
    };
    readonly 'agent-message-envelope': {
        readonly zh: "请把下面这条用户消息原样转发给子代理「{{name}}」（目标标识 {{id}}）：使用 SendMessage 工具投递，不要改写内容，也不要代替它作答。转发后简短告知结果即可。\n\n{{text}}";
        readonly en: "Please relay the following user message verbatim to subagent \"{{name}}\" (target id {{id}}): deliver it with the SendMessage tool, do not rewrite its content and do not answer on its behalf. Briefly report the outcome afterwards.\n\n{{text}}";
    };
    readonly 'session-cleared': {
        readonly zh: "会话已清屏";
        readonly en: "Session cleared";
    };
    readonly 'conversation-reset': {
        readonly zh: "对话已重置，之前的上下文已清空";
        readonly en: "The conversation was reset; the earlier context is gone";
    };
    readonly 'conversation-reset-clear': {
        readonly zh: "对话已清空，接下来从新的上下文开始";
        readonly en: "Conversation cleared; continuing with a fresh context";
    };
    readonly 'conversation-reset-plan': {
        readonly zh: "退出计划模式时清空了上下文，接下来带着计划从新的上下文开始";
        readonly en: "Context cleared on leaving plan mode; continuing from a fresh context with the plan";
    };
    readonly 'conversation-reset-fresh': {
        readonly zh: "已开新会话来执行计划";
        readonly en: "Started a fresh session to carry out the plan";
    };
    readonly 'cost-source-backend': {
        readonly zh: "内核上报的会话费用";
        readonly en: "session cost reported by the kernel";
    };
    readonly 'capability-unavailable-backend': {
        readonly zh: "当前内核不支持：{{name}}";
        readonly en: "Not supported by this kernel: {{name}}";
    };
    readonly 'effort-tier-low': {
        readonly zh: "低";
        readonly en: "Low";
    };
    readonly 'effort-tier-medium': {
        readonly zh: "中";
        readonly en: "Medium";
    };
    readonly 'effort-tier-high': {
        readonly zh: "高";
        readonly en: "High";
    };
    readonly 'effort-tier-xhigh': {
        readonly zh: "超高";
        readonly en: "Extra high";
    };
    readonly 'effort-tier-max': {
        readonly zh: "最高";
        readonly en: "Max";
    };
    readonly 'login-backend-heading': {
        readonly zh: "{{backend}} 登录状态";
        readonly en: "{{backend}} sign-in";
    };
    readonly 'login-backend-no-oauth': {
        readonly zh: "未挂载 dsh-auth 登录服务：只能用内核自己的凭证（环境变量或它自己的登录）";
        readonly en: "No dsh-auth sign-in service is mounted: only the kernel's own credentials apply (environment or its own login)";
    };
    readonly 'login-backend-oauth-removed': {
        readonly zh: "已移除 {{provider}} 的 dsh-auth 登录；内核原生登录未修改，已载入令牌需正常重启后停止使用";
        readonly en: "Removed the {{provider}} dsh-auth credential; native login is unchanged. Restart normally to stop using already-loaded tokens";
    };
    readonly 'login-backend-oauth-missing': {
        readonly zh: "dsh-auth 没有 {{provider}} 的登录可移除；内核原生登录未修改";
        readonly en: "No {{provider}} dsh-auth credential to remove; native login is unchanged";
    };
    readonly 'login-backend-reconnected': {
        readonly zh: "已用新凭证重新连接 {{backend}} 会话";
        readonly en: "The {{backend}} session reconnected with the new credential";
    };
    readonly 'login-backend-reconnect-failed': {
        readonly zh: "用新凭证重新连接失败 · {{err}}";
        readonly en: "Reconnecting with the new credential failed · {{err}}";
    };
    readonly 'provider-oauth-unmounted': {
        readonly zh: "dsh-auth 未挂载 {{provider}} 登录（在 dsh-auth 配置的 providers 中加入它）";
        readonly en: "dsh-auth does not mount the {{provider}} sign-in (add it to the dsh-auth providers config)";
    };
    readonly 'backend-mcp-heading': {
        readonly zh: "MCP 服务器（{{n}}）";
        readonly en: "MCP servers ({{n}})";
    };
    readonly 'backend-mcp-row': {
        readonly zh: "  {{name}} · {{status}}{{tools}}";
        readonly en: "  {{name}} · {{status}}{{tools}}";
    };
    readonly 'backend-mcp-tools': {
        readonly zh: " · {{n}} 个工具";
        readonly en: " · {{n}} tools";
    };
    readonly 'backend-mcp-none': {
        readonly zh: "没有配置 MCP 服务器";
        readonly en: "No MCP servers configured";
    };
    readonly 'backend-mcp-loading': {
        readonly zh: "正在读取 MCP 状态，稍后再运行 /mcp";
        readonly en: "Reading MCP status; run /mcp again in a moment";
    };
    readonly 'mcp-control-usage': {
        readonly zh: "用法：/mcp reconnect <服务器> 或 /mcp toggle <服务器> on|off";
        readonly en: "Usage: /mcp reconnect <server> or /mcp toggle <server> on|off";
    };
    readonly 'mcp-reconnected': {
        readonly zh: "已重新连接 MCP 服务器 {{name}}";
        readonly en: "Reconnected the MCP server {{name}}";
    };
    readonly 'mcp-enabled': {
        readonly zh: "已开启 MCP 服务器 {{name}}";
        readonly en: "Enabled the MCP server {{name}}";
    };
    readonly 'mcp-disabled': {
        readonly zh: "已关闭 MCP 服务器 {{name}}";
        readonly en: "Disabled the MCP server {{name}}";
    };
    readonly 'backend-mcp-needs-auth': {
        readonly zh: "需要授权的服务器请在终端运行 claude 后用 /mcp 完成";
        readonly en: "For servers that need auth, finish it with /mcp in an interactive `claude`";
    };
    readonly 'context-tokens': {
        readonly zh: "{{n}} tokens";
        readonly en: "{{n}} tokens";
    };
    readonly 'status-rate-limit': {
        readonly zh: "订阅用量 {{usage}}";
        readonly en: "Subscription usage {{usage}}";
    };
    readonly 'interrupt-failed': {
        readonly zh: "打断请求失败：排队消息没有撤回，仍会在下一回合发送；已取消暂存，避免重复发送";
        readonly en: "The interrupt request failed: the queued messages were not withdrawn and will still run next turn; they are no longer held, so nothing is sent twice";
    };
    readonly 'interrupt-unconfirmed': {
        readonly zh: "无法确认排队消息已撤回：它们仍会在下一回合发送，不再暂存";
        readonly en: "Could not confirm the queued messages were withdrawn: they will still run next turn and are no longer held";
    };
    readonly 'interrupt-pending': {
        readonly zh: "中断请求已发出，正在等待回合停止……";
        readonly en: "Interrupt requested; waiting for the turn to stop…";
    };
    readonly 'interrupt-stuck': {
        readonly zh: "中断迟迟没有生效（工具可能没有响应中断）。可用 /restart：它会中断当前回合并尝试重启；若进程无法正常收尾，退出后会打印恢复本会话的命令（排队输入不保留）。";
        readonly en: "The interrupt is not taking effect (a tool may be ignoring it). Use /restart: it interrupts this turn and tries to restart; if the process cannot shut down cleanly it exits and prints the command that resumes this session (queued input is not kept).";
    };
    readonly 'cmd-unavailable-backend': {
        readonly zh: "/{{cmd}} 在 {{backend}} 内核下不可用";
        readonly en: "/{{cmd}} is not available on the {{backend}} kernel";
    };
    readonly 'export-user-section': {
        readonly zh: "## 用户";
        readonly en: "## User";
    };
    readonly 'export-thinking-section': {
        readonly zh: "## 思考";
        readonly en: "## Thinking";
    };
    readonly 'export-assistant-section': {
        readonly zh: "## 助手";
        readonly en: "## Assistant";
    };
    readonly 'export-tool-section': {
        readonly zh: "## 工具 · {{name}}";
        readonly en: "## Tool · {{name}}";
    };
    readonly 'export-result-section': {
        readonly zh: "### 结果";
        readonly en: "### Result";
    };
    readonly 'agentsmd-project': {
        readonly zh: "## 项目";
        readonly en: "## Project";
    };
    readonly 'agentsmd-project-body': {
        readonly zh: "（在此描述项目的目标、结构与约定——这份文件会注入给每个 agent 作为工作区上下文。）";
        readonly en: "(Describe the project's goals, structure and conventions here — this file is injected to every agent as workspace context.)";
    };
    readonly 'agentsmd-conventions': {
        readonly zh: "## 约定";
        readonly en: "## Conventions";
    };
    readonly 'agentsmd-convention-read': {
        readonly zh: "- 改动前先阅读相关模块";
        readonly en: "- Read the relevant modules before making changes";
    };
    readonly 'agentsmd-convention-style': {
        readonly zh: "- 保持与现有代码风格一致";
        readonly en: "- Keep consistent with the existing code style";
    };
    readonly 'doctor-api-key': {
        readonly zh: "API key: {{state}}";
        readonly en: "API key: {{state}}";
    };
    readonly 'doctor-key-configured-env': {
        readonly zh: "已配置（环境变量）";
        readonly en: "configured (environment)";
    };
    readonly 'doctor-key-configured-store': {
        readonly zh: "已配置（DSH 凭据库）";
        readonly en: "configured (DSH credential store)";
    };
    readonly 'doctor-key-missing': {
        readonly zh: "未配置（环境变量与 DSH 凭据库中都没有 DEEPSEEK_API_KEY）";
        readonly en: "not configured (neither DEEPSEEK_API_KEY nor a DSH credential-store ref)";
    };
    readonly 'doctor-model': {
        readonly zh: "模型: {{model}} · 提供方: {{provider}}";
        readonly en: "Model: {{model}} · Provider: {{provider}}";
    };
    readonly 'doctor-cwd': {
        readonly zh: "工作目录: {{cwd}}";
        readonly en: "Working directory: {{cwd}}";
    };
    readonly 'doctor-context-window': {
        readonly zh: "上下文窗口: {{window}} tokens";
        readonly en: "Context window: {{window}} tokens";
    };
    readonly 'doctor-session': {
        readonly zh: "会话: {{id}}";
        readonly en: "Session: {{id}}";
    };
    readonly 'doctor-backend': {
        readonly zh: "内核: {{label}} ({{id}})";
        readonly en: "Kernel: {{label}} ({{id}})";
    };
    readonly 'doctor-config': {
        readonly zh: "配置: {{candidate}} {{state}}";
        readonly en: "Config: {{candidate}} {{state}}";
    };
    readonly 'doctor-config-missing': {
        readonly zh: "（不存在）";
        readonly en: "(missing)";
    };
    readonly 'doctor-storage': {
        readonly zh: "会话存储: {{dir}} {{state}}";
        readonly en: "Session storage: {{dir}} {{state}}";
    };
    readonly 'doctor-storage-uninit': {
        readonly zh: "（未初始化）";
        readonly en: "(not initialized)";
    };
    readonly 'subagent-not-mounted': {
        readonly zh: "子代理服务未挂载（leaf 未启用 subagent）";
        readonly en: "Subagent service not mounted (leaf has no subagent)";
    };
    readonly 'subagent-none': {
        readonly zh: "当前会话暂无子代理";
        readonly en: "No subagents in the current session";
    };
    readonly 'subagent-resumable': {
        readonly zh: "可续";
        readonly en: "resumable";
    };
    readonly 'subagent-oneshot': {
        readonly zh: "一次性";
        readonly en: "one-shot";
    };
    readonly 'subagent-row': {
        readonly zh: "{{mode}} {{label}}{{activity}} · {{id}}";
        readonly en: "{{mode}} {{label}}{{activity}} · {{id}}";
    };
    readonly 'subagent-running': {
        readonly zh: " 运行中";
        readonly en: " running";
    };
    readonly 'subagent-unknown': {
        readonly zh: " 状态未知";
        readonly en: " status unknown";
    };
    readonly 'subagent-query-failed': {
        readonly zh: "查询失败 · {{err}}";
        readonly en: "Query failed · {{err}}";
    };
    readonly 'subagent-tools': {
        readonly zh: "工具";
        readonly en: "Tools";
    };
    readonly 'subagent-status-running': {
        readonly zh: "运行中";
        readonly en: "running";
    };
    readonly 'subagent-status-completed': {
        readonly zh: "已完成";
        readonly en: "completed";
    };
    readonly 'subagent-status-failed': {
        readonly zh: "失败";
        readonly en: "failed";
    };
    readonly 'subagent-status-unknown': {
        readonly zh: "状态未知";
        readonly en: "status unknown";
    };
    readonly 'subagent-task-fallback': {
        readonly zh: "{{kind}} 任务";
        readonly en: "{{kind}} task";
    };
    readonly 'task-complete-notification': {
        readonly zh: "dsh-TUI · 任务已完成";
        readonly en: "dsh-TUI · Task complete";
    };
    readonly 'subagent-background': {
        readonly zh: "后台";
        readonly en: "background";
    };
    readonly 'subagent-interrupt-failed': {
        readonly zh: "无法停止子代理 {{id}}（已结束或被拒绝）";
        readonly en: "Could not stop subagent {{id}} (already finished or refused)";
    };
    readonly 'agent-preset-switched': {
        readonly zh: "Agent preset 已切换：{{preset}}";
        readonly en: "Agent preset switched: {{preset}}";
    };
    readonly 'context-low-warning': {
        readonly zh: "上下文即将耗尽（剩余 {{percent}}%）· 运行 /clear 或新建会话";
        readonly en: "Context low ({{percent}}% remaining) · Run /clear or start a new session";
    };
    readonly 'rewind-unavailable': {
        readonly zh: "回退不可用——会话服务未加载";
        readonly en: "Rewind unavailable — session services not loaded";
    };
    readonly 'rewind-settling': {
        readonly zh: "无法回退——回合仍在收尾，请稍候再试";
        readonly en: "Cannot rewind — the turn is still settling, try again in a moment";
    };
    readonly 'rewind-fork-failed': {
        readonly zh: "无法回退到该处 · {{err}}";
        readonly en: "Cannot rewind to this point · {{err}}";
    };
    readonly 'rewind-create-failed': {
        readonly zh: "回退失败——无法创建替代会话";
        readonly en: "Rewind failed — could not create the replacement session";
    };
    readonly 'rewind-attach-failed': {
        readonly zh: "已回退，但工作区挂载失败 · {{err}}";
        readonly en: "Session rewound, but workspace attachment failed · {{err}}";
    };
    readonly 'rewind-no-persistence': {
        readonly zh: "回退不可用——持久化服务未加载";
        readonly en: "Rewind unavailable — session persistence not loaded";
    };
    readonly 'rewind-load-failed': {
        readonly zh: "无法读取该会话日志 · {{err}}";
        readonly en: "Could not read that session log · {{err}}";
    };
    readonly 'rewind-noop': {
        readonly zh: "该点之后没有可回退的内容";
        readonly en: "Nothing to rewind past this point";
    };
    readonly 'rewind-while-working': {
        readonly zh: "回合运行中，无法回退";
        readonly en: "Cannot rewind while a turn is running";
    };
    readonly 'rewind-unanchored': {
        readonly zh: "这条消息没有可回退的锚点";
        readonly en: "This message has no rewind anchor";
    };
    readonly 'rewind-files-count': {
        readonly zh: "{{n}} 个文件";
        readonly en: "{{n}} file(s)";
    };
    readonly 'rewind-files-restored': {
        readonly zh: "已恢复文件 · {{summary}}";
        readonly en: "Files restored · {{summary}}";
    };
    readonly 'session-switch-input-parked': {
        readonly zh: "还有输入未送达当前会话（{{input}}），送达后再切换";
        readonly en: "An input is still on its way to this session ({{input}}); switch once it has been delivered";
    };
    readonly 'rewind-conversation-failed': {
        readonly zh: "文件已恢复，但会话回退失败 · {{err}}";
        readonly en: "Files restored, but the conversation rewind failed · {{err}}";
    };
    readonly 'rewind-fork-kept': {
        readonly zh: "回退副本已保存但未能切换过去；可用此命令进入：{{command}}";
        readonly en: "The rewound copy is saved but could not be opened here; enter it with: {{command}}";
    };
    readonly 'rewind-mode-both': {
        readonly zh: "回退会话并恢复文件";
        readonly en: "Rewind conversation and restore files";
    };
    readonly 'rewind-mode-files': {
        readonly zh: "仅恢复文件（会话不变）";
        readonly en: "Restore files only (conversation unchanged)";
    };
    readonly 'session-archive-failed': {
        readonly zh: "归档会话失败 · {{err}}";
        readonly en: "Archiving the session failed · {{err}}";
    };
    readonly 'session-delete-failed': {
        readonly zh: "删除会话失败 · {{err}}";
        readonly en: "Deleting the session failed · {{err}}";
    };
    readonly 'rewind-session-changed': {
        readonly zh: "会话已切换，回退已放弃";
        readonly en: "The session changed; the rewind was dropped";
    };
    readonly 'tree-unavailable': {
        readonly zh: "会话树不可用——持久化服务未加载";
        readonly en: "Session tree unavailable — session persistence not loaded";
    };
    readonly 'fork-unavailable': {
        readonly zh: "分叉不可用——会话服务未加载";
        readonly en: "Fork unavailable — session services not loaded";
    };
    readonly 'fork-while-working': {
        readonly zh: "回合运行中，无法分叉会话";
        readonly en: "Cannot fork while a turn is running";
    };
    readonly 'fork-failed': {
        readonly zh: "分叉失败 · {{err}}";
        readonly en: "Fork failed · {{err}}";
    };
    readonly 'fork-create-failed': {
        readonly zh: "分叉失败——无法创建分叉会话";
        readonly en: "Fork failed — could not create the forked session";
    };
    readonly 'fork-attach-failed': {
        readonly zh: "已分叉，但工作区挂载失败 · {{err}}";
        readonly en: "Session forked, but workspace attachment failed · {{err}}";
    };
    readonly 'fork-done': {
        readonly zh: "已分叉（{{id}}）——仍在原会话中\n新进程进入分叉：{{command}}";
        readonly en: "Forked ({{id}}) — still in the original session\nEnter the fork in a new process: {{command}}";
    };
    readonly 'fork-done-unstored': {
        readonly zh: "已分叉（{{id}}）——仍在原会话中\n源会话还没有内容，分叉副本没有日志可恢复";
        readonly en: "Forked ({{id}}) — still in the original session\nThe source session has no content yet, so the fork has no log to resume";
    };
    readonly 'tree-title': {
        readonly zh: "会话树";
        readonly en: "Session tree";
    };
    readonly 'tree-sessions': {
        readonly zh: "会话";
        readonly en: "sessions";
    };
    readonly 'tree-loading': {
        readonly zh: "正在加载会话树…";
        readonly en: "Loading the session tree…";
    };
    readonly 'tree-rewinding': {
        readonly zh: "正在分叉并切换…";
        readonly en: "Forking and switching…";
    };
    readonly 'tree-empty': {
        readonly zh: "没有可显示的条目";
        readonly en: "No entries to show";
    };
    readonly 'tree-truncated': {
        readonly zh: "已截断";
        readonly en: "truncated";
    };
    readonly 'tree-search': {
        readonly zh: "输入即搜索…";
        readonly en: "Type to search…";
    };
    readonly 'tree-filter-default': {
        readonly zh: "默认";
        readonly en: "default";
    };
    readonly 'tree-filter-no-tools': {
        readonly zh: "无工具";
        readonly en: "no tools";
    };
    readonly 'tree-filter-user-only': {
        readonly zh: "仅用户";
        readonly en: "user only";
    };
    readonly 'tree-filter-all': {
        readonly zh: "全部";
        readonly en: "all";
    };
    readonly 'tree-kind-user': {
        readonly zh: "用户消息";
        readonly en: "user message";
    };
    readonly 'tree-kind-assistant': {
        readonly zh: "助手回复";
        readonly en: "assistant message";
    };
    readonly 'tree-kind-tool': {
        readonly zh: "工具调用";
        readonly en: "tool call";
    };
    readonly 'tree-kind-compact': {
        readonly zh: "压缩检查点";
        readonly en: "compaction";
    };
    readonly 'tree-kind-interrupt': {
        readonly zh: "中断";
        readonly en: "interrupt";
    };
    readonly 'tree-kind-notice': {
        readonly zh: "通知";
        readonly en: "notice";
    };
    readonly 'tree-empty-fork': {
        readonly zh: "（空分叉）";
        readonly en: "(empty fork)";
    };
    readonly 'tree-unreadable': {
        readonly zh: "（日志无法读取）";
        readonly en: "(unreadable log)";
    };
    readonly 'tree-unloaded': {
        readonly zh: "（超出预算未加载）";
        readonly en: "(not loaded — over budget)";
    };
    readonly 'tree-first-message': {
        readonly zh: "不能回退到第一条消息之前";
        readonly en: "Cannot rewind past the very first message";
    };
    readonly 'tree-adopt-live': {
        readonly zh: "当前会话就在这条分支上";
        readonly en: "The live session is already on this branch";
    };
    readonly 'tree-adopt-unavailable': {
        readonly zh: "该分支无法整体切换（未加载到末端）";
        readonly en: "Cannot adopt this branch (its tip was not loaded)";
    };
    readonly 'tree-menu-rewind': {
        readonly zh: "回退到这里";
        readonly en: "Rewind here";
    };
    readonly 'tree-menu-rewind-detail': {
        readonly zh: "丢弃该轮对话，提示词回到输入框";
        readonly en: "Drops that turn; its prompt returns to the input";
    };
    readonly 'tree-menu-fork': {
        readonly zh: "从这分叉";
        readonly en: "Fork here";
    };
    readonly 'tree-menu-fork-detail': {
        readonly zh: "保留这条消息，从这里开新分支";
        readonly en: "Keeps this entry and branches here";
    };
    readonly 'tree-menu-adopt': {
        readonly zh: "切换到该分支";
        readonly en: "Adopt this branch";
    };
    readonly 'tree-menu-adopt-detail': {
        readonly zh: "保留整条分支并切换过去";
        readonly en: "Switches to the whole branch, content kept";
    };
    readonly 'tree-menu-cancel': {
        readonly zh: "取消";
        readonly en: "Cancel";
    };
    readonly 'tree-confirm-rewind': {
        readonly zh: "回退到「{{text}}」？";
        readonly en: "Rewind to \"{{text}}\"?";
    };
    readonly 'tree-confirm-drop': {
        readonly zh: "回退到「{{text}}」？该轮 {{n}} 条消息将丢弃";
        readonly en: "Rewind to \"{{text}}\"? Drops that turn ({{n}} entries)";
    };
    readonly 'tree-confirm-adopt': {
        readonly zh: "切换到「{{text}}」所在分支？";
        readonly en: "Switch to the branch of \"{{text}}\"?";
    };
    readonly 'tree-confirm-drops-branch': {
        readonly zh: "注意：该分支的全部内容都在这一轮里，回退后将看不到它们";
        readonly en: "Heads-up: this branch’s whole content is that one turn — it disappears from the fork";
    };
    readonly 'tree-hint': {
        readonly zh: "**Enter** 菜单 · **{{mod}}F** 从这分叉 · **{{mod}}B** 切到分支 · **{{mod}}O** 过滤 · 点击行出菜单 · 输入搜索 · Esc 退出";
        readonly en: "**Enter** menu · **{{mod}}F** fork here · **{{mod}}B** adopt branch · **{{mod}}O** filter · click a row for the menu · type to search · Esc exits";
    };
    readonly 'tree-hint-short': {
        readonly zh: "**Enter** 菜单 · 点击行出菜单 · Esc 退出";
        readonly en: "**Enter** menu · click a row · Esc exits";
    };
    readonly 'tree-hint-menu': {
        readonly zh: "**↑↓** 选择 · **Enter** 执行 · 首字母直达 · Esc 返回";
        readonly en: "**↑↓** move · **Enter** run · letter keys jump · Esc back";
    };
    readonly 'tree-hint-confirm': {
        readonly zh: "**Enter** 确认 · Esc 取消";
        readonly en: "**Enter** to confirm · Esc to cancel";
    };
    readonly 'tree-refused': {
        readonly zh: "操作未执行（原因已记录到会话通知）";
        readonly en: "Not executed — the reason was notified to the conversation";
    };
    readonly 'tree-rewind-failed': {
        readonly zh: "操作失败 · {{message}}";
        readonly en: "Action failed · {{message}}";
    };
    readonly 'tree-rewound': {
        readonly zh: "已回退——编辑后重新发送";
        readonly en: "Earlier turn restored — edit your message to continue";
    };
    readonly 'tree-forked': {
        readonly zh: "已从此处分叉";
        readonly en: "Forked from this point";
    };
    readonly 'tree-adopted': {
        readonly zh: "已切换到该分支";
        readonly en: "Switched to that branch";
    };
    readonly 'tree-preview-title': {
        readonly zh: "预览";
        readonly en: "Preview";
    };
    readonly 'tree-branch-live': {
        readonly zh: "当前会话";
        readonly en: "live session";
    };
    readonly 'resume-while-working': {
        readonly zh: "回合运行中，无法恢复会话";
        readonly en: "Cannot resume while a turn is running";
    };
    readonly 'resume-unavailable': {
        readonly zh: "恢复不可用——agents 服务未加载";
        readonly en: "Resume unavailable — agents service not loaded";
    };
    readonly 'resume-session-occupied': {
        readonly zh: "该会话正被其他 TUI 终端占用（进程 {{pid}}），无法进入";
        readonly en: "Another TUI terminal holds this session (pid {{pid}}); cannot enter";
    };
    readonly 'resume-mount-busy': {
        readonly zh: "无法确认该会话是否被其他终端占用（占用检查正忙），请稍后重试";
        readonly en: "Could not confirm whether another terminal holds this session (the occupancy check is busy); retry in a moment";
    };
    readonly 'resume-mount-unavailable': {
        readonly zh: "无法验证该会话的占用状态 · {{detail}}";
        readonly en: "Could not verify this session's occupancy · {{detail}}";
    };
    readonly 'resume-mount-ledger-repair': {
        readonly zh: "该文件已损坏：无其他 dsh-tui 运行时删除它，会自动重建";
        readonly en: "Damaged: remove it with no other TUI running (it rebuilds)";
    };
    readonly 'session-mount-occupied-short': {
        readonly zh: "占用 pid {{pid}}";
        readonly en: "held by pid {{pid}}";
    };
    readonly 'resume-failed': {
        readonly zh: "恢复失败 · {{err}}";
        readonly en: "Resume failed · {{err}}";
    };
    readonly 'resume-owned-elsewhere': {
        readonly zh: "另一个 DSH 进程正在写入此会话。请先在该进程（如 dsh web）释放会话，再重试恢复；不要删除会话或锁文件。";
        readonly en: "Another DSH process is writing this session. Release it in that process (for example, dsh web), then retry resume. Do not delete the session or lock files.";
    };
    readonly 'resume-attach-failed': {
        readonly zh: "已恢复会话，但工作区挂载失败 · {{err}}";
        readonly en: "Session resumed, but workspace attachment failed · {{err}}";
    };
    readonly 'resume-session-changed': {
        readonly zh: "会话已切换，恢复已放弃";
        readonly en: "The session changed; the resume was dropped";
    };
    readonly 'new-session-while-working': {
        readonly zh: "回合运行中，无法新建会话";
        readonly en: "Cannot start a new session while a turn is running";
    };
    readonly 'new-session-unavailable': {
        readonly zh: "新建会话不可用——agents 服务未加载";
        readonly en: "New session unavailable — agents service not loaded";
    };
    readonly 'new-session-failed': {
        readonly zh: "新建会话失败 · {{err}}";
        readonly en: "New session failed · {{err}}";
    };
    readonly 'startup-not-ready': {
        readonly zh: "{{backend}} 还在启动——就绪后按 Enter 发送";
        readonly en: "{{backend}} is still starting — press Enter to send once it is ready";
    };
    readonly 'startup-open-failed': {
        readonly zh: "{{backend}} 会话没能打开：{{err}}";
        readonly en: "{{backend}} session failed to open: {{err}}";
    };
    readonly 'startup-open-failed-hint': {
        readonly zh: "/new 重试 · /kernel 切换内核 · /quit 退出";
        readonly en: "/new to retry · /kernel to switch kernel · /quit to exit";
    };
    readonly 'startup-compose-failed-hint': {
        readonly zh: "DSH 没能启动 · /kernel 切换内核 · /quit 退出";
        readonly en: "DSH did not start · /kernel to switch kernel · /quit to exit";
    };
    readonly 'startup-compose-failed-hint-log': {
        readonly zh: "启动日志：{{path}} · /kernel 切换内核 · /quit 退出";
        readonly en: "Startup log: {{path}} · /kernel to switch kernel · /quit to exit";
    };
    readonly 'status-starting': {
        readonly zh: "正在启动 {{backend}}…";
        readonly en: "Starting {{backend}}…";
    };
    readonly 'host-dsh-unavailable': {
        readonly zh: "没有用上已安装的 dsh：{{reason}}";
        readonly en: "Not using the installed dsh: {{reason}}";
    };
    readonly 'resume-raced': {
        readonly zh: "会话打开期间当前会话开始了新的回合，已取消恢复；该回合在当前会话中继续";
        readonly en: "The current session started a turn while the other one was opening — the resume was cancelled; the turn continues here";
    };
    readonly 'new-session-raced': {
        readonly zh: "新会话打开期间当前会话开始了新的回合，已取消 /new；该回合在当前会话中继续";
        readonly en: "The current session started a turn while the new one was opening — /new was cancelled; the turn continues here";
    };
    readonly 'new-session-attach-failed': {
        readonly zh: "会话已创建，但工作区挂载失败 · {{err}}";
        readonly en: "Session created, but workspace attachment failed · {{err}}";
    };
    readonly 'model-switch-while-working': {
        readonly zh: "回合运行中，无法切换模型";
        readonly en: "Cannot switch models while a turn is running";
    };
    readonly 'model-switch-legacy-unavailable': {
        readonly zh: "同会话切换模型需要 DSH >= 0.1.2-alpha.3，请先升级 DSH";
        readonly en: "Switching models within a session requires DSH >= 0.1.2-alpha.3; upgrade DSH first";
    };
    readonly 'model-switch-failed': {
        readonly zh: "模型切换失败 · {{err}}";
        readonly en: "Model switch failed · {{err}}";
    };
    readonly 'model-usage': {
        readonly zh: "用法：/model <provider/model>（如 deepseek/deepseek-flash）";
        readonly en: "Usage: /model <provider/model> (e.g. deepseek/deepseek-flash)";
    };
    readonly 'model-unknown': {
        readonly zh: "未知模型「{{spec}}」· /model 查看全部";
        readonly en: "Unknown model \"{{spec}}\" · /model to view all";
    };
    readonly 'compact-unavailable': {
        readonly zh: "压缩不可用——当前 leaf 没有压缩服务";
        readonly en: "Compaction unavailable · no compaction service in this leaf";
    };
    readonly 'compact-while-working': {
        readonly zh: "回合运行中，无法压缩会话";
        readonly en: "Cannot compact while a turn is running";
    };
    readonly 'compact-working': {
        readonly zh: "正在压缩会话…";
        readonly en: "Summarizing earlier turns…";
    };
    readonly 'compact-done': {
        readonly zh: "会话已压缩";
        readonly en: "Session summary is ready";
    };
    readonly 'compact-nothing': {
        readonly zh: "没有可压缩的内容";
        readonly en: "Nothing to compact";
    };
    readonly 'compact-failed': {
        readonly zh: "压缩失败 · {{err}}";
        readonly en: "Compaction failed · {{err}}";
    };
    readonly 'compact-flush-failed': {
        readonly zh: "压缩已生效，但落盘检查失败——历史已由摘要替代，请留意会话状态";
        readonly en: "Compaction took effect, but its durability flush failed — history is now the summary";
    };
    readonly 'compact-cancelled-switch': {
        readonly zh: "压缩进行中，已取消并切换会话";
        readonly en: "In-flight compaction cancelled for the session switch";
    };
    readonly 'compact-phase-prefill': {
        readonly zh: "读取上下文…";
        readonly en: "reading context…";
    };
    readonly 'compact-esc-cancel': {
        readonly zh: "Esc 取消";
        readonly en: "Esc cancels";
    };
    readonly 'compact-cancelled': {
        readonly zh: "压缩已取消";
        readonly en: "Compaction cancelled";
    };
    readonly 'compact-badge': {
        readonly zh: "压缩中";
        readonly en: "compacting";
    };
    readonly 'capability-unavailable': {
        readonly zh: "/{{name}} 在当前 agent 预设下不可用：{{reason}}";
        readonly en: "/{{name}} is unavailable under the active agent preset: {{reason}}";
    };
    readonly 'capability-reason-no-compaction': {
        readonly zh: "该预设没有挂载压缩服务（内核「极简模式」预设不含 compaction，官方 /compact 命令也依赖它）";
        readonly en: "the preset mounts no compaction service (the kernel Minimal preset omits compaction, and the official /compact command depends on it)";
    };
    readonly 'capability-reason-no-plan-command': {
        readonly zh: "该预设没有注册 /plan 命令（内核「极简模式」预设不含 plan-mode）";
        readonly en: "the preset registers no /plan command (the kernel Minimal preset omits plan mode)";
    };
    readonly 'capability-gap-compaction': {
        readonly zh: "当前 agent 预设没有压缩：长会话可能撞上下文上限，届时只能新开会话";
        readonly en: "The active agent preset has no compaction: a long session can hit the context limit and has to be restarted";
    };
    readonly 'capability-gap-pruner': {
        readonly zh: "当前 agent 预设不剪枝工具结果：超长工具输出会整段留在上下文里";
        readonly en: "The active agent preset does not prune tool results: oversized tool output stays in the context in full";
    };
    readonly 'capability-gap-compaction-pruner': {
        readonly zh: "当前 agent 预设既没有压缩也不剪枝工具结果：长会话可能撞上下文上限，超长工具输出也会整段留在上下文里";
        readonly en: "The active agent preset has neither compaction nor tool-result pruning: a long session can hit the context limit, and oversized tool output stays in the context in full";
    };
    readonly 'turn-failed': {
        readonly zh: "回合出错{{detail}}";
        readonly en: "Turn error{{detail}}";
    };
    readonly 'prompt-debug-saved': {
        readonly zh: "已写入 {{count}} 条最终 LLM 请求快照到 {{file}}。快照含敏感会话与提示词数据；文件位于当前工作区，若工作区在同步/共享目录请注意清理。";
        readonly en: {
            readonly one: "Wrote 1 final LLM request snapshot to {{file}}. It contains sensitive conversation and prompt data, and lives in the current workspace — clean it up promptly if the workspace is synced or shared.";
            readonly other: "Wrote {{count}} final LLM request snapshots to {{file}}. It contains sensitive conversation and prompt data, and lives in the current workspace — clean it up promptly if the workspace is synced or shared.";
        };
    };
    readonly 'questionnaire-answered': {
        readonly zh: "📋 问卷已答 · {{total}} 题";
        readonly en: "📋 Questionnaire answered · {{total}} questions";
    };
    readonly 'command-output-truncated': {
        readonly zh: "…（命令输出已截断：最多 200 行、65536 个 UTF-16 码元、每行 4000 显示单元）";
        readonly en: "… (command output truncated: 200 lines, 65536 UTF-16 code units, 4000 cells per line)";
    };
    readonly 'context-truncated': {
        readonly zh: "…（已截断）";
        readonly en: "… (truncated)";
    };
    readonly 'context-sections': {
        readonly zh: "系统提示词 {{n}} 段";
        readonly en: "System prompt {{n}} sections";
    };
    readonly 'context-files': {
        readonly zh: "工作区指令 ×{{n}}";
        readonly en: "Workspace instructions ×{{n}}";
    };
    readonly 'context-runtime': {
        readonly zh: "运行时上下文 {{n}} 项";
        readonly en: "Runtime context {{n}} items";
    };
    readonly 'context-skills': {
        readonly zh: "技能 {{n}}";
        readonly en: "Skills {{n}}";
    };
    readonly 'context-tools': {
        readonly zh: "工具 {{n}}";
        readonly en: "Tools {{n}}";
    };
    readonly 'skill-unavailable': {
        readonly zh: "技能 {{name}} 已不可用或未开放用户直调";
        readonly en: "Skill {{name}} is gone or not user-invocable";
    };
    readonly 'context-loaded': {
        readonly zh: "已加载上下文";
        readonly en: "Context loaded";
    };
    readonly 'context-panel-expand': {
        readonly zh: " 展开";
        readonly en: " to expand";
    };
    readonly 'context-panel-collapse': {
        readonly zh: " 折叠";
        readonly en: " to collapse";
    };
    readonly 'copied-chars': {
        readonly zh: "已复制 {{n}} 个字符";
        readonly en: "Copied {{n}} characters";
    };
    readonly 'copy-refused-stale': {
        readonly zh: "选区内容已变化，已取消复制";
        readonly en: "Content under the selection changed; copy cancelled";
    };
    readonly 'migrate-failed': {
        readonly zh: "{{n}} 个源导入失败，详见输出";
        readonly en: "{{n}} source(s) failed — see the output";
    };
    readonly 'migrate-spawn-failed': {
        readonly zh: "无法启动迁移子进程（找不到本包 bin）";
        readonly en: "Could not start the migration child process (package bin not found)";
    };
    readonly 'migrate-child-timeout': {
        readonly zh: "（子进程超过 {{minutes}} 分钟未结束，已终止）";
        readonly en: "(the child ran past {{minutes}} minutes and was terminated)";
    };
    readonly 'migrate-usage': {
        readonly zh: "一次只能迁移一个源：/migrate <agent> [--dry-run]";
        readonly en: "One source per run: /migrate <agent> [--dry-run]";
    };
    readonly 'migrate-dry-run-needs-source': {
        readonly zh: "请指明要预览的源：/migrate <agent> --dry-run";
        readonly en: "Name the source to preview: /migrate <agent> --dry-run";
    };
    readonly 'picker-title-migrate': {
        readonly zh: "迁移哪个代理的对话？";
        readonly en: "Import conversations from which agent?";
    };
    readonly 'migrate-picker-empty': {
        readonly zh: "没有可用的迁移源";
        readonly en: "No migration sources available";
    };
    readonly 'migrate-picker-scanning': {
        readonly zh: "正在扫描各源…";
        readonly en: "Scanning sources…";
    };
    readonly 'migrate-picker-recent': {
        readonly zh: "{{minutes}} 分钟前刚活动过";
        readonly en: "active {{minutes}} min ago";
    };
    readonly 'migrate-picker-cold': {
        readonly zh: "最近未活动";
        readonly en: "not active recently";
    };
    readonly 'migrate-picker-count': {
        readonly zh: "{{n}} 个会话文件";
        readonly en: "{{n}} session files";
    };
    readonly 'migrate-hint-notify': {
        readonly zh: "刚刚从 {{agent}} 过来？/migrate 来快速迁移";
        readonly en: "Just came from {{agent}}? /migrate imports it quickly";
    };
    readonly 'migrate-picker-hint': {
        readonly zh: "空格 勾选 · a 全选/全不选 · Enter 确认 · Esc 关闭";
        readonly en: "Space toggle · a all/none · Enter confirm · Esc close";
    };
    readonly 'migrate-confirm-title': {
        readonly zh: "确认导入";
        readonly en: "Confirm import";
    };
    readonly 'migrate-confirm-line': {
        readonly zh: "{{label}}：将导入 {{n}} 个会话文件";
        readonly en: "{{label}}: {{n}} session files to import";
    };
    readonly 'migrate-confirm-note': {
        readonly zh: "已存在的自动跳过，可重复执行";
        readonly en: "Existing sessions are skipped automatically; safe to re-run";
    };
    readonly 'migrate-confirm-actions': {
        readonly zh: "Enter 导入 · d 干跑预览 · Esc 返回选择";
        readonly en: "Enter import · d dry-run · Esc back";
    };
    readonly 'migrate-importing-source': {
        readonly zh: "正在导入 {{label}}（{{i}}/{{n}}）…";
        readonly en: "Importing {{label}} ({{i}}/{{n}})…";
    };
    readonly 'migrate-previewing-source': {
        readonly zh: "正在预览 {{label}}（{{i}}/{{n}}）…";
        readonly en: "Previewing {{label}} ({{i}}/{{n}})…";
    };
    readonly 'migrate-source-done': {
        readonly zh: "{{label}}：导入 {{imported}} · 已存在 {{existing}}";
        readonly en: "{{label}}: imported {{imported}} · already present {{existing}}";
    };
    readonly 'migrate-all-done': {
        readonly zh: "迁移完成（{{n}} 个源）";
        readonly en: "Migration finished ({{n}} source(s))";
    };
    readonly 'migrate-all-previewed': {
        readonly zh: "预览完成（{{n}} 个源，未写入）";
        readonly en: "Preview finished ({{n}} source(s), nothing written)";
    };
    readonly 'migrate-unknown-agent': {
        readonly zh: "未知迁移源 {{agent}}，可用源见 /migrate";
        readonly en: "Unknown migration source {{agent}}; see /migrate for the list";
    };
    readonly 'activity-current-preset': {
        readonly zh: "当前预设  {{name}}";
        readonly en: "Current preset  {{name}}";
    };
    readonly 'activity-switch-hint': {
        readonly zh: "切换      /activity（选择器）或 /activity frames <名>";
        readonly en: "Switch      /activity (picker) or /activity frames <name>";
    };
    readonly 'activity-persist-hint': {
        readonly zh: "持久化    ~/.dsh-tui/working-activity.json（重启后仍生效）";
        readonly en: "Persisted    ~/.dsh-tui/working-activity.json (survives restart)";
    };
    readonly 'activity-current-direct': {
        readonly zh: "当前预设：{{name}} · /activity frames <名> 直接切换：";
        readonly en: "Current preset: {{name}} · /activity frames <name> to switch directly:";
    };
    readonly 'activity-random-each': {
        readonly zh: "每次随机";
        readonly en: "random each time";
    };
    readonly 'activity-current-marker': {
        readonly zh: "  ← 当前";
        readonly en: "  ← current";
    };
    readonly 'activity-usage': {
        readonly zh: "用法：/activity | /activity frames <名> | /activity status";
        readonly en: "Usage: /activity | /activity frames <name> | /activity status";
    };
    readonly 'preset-current': {
        readonly zh: "当前 preset  {{name}}";
        readonly en: "Current preset  {{name}}";
    };
    readonly 'preset-roster-missing': {
        readonly zh: "（未挂载名册）";
        readonly en: "(roster not mounted)";
    };
    readonly 'preset-switch-hint': {
        readonly zh: "切换        /preset（选择器）或 /preset <id>";
        readonly en: "Switch        /preset (picker) or /preset <id>";
    };
    readonly 'preset-persist-hint': {
        readonly zh: "持久化      ~/.dsh-tui/agent-preset.json（重启后仍生效；cordis.yml preset 优先）";
        readonly en: "Persisted      ~/.dsh-tui/agent-preset.json (survives restart; cordis.yml preset wins)";
    };
    readonly 'preset-lock-hint': {
        readonly zh: "锁定规则    已开始的会话不可切换（官方 blank-only 规则）";
        readonly en: "Lock rule     started sessions cannot switch (official blank-only rule)";
    };
    readonly 'preset-roster-unmounted': {
        readonly zh: "当前组合未挂载 agent-presets 名册（preset 不可用）";
        readonly en: "The agent-presets roster is not mounted (presets unavailable)";
    };
    readonly 'theme-current': {
        readonly zh: "当前主题  {{name}}";
        readonly en: "Current theme  {{name}}";
    };
    readonly 'theme-switch-hint': {
        readonly zh: "切换      /theme（选择器）或 /theme <名字>";
        readonly en: "Switch      /theme (picker) or /theme <name>";
    };
    readonly 'theme-persist-hint': {
        readonly zh: "持久化    ~/.dsh-tui/theme.json（重启后仍生效；DSH_TUI_THEME 优先）";
        readonly en: "Persisted    ~/.dsh-tui/theme.json (survives restart; DSH_TUI_THEME wins)";
    };
    readonly 'theme-custom-hint': {
        readonly zh: "自定义    静态 ~/.dsh-tui/themes/<名字>.json（插件也可提供运行时主题；见 README「自定义主题」）";
        readonly en: "Custom      static ~/.dsh-tui/themes/<name>.json (plugins may also provide runtime themes; see README \"Custom themes\")";
    };
    readonly 'theme-auto-resolved': {
        readonly zh: "自动解析  当前为 {{name}}（跟随终端背景）";
        readonly en: "Auto-resolved  currently {{name}} (follows terminal background)";
    };
    readonly 'theme-switched-saved': {
        readonly zh: "主题已切换：{{name}}（已保存）";
        readonly en: "Theme switched: {{name}} (saved)";
    };
    readonly 'theme-unknown': {
        readonly zh: "未知主题「{{name}}」· /theme 查看全部";
        readonly en: "Unknown theme \"{{name}}\" · /theme to view all";
    };
    readonly 'status-model': {
        readonly zh: "模型   {{model}}";
        readonly en: "Model   {{model}}";
    };
    readonly 'status-working': {
        readonly zh: "工作中";
        readonly en: "working";
    };
    readonly 'status-idle': {
        readonly zh: "空闲";
        readonly en: "idle";
    };
    readonly 'program-status-approval': {
        readonly zh: "等待授权：{{tool}}";
        readonly en: "Approval needed: {{tool}}";
    };
    readonly 'program-status-question': {
        readonly zh: "等待回答：{{question}}";
        readonly en: "Waiting for your answer: {{question}}";
    };
    readonly 'program-status-dialog': {
        readonly zh: "等待输入：{{title}}";
        readonly en: "Waiting for input: {{title}}";
    };
    readonly 'status-state': {
        readonly zh: "状态   {{state}}";
        readonly en: "Status   {{state}}";
    };
    readonly 'status-session': {
        readonly zh: "会话   {{id}}";
        readonly en: "Session   {{id}}";
    };
    readonly 'status-dir': {
        readonly zh: "目录   {{cwd}}";
        readonly en: "Directory   {{cwd}}";
    };
    readonly 'workspace-picker-title': {
        readonly zh: "工作区";
        readonly en: "Workspace";
    };
    readonly 'workspace-picker-hint': {
        readonly zh: "**Enter** 切换并新建会话 · Esc 退出 · 也可输入 /workspace open <路径或 URI>";
        readonly en: "**Enter** switch and start a new session · Esc to exit · or type /workspace open <path-or-URI>";
    };
    readonly 'workspace-none': {
        readonly zh: "没有可用工作区";
        readonly en: "No workspaces available";
    };
    readonly 'workspace-list-failed': {
        readonly zh: "读取工作区失败 · {{err}}";
        readonly en: "Failed to list workspaces · {{err}}";
    };
    readonly 'workspace-uri-invalid': {
        readonly zh: "无法解析工作区目标：{{uri}}";
        readonly en: "Cannot resolve workspace target: {{uri}}";
    };
    readonly 'workspace-uri-failed': {
        readonly zh: "加载工作区失败 · {{err}}";
        readonly en: "Failed to load workspace · {{err}}";
    };
    readonly 'workspace-switch-working': {
        readonly zh: "Agent 运行中，无法切换工作区";
        readonly en: "Cannot switch workspaces while the agent is running";
    };
    readonly 'workspace-open-invalid': {
        readonly zh: "无法打开工作区：{{target}} 不是存在的目录";
        readonly en: "Cannot open workspace: {{target}} is not an existing directory";
    };
    readonly 'workspace-switched': {
        readonly zh: "已切换工作区：{{target}}";
        readonly en: "Workspace switched: {{target}}";
    };
    readonly 'workspace-flow-hint': {
        readonly zh: "**Enter** 选择 · Esc 退出";
        readonly en: "**Enter** select · Esc to exit";
    };
    readonly 'workspace-flow-edit-hint': {
        readonly zh: "**Enter** 选择当前目录 · Tab 手动输入路径 · Esc 退出";
        readonly en: "**Enter** select current directory · Tab enter a path · Esc to exit";
    };
    readonly 'workspace-flow-input-hint': {
        readonly zh: "输入绝对路径 · **Enter** 读取目录 · Esc 返回";
        readonly en: "Enter an absolute path · **Enter** load directory · Esc back";
    };
    readonly 'workspace-flow-input-empty': {
        readonly zh: "目录路径不能为空";
        readonly en: "Directory path cannot be empty";
    };
    readonly 'workspace-flow-loading': {
        readonly zh: "正在连接并读取目录… · Esc 关闭";
        readonly en: "Connecting and loading directories… · Esc to close";
    };
    readonly 'workspace-menu-title': {
        readonly zh: "Workspace 操作";
        readonly en: "Workspace actions";
    };
    readonly 'workspace-menu-resume-desc': {
        readonly zh: "切换到另一个工作区";
        readonly en: "Switch to another workspace";
    };
    readonly 'workspace-menu-rename-desc': {
        readonly zh: "重命名当前工作区（需输入名称）";
        readonly en: "Rename the current workspace (needs a name)";
    };
    readonly 'workspace-menu-open-desc': {
        readonly zh: "打开路径或工作区 URI（需输入路径）";
        readonly en: "Open a path or workspace URI (needs a path)";
    };
    readonly 'workspace-open-usage': {
        readonly zh: "用法：/workspace open <路径或 URI>";
        readonly en: "Usage: /workspace open <path-or-URI>";
    };
    readonly 'workspace-rename-usage': {
        readonly zh: "用法：/workspace rename <名称>";
        readonly en: "Usage: /workspace rename <name>";
    };
    readonly 'workspace-command-unknown': {
        readonly zh: "未知的 workspace 子命令：{{command}}";
        readonly en: "Unknown workspace subcommand: {{command}}";
    };
    readonly 'workspace-command-empty': {
        readonly zh: "该 workspace 操作没有可选目标";
        readonly en: "This workspace action has no available targets";
    };
    readonly 'workspace-command-failed': {
        readonly zh: "workspace 操作失败 · {{err}}";
        readonly en: "Workspace action failed · {{err}}";
    };
    readonly 'workspace-renamed': {
        readonly zh: "工作区已重命名：{{title}}";
        readonly en: "Workspace renamed: {{title}}";
    };
    readonly 'workspace-rename-failed': {
        readonly zh: "工作区重命名失败 · {{err}}";
        readonly en: "Failed to rename workspace · {{err}}";
    };
    readonly 'workspace-removed': {
        readonly zh: "已从工作区列表移除：{{target}}（会话与目录保留）";
        readonly en: "Removed from the workspace list: {{target}} (sessions and directory kept)";
    };
    readonly 'workspace-remove-unknown': {
        readonly zh: "工作区列表中没有：{{target}}";
        readonly en: "Not in the workspace list: {{target}}";
    };
    readonly 'workspace-remove-failed': {
        readonly zh: "移除工作区失败 · {{err}}";
        readonly en: "Failed to remove the workspace · {{err}}";
    };
    readonly 'home-section-workspaces': {
        readonly zh: "工作区（{{n}}）";
        readonly en: "Workspaces ({{n}})";
    };
    readonly 'home-add-workspace': {
        readonly zh: "添加工作区";
        readonly en: "Add workspace";
    };
    readonly 'home-add-hint': {
        readonly zh: "选择目录并加入列表";
        readonly en: "Pick a directory and add it to the list";
    };
    readonly 'home-workspace-missing': {
        readonly zh: "目录不存在";
        readonly en: "directory missing";
    };
    readonly 'home-no-workspaces': {
        readonly zh: "还没有工作区 · 在任意目录启动 dsh-tui 即可自动加入";
        readonly en: "No workspaces yet · start dsh-tui in a directory to add it";
    };
    readonly 'home-sessions-title': {
        readonly zh: "{{name}} 的会话";
        readonly en: "Sessions in {{name}}";
    };
    readonly 'home-no-sessions': {
        readonly zh: "这个工作区还没有会话 · Enter 新建一个";
        readonly en: "No sessions in this workspace yet · Enter starts one";
    };
    readonly 'home-sessions-loading': {
        readonly zh: "正在读取会话…";
        readonly en: "Loading sessions…";
    };
    readonly 'home-sessions-refreshing': {
        readonly zh: "后台刷新中";
        readonly en: "refreshing";
    };
    readonly 'home-sessions-failed': {
        readonly zh: "读取会话失败 · {{err}}";
        readonly en: "Failed to load sessions · {{err}}";
    };
    readonly 'home-hint-list': {
        readonly zh: "**←/→** 切换栏位 · **↑/↓** 选择 · **Enter** 编辑 · Ctrl+N 新建 · Esc 进入会话";
        readonly en: "**←/→** switch pane · **↑/↓** move · **Enter** edit · Ctrl+N new · Esc enter the session";
    };
    readonly 'home-hint-menu': {
        readonly zh: "**↑/↓** 选择 · **Enter** 确认 · Esc 关闭";
        readonly en: "**↑/↓** move · **Enter** confirm · Esc close";
    };
    readonly 'home-hint-rename': {
        readonly zh: "输入新名称 · **Enter** 保存 · Esc 取消";
        readonly en: "Type a new name · **Enter** save · Esc cancel";
    };
    readonly 'home-hint-confirm-remove': {
        readonly zh: "**Enter** 确认移除 · Esc 取消";
        readonly en: "**Enter** confirm removal · Esc cancel";
    };
    readonly 'home-menu-edit': {
        readonly zh: "编辑";
        readonly en: "Edit";
    };
    readonly 'home-menu-new': {
        readonly zh: "在此新建会话";
        readonly en: "New session here";
    };
    readonly 'home-menu-rename': {
        readonly zh: "重命名工作区";
        readonly en: "Rename workspace";
    };
    readonly 'home-menu-remove': {
        readonly zh: "从列表移除";
        readonly en: "Remove from list";
    };
    readonly 'home-rename-placeholder': {
        readonly zh: "新名称";
        readonly en: "New name";
    };
    readonly 'home-rename-empty': {
        readonly zh: "名称不能为空";
        readonly en: "The name cannot be empty";
    };
    readonly 'home-rename-failed': {
        readonly zh: "重命名失败 · {{err}}";
        readonly en: "Rename failed · {{err}}";
    };
    readonly 'home-remove-title': {
        readonly zh: "移除工作区「{{name}}」？";
        readonly en: "Remove workspace \"{{name}}\"?";
    };
    readonly 'home-remove-detail': {
        readonly zh: "只从列表移除，会话记录与磁盘目录都会保留";
        readonly en: "Only the list entry goes away; sessions and the directory stay";
    };
    readonly 'supervisor-title': {
        readonly zh: "会话管理";
        readonly en: "Sessions";
    };
    readonly 'supervisor-unregistered': {
        readonly zh: "未登记的工作区";
        readonly en: "Unregistered";
    };
    readonly 'supervisor-history-only': {
        readonly zh: "仅历史";
        readonly en: "History only";
    };
    readonly 'supervisor-workspace-groups': {
        readonly zh: "工作区 {{registered}} · 历史目录 {{history}}";
        readonly en: "Workspaces {{registered}} · History {{history}}";
    };
    readonly 'supervisor-workspace-removed': {
        readonly zh: "工作区登记已移除；目录与历史会话仍保留";
        readonly en: "Workspace registration removed; directory and past sessions remain";
    };
    readonly 'supervisor-no-matches': {
        readonly zh: "没有匹配的会话 · Esc 清空筛选";
        readonly en: "No sessions match · Esc clears the filter";
    };
    readonly 'supervisor-subtitle': {
        readonly zh: "本终端托管多个会话 · 切换不中断";
        readonly en: "This terminal hosts several sessions · switching does not stop them";
    };
    readonly 'supervisor-filter-placeholder': {
        readonly zh: "输入以搜索会话…";
        readonly en: "Type to search sessions…";
    };
    readonly 'supervisor-hint-list': {
        readonly zh: "**←/→** 切换栏位 · **Enter** 进入会话 · Ctrl+N 新建 · Ctrl+X 停止 · Esc 返回";
        readonly en: "**←/→** switch pane · **Enter** enter · Ctrl+N new · Ctrl+X stop · Esc back";
    };
    readonly 'supervisor-hint-filter': {
        readonly zh: "输入过滤会话 · **Enter** 进入 · Esc 清空";
        readonly en: "Type to filter · **Enter** enter · Esc clears";
    };
    readonly 'supervisor-occupied': {
        readonly zh: "被其他 TUI 终端占用（pid {{pid}}），无法进入";
        readonly en: "Held by another TUI terminal (pid {{pid}}) — cannot enter";
    };
    readonly 'supervisor-occupied-badge': {
        readonly zh: "占用 pid {{pid}}";
        readonly en: "held by pid {{pid}}";
    };
    readonly 'supervisor-current': {
        readonly zh: "当前";
        readonly en: "current";
    };
    readonly 'supervisor-counts': {
        readonly zh: "{{working}} 运行中 · {{live}} 个活跃 · 共 {{total}}";
        readonly en: "{{working}} working · {{live}} live · {{total}} total";
    };
    readonly 'supervisor-new-session': {
        readonly zh: "＋ 新建会话";
        readonly en: "+ New session";
    };
    readonly 'supervisor-new-session-hint': {
        readonly zh: "在「{{name}}」新建一个会话";
        readonly en: "Start a session in \"{{name}}\"";
    };
    readonly 'supervisor-stopped': {
        readonly zh: "已停止会话「{{name}}」";
        readonly en: "Stopped session {{name}}";
    };
    readonly 'supervisor-stop-failed': {
        readonly zh: "无法停止该会话";
        readonly en: "Could not stop that session";
    };
    readonly 'supervisor-stop-current': {
        readonly zh: "不能停止当前正在使用的会话";
        readonly en: "The session you are attached to cannot be stopped";
    };
    readonly 'supervisor-open-failed': {
        readonly zh: "无法进入会话「{{name}}」· {{reason}}";
        readonly en: "Could not enter {{name}} · {{reason}}";
    };
    readonly 'supervisor-hint-list-backend': {
        readonly zh: "**←/→** 切换栏位 · **Enter** 进入会话 · Ctrl+R 重命名 · Ctrl+D 删除 · Esc 返回";
        readonly en: "**←/→** switch pane · **Enter** enter · Ctrl+R rename · Ctrl+D delete · Esc back";
    };
    readonly 'supervisor-hint-list-archive': {
        readonly zh: "**←/→** 切换栏位 · **Enter** 进入会话 · Ctrl+R 重命名 · Ctrl+D 归档 · Esc 返回";
        readonly en: "**←/→** switch pane · **Enter** enter · Ctrl+R rename · Ctrl+D archive · Esc back";
    };
    readonly 'supervisor-archive-confirm': {
        readonly zh: "归档会话「{{name}}」？原生对话记录保留 · **Enter** 确认 · Esc 取消";
        readonly en: "Archive session {{name}}? The native transcript is kept · **Enter** confirm · Esc cancel";
    };
    readonly 'supervisor-archive-current': {
        readonly zh: "不能归档当前正在使用的会话";
        readonly en: "The session you are attached to cannot be archived";
    };
    readonly 'supervisor-archive-failed': {
        readonly zh: "无法归档会话「{{name}}」";
        readonly en: "Could not archive {{name}}";
    };
    readonly 'supervisor-archived': {
        readonly zh: "已归档会话「{{name}}」";
        readonly en: "Archived session {{name}}";
    };
    readonly 'supervisor-hint-session-rename': {
        readonly zh: "输入新标题 · **Enter** 保存 · Esc 取消";
        readonly en: "Type a new title · **Enter** save · Esc cancel";
    };
    readonly 'supervisor-delete-confirm': {
        readonly zh: "删除会话「{{name}}」？对话记录会从磁盘移除 · **Enter** 确认 · Esc 取消";
        readonly en: "Delete session {{name}}? Its transcript is removed from disk · **Enter** confirm · Esc cancel";
    };
    readonly 'supervisor-delete-current': {
        readonly zh: "不能删除当前正在使用的会话";
        readonly en: "The session you are attached to cannot be deleted";
    };
    readonly 'supervisor-delete-failed': {
        readonly zh: "无法删除会话「{{name}}」";
        readonly en: "Could not delete {{name}}";
    };
    readonly 'supervisor-deleted': {
        readonly zh: "已删除会话「{{name}}」";
        readonly en: "Deleted session {{name}}";
    };
    readonly 'supervisor-hint-tabs': {
        readonly zh: "**Tab** 切换来源";
        readonly en: "**Tab** switch source";
    };
    readonly 'supervisor-foreign-sessions-title': {
        readonly zh: "{{source}} · {{name}} 的会话";
        readonly en: "{{source}} · sessions in {{name}}";
    };
    readonly 'supervisor-foreign-count': {
        readonly zh: "共 {{total}}";
        readonly en: "{{total}} total";
    };
    readonly 'supervisor-foreign-filter-placeholder': {
        readonly zh: "输入以按标题或目录搜索…";
        readonly en: "Type to search by title or directory…";
    };
    readonly 'supervisor-foreign-loading': {
        readonly zh: "正在读取 {{source}} 的会话…";
        readonly en: "Reading {{source}} sessions…";
    };
    readonly 'supervisor-foreign-empty': {
        readonly zh: "{{source}} 里没有可导入的会话";
        readonly en: "No importable sessions in {{source}}";
    };
    readonly 'supervisor-foreign-unknown-cwd': {
        readonly zh: "未知目录";
        readonly en: "Unknown directory";
    };
    readonly 'supervisor-foreign-hint-rail': {
        readonly zh: "**←/→** 切换栏位 · **↑/↓** 选择 · **Tab** 切换来源 · Esc 返回";
        readonly en: "**←/→** switch pane · **↑/↓** move · **Tab** switch source · Esc back";
    };
    readonly 'supervisor-foreign-hint-list': {
        readonly zh: "**←/→** 切换栏位 · **Enter** 导入并打开 · **Tab** 切换来源 · Ctrl+L 重新扫描 · Esc 返回";
        readonly en: "**←/→** switch pane · **Enter** import and open · **Tab** switch source · Ctrl+L rescan · Esc back";
    };
    readonly 'supervisor-foreign-hint-filter': {
        readonly zh: "输入过滤会话 · **Enter** 导入并打开 · Esc 清空";
        readonly en: "Type to filter · **Enter** import and open · Esc clears";
    };
    readonly 'supervisor-foreign-importing': {
        readonly zh: "正在导入「{{name}}」…";
        readonly en: "Importing {{name}}…";
    };
    readonly 'supervisor-foreign-import-failed': {
        readonly zh: "导入失败 · {{err}}";
        readonly en: "Import failed · {{err}}";
    };
    readonly 'supervisor-foreign-scan-failed': {
        readonly zh: "读取外部会话失败 · {{err}}";
        readonly en: "Failed to read foreign sessions · {{err}}";
    };
    readonly 'supervisor-foreign-cwd-missing': {
        readonly zh: "该会话的工作目录已不存在，未导入：{{cwd}}";
        readonly en: "Not imported: its working directory no longer exists: {{cwd}}";
    };
    readonly 'supervisor-foreign-failed-missing': {
        readonly zh: "源文件已不存在";
        readonly en: "the source file is gone";
    };
    readonly 'supervisor-foreign-failed-too-large': {
        readonly zh: "源文件过大";
        readonly en: "the source file is too large";
    };
    readonly 'supervisor-foreign-failed-not-a-session': {
        readonly zh: "不是可导入的会话";
        readonly en: "not an importable session";
    };
    readonly 'supervisor-foreign-failed-write-failed': {
        readonly zh: "写入会话失败";
        readonly en: "writing the session failed";
    };
    readonly 'supervisor-foreign-failed-unknown-source': {
        readonly zh: "未知来源";
        readonly en: "unknown source";
    };
    readonly 'cost-cache-rate': {
        readonly zh: "本次请求缓存率 {{rate}}% · {{read}} 读 / {{write}} 写";
        readonly en: "Cache rate of this request: {{rate}}% · {{read}} read / {{write}} write";
    };
    readonly 'context-occupancy': {
        readonly zh: "上下文占用 {{percent}}%（{{used}}/{{window}}）";
        readonly en: "Context occupancy {{percent}}% ({{used}}/{{window}})";
    };
    readonly 'context-bar-used': {
        readonly zh: "已用";
        readonly en: "used";
    };
    readonly 'status-title': {
        readonly zh: "标题   {{title}}";
        readonly en: "Title   {{title}}";
    };
    readonly 'cost-cache-hit-rate': {
        readonly zh: "本次请求缓存命中率 {{rate}}% · 缓存 {{read}} 读 / {{write}} 写";
        readonly en: "Cache hit rate of this request: {{rate}}% · cache {{read}} read / {{write}} write";
    };
    readonly 'cost-note': {
        readonly zh: "注：以上为本地估算（官方单价 × 用量），非平台账单，以 DeepSeek 平台为准";
        readonly en: "Note: the above is a local estimate (official unit rates × usage), not a platform bill — the DeepSeek platform is authoritative";
    };
    readonly 'cost-note-no-amount': {
        readonly zh: "注：以上仅为 token 用量，暂无可估算金额（本会话暂无用量，或模型未收录/非官方）；估算仅供参考，以 DeepSeek 平台为准";
        readonly en: "Note: the above is token usage only; no amount can be estimated (no usage yet, or the model is unlisted/non-official). Estimates are for reference — the DeepSeek platform is authoritative";
    };
    readonly 'status-cost-label': {
        readonly zh: "≈";
        readonly en: "≈";
    };
    readonly 'status-cost-note': {
        readonly zh: "估算（官方单价，非账单）";
        readonly en: "estimate (official rates, not a bill)";
    };
    readonly 'cost-session-estimate': {
        readonly zh: "本会话估算 ≈¥{{cost}}";
        readonly en: "Session estimate ≈¥{{cost}}";
    };
    readonly 'cost-split-main': {
        readonly zh: "主会话 ¥{{cost}}";
        readonly en: "main ¥{{cost}}";
    };
    readonly 'cost-split-subagent': {
        readonly zh: "子代理 ¥{{cost}}";
        readonly en: "subagent ¥{{cost}}";
    };
    readonly 'cost-unpriced': {
        readonly zh: "未计价 {{tokens}} tok";
        readonly en: "unpriced {{tokens}} tok";
    };
    readonly 'cost-peak-name': {
        readonly zh: "梁文峰";
        readonly en: "peak";
    };
    readonly 'cost-idle-name': {
        readonly zh: "梁文谷";
        readonly en: "idle";
    };
    readonly 'cost-now-peak': {
        readonly zh: "峰";
        readonly en: "peak";
    };
    readonly 'cost-now-idle': {
        readonly zh: "谷";
        readonly en: "idle";
    };
    readonly 'balance-summary-loading': {
        readonly zh: "DeepSeek 余额 · 查询中…";
        readonly en: "DeepSeek balance · querying…";
    };
    readonly 'balance-summary-ok': {
        readonly zh: "DeepSeek 余额 ¥{{total}} · {{state}}";
        readonly en: "DeepSeek balance ¥{{total}} · {{state}}";
    };
    readonly 'balance-summary-state-ok': {
        readonly zh: "可用";
        readonly en: "available";
    };
    readonly 'balance-summary-state-off': {
        readonly zh: "不可用";
        readonly en: "unavailable";
    };
    readonly 'balance-summary-fail': {
        readonly zh: "DeepSeek 余额 · 查询失败";
        readonly en: "DeepSeek balance · query failed";
    };
    readonly 'balance-currency': {
        readonly zh: "{{currency}} 总额 ¥{{total}} · 赠送 ¥{{granted}} · 充值 ¥{{toppedUp}}";
        readonly en: "{{currency}} total ¥{{total}} · granted ¥{{granted}} · topped up ¥{{toppedUp}}";
    };
    readonly 'balance-no-key': {
        readonly zh: "未配置 DeepSeek API key（DEEPSEEK_API_KEY）";
        readonly en: "No DeepSeek API key configured (DEEPSEEK_API_KEY)";
    };
    readonly 'balance-unauthorized': {
        readonly zh: "认证失败——key 无效或已被撤销";
        readonly en: "Authentication failed — the key is invalid or revoked";
    };
    readonly 'balance-network-error': {
        readonly zh: "网络错误或请求超时";
        readonly en: "Network error or request timeout";
    };
    readonly 'balance-http-error': {
        readonly zh: "余额接口返回 HTTP {{status}}";
        readonly en: "Balance endpoint returned HTTP {{status}}";
    };
    readonly 'balance-invalid': {
        readonly zh: "余额接口响应格式异常";
        readonly en: "Unexpected balance endpoint response";
    };
    readonly 'balance-fail-hint': {
        readonly zh: "仅 DeepSeek 官方 API key 可查询；/login 可查看凭据状态";
        readonly en: "Only a DeepSeek official API key can be queried; /login shows credential status";
    };
    readonly 'balance-hover-tokens': {
        readonly zh: "本会话 tokens {{input}} in → {{output}} out · ≈¥{{cost}}（{{peakName}} ¥{{peak}} / {{idleName}} ¥{{idle}}）";
        readonly en: "Session tokens {{input}} in → {{output}} out · ≈¥{{cost}} ({{peakName}} ¥{{peak}} / {{idleName}} ¥{{idle}})";
    };
    readonly 'balance-current-rate': {
        readonly zh: "当前时段：{{name}} · 输入 ¥{{input}}/百万 · 输出 ¥{{output}}/百万";
        readonly en: "Current window: {{name}} · input ¥{{input}}/M · output ¥{{output}}/M";
    };
    readonly 'balance-refresh': {
        readonly zh: "点击刷新";
        readonly en: "click to refresh";
    };
    readonly 'balance-retry': {
        readonly zh: "点击重试";
        readonly en: "click to retry";
    };
    readonly 'balance-close': {
        readonly zh: "关闭";
        readonly en: "dismiss";
    };
    readonly 'balance-hint': {
        readonly zh: "余额查询免费 · 以 DeepSeek 平台为准";
        readonly en: "balance queries are free · authoritative on the DeepSeek platform";
    };
    readonly 'doctor-example-config': {
        readonly zh: "示例配置  {{path}}";
        readonly en: "Example config  {{path}}";
    };
    readonly 'doctor-user-config': {
        readonly zh: "用户配置  {{path}}";
        readonly en: "User config  {{path}}";
    };
    readonly 'doctor-launch-hint': {
        readonly zh: "启动方式  dsh-tui.cmd / dsh --profile dsh-tui";
        readonly en: "Launch      dsh-tui.cmd / dsh --profile dsh-tui";
    };
    readonly 'doctor-route-hint': {
        readonly zh: "模型路由  由 cordis.yml 的 llm-deepseek 段决定（/model 仅提示重启生效）";
        readonly en: "Model route  set by the llm-deepseek block in cordis.yml (/model only hints at restart)";
    };
    readonly 'export-failed': {
        readonly zh: "导出失败（无法写入工作目录）";
        readonly en: "Export failed (cannot write to working directory)";
    };
    readonly 'export-saved': {
        readonly zh: "已导出: {{target}}（文件位于当前工作区，若工作区在同步/共享目录请注意清理）";
        readonly en: "Exported: {{target}} (the file lives in the current workspace — clean it up promptly if the workspace is synced or shared)";
    };
    readonly 'agentsmd-create-failed': {
        readonly zh: "创建 AGENTS.md 失败";
        readonly en: "Failed to create AGENTS.md";
    };
    readonly 'agentsmd-exists': {
        readonly zh: "AGENTS.md 已存在，未覆盖";
        readonly en: "AGENTS.md already exists, not overwritten";
    };
    readonly 'agentsmd-created': {
        readonly zh: "已创建 {{result}}";
        readonly en: "Created {{result}}";
    };
    readonly 'login-api-key': {
        readonly zh: "API key: {{status}}";
        readonly en: "API key: {{status}}";
    };
    readonly 'login-key-configured': {
        readonly zh: "已配置（{{ref}}）";
        readonly en: "configured ({{ref}})";
    };
    readonly 'login-key-missing': {
        readonly zh: "未配置（DEEPSEEK_API_KEY）";
        readonly en: "not configured (DEEPSEEK_API_KEY)";
    };
    readonly 'login-credentials-unavailable': {
        readonly zh: "无法检查（credentials service 不可用）";
        readonly en: "unavailable (credentials service unavailable)";
    };
    readonly 'login-credential-source': {
        readonly zh: "凭据来源: {{source}}";
        readonly en: "Credential source: {{source}}";
    };
    readonly 'login-source-none': {
        readonly zh: "无";
        readonly en: "none";
    };
    readonly 'login-credential-storage': {
        readonly zh: "凭据存储: {{mode}}";
        readonly en: "Credential storage: {{mode}}";
    };
    readonly 'login-storage-writable': {
        readonly zh: "可写";
        readonly en: "writable";
    };
    readonly 'login-storage-read-only': {
        readonly zh: "只读";
        readonly en: "read-only";
    };
    readonly 'login-base-url': {
        readonly zh: "Base URL: {{url}}";
        readonly en: "Base URL: {{url}}";
    };
    readonly 'login-official-endpoint': {
        readonly zh: "官方端点";
        readonly en: "official endpoint";
    };
    readonly 'login-logout-hint': {
        readonly zh: "使用 /provider 管理 DSH 凭据；若来源为 env，请删除对应环境变量并重启 dsh-tui";
        readonly en: "Manage DSH credentials with /provider; for env sources, remove the corresponding environment variable and restart dsh-tui";
    };
    readonly 'login-oauth-heading': {
        readonly zh: "OAuth 账号:";
        readonly en: "OAuth accounts:";
    };
    readonly 'login-oauth-row': {
        readonly zh: "  {{provider}} — {{state}}";
        readonly en: "  {{provider}} — {{state}}";
    };
    readonly 'login-oauth-in': {
        readonly zh: "已登录 · 令牌到期 {{time}}";
        readonly en: "signed in · token expires {{time}}";
    };
    readonly 'login-oauth-in-no-expiry': {
        readonly zh: "已登录";
        readonly en: "signed in";
    };
    readonly 'login-oauth-expired': {
        readonly zh: "已登录但令牌已过期，重新登录可恢复";
        readonly en: "signed in but the token expired — sign in again to restore";
    };
    readonly 'login-oauth-signed-out': {
        readonly zh: "未登录";
        readonly en: "not signed in";
    };
    readonly 'login-oauth-hint': {
        readonly zh: "  登录/登出：/provider 账号登录，或 /auth login <provider>";
        readonly en: "  Sign in/out: /provider account sign-in, or /auth login <provider>";
    };
    readonly 'permission-policy-hint': {
        readonly zh: "DSH 权限策略由 fs-policy / bash-sandbox 配置决定（当前 leaf：workspace 内读写、写入需已读文件）。";
        readonly en: "DSH permission policy is set by fs-policy / bash-sandbox config (current leaf: read/write in workspace, writes need a prior read).";
    };
    readonly 'permission-approval-hint': {
        readonly zh: "审批通道已挂载：命令申请权限提升（sandbox_permissions）时弹出审批条，Yes 放行一次、No / Esc 拒绝。";
        readonly en: "The approval channel is mounted: sandbox escalations (sandbox_permissions) raise an approval bar — Yes allows once, No / Esc rejects.";
    };
    readonly 'permission-root-hint': {
        readonly zh: "当前文件系统策略以工作目录为根：{{cwd}}";
        readonly en: "Current filesystem policy is rooted at the working directory: {{cwd}}";
    };
    readonly 'permission-path-hint': {
        readonly zh: "模型工具相对路径均解析自该目录；跨目录访问由 fs-policy 拦截。";
        readonly en: "Relative paths of model tools resolve from this directory; cross-directory access is blocked by fs-policy.";
    };
    readonly 'permission-current': {
        readonly zh: "当前预设  {{name}}";
        readonly en: "Current preset  {{name}}";
    };
    readonly 'permission-roster-unavailable': {
        readonly zh: "权限预设名册不可用";
        readonly en: "Permission preset roster unavailable";
    };
    readonly 'permission-picker-title': {
        readonly zh: "权限预设";
        readonly en: "Permission preset";
    };
    readonly 'permission-mode-picker-title': {
        readonly zh: "权限模式";
        readonly en: "Permission mode";
    };
    readonly 'permission-mode-current': {
        readonly zh: "当前权限模式  {{name}}";
        readonly en: "Current permission mode  {{name}}";
    };
    readonly 'permission-mode-switch-hint': {
        readonly zh: "切换：/permission <模式>，或点击底栏模式段";
        readonly en: "Switch with /permission <mode>, or click the mode segment in the footer";
    };
    readonly 'permission-mode-unknown': {
        readonly zh: "没有这个权限模式：{{id}}";
        readonly en: "No such permission mode: {{id}}";
    };
    readonly 'permission-preset-readonly': {
        readonly zh: "只读";
        readonly en: "Read-only";
    };
    readonly 'permission-preset-readonly-desc': {
        readonly zh: "会话只读：不写文件、不执行命令";
        readonly en: "Read-only session: no file writes, no commands";
    };
    readonly 'permission-preset-workspace-write': {
        readonly zh: "工作区读写";
        readonly en: "Workspace read/write";
    };
    readonly 'permission-preset-workspace-write-desc': {
        readonly zh: "工作区内读写；写入需先读该文件";
        readonly en: "Read/write inside the workspace; writes need a prior read";
    };
    readonly 'permission-preset-full-access': {
        readonly zh: "完全访问";
        readonly en: "Full access";
    };
    readonly 'permission-preset-full-access-desc': {
        readonly zh: "不受限读写，无需审批";
        readonly en: "Unrestricted access, no approvals";
    };
    readonly 'permission-preset-auto': {
        readonly zh: "自动授权审查";
        readonly en: "Auto review";
    };
    readonly 'permission-preset-auto-desc': {
        readonly zh: "模型在每次工具调用前审查授权；无文件沙箱，仅当前会话";
        readonly en: "The model reviews every tool call before it runs; no file sandbox, this session only";
    };
    readonly 'permission-preset-exp-tag': {
        readonly zh: "EXP";
        readonly en: "EXP";
    };
    readonly 'permission-auto-confirm-title': {
        readonly zh: "启用自动授权审查（实验性）？";
        readonly en: "Enable Auto review (experimental)?";
    };
    readonly 'permission-auto-confirm-session': {
        readonly zh: "仅对当前会话生效，不会成为新会话的默认";
        readonly en: "Applies to this session only; never becomes the default for new sessions";
    };
    readonly 'permission-auto-confirm-sandbox': {
        readonly zh: "无文件沙箱：放行的调用拥有完全访问权限";
        readonly en: "No file sandbox: allowed calls run with full access";
    };
    readonly 'permission-auto-confirm-cost': {
        readonly zh: "每次工具调用都会额外发起一次模型审查请求";
        readonly en: "Every tool call costs one extra model review request";
    };
    readonly 'permission-auto-confirm-risk': {
        readonly zh: "审查放行的调用（含你已明确授权的中风险操作）直接执行；被拒的调用（含高风险）转为审批由你决定，子代理中直接拒绝；审查失败即不执行";
        readonly en: "Calls the review allows (including medium-risk ones you explicitly authorized) run without asking; denied calls, high-risk included, come to you as an approval, or are denied outright in subagents; a failed review never runs";
    };
    readonly 'permission-auto-confirm-actions': {
        readonly zh: "**Enter** 启用 · Esc 返回";
        readonly en: "**Enter** to enable · Esc to go back";
    };
    readonly 'permission-auto-confirm-enable': {
        readonly zh: "启用";
        readonly en: "Enable";
    };
    readonly 'permission-auto-confirm-back': {
        readonly zh: "返回";
        readonly en: "Go back";
    };
    readonly 'permission-auto-unavailable': {
        readonly zh: "自动授权审查已不可用";
        readonly en: "Auto review is no longer available";
    };
    readonly 'tool-error-auto-review-denied': {
        readonly zh: "自动授权审查拒绝，未执行";
        readonly en: "Auto review denied; not executed";
    };
    readonly 'plan-picker-title': {
        readonly zh: "计划模式";
        readonly en: "Plan mode";
    };
    readonly 'plan-mode-on': {
        readonly zh: "开启";
        readonly en: "On";
    };
    readonly 'plan-mode-on-desc': {
        readonly zh: "进入计划模式：只读，先规划后动手";
        readonly en: "Enter plan mode: read-only, plan before acting";
    };
    readonly 'plan-mode-off': {
        readonly zh: "关闭";
        readonly en: "Off";
    };
    readonly 'plan-mode-off-desc': {
        readonly zh: "退出计划模式，恢复正常执行";
        readonly en: "Exit plan mode, back to normal execution";
    };
    readonly 'hooks-not-mounted': {
        readonly zh: "DSH hooks（dsh-hooks-claude / dsh-hooks-codex）未在本 leaf 挂载。";
        readonly en: "DSH hooks (dsh-hooks-claude / dsh-hooks-codex) are not mounted in this leaf.";
    };
    readonly 'hooks-mount-hint': {
        readonly zh: "需要时可在 cordis.yml 挂载对应 hooks 插件。";
        readonly en: "Mount the matching hooks plugin in cordis.yml when needed.";
    };
    readonly 'update-unavailable': {
        readonly zh: "当前运行方式不支持自动更新（需经 dsh --profile 启动），请在终端执行 dsh plugin --profile <name> update @deepseek-harness-tui/dsh-tui";
        readonly en: "Automatic update is unavailable in this launch mode (needs dsh --profile). Run dsh plugin --profile <name> update @deepseek-harness-tui/dsh-tui in a terminal.";
    };
    readonly 'update-working': {
        readonly zh: "当前回合仍在运行，请等待完成后再更新 TUI。";
        readonly en: "The current turn is still running. Wait for it to finish before updating the TUI.";
    };
    readonly 'update-starting': {
        readonly zh: "正在更新 @deepseek-harness-tui/dsh-tui，完成后会自动重启并恢复当前会话……";
        readonly en: "Updating @deepseek-harness-tui/dsh-tui. The TUI will restart and resume this session when finished…";
    };
    readonly 'update-available': {
        readonly zh: "发现新版本：v{{latest}}（当前 v{{current}}）· 输入 /update 更新 TUI";
        readonly en: "New version available: v{{latest}} (current v{{current}}) · type /update to update the TUI";
    };
    readonly 'update-already-latest': {
        readonly zh: "当前已是最新版本（v{{current}}）。";
        readonly en: "Already on the latest version (v{{current}}).";
    };
    readonly 'update-check-failed': {
        readonly zh: "无法确认新版本（网络或 registry 不可达），已尝试直接更新……";
        readonly en: "Could not confirm a newer version (network or registry unreachable); attempting the update anyway…";
    };
    readonly 'update-refused-deadlock': {
        readonly zh: "已取消更新：镜像 registry 目前只能装到 v{{latest}}，而该版本在旧全局启动器的 patch 下会启动死锁（#183/#307）；官方最新为 v{{authoritative}}，待镜像同步后再 /update。";
        readonly en: "Update cancelled: the mirror registry can only serve v{{latest}}, which deadlocks boot under older global-launcher patches (#183/#307); official latest is v{{authoritative}} — retry /update after the mirror syncs.";
    };
    readonly 'update-mirror-lag': {
        readonly zh: "镜像 registry 滞后：本次安装 v{{latest}}；官方最新 v{{authoritative}}，镜像同步后可再 /update。";
        readonly en: "Mirror registry lag: installing v{{latest}} now; official latest is v{{authoritative}} — run /update again once the mirror syncs.";
    };
    readonly 'update-standalone-available': {
        readonly zh: "发现便携包新版本：v{{latest}}（当前 v{{current}}）· 输入 /update 自动更新";
        readonly en: "New standalone version available: v{{latest}} (current v{{current}}) · type /update to update";
    };
    readonly 'update-standalone-no-checksum': {
        readonly zh: "该版本未发布 SHA256 校验和，更新包完整性无法验证";
        readonly en: "this release publishes no SHA256 checksums; the update payload cannot be integrity-verified";
    };
    readonly 'update-standalone-starting': {
        readonly zh: "正在下载便携包新版本并自动替换，完成后会自动重启并恢复当前会话……";
        readonly en: "Downloading and replacing standalone binary. The TUI will restart and resume this session when finished…";
    };
    readonly 'reload-header': {
        readonly zh: "已重读偏好文件：";
        readonly en: "Preferences reloaded:";
    };
    readonly 'reload-applied': {
        readonly zh: "{{kind}}  {{from}} → {{to}}（已应用）";
        readonly en: "{{kind}}  {{from}} → {{to}} (applied)";
    };
    readonly 'reload-unchanged': {
        readonly zh: "{{kind}}  无变化";
        readonly en: "{{kind}}  unchanged";
    };
    readonly 'reload-skipped-env': {
        readonly zh: "{{kind}}  跳过：环境变量优先";
        readonly en: "{{kind}}  skipped: env override wins";
    };
    readonly 'reload-skipped-config': {
        readonly zh: "{{kind}}  跳过：显式配置优先";
        readonly en: "{{kind}}  skipped: explicit config wins";
    };
    readonly 'reload-skipped-invalid': {
        readonly zh: "{{kind}}  跳过：文件缺失或无效";
        readonly en: "{{kind}}  skipped: missing or invalid file";
    };
    readonly 'reload-footer': {
        readonly zh: "提示：settings.yaml / cordis.patch.yml 由 watcher 自动热重载；cordis.yml 根配置改动需 /restart";
        readonly en: "Note: settings.yaml / cordis.patch.yml hot-reload via watchers; cordis.yml root config changes need /restart";
    };
    readonly 'reload-kind-theme': {
        readonly zh: "主题";
        readonly en: "theme";
    };
    readonly 'reload-kind-lang': {
        readonly zh: "语言";
        readonly en: "language";
    };
    readonly 'reload-kind-preset': {
        readonly zh: "预设";
        readonly en: "preset";
    };
    readonly 'reload-kind-model': {
        readonly zh: "模型";
        readonly en: "model";
    };
    readonly 'reload-kind-activity': {
        readonly zh: "活动指示";
        readonly en: "activity";
    };
    readonly 'restart-starting': {
        readonly zh: "正在重启 dsh-tui，完成后自动恢复当前会话……";
        readonly en: "Restarting dsh-tui. The session resumes when it comes back…";
    };
    readonly 'restart-during-turn': {
        readonly zh: "当前回合仍在运行，正在中断重启；排队输入不会保留。若进程无法正常收尾，退出后会打印恢复本会话的命令。";
        readonly en: "The current turn is still running; interrupting and restarting. Queued input is not kept. If the process cannot shut down cleanly it exits and prints the command that resumes this session.";
    };
    readonly 'restart-unavailable': {
        readonly zh: "当前运行方式不支持进程内重启（未挂载重启通道）。";
        readonly en: "Restart is unavailable in this launch mode (no restart channel mounted).";
    };
    readonly 'streaming-folded': {
        readonly zh: "…（前 {{count}} 字符流式期间已折叠，落定后完整显示）";
        readonly en: "…(first {{count}} chars folded while streaming; full text renders once the turn settles)";
    };
    readonly 'mermaid-too-wide': {
        readonly zh: "（图需要 {{width}} 列，当前宽度不足，显示源码）";
        readonly en: "(diagram needs {{width}} columns; showing the source)";
    };
    readonly 'vim-on': {
        readonly zh: "vim 模式已开启（Esc 切 normal，i/a/o 回 insert）";
        readonly en: "vim mode on (Esc = normal, i/a/o = insert)";
    };
    readonly 'vim-off': {
        readonly zh: "vim 模式已关闭";
        readonly en: "vim mode off";
    };
    readonly 'terminal-setup-hint': {
        readonly zh: "推荐 Windows Terminal（≥110 列、等宽字体、TrueColor）。";
        readonly en: "Recommended: Windows Terminal (≥110 columns, monospace, TrueColor).";
    };
    readonly 'terminal-paste-hint': {
        readonly zh: "{{keys}} 粘贴文本、文件路径或图片；Ctrl+Shift+V 终端原生粘贴；右键粘贴同样可用；快捷键可在 /settings 修改。";
        readonly en: "{{keys}} pastes text, file paths, or images; Ctrl+Shift+V is native terminal paste; right-click paste also works; remappable via /settings.";
    };
    readonly 'connect-none': {
        readonly zh: "当前环境未提供远程连接服务。";
        readonly en: "No remote connection service is available in this environment.";
    };
    readonly 'theme-switch-failed': {
        readonly zh: "主题「{{name}}」切换失败（无法写入 ~/.dsh-tui/theme.json）";
        readonly en: "Theme \"{{name}}\" switch failed (cannot write ~/.dsh-tui/theme.json)";
    };
    readonly 'btw-usage': {
        readonly zh: "用法：/btw <问题> —— 不打断当前对话的快速侧问";
        readonly en: "Usage: /btw <question> — quick side question without interrupting the conversation";
    };
    readonly 'panel-title-btw': {
        readonly zh: "侧问";
        readonly en: "btw";
    };
    readonly 'btw-thread-empty': {
        readonly zh: "还没有侧问。输入 /btw <问题>，或点击下方输入框开始提问。";
        readonly en: "No side questions yet. Type /btw <question>, or click the input below to ask.";
    };
    readonly 'btw-thread-new': {
        readonly zh: "新话题";
        readonly en: "New topic";
    };
    readonly 'btw-thread-clear': {
        readonly zh: "已开始新话题：上下文与未读已清空";
        readonly en: "New topic started: context and unread cleared";
    };
    readonly 'btw-thread-context-recent': {
        readonly zh: "后续答案参考最近 {{n}} 组问答";
        readonly en: "Answers use the last {{n}} Q/A pairs as context";
    };
    readonly 'btw-thread-context-omitted': {
        readonly zh: "已省略更早 {{n}} 组问答";
        readonly en: "{{n}} earlier Q/A pair(s) omitted";
    };
    readonly 'btw-thread-followup': {
        readonly zh: "输入追问…（Enter 发送 · Esc 回到对话 · Tab 切列表）";
        readonly en: "Type a follow-up… (Enter send · Esc back to chat · Tab list)";
    };
    readonly 'btw-input-placeholder': {
        readonly zh: "Enter 提问";
        readonly en: "Enter to ask";
    };
    readonly 'btw-input-hint-edit': {
        readonly zh: "Enter 发送 · Esc";
        readonly en: "Enter send · Esc";
    };
    readonly 'btw-list-hint': {
        readonly zh: "↑/↓ 选择 · s 送聊天 · c 复制";
        readonly en: "↑/↓ select · s to chat · c copy";
    };
    readonly 'btw-list-hint-attached': {
        readonly zh: "↑/↓ 选择 · s 撤回 · c 复制";
        readonly en: "↑/↓ select · s unsend · c copy";
    };
    readonly 'btw-hint-edit-back': {
        readonly zh: "↑ 选择";
        readonly en: "↑ select";
    };
    readonly 'btw-empty-lines': {
        readonly zh: "旁路问答不打断主线：答案只留在这里，不进主聊天与会话记录。";
        readonly en: "Side questions never derail the main line: answers stay here, out of the main chat and session log.";
    };
    readonly 'btw-thread-busy': {
        readonly zh: "上一个侧问还在回答，等它结束再追问";
        readonly en: "Still answering the last side question; ask again once it finishes";
    };
    readonly 'btw-thread-error': {
        readonly zh: "本轮失败";
        readonly en: "This turn failed";
    };
    readonly 'btw-thread-cancelled': {
        readonly zh: "已取消本轮侧问";
        readonly en: "Side question cancelled";
    };
    readonly 'btw-thread-unread': {
        readonly zh: "有新回答";
        readonly en: "New answer";
    };
    readonly 'btw-thread-answer-attached': {
        readonly zh: "答案已附加到下一次主聊天提交";
        readonly en: "Answer attached to your next main chat submission";
    };
    readonly 'btw-thread-answer-truncated': {
        readonly zh: "答案过长，附加时已截断";
        readonly en: "Answer exceeded the attach limit and was truncated";
    };
    readonly 'btw-fullscreen-title': {
        readonly zh: "侧问线程";
        readonly en: "Side thread";
    };
    readonly 'btw-scene-hints': {
        readonly zh: "Enter 追问 · ↑/↓ 选择 · n 新话题 · s 送聊天 · c 复制 · Esc 返回";
        readonly en: "Enter ask · ↑/↓ select · n new · s to chat · c copy · Esc back";
    };
    readonly 'btw-panel-unavailable': {
        readonly zh: "btw 面板未启用（/settings → dsh-tui.sidePanel.panels）";
        readonly en: "btw panel not enabled (/settings → dsh-tui.sidePanel.panels)";
    };
    readonly 'btw-surface-busy': {
        readonly zh: "侧问已发出，但当前界面挡住了它（关掉浮层后再 /btw）";
        readonly en: "Side question is hidden by the current screen — close it, then rerun /btw";
    };
    readonly 'btw-output-unavailable': {
        readonly zh: "没有收到回答";
        readonly en: "No answer received";
    };
    readonly 'btw-answering': {
        readonly zh: "思考中…";
        readonly en: "Answering…";
    };
    readonly 'btw-hint-loading': {
        readonly zh: "Esc 取消";
        readonly en: "Esc cancel";
    };
    readonly 'btw-hint-done': {
        readonly zh: "↑/↓ 滚动 · Space/Enter/Esc 关闭 · c 复制";
        readonly en: "↑/↓ scroll · Space/Enter/Esc dismiss · c copy";
    };
    readonly 'btw-llm-unavailable': {
        readonly zh: "侧问不可用（llm 服务未挂载）";
        readonly en: "Side question unavailable (llm service not mounted)";
    };
    readonly 'recap-llm-unavailable': {
        readonly zh: "recap 不可用（llm 服务未挂载）";
        readonly en: "Recap unavailable (llm service not mounted)";
    };
    readonly 'recap-no-activity': {
        readonly zh: "会话还没有可总结的活动";
        readonly en: "No session activity to recap yet";
    };
    readonly 'recap-answering': {
        readonly zh: "正在总结最近活动…";
        readonly en: "Summarizing recent activity…";
    };
    readonly 'recap-title-label': {
        readonly zh: "建议标题";
        readonly en: "Suggested title";
    };
    readonly 'recap-apply-title': {
        readonly zh: "应用";
        readonly en: "Apply";
    };
    readonly 'recap-title-applied': {
        readonly zh: "已应用";
        readonly en: "Applied";
    };
    readonly 'recap-title-applied-notify': {
        readonly zh: "已将会话标题设为「{{title}}」";
        readonly en: "Session title set to \"{{title}}\"";
    };
    readonly 'recap-hint': {
        readonly zh: "↑/↓ 滚动 · Space/Enter/Esc 关闭 · c 复制{{apply}}";
        readonly en: "↑/↓ scroll · Space/Enter/Esc dismiss · c copy{{apply}}";
    };
    readonly 'recap-auto-hint': {
        readonly zh: "点击展开查看/应用";
        readonly en: "Click to expand & apply";
    };
    readonly 'recap-auto-close': {
        readonly zh: "关闭";
        readonly en: "Dismiss";
    };
    readonly 'recap-auto-line': {
        readonly zh: "回顾：{{summary}}";
        readonly en: "Recap: {{summary}}";
    };
    readonly 'recap-panel-title': {
        readonly zh: "会话回顾";
        readonly en: "Session recap";
    };
    readonly 'recap-panel-subtitle': {
        readonly zh: "最近活动的快速复盘";
        readonly en: "A quick recap of recent activity";
    };
    readonly 'color-current': {
        readonly zh: "当前会话颜色  {{name}}";
        readonly en: "Current session color  {{name}}";
    };
    readonly 'color-current-none': {
        readonly zh: "当前会话未设置颜色（用主题默认）";
        readonly en: "No session color set (theme default)";
    };
    readonly 'color-usage': {
        readonly zh: "用法：/color <{{list}}|reset> —— 颜色按会话保存，resume 后仍在";
        readonly en: "Usage: /color <{{list}}|reset> — per-session, survives resume";
    };
    readonly 'color-reset': {
        readonly zh: "已清除会话颜色，恢复主题默认";
        readonly en: "Session color cleared — back to the theme default";
    };
    readonly 'color-unknown': {
        readonly zh: "未知颜色「{{name}}」· 可选：{{list}}";
        readonly en: "Unknown color \"{{name}}\" · available: {{list}}";
    };
    readonly 'color-set': {
        readonly zh: "会话颜色已设为 {{name}}";
        readonly en: "Session color set to {{name}}";
    };
    readonly 'exit-press-again': {
        readonly zh: "再次按 Ctrl+C 退出";
        readonly en: "Press Ctrl+C again to exit";
    };
    readonly 'esc-again-rewind': {
        readonly zh: "再次按 Esc 时间回溯";
        readonly en: "Press Esc again to rewind";
    };
    readonly 'esc-again-clear': {
        readonly zh: "再次按 Esc 清空";
        readonly en: "Press Esc again to clear";
    };
    readonly 'new-session-started': {
        readonly zh: "已新建会话";
        readonly en: "New session started";
    };
    readonly 'command-not-found': {
        readonly zh: "/{{name}}：没有这个命令";
        readonly en: "/{{name}}: no such command";
    };
    readonly 'command-images-unsupported': {
        readonly zh: "/{{name}} 不接受图片；草稿已保留";
        readonly en: "/{{name}} does not accept images; the draft was preserved";
    };
    readonly 'command-images-runtime-unsupported': {
        readonly zh: "/{{name}}：当前命令运行时不支持图片；草稿已保留";
        readonly en: "/{{name}}: this command runtime cannot accept images; the draft was preserved";
    };
    readonly 'command-images-limit': {
        readonly zh: "/{{name}}：图片数量或总大小超过当前 profile 限制；草稿已保留";
        readonly en: "/{{name}}: the image batch exceeds this profile's limits; the draft was preserved";
    };
    readonly 'command-images-missing': {
        readonly zh: "/{{name}}：图片已失效或不可读取（{{paths}}）；草稿已保留";
        readonly en: "/{{name}}: images are stale or unreadable ({{paths}}); the draft was preserved";
    };
    readonly 'command-running': {
        readonly zh: "命令仍在执行，请等待本次结果";
        readonly en: "The command is still running; wait for this attempt to settle";
    };
    readonly 'command-changed': {
        readonly zh: "/{{name}} 在图片准备期间发生变化；未执行，草稿已保留";
        readonly en: "/{{name}} changed while its images were prepared; it was not run and the draft was preserved";
    };
    readonly 'shell-images-unsupported': {
        readonly zh: "Shell 命令不接受图片；草稿已保留";
        readonly en: "Shell commands do not accept images; the draft was preserved";
    };
    readonly 'thinking-toggled': {
        readonly zh: "思考过程：{{state}}";
        readonly en: "Thinking display: {{state}}";
    };
    readonly 'thinking-on': {
        readonly zh: "显示";
        readonly en: "shown";
    };
    readonly 'thinking-off': {
        readonly zh: "隐藏";
        readonly en: "hidden";
    };
    readonly 'tokens-request-upload': {
        readonly zh: "本次请求：上传 {{upload}}（输入 {{input}} · 缓存读 {{read}} · 缓存写 {{write}}）· 命中率 {{rate}}%";
        readonly en: "This request: {{upload}} uploaded (input {{input}} · cache read {{read}} · cache write {{write}}) · hit rate {{rate}}%";
    };
    readonly 'tokens-session-total': {
        readonly zh: "会话累计：未缓存输入 {{input}} · 输出 {{output}}";
        readonly en: "Session total: {{input}} uncached input · {{output}} output";
    };
    readonly 'tokens-session-breakdown': {
        readonly zh: "会话累计：未缓存输入 {{input}} · 输出 {{output}} · 缓存读 {{read}} · 缓存写 {{write}}";
        readonly en: "Session total: {{input}} uncached input · {{output}} output · {{read}} cache read · {{write}} cache write";
    };
    readonly 'update-aborted-no-profile': {
        readonly zh: "dsh-tui 更新中止：未解析到 dsh profile。";
        readonly en: "dsh-tui update aborted: no dsh profile resolved.";
    };
    readonly 'update-launcher-align-unknown': {
        readonly zh: "Profile 已更新到 v{{version}}。如果你平时使用全局 dsh-tui 命令启动，请同步更新全局启动器：\n  npm install -g --legacy-peer-deps @deepseek-harness-tui/dsh-tui@{{version}}\n（--legacy-peer-deps 可绕过 npm 12 的 peer 解析崩溃，全局启动器是瘦壳，跳过全局 peer 解析是安全的）";
        readonly en: "The profile is now v{{version}}. If you normally launch with the global dsh-tui command, align the global launcher too:\n  npm install -g --legacy-peer-deps @deepseek-harness-tui/dsh-tui@{{version}}\n(--legacy-peer-deps works around an npm 12 peer-resolution crash; the global launcher is a thin shim, so skipping global peer resolution is safe.)";
    };
    readonly 'update-launcher-outdated': {
        readonly zh: "Profile 已更新到 v{{profile}}，但全局启动器仍是 v{{launcher}}。请同步更新：\n  npm install -g --legacy-peer-deps @deepseek-harness-tui/dsh-tui@{{profile}}\n（--legacy-peer-deps 可绕过 npm 12 的 peer 解析崩溃，见 #459）";
        readonly en: "The profile is now v{{profile}}, but the global launcher is still v{{launcher}}. Align it with:\n  npm install -g --legacy-peer-deps @deepseek-harness-tui/dsh-tui@{{profile}}\n(--legacy-peer-deps works around an npm 12 peer-resolution crash, see #459.)";
    };
    readonly 'activity-ctx-warn': {
        readonly zh: "⚠ 上下文";
        readonly en: "⚠ ctx ";
    };
    readonly 'activity-random-each-preset': {
        readonly zh: "每次随机一个预设";
        readonly en: "random preset each time";
    };
    readonly 'preset-default-tag': {
        readonly zh: "（默认）";
        readonly en: " (default)";
    };
    readonly 'preset-broken-tag': {
        readonly zh: "（无法加载）";
        readonly en: " (failed to load)";
    };
    readonly 'effort-unavailable': {
        readonly zh: "推理等级切换不可用（llm 服务未挂载）";
        readonly en: "Reasoning effort switching unavailable (llm service not mounted)";
    };
    readonly 'effort-read-failed': {
        readonly zh: "推理等级读取失败 · {{error}}";
        readonly en: "Failed to read reasoning efforts · {{error}}";
    };
    readonly 'effort-single-tier': {
        readonly zh: "当前模型只有一档推理等级（{{name}}）";
        readonly en: "Current model has a single reasoning effort ({{name}})";
    };
    readonly 'effort-unsupported': {
        readonly zh: "当前模型不支持推理等级切换";
        readonly en: "Current model does not support reasoning effort switching";
    };
    readonly 'effort-preference-downgraded': {
        readonly zh: "偏好推理强度 {{preferred}} 不被当前模型支持，已就近降档至 {{applied}}";
        readonly en: "Preferred reasoning effort {{preferred}} is unavailable on this model; fell back to the nearest lower tier {{applied}}";
    };
    readonly 'effort-preference-unsupported': {
        readonly zh: "偏好推理强度 {{preferred}} 不被当前模型支持，且无更低可用档，保持模型默认";
        readonly en: "Preferred reasoning effort {{preferred}} is unavailable on this model with no lower tier; keeping the model default";
    };
    readonly 'effort-switched': {
        readonly zh: "推理强度 → {{name}}";
        readonly en: "Reasoning effort → {{name}}";
    };
    readonly 'effort-current': {
        readonly zh: "当前推理强度 {{name}}";
        readonly en: "Current reasoning effort {{name}}";
    };
    readonly 'effort-usage': {
        readonly zh: "用法：/effort（滑杆）| /effort <id> | /effort status";
        readonly en: "Usage: /effort (slider) | /effort <id> | /effort status";
    };
    readonly 'effort-fallback-tier-note': {
        readonly zh: "该模型没有声明推理档位，这里列出的是通用档位";
        readonly en: "This model declares no effort levels; these are the standard ones";
    };
    readonly 'mode-switched': {
        readonly zh: "模式 → {{name}}";
        readonly en: "Mode → {{name}}";
    };
    readonly 'mode-default': {
        readonly zh: "默认";
        readonly en: "default";
    };
    readonly 'mode-plan': {
        readonly zh: "计划模式";
        readonly en: "plan mode";
    };
    readonly 'mode-full': {
        readonly zh: "完全访问";
        readonly en: "full access";
    };
    readonly 'mode-plan-unavailable': {
        readonly zh: "当前 preset 未注册 /plan 命令，无法切换计划模式";
        readonly en: "The active preset does not register /plan; cannot toggle plan mode";
    };
    readonly 'mode-switch-failed': {
        readonly zh: "模式切换失败 · {{err}}";
        readonly en: "Mode switch failed · {{err}}";
    };
    readonly 'mode-permission-unregistered': {
        readonly zh: "当前 preset 未注册 /permission 命令，无法切换权限模式";
        readonly en: "The active preset does not register /permission; cannot switch the permission mode";
    };
    readonly 'mode-permission-invoke-failed': {
        readonly zh: "/permission 切换失败，请重试或查看日志";
        readonly en: "/permission switch failed; retry or check the logs";
    };
    readonly 'mode-permission-unconfirmed': {
        readonly zh: "权限切换未被 DSH 确认，模式未改变";
        readonly en: "The permission switch was not confirmed by DSH; the mode is unchanged";
    };
    readonly 'mode-permission-no-canonical': {
        readonly zh: "模式「{{name}}」的 sandbox/approval 组合没有对应权限预设，无法安全切换";
        readonly en: "Mode \"{{name}}\" has no matching permission preset for its sandbox/approval combo; cannot switch safely";
    };
    readonly 'cmd-desc-permission': {
        readonly zh: "切换权限预设（沙箱模式 + 审批策略）";
        readonly en: "Switch the permission preset (sandbox mode + approval policy)";
    };
    readonly 'upstream-retry-enabled': {
        readonly zh: "已为当前渠道 {{routes}} 启用上游断链自动重试（最多重试 5 次；cordis.yml upstreamRetry: false 可关闭）";
        readonly en: "Upstream auto-retry enabled for {{routes}} (the route in use) — up to 5 retries per request (opt out with upstreamRetry: false in cordis.yml)";
    };
    readonly 'logo-tagline': {
        readonly zh: "探索未至之境！";
        readonly en: "Explore the uncharted!";
    };
    readonly 'logo-star-title': {
        readonly zh: "鲸鱼娘好像在等一颗小星星…… ☆";
        readonly en: "The whale girl seems to be waiting for a little star… ☆";
    };
    readonly 'logo-star-caught': {
        readonly zh: "鲸鱼娘捡到一颗小星星啦 ✨";
        readonly en: "The whale girl caught a little star ✨";
    };
    readonly 'logo-star-stats': {
        readonly zh: "已陪你 {{hours}} 小时 · 第 {{launches}} 次打开";
        readonly en: "{{hours}}h together · launch #{{launches}}";
    };
    readonly 'logo-star-ask': {
        readonly zh: "喜欢 dshTUI 的话，顺手点亮一颗 {{star}}？（点这一行或 {{key}} 一键支持）";
        readonly en: "If you like dsh-TUI, would you light a {{star}}? (click this line or {{key}})";
    };
    readonly 'cmd-desc-star': {
        readonly zh: "给这个项目点个 star（用 gh 一键）";
    };
    readonly 'star-ok': {
        readonly zh: "已 star，谢谢！";
        readonly en: "Starred — thank you!";
    };
    readonly 'star-no-gh': {
        readonly zh: "没找到 gh（GitHub CLI），已经替你在浏览器里打开仓库页：{{url}}。装一个 gh 就能一键 star：https://cli.github.com";
        readonly en: "gh (GitHub CLI) is not installed, so I opened the repo page in your browser: {{url}}. Install gh for one-key starring: https://cli.github.com";
    };
    readonly 'star-not-authed': {
        readonly zh: "gh 还没登录，已经替你在浏览器里打开仓库页：{{url}}。想一键 star 就先跑 gh auth login";
        readonly en: "gh is not logged in, so I opened the repo page in your browser: {{url}}. Run gh auth login for one-key starring";
    };
    readonly 'star-failed': {
        readonly zh: "一键 star 没成功：{{detail}}（也可以直接在浏览器里打开 {{url}}）";
        readonly en: "One-key star failed: {{detail}} (or open {{url}} in a browser)";
    };
    readonly 'star-modal-title-hours': {
        readonly zh: "🐳 已经陪你 {{hours}} 小时了！";
        readonly en: "🐳 {{hours}} hours together!";
    };
    readonly 'star-modal-title-launches': {
        readonly zh: "🐳 已经陪你 {{launches}} 次启动了！";
        readonly en: "🐳 {{launches}} launches together!";
    };
    readonly 'star-modal-body-1': {
        readonly zh: "不知不觉，dshTUI 已经陪你走了这么久啦。";
        readonly en: "Before you noticed, dsh-TUI had already come this far with you.";
    };
    readonly 'star-modal-body-2': {
        readonly zh: "如果它有让你的 DSH 更好用一点、";
        readonly en: "If it made your DSH a little more usable,";
    };
    readonly 'star-modal-body-3': {
        readonly zh: "更顺手一点，或者只是让你开心了一点——";
        readonly en: "a little smoother — or just made you smile —";
    };
    readonly 'star-modal-body-4': {
        readonly zh: "那就送鲸鱼娘一颗小小的 Star 吧 ⭐";
        readonly en: "treat the whale girl to a tiny Star ⭐";
    };
    readonly 'star-modal-body-5': {
        readonly zh: "每一颗 Star，都会变成我们继续折腾";
        readonly en: "Every Star becomes fuel for us to keep tinkering";
    };
    readonly 'star-modal-body-6': {
        readonly zh: "和把 dshTUI 做得更好的动力！";
        readonly en: "and to keep making dsh-TUI better!";
    };
    readonly 'star-modal-star': {
        readonly zh: "投喂一颗 Star ⭐";
        readonly en: "Feed a Star ⭐";
    };
    readonly 'star-modal-open': {
        readonly zh: "在浏览器中打开 GitHub";
        readonly en: "Open GitHub in the browser";
    };
    readonly 'star-modal-working': {
        readonly zh: "正在点 star…";
        readonly en: "Starring…";
    };
    readonly 'star-modal-hint': {
        readonly zh: "↑↓ 选择 · **Enter** 确认 · **Esc** 下次一定 (´;ω;`)";
        readonly en: "↑↓ choose · **Enter** confirm · **Esc** next time (´;ω;`)";
    };
    readonly 'star-modal-thanks-title': {
        readonly zh: "🌟 收到 Star 啦！";
        readonly en: "🌟 Star received!";
    };
    readonly 'star-modal-thanks-1': {
        readonly zh: "鲸鱼娘成功接住了一颗小星星 ~";
        readonly en: "The whale girl caught a little star ~";
    };
    readonly 'star-modal-thanks-2': {
        readonly zh: "谢谢你的支持！";
        readonly en: "Thank you for your support!";
    };
    readonly 'star-modal-thanks-3': {
        readonly zh: "这颗 Star 会变成 dshTUI 继续成长的动力。";
        readonly en: "This Star becomes fuel for dsh-TUI to keep growing.";
    };
    readonly 'star-modal-thanks-4': {
        readonly zh: "希望以后，它也能继续陪你走很久。";
        readonly en: "May it keep you company for a long time to come.";
    };
    readonly 'star-modal-thanks-hint': {
        readonly zh: "**Enter** / **Esc** 关闭";
        readonly en: "**Enter** / **Esc** to close";
    };
    readonly 'coupon-modal-title': {
        readonly zh: "鲸鱼券";
        readonly en: "Whale coupon";
    };
    readonly 'coupon-modal-received': {
        readonly zh: "DeepSeek 送你的 {{amount}} {{unit}}鲸鱼券到账啦～";
        readonly en: "Your {{amount}} {{unit}} whale coupon from DeepSeek is here ~";
    };
    readonly 'coupon-modal-expiry': {
        readonly zh: "Deepy提醒：这张券 {{month}} 月 {{day}} 日 {{time}} 就要过期啦，别忘记用掉哦～";
        readonly en: "Deepy says: this coupon expires on {{month}}/{{day}} at {{time}}. Do not forget to use it ~";
    };
    readonly 'coupon-modal-hint': {
        readonly zh: "**Enter** / **Esc** 收好鲸鱼券";
        readonly en: "**Enter** / **Esc** to tuck it away";
    };
    readonly 'logo-tip-prefix': {
        readonly zh: "提示：";
        readonly en: "Tip: ";
    };
    readonly 'logo-tip-more': {
        readonly zh: "更多技巧";
        readonly en: "more tips";
    };
    readonly 'logo-drift-newer': {
        readonly zh: "dsh 引擎为 {{installed}}，比本界面验证过的 {{validated}} 新，可能出现兼容问题；求稳可执行 npm i -g @deepseek-ai/dsh@{{primary}} 降级，或等待 dsh-tui 适配新版。";
        readonly en: "The dsh engine ({{installed}}) is newer than the {{validated}} this UI is validated against, so issues are possible; downgrade via npm i -g @deepseek-ai/dsh@{{primary}} for stability, or wait for a dsh-tui update.";
    };
    readonly 'logo-drift-older': {
        readonly zh: "dsh 引擎为 {{installed}}，低于本界面验证过的 {{validated}}，部分功能可能不可用；建议执行 npm i -g @deepseek-ai/dsh@{{primary}} 升级。";
        readonly en: "The dsh engine ({{installed}}) is older than the {{validated}} this UI is validated against; some features may be missing. Upgrade via npm i -g @deepseek-ai/dsh@{{primary}}.";
    };
    readonly 'logo-drift-mixed': {
        readonly zh: "检测到 dsh 引擎多版本混装（{{installed}}），容易出现奇怪问题；建议执行 npm i -g @deepseek-ai/dsh@{{primary}} 统一版本。";
        readonly en: "Mixed dsh engine versions detected ({{installed}}), which can cause odd behavior; unify them via npm i -g @deepseek-ai/dsh@{{primary}}.";
    };
    readonly 'logo-drift-broken': {
        readonly zh: "dsh 引擎版本异常（{{installed}}），本界面验证过 {{validated}}；建议执行 npm i -g @deepseek-ai/dsh@{{primary}} 重装。";
        readonly en: "Unexpected dsh engine versions ({{installed}}); this UI is validated against {{validated}}. Reinstall via npm i -g @deepseek-ai/dsh@{{primary}}.";
    };
    readonly 'input-sent-after-turn': {
        readonly zh: "已发送，当前回合结束后处理";
        readonly en: "Sent, processed after the current turn";
    };
    readonly 'input-injected': {
        readonly zh: "已从编辑器发送";
        readonly en: "Sent from editor";
    };
    readonly 'input-interrupted-next': {
        readonly zh: "已插话 · 下一步立即处理";
        readonly en: "Interrupted · processed next";
    };
    readonly 'input-steer-pending': {
        readonly zh: "已插话；中断尚未生效，等待回合恢复后再处理";
        readonly en: "Steered; the interrupt has not taken effect — held until the turn can advance";
    };
    readonly 'input-queued-after-turn': {
        readonly zh: "已排队 · 回合结束后处理";
        readonly en: "Queued · processed after the turn";
    };
    readonly 'input-cannot-retract': {
        readonly zh: "无法撤回：消息可能已被处理，或当前版本不支持";
        readonly en: "Cannot retract: the message may already be processed, or this version doesn't support it";
    };
    readonly 'input-retracted': {
        readonly zh: "已撤回，可编辑后重新发送";
        readonly en: "Retracted, editable and resendable";
    };
    readonly 'input-empty': {
        readonly zh: "输入为空，没有可发送的内容";
        readonly en: "Empty input, nothing to send";
    };
    readonly 'input-interrupt-immediate': {
        readonly zh: "已打断当前回合，正在立即处理";
        readonly en: "Interrupted current turn, processing immediately";
    };
    readonly 'input-interrupt-deferred': {
        readonly zh: "中断尚未生效：消息已排队，回合结束后处理；若持续卡住，可用 /restart";
        readonly en: "The interrupt has not taken effect yet: messages are queued until the turn ends. If it stays stuck, use /restart";
    };
    readonly 'input-clipboard-empty': {
        readonly zh: "剪贴板为空";
        readonly en: "Clipboard is empty";
    };
    readonly 'input-editor-unavailable': {
        readonly zh: "错误：未配置编辑器。请设置 $VISUAL 或 $EDITOR 环境变量。";
        readonly en: "Error: No editor configured. Set $VISUAL or $EDITOR environment variable.";
    };
    readonly 'input-editor-failed': {
        readonly zh: "外部编辑器失败：{{name}}";
        readonly en: "External editor failed: {{name}}";
    };
    readonly 'input-clipboard-read-failed': {
        readonly zh: "读取剪贴板失败";
        readonly en: "Failed to read the clipboard";
    };
    readonly 'input-clipboard-unavailable': {
        readonly zh: "无法读取剪贴板：没有可用的 wl-paste / xclip / xsel（未安装或会话不可连接）";
        readonly en: "Cannot read clipboard: no usable wl-paste / xclip / xsel (not installed or session unreachable)";
    };
    readonly 'input-clipboard-unavailable-wsl': {
        readonly zh: "无法读取剪贴板：WSL 下请安装 wl-clipboard（需要 WSLg），或启用 Windows interop 以调用 powershell.exe";
        readonly en: "Cannot read clipboard: in WSL install wl-clipboard (needs WSLg) or enable Windows interop so powershell.exe is reachable";
    };
    readonly 'input-image-pasted': {
        readonly zh: "已粘贴图片 {{token}}";
        readonly en: "Pasted image {{token}}";
    };
    readonly 'input-image-pasted-adjusted': {
        readonly zh: "已粘贴图片 {{token}}（{{detail}}）";
        readonly en: "Pasted image {{token}} ({{detail}})";
    };
    readonly 'input-image-detail-resized': {
        readonly zh: "已缩放至 {{width}}×{{height}}";
        readonly en: "resized to {{width}}×{{height}}";
    };
    readonly 'input-image-detail-converted': {
        readonly zh: "{{from}} 已转 {{to}}";
        readonly en: "{{from}} converted to {{to}}";
    };
    readonly 'input-image-detail-converted-flattened': {
        readonly zh: "{{from}} 已转 {{to}}，透明区域已填白";
        readonly en: "{{from}} converted to {{to}}, transparency filled white";
    };
    readonly 'input-image-paste-failed': {
        readonly zh: "粘贴图片失败：{{err}}";
        readonly en: "Could not paste image: {{err}}";
    };
    readonly 'input-image-paste-limit': {
        readonly zh: "图片数量超过当前配置的单条消息上限";
        readonly en: "Image count exceeds the per-message limit for this profile";
    };
    readonly 'input-image-format-unsupported': {
        readonly zh: "剪贴板图片格式不受支持；请使用 PNG、JPEG、WebP 或 GIF";
        readonly en: "Clipboard image format is unsupported; use PNG, JPEG, WebP, or GIF";
    };
    readonly 'input-pending-steer-label': {
        readonly zh: "插话 · 下一步送达";
        readonly en: "Steer · delivered next";
    };
    readonly 'input-pending-queue-label': {
        readonly zh: "排队 · 回合结束后送达";
        readonly en: "Queued · delivered after the turn";
    };
    readonly 'input-pending-actions-hint': {
        readonly zh: "撤回 · Esc 打断并暂存排队消息";
        readonly en: "Retract · Esc interrupts and holds the queue";
    };
    readonly 'input-pending-dock-label': {
        readonly zh: "已暂存 · 打断后保留，不会自动发送";
        readonly en: "Held · kept after the interrupt, not sent automatically";
    };
    readonly 'input-pending-dock-hint': {
        readonly zh: "按 ↑ 编辑排队消息，⏎ 立即发送";
        readonly en: "Press ↑ to edit queued messages, ⏎ to send now";
    };
    readonly 'input-pending-dock-hint-working': {
        readonly zh: "按 ↑ 编辑排队消息，回合结束后 ⏎ 发送";
        readonly en: "Press ↑ to edit queued messages, ⏎ sends after the turn";
    };
    readonly 'input-dock-sent': {
        readonly zh: "已发送 {{n}} 条暂存消息";
        readonly en: "Sent {{n}} held message(s)";
    };
    readonly 'input-dock-swapped': {
        readonly zh: "已交换：草稿暂存，所点消息回到输入框（Ctrl+Z 换回）";
        readonly en: "Swapped: the draft is held and the picked message is back in the input (Ctrl+Z swaps back)";
    };
    readonly 'input-dock-confirming': {
        readonly zh: "{{n}} 条暂存消息还在等打断完成，稍后再发送或编辑";
        readonly en: "{{n}} held message(s) are waiting for the interrupt to finish; send or edit again in a moment";
    };
    readonly 'input-fold-stats': {
        readonly zh: "{{lines}} 行・{{chars}} 字";
        readonly en: "{{lines}} lines・{{chars}} chars";
    };
    readonly 'input-fold-hover': {
        readonly zh: "悬停查看";
        readonly en: "hover to peek";
    };
    readonly 'input-fold-peek-footer': {
        readonly zh: "… 共 {{lines}} 行・点击展开编辑";
        readonly en: "… {{lines}} lines total・click to edit";
    };
    readonly 'input-expand-editor-title': {
        readonly zh: "草稿编辑";
        readonly en: "Draft editor";
    };
    readonly 'input-expand-editor-position': {
        readonly zh: "行 {{line}} · 列 {{col}}";
        readonly en: "Ln {{line}}, Col {{col}}";
    };
    readonly 'input-expand-editor-scroll': {
        readonly zh: "滚轮翻动 · 光标行自动跟随";
        readonly en: "wheel scrolls · caret row follows";
    };
    readonly 'input-expand-editor-send': {
        readonly zh: "发送";
        readonly en: "Send";
    };
    readonly 'input-expand-editor-collapse': {
        readonly zh: "收起";
        readonly en: "Collapse";
    };
    readonly 'input-expand-editor-hint-send': {
        readonly zh: "Ctrl+Enter 发送";
        readonly en: "Ctrl+Enter sends";
    };
    readonly 'input-expand-editor-hint-collapse': {
        readonly zh: "Esc 收起";
        readonly en: "Esc collapses";
    };
    readonly 'tool-tip-started': {
        readonly zh: "开始 {{time}}";
        readonly en: "started {{time}}";
    };
    readonly 'tool-tip-finished': {
        readonly zh: "结束 {{time}}";
        readonly en: "finished {{time}}";
    };
    readonly 'tool-tip-failed': {
        readonly zh: "失败 {{time}}";
        readonly en: "failed {{time}}";
    };
    readonly 'tool-tip-exit': {
        readonly zh: "退出码 {{code}}";
        readonly en: "exit {{code}}";
    };
    readonly 'tool-tip-signal': {
        readonly zh: "信号 {{name}}";
        readonly en: "signal {{name}}";
    };
    readonly 'tool-name-powershell': {
        readonly zh: "PowerShell";
        readonly en: "PowerShell";
    };
    readonly 'tool-name-read': {
        readonly zh: "读取";
        readonly en: "Read";
    };
    readonly 'tool-name-glob': {
        readonly zh: "文件搜索";
        readonly en: "Glob";
    };
    readonly 'tool-name-grep': {
        readonly zh: "内容搜索";
        readonly en: "Grep";
    };
    readonly 'tool-name-write': {
        readonly zh: "写入";
        readonly en: "Write";
    };
    readonly 'tool-name-todo_write': {
        readonly zh: "待办清单";
        readonly en: "TodoWrite";
    };
    readonly 'tool-name-subagent': {
        readonly zh: "子代理";
        readonly en: "Task";
    };
    readonly 'tool-name-team-message': {
        readonly zh: "团队消息";
        readonly en: "Message";
    };
    readonly 'tool-name-team-roster': {
        readonly zh: "团队成员";
        readonly en: "Team";
    };
    readonly 'tool-name-team-wait': {
        readonly zh: "等待团队";
        readonly en: "Wait";
    };
    readonly 'tool-name-team-interrupt': {
        readonly zh: "中断成员";
        readonly en: "Interrupt";
    };
    readonly 'tool-name-team-task': {
        readonly zh: "任务板";
        readonly en: "Tasks";
    };
    readonly 'tool-name-web_search': {
        readonly zh: "联网搜索";
        readonly en: "WebSearch";
    };
    readonly 'tool-name-multiedit': {
        readonly zh: "多处编辑";
        readonly en: "MultiEdit";
    };
    readonly 'tool-name-notebookedit': {
        readonly zh: "笔记本编辑";
        readonly en: "NotebookEdit";
    };
    readonly 'tool-name-webfetch': {
        readonly zh: "网页抓取";
        readonly en: "WebFetch";
    };
    readonly 'tool-name-skill': {
        readonly zh: "技能";
        readonly en: "Skill";
    };
    readonly 'tool-exit-code': {
        readonly zh: "退出码 {{code}}";
        readonly en: "Exit code {{code}}";
    };
    readonly 'tool-killed-signal': {
        readonly zh: "被信号 {{name}} 终止";
        readonly en: "Killed by signal {{name}}";
    };
    readonly 'tool-running-elapsed': {
        readonly zh: "运行中…（{{duration}}）";
        readonly en: "Running… ({{duration}})";
    };
    readonly 'diff-patch-added': {
        readonly zh: "新文件";
        readonly en: "new file";
    };
    readonly 'diff-patch-deleted': {
        readonly zh: "已删除";
        readonly en: "deleted";
    };
    readonly 'tool-live-omitted': {
        readonly zh: "… 已省略 {{count}} 行";
        readonly en: {
            readonly one: "… {{count}} line omitted";
            readonly other: "… {{count}} lines omitted";
        };
    };
    readonly 'search-results-total': {
        readonly zh: "…（共 {{n}} 条）";
        readonly en: "… ({{n}} total)";
    };
    readonly 'lines-folded-expand': {
        readonly zh: "… +{{n}} 行（{{key}} 展开）";
        readonly en: "… +{{n}} lines ({{key}} to expand)";
    };
    readonly 'tool-card-lines-unit': {
        readonly zh: "{{n}} 行";
        readonly en: "{{n}} lines";
    };
    readonly 'tool-card-chars-unit': {
        readonly zh: "{{n}} 字符";
        readonly en: "{{n}} chars";
    };
    readonly 'tool-card-lines-hidden': {
        readonly zh: "… 已折叠 {{parts}}（{{key}} 展开）";
        readonly en: "… folded {{parts}} ({{key}} to expand)";
    };
    readonly 'tool-card-source-truncated': {
        readonly zh: "原始数据已折叠：以上是预览，全文保留在会话日志里";
        readonly en: "Source folded: the above is a preview; the session log keeps the full text";
    };
    readonly 'tool-card-full-unavailable': {
        readonly zh: "以上是整理后的视图，没有保留可展开的原始全文";
        readonly en: "Formatted view above; no raw full text was kept to expand";
    };
    readonly 'tool-card-window-shown': {
        readonly zh: "… 只显示前 {{shown}}/{{total}} 行（全文仍保留）";
        readonly en: "… showing the first {{shown}}/{{total}} lines (the full text is kept)";
    };
    readonly 'tool-card-window-shown-wrapped': {
        readonly zh: "… 只显示前 {{shown}}/{{total}} 个换行后的行";
        readonly en: "… showing the first {{shown}}/{{total}} wrapped rows";
    };
    readonly 'usage-turn-summary': {
        readonly zh: "本轮";
        readonly en: "turn";
    };
    readonly 'usage-cache-read': {
        readonly zh: "读 {{n}}";
        readonly en: "read {{n}}";
    };
    readonly 'usage-cache-write': {
        readonly zh: "写 {{n}}";
        readonly en: "write {{n}}";
    };
    readonly 'usage-cache-segment': {
        readonly zh: "缓存 {{parts}}";
        readonly en: "cache {{parts}}";
    };
    readonly 'usage-retry-segment': {
        readonly zh: "重试 {{n}} 次";
        readonly en: "{{n}} retries";
    };
    readonly 'usage-turn-outcome-interrupted': {
        readonly zh: "已中断";
        readonly en: "interrupted";
    };
    readonly 'usage-turn-outcome-error': {
        readonly zh: "未完成";
        readonly en: "unfinished";
    };
    readonly 'usage-sampled-at': {
        readonly zh: "截至 {{time}}";
        readonly en: "as of {{time}}";
    };
    readonly 'usage-last-turn': {
        readonly zh: "上一轮";
        readonly en: "last turn";
    };
    readonly 'sugg-commands-title': {
        readonly zh: "命令";
        readonly en: "commands";
    };
    readonly 'sugg-files-title': {
        readonly zh: "文件";
        readonly en: "files";
    };
    readonly 'sugg-count': {
        readonly zh: "共 {{n}} 项";
        readonly en: "{{n}} items";
    };
    readonly 'sugg-more-above': {
        readonly zh: "↑{{n}}";
        readonly en: "↑{{n}}";
    };
    readonly 'sugg-more-below': {
        readonly zh: "↓{{n}}";
        readonly en: "↓{{n}}";
    };
    readonly 'sugg-status-desc': {
        readonly zh: "显示当前选择";
        readonly en: "Show the current choice";
    };
    readonly 'sugg-lang-zh-desc': {
        readonly zh: "切换界面语言到中文";
        readonly en: "Switch the UI language to Chinese";
    };
    readonly 'sugg-lang-en-desc': {
        readonly zh: "切换界面语言到英文";
        readonly en: "Switch the UI language to English";
    };
    readonly 'sugg-theme-auto-desc': {
        readonly zh: "跟随终端背景自动切换";
        readonly en: "Follow the terminal background";
    };
    readonly 'sugg-theme-builtin-desc': {
        readonly zh: "内置主题";
        readonly en: "Built-in theme";
    };
    readonly 'sugg-theme-user-desc': {
        readonly zh: "用户主题（{{base}} 基底）";
        readonly en: "User theme ({{base}} base)";
    };
    readonly 'sugg-theme-plugin-desc': {
        readonly zh: "插件主题（{{base}} 基底）";
        readonly en: "Plugin theme ({{base}} base)";
    };
    readonly 'sugg-effort-level-desc': {
        readonly zh: "思考强度档位";
        readonly en: "Reasoning effort level";
    };
    readonly 'sugg-activity-frames-desc': {
        readonly zh: "列出或切换动画帧预设";
        readonly en: "List or switch frame presets";
    };
    readonly 'sugg-activity-frame-desc': {
        readonly zh: "动画帧预设";
        readonly en: "Animation frame preset";
    };
    readonly 'sugg-color-reset-desc': {
        readonly zh: "清除会话颜色，恢复主题默认";
        readonly en: "Clear the session color";
    };
    readonly 'sugg-mcp-reconnect-desc': {
        readonly zh: "重新连接一个 MCP 服务器";
        readonly en: "Reconnect an MCP server";
    };
    readonly 'sugg-mcp-toggle-desc': {
        readonly zh: "开启或关闭一个 MCP 服务器";
        readonly en: "Turn an MCP server on or off";
    };
    readonly 'sugg-mcp-server-desc': {
        readonly zh: "MCP 服务器";
        readonly en: "MCP server";
    };
    readonly 'sugg-mcp-on-desc': {
        readonly zh: "开启该服务器";
        readonly en: "Enable the server";
    };
    readonly 'sugg-mcp-off-desc': {
        readonly zh: "关闭该服务器";
        readonly en: "Disable the server";
    };
    readonly 'sugg-color-name-desc': {
        readonly zh: "会话强调色";
        readonly en: "Session accent color";
    };
    readonly 'settings-fullscreen-restart': {
        readonly zh: "全屏设置已保存，重启 dsh-tui 后生效";
        readonly en: "Fullscreen preference saved — restart dsh-tui to apply";
    };
    readonly 'settings-launchpad-restart': {
        readonly zh: "启动页设置已保存，重启 dsh-tui 后生效";
        readonly en: "Launchpad preference saved — restart dsh-tui to apply";
    };
    readonly 'settings-terminal-images-restart': {
        readonly zh: "图片预览设置已保存，使用 /restart 重启 TUI 后生效";
        readonly en: "Image preview preference saved — use /restart to apply";
    };
    readonly 'settings-fullscreen-migrated': {
        readonly zh: "全屏已是出厂默认（已清除更新前的 inline 选择）；偏好 inline 可在 /settings 改回";
        readonly en: "Fullscreen is now the factory default (pre-update inline choice cleared); prefer inline? Switch back in /settings";
    };
    readonly 'help-for-commands': {
        readonly zh: "/ 查看命令";
        readonly en: "/ for commands";
    };
    readonly 'help-this-help': {
        readonly zh: "? 查看本帮助";
        readonly en: "? for this help";
    };
    readonly 'help-verbose-output': {
        readonly zh: "{{key}} 详细输出";
        readonly en: "{{key}} for verbose output";
    };
    readonly 'help-open-trajectory': {
        readonly zh: "{{key}} 打开会话轨迹";
        readonly en: "{{key}} to open trajectory";
    };
    readonly 'help-search-history': {
        readonly zh: "{{key}} 搜索历史";
        readonly en: "{{key}} to search history";
    };
    readonly 'help-interrupt': {
        readonly zh: "ctrl+c 打断";
        readonly en: "ctrl+c to interrupt";
    };
    readonly 'help-exit': {
        readonly zh: "ctrl+d 退出";
        readonly en: "ctrl+d to exit";
    };
    readonly 'help-redraw': {
        readonly zh: "{{key}} 重绘";
        readonly en: "{{key}} to redraw";
    };
    readonly 'help-clear-input': {
        readonly zh: "esc 清空输入";
        readonly en: "esc to clear input";
    };
    readonly 'help-history-nav': {
        readonly zh: "↑/↓ 历史";
        readonly en: "↑/↓ for history";
    };
    readonly 'help-move-cursor': {
        readonly zh: "←/→ 移动光标";
        readonly en: "←/→ to move cursor";
    };
    readonly 'help-word-jumps': {
        readonly zh: "{{mod}}←/→ 或 Alt/Option+←/→ 按词跳转";
        readonly en: "{{mod}}←/→ or Alt/Option+←/→ for word jumps";
    };
    readonly 'help-complete-command': {
        readonly zh: "tab 补全命令";
        readonly en: "tab to complete command";
    };
    readonly 'help-cycle-mode': {
        readonly zh: "shift+tab 切换模式";
        readonly en: "shift+tab to cycle mode";
    };
    readonly 'help-open-editor': {
        readonly zh: "{{key}} 打开编辑器";
        readonly en: "{{key}} to open editor";
    };
    readonly 'help-fold-todos': {
        readonly zh: "{{key}} 运行时折叠／空闲时隐藏待办";
        readonly en: "{{key}} to fold running / hide idle todos";
    };
    readonly 'goal-todo-hide-hint': {
        readonly zh: "{{key}} 隐藏／恢复";
        readonly en: "{{key}} to hide/restore";
    };
    readonly 'goal-todo-fold-hint': {
        readonly zh: "{{key}} 折叠";
        readonly en: "{{key}} to fold";
    };
    readonly 'goal-budget-used': {
        readonly zh: "已用 {{used}} / {{budget}} tokens · {{time}}";
        readonly en: "Used {{used}} / {{budget}} tokens · {{time}}";
    };
    readonly 'goal-budget-used-open': {
        readonly zh: "已用 {{used}} tokens · {{time}}";
        readonly en: "Used {{used}} tokens · {{time}}";
    };
    readonly 'goal-phase-active': {
        readonly zh: "进行中";
        readonly en: "active";
    };
    readonly 'goal-phase-paused': {
        readonly zh: "已暂停";
        readonly en: "paused";
    };
    readonly 'goal-phase-blocked': {
        readonly zh: "受阻";
        readonly en: "blocked";
    };
    readonly 'goal-phase-complete': {
        readonly zh: "已完成";
        readonly en: "complete";
    };
    readonly 'goal-backend-none': {
        readonly zh: "当前没有目标";
        readonly en: "No goal is set";
    };
    readonly 'goal-backend-usage': {
        readonly zh: "用法：/goal <目标>（可加 --budget 50k 设 token 预算）· /goal pause · /goal resume · /goal clear";
        readonly en: "Usage: /goal <objective> (add --budget 50k for a token budget) · /goal pause · /goal resume · /goal clear";
    };
    readonly 'goal-backend-objective': {
        readonly zh: "目标：{{objective}}";
        readonly en: "Goal: {{objective}}";
    };
    readonly 'goal-backend-phase': {
        readonly zh: "状态：{{phase}}";
        readonly en: "Status: {{phase}}";
    };
    readonly 'goal-backend-rounds': {
        readonly zh: "轮次：{{started}}/{{max}}";
        readonly en: "Rounds: {{started}}/{{max}}";
    };
    readonly 'goal-backend-blocked': {
        readonly zh: "受阻原因：{{message}}";
        readonly en: "Blocked: {{message}}";
    };
    readonly 'goal-backend-bad-budget': {
        readonly zh: "无效的 token 预算「{{value}}」（例：50000、50k、1.5m）";
        readonly en: "Invalid token budget \"{{value}}\" (e.g. 50000, 50k, 1.5m)";
    };
    readonly 'goal-backend-missing-objective': {
        readonly zh: "请写出目标内容：/goal <目标>";
        readonly en: "Say what the goal is: /goal <objective>";
    };
    readonly 'goal-backend-set': {
        readonly zh: "已设置目标";
        readonly en: "Goal set";
    };
    readonly 'goal-backend-paused': {
        readonly zh: "目标已暂停";
        readonly en: "Goal paused";
    };
    readonly 'goal-backend-resumed': {
        readonly zh: "目标已恢复";
        readonly en: "Goal resumed";
    };
    readonly 'goal-backend-cleared': {
        readonly zh: "目标已清除";
        readonly en: "Goal cleared";
    };
    readonly 'help-commands-title': {
        readonly zh: "命令：";
        readonly en: "commands:";
    };
    readonly 'help-scroll-hint': {
        readonly zh: "↑/↓ 滚动 · PgUp/PgDn 翻页 · Home/End 首尾 · Esc 关闭";
        readonly en: "↑/↓ scroll · PgUp/PgDn page · Home/End jump · Esc close";
    };
    readonly 'tips-title': {
        readonly zh: "使用技巧（快捷键 · 命令 · 工作流 · 个性化 · 避坑）";
        readonly en: "Usage tips (shortcuts · commands · workflow · display · gotchas)";
    };
    readonly 'tips-hint': {
        readonly zh: "↑/↓ 滚动 · Esc 关闭";
        readonly en: "↑/↓ scroll · Esc to close";
    };
    readonly 'interrupted-by-user': {
        readonly zh: "已打断 ";
        readonly en: "Interrupted ";
    };
    readonly 'interrupted-ask-next': {
        readonly zh: "· 接下来想让 DeepSeek 做什么？";
        readonly en: "· What should DeepSeek do instead?";
    };
    readonly 'interrupted-ask-backend': {
        readonly zh: "· 接下来想让 {{name}} 做什么？";
        readonly en: "· What should {{name}} do instead?";
    };
    readonly 'load-earlier': {
        readonly zh: " ↑ 加载更早消息（会话日志完整，/export 导出全文） ";
        readonly en: " ↑ load earlier messages (full session log; /export for full text) ";
    };
    readonly 'show-previous-messages': {
        readonly zh: " {{key}} 显示前 {{n}} 条消息 ";
        readonly en: " {{key}} to show {{n}} previous messages ";
    };
    readonly 'resume-resumed': {
        readonly zh: "已恢复会话";
        readonly en: "Session resumed";
    };
    readonly 'agentview-empty-prompt': {
        readonly zh: "派发内容不能为空";
        readonly en: "Dispatch prompt cannot be empty";
    };
    readonly 'agentview-dispatch-unavailable': {
        readonly zh: "无法派发后台会话——agent 服务不可用";
        readonly en: "Cannot dispatch a background session — the agent service is unavailable";
    };
    readonly 'agentview-dispatch-failed': {
        readonly zh: "后台会话创建失败 · {{err}}";
        readonly en: "Background session creation failed · {{err}}";
    };
    readonly 'agentview-reply-empty': {
        readonly zh: "回复内容为空";
        readonly en: "Reply is empty";
    };
    readonly 'agentview-reply-stopped': {
        readonly zh: "该会话未运行——回车切换进去后回复";
        readonly en: "This session is not running — press Enter to attach and reply";
    };
    readonly 'approval-background-agent': {
        readonly zh: "来自后台会话 {{id}} 的审批请求";
        readonly en: "Approval request from background session {{id}}";
    };
    readonly 'input-background-hint-count': {
        readonly zh: "← {{n}} 个会话等待输入";
        readonly en: "← {{n}} agents";
    };
    readonly 'input-background-hint-idle': {
        readonly zh: "← 会话总览";
        readonly en: "← for agents";
    };
    readonly 'settings-title': {
        readonly zh: "插件设置";
        readonly en: "Plugin settings";
    };
    readonly 'settings-unavailable': {
        readonly zh: "设置服务未挂载——只读";
        readonly en: "settings service absent — read-only";
    };
    readonly 'settings-empty': {
        readonly zh: "没有可配置的插件设置（尚无插件注册设置区块）";
        readonly en: "No configurable plugin settings (no plugin has registered a section)";
    };
    readonly 'settings-group-empty': {
        readonly zh: "此分组没有可配置字段";
        readonly en: "No configurable fields in this group";
    };
    readonly 'settings-section-unavailable': {
        readonly zh: "命名空间未注册";
        readonly en: "namespace not served";
    };
    readonly 'settings-badge-restart': {
        readonly zh: "重启生效";
        readonly en: "applies on restart";
    };
    readonly 'settings-badge-unreadable': {
        readonly zh: "设置文件无法读取——已回退默认；保存前会先备份原文件";
        readonly en: "settings file unreadable — defaults shown; saving backs up the original first";
    };
    readonly 'settings-badge-recovered': {
        readonly zh: "损坏的设置文件已备份到 {{backup}}";
        readonly en: "the broken settings file was backed up to {{backup}}";
    };
    readonly 'settings-badge-dirty': {
        readonly zh: "未保存";
        readonly en: "unsaved";
    };
    readonly 'settings-badge-saving': {
        readonly zh: "保存中";
        readonly en: "saving";
    };
    readonly 'settings-badge-failed': {
        readonly zh: "保存失败";
        readonly en: "save failed";
    };
    readonly 'settings-field-customized': {
        readonly zh: "已自定义";
        readonly en: "customized";
    };
    readonly 'settings-field-empty': {
        readonly zh: "（未设置）";
        readonly en: "(unset)";
    };
    readonly 'settings-field-invalid': {
        readonly zh: "无效输入";
        readonly en: "invalid";
    };
    readonly 'settings-secret-set': {
        readonly zh: "●●●●●●（已配置）";
        readonly en: "●●●●●● (configured)";
    };
    readonly 'settings-secret-unset': {
        readonly zh: "（未配置）";
        readonly en: "(not configured)";
    };
    readonly 'settings-secret-staged': {
        readonly zh: "（待保存）";
        readonly en: "(pending save)";
    };
    readonly 'settings-saved': {
        readonly zh: "已保存 {{ns}}";
        readonly en: "Saved {{ns}}";
    };
    readonly 'settings-save-failed': {
        readonly zh: "保存 {{ns}} 失败——请重试";
        readonly en: "Saving {{ns}} failed — please retry";
    };
    readonly 'settings-secret-ref-reserved': {
        readonly zh: "凭据 {{ref}} 由宿主保留，写入被拒绝：第三方设置区块不能覆盖宿主共享凭据";
        readonly en: "Credential {{ref}} is reserved by the host; write rejected: third-party settings sections cannot overwrite host-shared credentials";
    };
    readonly 'settings-web-key-changed': {
        readonly zh: "网页搜索设置已变化，请重新打开设置后输入密钥";
        readonly en: "Web search settings changed. Reopen settings and enter the key again.";
    };
    readonly 'settings-panels-unclaimed': {
        readonly zh: "暂无面板使用此 id：先保留，等插件注册后生效";
        readonly en: "No panel uses this id yet; kept until a plugin registers it";
    };
    readonly 'settings-panels-temporary': {
        readonly zh: "临时面板 #{{n}} · 仅本次运行，不保存";
        readonly en: "Temporary panel #{{n}} · this run only, not saved";
    };
    readonly 'settings-panels-legacy-anonymous': {
        readonly zh: "旧匿名地址无法识别，请移除并重新选择面板";
        readonly en: "Old anonymous address: remove it and select the panel again";
    };
    readonly 'settings-panels-plugin': {
        readonly zh: "插件面板（{{plugin}}）";
        readonly en: "Plugin panel ({{plugin}})";
    };
    readonly 'settings-panels-advanced': {
        readonly zh: "高级：编辑原始面板列表";
        readonly en: "Advanced: edit raw panel list";
    };
    readonly 'settings-fields-advanced': {
        readonly zh: "高级：编辑原始字段列表";
        readonly en: "Advanced: edit raw field list";
    };
    readonly 'settings-fields-unclaimed': {
        readonly zh: "未认领：先保留，等插件注册后生效";
        readonly en: "Unclaimed; kept until a plugin registers it";
    };
    readonly 'settings-fields-moved': {
        readonly zh: "改自 {{slot}}";
        readonly en: "moved from {{slot}}";
    };
    readonly 'settings-fields-slot-left-tail': {
        readonly zh: "左组末尾";
        readonly en: "Left group tail";
    };
    readonly 'settings-fields-slot-right-head': {
        readonly zh: "右组开头";
        readonly en: "Right group head";
    };
    readonly 'settings-fields-slot-right-tail': {
        readonly zh: "右组末尾";
        readonly en: "Right group tail";
    };
    readonly 'settings-panels-min-one': {
        readonly zh: "至少保留一个启用的面板";
        readonly en: "Keep at least one panel enabled";
    };
    readonly 'settings-page-general': {
        readonly zh: "常规";
        readonly en: "General";
    };
    readonly 'settings-hint-list': {
        readonly zh: "**Enter** 进入/编辑/切换（改动即保存） · Esc 退出";
        readonly en: "**Enter** open/edit/toggle (auto-saves) · Esc exit";
    };
    readonly 'settings-hint-list-pages': {
        readonly zh: "**Enter** 进入/编辑/切换（改动即保存） · **Tab** 切换页 · Esc 退出";
        readonly en: "**Enter** open/edit/toggle (auto-saves) · **Tab** switch page · Esc exit";
    };
    readonly 'settings-hint-group': {
        readonly zh: "**Enter** 编辑/切换（改动即保存） · Esc 返回";
        readonly en: "**Enter** edit/toggle (auto-saves) · Esc back";
    };
    readonly 'settings-hint-edit': {
        readonly zh: "**Enter** 确认并保存 · Esc 取消";
        readonly en: "**Enter** to confirm & save · Esc to cancel";
    };
    readonly 'session-resume-failed': {
        readonly zh: "恢复会话失败 · {{err}}";
        readonly en: "Resuming the session failed · {{err}}";
    };
    readonly 'session-when-now': {
        readonly zh: "刚刚";
        readonly en: "just now";
    };
    readonly 'session-when-minutes': {
        readonly zh: "{{n}} 分钟前";
        readonly en: "{{n}}m ago";
    };
    readonly 'session-when-hours': {
        readonly zh: "{{n}} 小时前";
        readonly en: "{{n}}h ago";
    };
    readonly 'session-when-days': {
        readonly zh: "{{n}} 天前";
        readonly en: "{{n}}d ago";
    };
    readonly 'session-when-date': {
        readonly zh: "{{month}} 月 {{day}} 日";
        readonly en: "{{month}}/{{day}}";
    };
    readonly 'session-children': {
        readonly zh: "{{n}} 个子运行";
        readonly en: "{{n}} runs";
    };
    readonly 'session-kind-root': {
        readonly zh: "对话";
        readonly en: "Conversation";
    };
    readonly 'session-kind-fork': {
        readonly zh: "回溯分支";
        readonly en: "Rewound branch";
    };
    readonly 'session-kind-subagent': {
        readonly zh: "子 agent 运行";
        readonly en: "Sub-agent run";
    };
    readonly 'session-project-unknown': {
        readonly zh: "（未记录目录）";
        readonly en: "(no directory recorded)";
    };
    readonly 'session-workspace-all': {
        readonly zh: "全部工作目录";
        readonly en: "All working directories";
    };
    readonly 'session-workspace-current': {
        readonly zh: "当前";
        readonly en: "current";
    };
    readonly 'session-workspace-project-count': {
        readonly zh: "{{n}} 个目录";
        readonly en: "{{n}} directories";
    };
    readonly 'session-workspace-all-detail': {
        readonly zh: "跨目录浏览 · {{n}} 个会话";
        readonly en: "browse across directories · {{n}} sessions";
    };
    readonly 'session-workspace-empty': {
        readonly zh: "暂无历史会话";
        readonly en: "no history yet";
    };
    readonly 'resume-menu-pin': {
        readonly zh: "固定到顶部";
        readonly en: "Pin to top";
    };
    readonly 'resume-menu-unpin': {
        readonly zh: "取消固定";
        readonly en: "Unpin";
    };
    readonly 'resume-pin-save-failed': {
        readonly zh: "固定状态保存失败，未应用更改";
        readonly en: "Could not save pin; no change was applied";
    };
    readonly 'session-count-shown': {
        readonly zh: "{{n}} 个会话";
        readonly en: "{{n}} sessions";
    };
    readonly 'session-preview-times': {
        readonly zh: "创建于 {{created}} · 最后活动 {{updated}}";
        readonly en: "created {{created}} · last active {{updated}}";
    };
    readonly 'session-preview-loading': {
        readonly zh: "正在读取会话结尾…";
        readonly en: "Reading the end of this session…";
    };
    readonly 'session-preview-empty': {
        readonly zh: "这个会话没有可预览的往来消息";
        readonly en: "No exchanges to preview in this session";
    };
    readonly 'hint-confirm-exit': {
        readonly zh: "**Enter** 确认 · Esc 退出";
        readonly en: "**Enter** to confirm · Esc to exit";
    };
    readonly 'hint-select-exit': {
        readonly zh: "**Enter** 选择 · Esc 退出";
        readonly en: "**Enter** to select · Esc to exit";
    };
    readonly 'hint-fill-exit': {
        readonly zh: "**Enter** 填入命令 · Esc 退出";
        readonly en: "**Enter** to insert · Esc to exit";
    };
    readonly 'hint-rewind-back': {
        readonly zh: "**Enter** 回退 · Esc 返回";
        readonly en: "**Enter** to rewind · Esc to back";
    };
    readonly 'statusline-hint-select': {
        readonly zh: "esc 返回输入";
        readonly en: "esc to return to input";
    };
    readonly 'statusline-hint-working': {
        readonly zh: "esc 中断";
        readonly en: "esc to interrupt";
    };
    readonly 'statusline-hint-interrupting': {
        readonly zh: "中断中…";
        readonly en: "interrupting…";
    };
    readonly 'statusline-hint-shortcuts': {
        readonly zh: "? 查看快捷键";
        readonly en: "? for shortcuts";
    };
    readonly 'status-detail-session-id': {
        readonly zh: "会话日志目录与此 id 同名";
        readonly en: "the session log directory is named after this id";
    };
    readonly 'status-detail-mode': {
        readonly zh: "点击或 /permission 切换权限模式";
        readonly en: "click or /permission to switch the permission mode";
    };
    readonly 'status-detail-model': {
        readonly zh: "点击或 /model 切换模型";
        readonly en: "click or /model to switch the model";
    };
    readonly 'status-detail-effort': {
        readonly zh: "点击或 /effort 调整推理强度";
        readonly en: "click or /effort to adjust reasoning effort";
    };
    readonly 'hint-ext-dialog-input': {
        readonly zh: "**Enter** 确认 · Esc 取消";
        readonly en: "**Enter** to confirm · Esc to cancel";
    };
    readonly 'hint-adjust-done': {
        readonly zh: "**←/→** 调整 · Enter/Esc 完成";
        readonly en: "**←/→** to adjust · Enter/Esc to done";
    };
    readonly 'hint-history-search': {
        readonly zh: "↑/↓ 选择 · **Enter** 确认 · Esc 取消";
        readonly en: "↑/↓ to navigate · **Enter** to select · Esc to cancel";
    };
    readonly 'hint-expand-ctrl-o': {
        readonly zh: "（{{key}} 展开）";
        readonly en: "({{key}} to expand)";
    };
    readonly 'long-line-folded': {
        readonly zh: "… 已折叠 {{n}} 字符（点击或 {{key}} 展开）";
        readonly en: "… {{n}} chars folded (click or {{key}} to expand)";
    };
    readonly 'file-actions-title': {
        readonly zh: "文件操作";
        readonly en: "File actions";
    };
    readonly 'file-actions-open': {
        readonly zh: "打开文件";
        readonly en: "Open file";
    };
    readonly 'file-actions-open-dir': {
        readonly zh: "打开文件夹";
        readonly en: "Open folder";
    };
    readonly 'file-actions-reveal': {
        readonly zh: "打开所在文件夹";
        readonly en: "Reveal in folder";
    };
    readonly 'file-actions-copy': {
        readonly zh: "复制绝对路径";
        readonly en: "Copy absolute path";
    };
    readonly 'picker-title-model': {
        readonly zh: "模型";
        readonly en: "Model";
    };
    readonly 'picker-group-recent': {
        readonly zh: "最近使用";
        readonly en: "Recently used";
    };
    readonly 'hint-model-provider': {
        readonly zh: "**Tab** / **Shift+Tab** 提供商";
        readonly en: "**Tab** / **Shift+Tab** providers";
    };
    readonly 'hint-model-navigation': {
        readonly zh: "**↑/↓** 模型";
        readonly en: "**↑/↓** model";
    };
    readonly 'hint-model-effort': {
        readonly zh: "**←/→** 调整";
        readonly en: "**←/→** adjust";
    };
    readonly 'hint-model-select': {
        readonly zh: "**Enter** 选择";
        readonly en: "**Enter** select";
    };
    readonly 'hint-model-cancel': {
        readonly zh: "**Esc** 取消";
        readonly en: "**Esc** cancel";
    };
    readonly 'picker-recents-empty': {
        readonly zh: "暂无最近使用的模型，按 Tab 查看提供商";
        readonly en: "No recent models; press Tab to browse providers";
    };
    readonly 'picker-models-empty': {
        readonly zh: "暂无可用模型";
        readonly en: "No models available";
    };
    readonly 'picker-effort-loading': {
        readonly zh: "正在加载…";
        readonly en: "Loading…";
    };
    readonly 'picker-effort-error': {
        readonly zh: "读取失败";
        readonly en: "Failed to load";
    };
    readonly 'picker-effort-unavailable': {
        readonly zh: "不支持";
        readonly en: "Unavailable";
    };
    readonly 'picker-effort-default': {
        readonly zh: "默认";
        readonly en: "Default";
    };
    readonly 'picker-title-skills': {
        readonly zh: "技能";
        readonly en: "Skills";
    };
    readonly 'skills-loading': {
        readonly zh: "正在加载技能";
        readonly en: "Loading skills";
    };
    readonly 'skills-loading-subtitle': {
        readonly zh: "正在查询技能注册表…";
        readonly en: "Querying the skill registry…";
    };
    readonly 'skills-empty': {
        readonly zh: "当前会话没有可用技能";
        readonly en: "No skills available in this session";
    };
    readonly 'skills-load-failed': {
        readonly zh: "技能列表加载失败";
        readonly en: "Failed to load the skill list";
    };
    readonly 'skills-unknown': {
        readonly zh: "未知技能「{{name}}」";
        readonly en: "Unknown skill \"{{name}}\"";
    };
    readonly 'skills-not-invocable': {
        readonly zh: "技能「{{name}}」不可直接调用";
        readonly en: "Skill \"{{name}}\" is not directly invocable";
    };
    readonly 'plugin-scene-crashed': {
        readonly zh: "插件场景「{{id}}」渲染崩溃：{{err}}（已自动关闭）";
        readonly en: "Plugin scene \"{{id}}\" crashed while rendering: {{err}} (closed)";
    };
    readonly 'skills-source-bundled': {
        readonly zh: "内置";
        readonly en: "built-in";
    };
    readonly 'skills-source-user': {
        readonly zh: "用户";
        readonly en: "user";
    };
    readonly 'skills-source-project': {
        readonly zh: "项目";
        readonly en: "project";
    };
    readonly 'skills-source-runtime': {
        readonly zh: "运行时";
        readonly en: "runtime";
    };
    readonly 'skills-source-custom': {
        readonly zh: "自定义";
        readonly en: "custom";
    };
    readonly 'picker-title-theme': {
        readonly zh: "颜色主题";
        readonly en: "Color theme";
    };
    readonly 'picker-title-activity': {
        readonly zh: "指示器预设";
        readonly en: "Indicator preset";
    };
    readonly 'picker-title-color': {
        readonly zh: "会话强调色";
        readonly en: "Session accent color";
    };
    readonly 'picker-title-effort': {
        readonly zh: "推理强度";
        readonly en: "Reasoning effort";
    };
    readonly 'model-loading': {
        readonly zh: "正在加载模型";
        readonly en: "Loading models";
    };
    readonly 'model-load-failed': {
        readonly zh: "模型列表加载失败";
        readonly en: "Failed to load the model list";
    };
    readonly 'model-switching': {
        readonly zh: "正在切换模型到 {{name}}…";
        readonly en: "Switching model to {{name}}…";
    };
    readonly 'model-switched': {
        readonly zh: "模型已切换为 {{name}}";
        readonly en: "Model switched to {{name}}";
    };
    readonly 'rewind-title': {
        readonly zh: "回退";
        readonly en: "Rewind";
    };
    readonly 'rewind-subtitle': {
        readonly zh: "选择一条消息，将对话回退到该处";
        readonly en: "Pick a message to rewind the conversation to";
    };
    readonly 'rewind-confirm-title': {
        readonly zh: "将对话回退到这条消息？";
        readonly en: "Rewind conversation to this message?";
    };
    readonly 'rewind-confirm-desc': {
        readonly zh: "对话从此处重新开始";
        readonly en: "conversation restarts here";
    };
    readonly 'rewind-empty': {
        readonly zh: "没有可回退的消息";
        readonly en: "No messages to rewind to";
    };
    readonly 'rewind-last-message': {
        readonly zh: "最近一条消息";
        readonly en: "last message";
    };
    readonly 'rewind-none': {
        readonly zh: "还没有可回退的消息";
        readonly en: "Nothing to rewind yet";
    };
    readonly 'rewind-done': {
        readonly zh: "已回退——编辑后按 Enter 重新发送";
        readonly en: "Rewound — edit and press Enter to resend";
    };
    readonly 'rewind-mode-default': {
        readonly zh: "仅回退会话";
        readonly en: "Conversation only";
    };
    readonly 'rewind-waiting-plugins': {
        readonly zh: "正在等待插件决定…（Esc 放弃等待）";
        readonly en: "Waiting for plugins… (Esc to stop waiting)";
    };
    readonly 'ext-action-cancelled': {
        readonly zh: "操作已被插件取消";
        readonly en: "Action cancelled by a plugin";
    };
    readonly 'ext-action-handled': {
        readonly zh: "输入已由插件处理";
        readonly en: "Input handled by a plugin";
    };
    readonly 'ext-decision-pending': {
        readonly zh: "正在等待插件决定（{{event}}）…";
        readonly en: "Waiting for a plugin decision ({{event}})…";
    };
    readonly 'ext-stale-dropped': {
        readonly zh: "等待插件期间会话已切换，该条输入已丢弃";
        readonly en: "Session switched while a plugin decided — the input was dropped";
    };
    readonly 'ext-shortcut-failed': {
        readonly zh: "插件快捷键 {{combo}} 执行失败";
        readonly en: "Plugin shortcut {{combo}} failed";
    };
    readonly 'ext-status-field-failed': {
        readonly zh: "插件底栏字段 {{key}} 操作失败";
        readonly en: "Plugin footer field {{key}} failed";
    };
    readonly 'command-invoke-denied': {
        readonly zh: "命令调用已被授权文件拒绝（commands.invoke 已撤销）";
        readonly en: "Command invocation denied by the grants file (commands.invoke revoked)";
    };
    readonly 'command-invoke-denied-owner': {
        readonly zh: "命令 \"/{{name}}\" 的调用已被拒绝——注册它的插件 \"{{owner}}\" 已被撤销 commands.invoke";
        readonly en: "Command \"/{{name}}\" invocation denied — its owner plugin \"{{owner}}\" lost commands.invoke";
    };
    readonly 'plugins-trust-banner': {
        readonly zh: "插件与宿主同进程运行：授权是行为约束而非安全隔离；通过校验 ≠ 插件安全（C-070）。";
        readonly en: "Plugins run in-process with the host: grants are behavioral constraints, not a security boundary; passing validation ≠ a safe plugin (C-070).";
    };
    readonly 'plugins-host-unavailable': {
        readonly zh: "plugin-host 行未挂载：Host Descriptor 与授权矩阵按无信息降级。";
        readonly en: "plugin-host row not mounted: Host Descriptor and grant matrix degraded to no-data.";
    };
    readonly 'plugins-contract-dropped': {
        readonly zh: "已剔除（vendored 哈希漂移）";
        readonly en: "dropped (vendored hash drift)";
    };
    readonly 'plugins-matrix-note': {
        readonly zh: "授权矩阵（✓ 允许 / · 拒绝；仅显示有足迹的插件——授权文件、效果台账与存储目录的并集）：";
        readonly en: "Grant matrix (✓ allowed / · denied; plugins with footprints only — union of the grants file, effect ledger, and storage directory):";
    };
    readonly 'plugins-matrix-no-registry': {
        readonly zh: "（权限注册表不可用）";
        readonly en: "(permission registry unavailable)";
    };
    readonly 'plugins-matrix-empty': {
        readonly zh: "（暂无插件足迹）";
        readonly en: "(no plugin footprints yet)";
    };
    readonly 'plugins-footprint-overflow': {
        readonly zh: "…另有 {{count}} 个插件未显示";
        readonly en: {
            readonly one: "…{{count}} more plugin not shown";
            readonly other: "…{{count}} more plugins not shown";
        };
    };
    readonly 'plugins-ledger-empty': {
        readonly zh: "效果台账为空。";
        readonly en: "The effect ledger is empty.";
    };
    readonly 'plugins-ledger-header': {
        readonly zh: "效果台账（{{file}}）尾 5 条：";
        readonly en: "Effect ledger ({{file}}), last 5 records:";
    };
    readonly 'plugins-unknown-subcommand': {
        readonly zh: "未知子命令：{{sub}}（支持：list / install <spec> / remove <bundle> / disable <名称|id> / enable <名称|id> / check <路径> / info <spec> / registries）";
        readonly en: "Unknown subcommand: {{sub}} (supported: list / install <spec> / remove <bundle> / disable <name|id> / enable <name|id> / check <path> / info <spec> / registries)";
    };
    readonly 'plugins-check-usage': {
        readonly zh: "用法：/plugin check <dsh-plugin.json 路径>";
        readonly en: "Usage: /plugin check <path-to-dsh-plugin.json>";
    };
    readonly 'plugins-check-not-found': {
        readonly zh: "文件不存在：{{path}}";
        readonly en: "File not found: {{path}}";
    };
    readonly 'plugins-check-invalid-json': {
        readonly zh: "不是可解析的 JSON：{{err}}";
        readonly en: "Not parseable JSON: {{err}}";
    };
    readonly 'plugins-check-spec-unavailable': {
        readonly zh: "vendored 规范数据不可用（tui-profile/），无法校验。";
        readonly en: "Vendored spec data unavailable (tui-profile/); cannot validate.";
    };
    readonly 'plugins-check-schema-failed': {
        readonly zh: "schema 校验失败：{{err}}";
        readonly en: "Schema validation failed: {{err}}";
    };
    readonly 'plugins-check-invalid': {
        readonly zh: "语义校验失败：{{err}}";
        readonly en: "Semantic validation failed: {{err}}";
    };
    readonly 'plugins-check-state': {
        readonly zh: "协商结果：{{state}}";
        readonly en: "Negotiation decision: {{state}}";
    };
    readonly 'plugins-grant-hint': {
        readonly zh: "授权方法：在 ~/.dsh-tui/extension-grants.json 的 \"grants\" 段为插件 id 添加规则（如 { \"name\": \"<权限>\", \"scope\": \"<范围>\" }），保存即生效、无需重启。";
        readonly en: "To grant: add a rule for the plugin id under \"grants\" in ~/.dsh-tui/extension-grants.json (e.g. { \"name\": \"<permission>\", \"scope\": \"<scope>\" }); saved changes apply immediately, no restart.";
    };
    readonly 'plugins-check-grant-hint': {
        readonly zh: "授权方法：在 ~/.dsh-tui/extension-grants.json 的 \"grants\" 段加入 \"{{id}}\": [{ \"name\": \"<权限>\", \"scope\": \"<范围>\" }]；待授权权限：{{perms}}。";
        readonly en: "To authorize: add \"{{id}}\": [{ \"name\": \"<permission>\", \"scope\": \"<scope>\" }] under \"grants\" in ~/.dsh-tui/extension-grants.json; pending permissions: {{perms}}.";
    };
    readonly 'plugins-check-dropped': {
        readonly zh: "（宿主描述符已剔除漂移契约：{{dropped}}）";
        readonly en: "(host descriptor dropped drifted contracts: {{dropped}})";
    };
    readonly 'plugins-check-host-unavailable': {
        readonly zh: "当前没有 live Host Descriptor；只做静态 manifest 校验，不进行协议支持声明/协商。";
        readonly en: "No live Host Descriptor is available; only static manifest validation was performed, no protocol support declaration/negotiation.";
    };
    readonly 'plugins-service-unavailable': {
        readonly zh: "当前内核没有 profile 插件服务（ctx.pluginManager）：bundle / 行列表与生命周期动作都不可用。";
        readonly en: "This kernel provides no profile plugin service (ctx.pluginManager): the bundle/row list and the lifecycle actions are unavailable.";
    };
    readonly 'plugins-service-unavailable-route': {
        readonly zh: "装 / 卸走命令行：`dsh plugin --profile dsh-tui add|remove …`；启用 / 关闭没有命令行动词，请以 `dsh --profile dsh-tui` 启动本应用后在 /plugin 里操作。";
        readonly en: "Install and remove go through the CLI: `dsh plugin --profile dsh-tui add|remove …`. Enable and disable have no CLI verb — start this app with `dsh --profile dsh-tui` and use /plugin.";
    };
    readonly 'plugins-service-error': {
        readonly zh: "插件服务调用失败：{{err}}（上面的诊断部分照常显示。重试一次；仍失败请用 `dsh plugin --profile dsh-tui` 查看 CLI 侧的报错。）";
        readonly en: "The plugin service call failed: {{err}} (the diagnostics above are unaffected. Retry once; if it keeps failing, read the CLI-side error with `dsh plugin --profile dsh-tui`.)";
    };
    readonly 'plugins-list-header': {
        readonly zh: "你装的额外插件（{{count}}）：";
        readonly en: "Plugins you added ({{count}}):";
    };
    readonly 'plugins-list-empty': {
        readonly zh: "本 profile 没有额外插件：只有安装自带与 dsh-tui 自身。装好后用 /plugin list 复查。";
        readonly en: "No extra plugins in this profile: only the installation-supplied bundles and dsh-tui itself. Run /plugin list again after installing one.";
    };
    readonly 'plugins-experimental-header': {
        readonly zh: "DSH 自带实验性功能（EXP，{{count}} 项）：";
        readonly en: "Experimental features shipped by DSH (EXP, {{count}}):";
    };
    readonly 'plugins-experimental-enable': {
        readonly zh: "启用：/plugin enable {{bundle}}";
        readonly en: "Enable: /plugin enable {{bundle}}";
    };
    readonly 'plugins-experimental-disable': {
        readonly zh: "关闭：/plugin disable {{bundle}}";
        readonly en: "Disable: /plugin disable {{bundle}}";
    };
    readonly 'plugins-experimental-team-hint': {
        readonly zh: "用途：Agent 分工合作，/team status 看状态";
        readonly en: "Use: agents divide the work; /team status shows the roster";
    };
    readonly 'plugins-experimental-auto-review-hint': {
        readonly zh: "用途：/permission auto，模型自主审批";
        readonly en: "Use: /permission auto — the model approves on its own";
    };
    readonly 'plugins-experimental-session-search-hint': {
        readonly zh: "用途：Agent 能翻本工作区的历史会话";
        readonly en: "Use: agents can browse past sessions in this workspace";
    };
    readonly 'plugins-bundles-header': {
        readonly zh: "已装 bundle（数据来自 profile 插件服务）：";
        readonly en: "Installed bundles (from the profile plugin service):";
    };
    readonly 'plugins-bundles-official': {
        readonly zh: "安装自带";
        readonly en: "Official (installation-supplied)";
    };
    readonly 'plugins-bundles-installed': {
        readonly zh: "profile 依赖";
        readonly en: "Profile dependencies";
    };
    readonly 'plugins-bundles-empty': {
        readonly zh: "（这个 profile 里还没有 bundle）";
        readonly en: "(no bundles in this profile yet)";
    };
    readonly 'plugins-bundle-on': {
        readonly zh: "已启用";
        readonly en: "on";
    };
    readonly 'plugins-bundle-off': {
        readonly zh: "未启用";
        readonly en: "off";
    };
    readonly 'plugins-bundle-kept': {
        readonly zh: "不可卸载";
        readonly en: "not removable";
    };
    readonly 'plugins-bundle-locked': {
        readonly zh: "不可管理（{{reason}}）";
        readonly en: "locked ({{reason}})";
    };
    readonly 'plugins-bundle-problem': {
        readonly zh: "问题：{{code}}";
        readonly en: "problem: {{code}}";
    };
    readonly 'plugins-bundle-rows': {
        readonly zh: "行 {{rows}} / 覆盖 {{overrides}}";
        readonly en: "rows {{rows}} / overrides {{overrides}}";
    };
    readonly 'plugins-rows-header': {
        readonly zh: "没有 patch 行可管理的 loader 条目：";
        readonly en: "Loader entries no patch row can address:";
    };
    readonly 'plugins-tag-undeclared': {
        readonly zh: "未声明 TUI 贡献";
        readonly en: "no TUI contribution declared";
    };
    readonly 'plugins-tag-undeclared-hint': {
        readonly zh: "「未声明 TUI 贡献」= 该包没有包根 dsh-plugin.json（@dsh-std/manifest 0.15 形状）：它不会作为后端或贡献出现，运行时既不拒绝也不报错。声明写法见 tui-profile/docs/plugin-admission-and-development.md。";
        readonly en: "“no TUI contribution declared” = the package ships no package-root dsh-plugin.json (@dsh-std/manifest 0.15): it will not appear as a backend or contribution, and the runtime neither refuses it nor reports an error. See tui-profile/docs/plugin-admission-and-development.md for how to declare one.";
    };
    readonly 'plugins-tag-invalid': {
        readonly zh: "声明无法判定：{{err}}";
        readonly en: "declaration undecidable: {{err}}";
    };
    readonly 'plugins-tag-declared': {
        readonly zh: "TUI 贡献：{{state}}";
        readonly en: "TUI contribution: {{state}}";
    };
    readonly 'plugins-info-usage': {
        readonly zh: "用法：/plugin info <已装 bundle 名或待装 spec>";
        readonly en: "Usage: /plugin info <installed bundle name or install spec>";
    };
    readonly 'plugins-info-bundle': {
        readonly zh: "已装 bundle：{{name}}";
        readonly en: "Installed bundle: {{name}}";
    };
    readonly 'plugins-info-rows-label': {
        readonly zh: "  行：";
        readonly en: "  rows:";
    };
    readonly 'plugins-info-overrides-label': {
        readonly zh: "  覆盖的行：{{list}}";
        readonly en: "  overridden rows: {{list}}";
    };
    readonly 'plugins-info-problem': {
        readonly zh: "  问题：{{code}}{{diagnostic}}";
        readonly en: "  problem: {{code}}{{diagnostic}}";
    };
    readonly 'plugins-info-inspect-refused': {
        readonly zh: "不可安装：{{problem}} — {{reason}}";
        readonly en: "Not installable: {{problem}} — {{reason}}";
    };
    readonly 'plugins-info-inspect-accepted': {
        readonly zh: "可安装：{{name}} {{version}} · {{kind}} · bundle={{bundle}} · 来源 {{registry}}";
        readonly en: "Installable: {{name}} {{version}} · {{kind}} · bundle={{bundle}} · from {{registry}}";
    };
    readonly 'plugins-info-inspect-description': {
        readonly zh: "  {{description}}";
        readonly en: "  {{description}}";
    };
    readonly 'plugins-info-inspect-host': {
        readonly zh: "  来源主机：{{host}}";
        readonly en: "  source host: {{host}}";
    };
    readonly 'plugins-info-registries-header': {
        readonly zh: "安装源（首用优先，逐级回退）：";
        readonly en: "Registries (asked first, then in order):";
    };
    readonly 'plugins-info-registries-first': {
        readonly zh: "  首选：{{registry}}";
        readonly en: "  first: {{registry}}";
    };
    readonly 'plugins-info-registries-fallbacks': {
        readonly zh: "  回退：{{list}}";
        readonly en: "  fallbacks: {{list}}";
    };
    readonly 'plugins-info-registries-resolved': {
        readonly zh: "  pnpm 配置解析：{{registry}}";
        readonly en: "  resolved from pnpm: {{registry}}";
    };
    readonly 'plugins-info-registries-none': {
        readonly zh: "（无）";
        readonly en: "(none)";
    };
    readonly 'plugins-install-busy': {
        readonly zh: "回合正在运行，先结束它（或 /new）再装插件：安装会改动 profile 并触发应用／热重载";
        readonly en: "A turn is running; finish it (or /new) before installing: an install changes the profile and applies or hot-reloads plugins";
    };
    readonly 'plugins-install-inspect': {
        readonly zh: "将要安装：{{spec}}（{{kind}} · {{bundle}}）";
        readonly en: "About to install: {{spec}} ({{kind}} · {{bundle}})";
    };
    readonly 'plugins-install-trusted': {
        readonly zh: "嫡系（feed 命中）：{{name}}@{{version}} —— 跳过装包信任确认；仍记 effect ledger，仍在 /plugin 列表可见";
        readonly en: "First-party (feed hit): {{name}}@{{version}} — skipping the package trust confirmation; the effect ledger and the /plugin list are unaffected";
    };
    readonly 'plugins-install-attempt': {
        readonly zh: "正在询问第 {{index}}/{{total}} 个安装源：{{registry}}";
        readonly en: "Asking registry {{index}}/{{total}}: {{registry}}";
    };
    readonly 'plugins-install-installing': {
        readonly zh: "正在安装…";
        readonly en: "Installing…";
    };
    readonly 'plugins-install-cancelling': {
        readonly zh: "正在取消…";
        readonly en: "Cancelling…";
    };
    readonly 'plugins-install-applying': {
        readonly zh: "正在应用…";
        readonly en: "Applying…";
    };
    readonly 'plugins-install-log-line-omitted': {
        readonly zh: "已省略超长日志行（每行上限 {{bytes}} 字节）。";
        readonly en: "An oversized log line was omitted (limit: {{bytes}} bytes per line).";
    };
    readonly 'plugins-install-build-blocked': {
        readonly zh: "安装被构建脚本拦住：有 {{count}} 个脚本待批准（批准后才会重试安装）";
        readonly en: "Blocked by build scripts: {{count}} awaiting approval (the install retries only after approval)";
    };
    readonly 'plugins-install-build-approved': {
        readonly zh: "已批准 {{count}} 个构建脚本（写入 profile 的 allowBuilds），正在重试安装";
        readonly en: "Approved {{count}} build scripts (written to the profile allowBuilds); retrying the install";
    };
    readonly 'plugins-install-incompatible': {
        readonly zh: "版本不兼容：{{packages}}（当前 DSH {{runtime}}）";
        readonly en: "Incompatible version: {{packages}} (running DSH {{runtime}})";
    };
    readonly 'plugins-install-exempted': {
        readonly zh: "已为 {{count}} 个包登记精确版本豁免（accept-risk）";
        readonly en: "Recorded an exact-version exemption for {{count}} package(s) (accept-risk)";
    };
    readonly 'plugins-install-exemptions-unreadable': {
        readonly zh: "读不到当前的版本豁免清单：{{reason}}（面板按\"没有豁免\"继续）";
        readonly en: "Could not read the current version exemptions: {{reason}} (the pane continues as if there were none)";
    };
    readonly 'plugins-install-done': {
        readonly zh: "已安装 {{bundle}}：{{state}}";
        readonly en: "Installed {{bundle}}: {{state}}";
    };
    readonly 'plugins-install-state-applied': {
        readonly zh: "已应用";
        readonly en: "applied";
    };
    readonly 'plugins-install-state-restart': {
        readonly zh: "需要重启";
        readonly en: "restart required";
    };
    readonly 'plugins-install-state-overridden': {
        readonly zh: "被覆盖（HMR 生效中）";
        readonly en: "overridden (HMR is live)";
    };
    readonly 'plugins-install-restart-hint': {
        readonly zh: "重启本应用后它才会作为后端 / 贡献生效。";
        readonly en: "Restart this app for it to take effect as a backend / contribution.";
    };
    readonly 'plugins-install-failed': {
        readonly zh: "安装失败：{{reason}}";
        readonly en: "Install failed: {{reason}}";
    };
    readonly 'plugins-install-manual': {
        readonly zh: "手工命令：dsh plugin --profile {{profile}} add {{spec}}";
        readonly en: "Manual command: dsh plugin --profile {{profile}} add {{spec}}";
    };
    readonly 'plugins-install-rescue': {
        readonly zh: "反复失败时用救援 profile：dsh-tui safe --rescue";
        readonly en: "If it keeps failing, use the rescue profile: dsh-tui safe --rescue";
    };
    readonly 'plugins-install-cancelled': {
        readonly zh: "已取消安装（profile 已回滚）";
        readonly en: "Install cancelled (the profile was rolled back)";
    };
    readonly 'plugins-install-cancel-too-late': {
        readonly zh: "已进入应用阶段，无法取消";
        readonly en: "Already applying; it cannot be cancelled";
    };
    readonly 'plugins-install-cancel-not-running': {
        readonly zh: "没有在跑的安装（可能已经结束）";
        readonly en: "No installation is running (it may have finished)";
    };
    readonly 'plugins-install-cancel-failed': {
        readonly zh: "取消失败：{{reason}}";
        readonly en: "Cancel failed: {{reason}}";
    };
    readonly 'plugins-install-drift': {
        readonly zh: "注意：profile 里的 {{name}} 现在是 {{found}}，本进程运行的是 {{running}}；对齐它：dsh plugin --profile {{profile}} add {{name}}@{{running}}";
        readonly en: "Heads up: {{name}} in the profile is now {{found}} while this process runs {{running}}; realign it: dsh plugin --profile {{profile}} add {{name}}@{{running}}";
    };
    readonly 'plugins-install-usage': {
        readonly zh: "用法：/plugin install <包名[@版本] | 路径 | git URL>";
        readonly en: "Usage: /plugin install <package[@version] | path | git url>";
    };
    readonly 'plugins-install-pane-title': {
        readonly zh: "安装插件";
        readonly en: "Install plugin";
    };
    readonly 'plugins-install-configure': {
        readonly zh: "要安装：{{spec}} · {{kind}} · bundle={{bundle}}";
        readonly en: "To install: {{spec}} · {{kind}} · bundle={{bundle}}";
    };
    readonly 'plugins-install-unidentified': {
        readonly zh: "（服务未给出包名）";
        readonly en: "(the service named no package)";
    };
    readonly 'plugins-install-trust-third-party': {
        readonly zh: "信任确认：插件与本应用同进程运行 —— 进程内全信任、无沙箱；装上后不会自动更新；它的行为受声明的 grants 约束（授权是行为约束，不是安全隔离）。";
        readonly en: "Trust: the plugin runs in-process with this app — full trust, no sandbox; it will not auto-update; its behaviour is bounded by the grants it declares (grants are behavioural constraints, not a security boundary).";
    };
    readonly 'plugins-install-notice-declared': {
        readonly zh: "声明可判定：该包的 dsh-plugin.json 已通过本 profile 的准入判定。";
        readonly en: "Declaration readable: the package-root dsh-plugin.json passes this profile’s admission.";
    };
    readonly 'plugins-install-notice-undeclared': {
        readonly zh: "提醒：该包没有声明 TUI 贡献（包根缺少 dsh-plugin.json）；装上后不会作为后端/贡献出现，并会在 /plugin 列表里带常驻标签。";
        readonly en: "Heads up: this package declares no TUI contribution (no package-root dsh-plugin.json); it will not appear as a backend/contribution, and /plugin will tag it.";
    };
    readonly 'plugins-install-notice-invalid': {
        readonly zh: "提醒：该包的声明本 profile 无法通过（{{err}}）；装上后不会作为后端/贡献出现。";
        readonly en: "Heads up: this profile cannot accept the package’s declaration ({{err}}); it will not appear as a backend/contribution.";
    };
    readonly 'plugins-install-notice-unjudged': {
        readonly zh: "提醒：注册表里的包在装上之前无法判定是否声明了 TUI 贡献；若未声明，它不会作为后端/贡献出现，并会在 /plugin 列表里带常驻标签。";
        readonly en: "Heads up: a registry package’s declaration cannot be read before it lands; if it declares none, it will not appear as a backend/contribution and /plugin will tag it.";
    };
    readonly 'plugins-install-builds-title': {
        readonly zh: "以下构建脚本需要批准（写进 profile 的 allowBuilds）：";
        readonly en: "These build scripts need approval (written to the profile allowBuilds):";
    };
    readonly 'plugins-install-incompatible-title': {
        readonly zh: "版本不兼容的包：";
        readonly en: "Incompatible packages:";
    };
    readonly 'plugins-install-exemptions-title': {
        readonly zh: "已登记的精确版本豁免：";
        readonly en: "Exact-version exemptions recorded:";
    };
    readonly 'plugins-install-key-confirm': {
        readonly zh: "⏎ 安装 · esc 取消";
        readonly en: "⏎ install · esc cancel";
    };
    readonly 'plugins-install-key-builds': {
        readonly zh: "⏎ 允许这些脚本并重试 · esc 取消";
        readonly en: "⏎ allow these scripts and retry · esc cancel";
    };
    readonly 'plugins-install-key-incompatible': {
        readonly zh: "⏎ 接受风险并重试 · esc 取消";
        readonly en: "⏎ accept the risk and retry · esc cancel";
    };
    readonly 'plugins-install-key-cancel': {
        readonly zh: "esc 取消安装";
        readonly en: "esc cancel the install";
    };
    readonly 'plugins-manage-busy': {
        readonly zh: "有回合正在运行：先结束它或 /new，再执行这个动作（不改动 profile）。";
        readonly en: "A turn is running: finish it or /new before this action (the profile is left alone).";
    };
    readonly 'plugins-manage-unknown': {
        readonly zh: "找不到目标：{{target}}（可寻址的：{{names}}）";
        readonly en: "No such target: {{target}} (addressable: {{names}})";
    };
    readonly 'plugins-manage-ambiguous': {
        readonly zh: "{{target}} 匹配多行，请改用具体行 id：{{ids}}（profile 没有改动）。";
        readonly en: "{{target}} matches multiple rows. Use a specific row id: {{ids}} (the profile was not changed).";
    };
    readonly 'plugins-manage-refused-service-locked': {
        readonly zh: "拒绝：插件服务锁定了 {{target}}（{{reason}}）——两个方向都不是本应用能改的。";
        readonly en: "Refused: the plugin service has {{target}} locked ({{reason}}); neither direction is this app's to take.";
    };
    readonly 'plugins-manage-refused-app-bundle': {
        readonly zh: "拒绝：{{target}} 就是本应用自己（门禁 2）——关了它，界面当场消失。";
        readonly en: "Refused: {{target}} is this application itself (gate 2); switching it off takes the interface down with it.";
    };
    readonly 'plugins-manage-refused-host-bundle': {
        readonly zh: "拒绝：{{target}} 是本应用赖以运行的宿主层（门禁 2）——它提供本应用离不开的服务。";
        readonly en: "Refused: {{target}} is the host layer this application runs on (gate 2); it provides services the interface needs.";
    };
    readonly 'plugins-manage-refused-not-removable': {
        readonly zh: "拒绝：{{target}} 不是本 profile 装的（安装自带），不可卸载。";
        readonly en: "Refused: {{target}} was not installed by this profile (the dsh installation supplies it), so it cannot be removed.";
    };
    readonly 'plugins-manage-refused-row-not-removable': {
        readonly zh: "拒绝：{{target}} 是一行 patch，不能单独卸载——它随所属 bundle 走。";
        readonly en: "Refused: {{target}} is a patch row and cannot be removed on its own; it goes with its bundle.";
    };
    readonly 'plugins-manage-refused-app-row': {
        readonly zh: "拒绝：{{target}} 提供本应用的界面（门禁 2）——关掉它，界面当场消失。";
        readonly en: "Refused: {{target}} provides this application's interface (gate 2); switching it off takes the interface down with it.";
    };
    readonly 'plugins-manage-unchanged': {
        readonly zh: "{{target}} 已经是这个状态，profile 没有改动。";
        readonly en: "{{target}} is already in that state; the profile was not changed.";
    };
    readonly 'plugins-manage-removed': {
        readonly zh: "已卸载 {{target}}：{{state}}";
        readonly en: "Removed {{target}}: {{state}}";
    };
    readonly 'plugins-manage-enabled': {
        readonly zh: "已启用 {{target}}：{{state}}";
        readonly en: "Enabled {{target}}: {{state}}";
    };
    readonly 'plugins-manage-disabled': {
        readonly zh: "已关闭 {{target}}：{{state}}";
        readonly en: "Disabled {{target}}: {{state}}";
    };
    readonly 'plugins-manage-failed': {
        readonly zh: "操作失败：{{reason}}";
        readonly en: "The action failed: {{reason}}";
    };
    readonly 'plugins-manage-incompatible': {
        readonly zh: "版本不兼容：{{packages}}——要强行启用，先接受风险：dsh plugin --profile {{profile}} allow-version <包@版本> <当前版本> --accept-risk";
        readonly en: "Incompatible version: {{packages}} — to force it, accept the risk first: dsh plugin --profile {{profile}} allow-version <package@version> <running version> --accept-risk";
    };
    readonly 'plugins-manage-manual-remove': {
        readonly zh: "手工命令：dsh plugin --profile {{profile}} remove {{target}}";
        readonly en: "Manual command: dsh plugin --profile {{profile}} remove {{target}}";
    };
    readonly 'plugins-manage-manual-profile': {
        readonly zh: "启用 / 关闭没有命令行动词（profile 的依赖与 cordis.patch.yml 是服务写自己的文件）：请用 `dsh --profile {{profile}}` 启动本应用，在 /plugin 里操作；命令行只有 add / remove。";
        readonly en: "Enable and disable have no CLI verb (the profile's dependencies and cordis.patch.yml are files the service writes for itself): start this app with `dsh --profile {{profile}}` and use /plugin; the CLI has add and remove only.";
    };
    readonly 'plugins-manage-residue': {
        readonly zh: "用户数据仍在：{{paths}} —— 不再需要时可手动删除。";
        readonly en: "Your own data is still there: {{paths}} — delete it by hand when you no longer need it.";
    };
    readonly 'plugins-manage-residue-footprint': {
        readonly zh: "{{id}} 仍在授权文件 / 效果台账 / 存储目录里留有足迹";
        readonly en: "{{id}} still has a footprint in the grants file, the effect ledger or the storage directory";
    };
    readonly 'plugins-manage-residue-unjudged': {
        readonly zh: "读不到 {{target}} 的包内声明，无法判断它是否留下了用户数据（不猜）。";
        readonly en: "The declaration inside {{target}} could not be read, so what data it left behind cannot be judged (nothing is guessed).";
    };
    readonly 'plugins-manage-usage': {
        readonly zh: "用法：/plugin {{sub}} <bundle 名 | 行 id>";
        readonly en: "Usage: /plugin {{sub}} <bundle name | row id>";
    };
    readonly 'plugins-manage-pane-title': {
        readonly zh: "插件生命周期";
        readonly en: "Plugin lifecycle";
    };
    readonly 'plugins-manage-action-remove': {
        readonly zh: "卸载";
        readonly en: "remove";
    };
    readonly 'plugins-manage-action-enable': {
        readonly zh: "启用";
        readonly en: "enable";
    };
    readonly 'plugins-manage-action-disable': {
        readonly zh: "关闭";
        readonly en: "disable";
    };
    readonly 'plugins-manage-configure': {
        readonly zh: "要{{action}}：{{target}}";
        readonly en: "About to {{action}}: {{target}}";
    };
    readonly 'plugins-manage-working': {
        readonly zh: "正在写入 profile…";
        readonly en: "Writing the profile…";
    };
    readonly 'plugins-manage-remove-facts': {
        readonly zh: "这是破坏性操作：它会改 profile 的 package.json 与 lockfile（服务失败时回滚），并移除它的 {{rows}} 行 / {{overrides}} 项覆盖；它留下的你自己的数据不会被删（有残留会另行提示）。";
        readonly en: "This is destructive: it changes the profile's package.json and lockfile (rolled back if the service fails) and drops its {{rows}} rows / {{overrides}} overrides. Your own data is not deleted (any residue is reported separately).";
    };
    readonly 'plugins-manage-trust-facts': {
        readonly zh: "无法验证已装代码的安装来源：启用后它就在本进程内运行、不自动更新、没有沙箱。它声明的权限见 /plugin 的授权矩阵。";
        readonly en: "The installed code's source cannot be verified: once enabled it runs inside this process, with no auto-update and no sandbox. Its declared permissions are in the /plugin grant matrix.";
    };
    readonly 'plugins-manage-host-row-facts': {
        readonly zh: "这一行属于宿主层（dsh-base）：关掉它会卸载本应用注入的服务，本应用可能重启或退出。";
        readonly en: "This row belongs to the host layer (dsh-base): switching it off unloads services this application injects, and the app may restart or exit.";
    };
    readonly 'plugins-manage-team-active-facts': {
        readonly zh: "本会话有 {{members}} 个 teammate 正在运行或准备中。";
        readonly en: "{{members}} teammate(s) in this session are running or being created.";
    };
    readonly 'plugins-manage-team-unseen-facts': {
        readonly zh: "团队里有 {{members}} 个 teammate 可能正在运行：从 teammate 会话里看不到它们的运行状态。";
        readonly en: "{{members}} teammate(s) of this team may be running: their runs are not visible from a teammate session.";
    };
    readonly 'plugins-manage-team-active-stop': {
        readonly zh: "关闭团队会停止它们：团队服务卸载时释放仍在运行的 teammate。团队消息与任务板停止，团队记录留在会话里。";
        readonly en: "Switching the team off stops them: the team service releases the teammates still running as it unloads. Team messages and the task board stop; the team record stays in the session.";
    };
    readonly 'plugins-manage-key-confirm': {
        readonly zh: "⏎ 执行 · esc 关闭";
        readonly en: "⏎ do it · esc close";
    };
    readonly 'plugins-manage-key-busy': {
        readonly zh: "写入中 · esc 只关面板，操作会继续（这三个动作没有取消面）";
        readonly en: "writing · esc only closes the pane, the action goes on (these three have no cancellation)";
    };
    readonly 'doctor-plugin-generation': {
        readonly zh: "插件运行时 generation：{{id}}";
        readonly en: "Plugin runtime generation: {{id}}";
    };
    readonly 'doctor-plugin-registry': {
        readonly zh: "插件规范注册表自检：{{state}}";
        readonly en: "Plugin-spec registry self-check: {{state}}";
    };
    readonly 'doctor-plugin-host-missing': {
        readonly zh: "plugin-host 行未挂载";
        readonly en: "plugin-host row not mounted";
    };
    readonly 'ext-dialog-yes': {
        readonly zh: "是";
        readonly en: "Yes";
    };
    readonly 'ext-dialog-no': {
        readonly zh: "否";
        readonly en: "No";
    };
    readonly 'thinking-title': {
        readonly zh: "思考过程显示";
        readonly en: "Thinking display";
    };
    readonly 'thinking-subtitle': {
        readonly zh: "只控制思考过程是否显示，不改变模型的思考行为。";
        readonly en: "Only controls whether reasoning is shown; it does not change model behavior.";
    };
    readonly 'thinking-enabled': {
        readonly zh: "显示";
        readonly en: "Shown";
    };
    readonly 'thinking-enabled-desc': {
        readonly zh: "在对话中显示 DeepSeek 的思考过程";
        readonly en: "Show DeepSeek's reasoning in the conversation";
    };
    readonly 'thinking-disabled': {
        readonly zh: "隐藏";
        readonly en: "Hidden";
    };
    readonly 'thinking-disabled-desc': {
        readonly zh: "隐藏思考过程；模型仍会照常思考";
        readonly en: "Hide reasoning; the model will still think as usual";
    };
    readonly 'thinking-label': {
        readonly zh: "思考";
        readonly en: "Thinking";
    };
    readonly 'thinking-tokens-live': {
        readonly zh: "思考中 · ~{{n}} tokens";
        readonly en: "Thinking · ~{{n}} tokens";
    };
    readonly 'thinking-tokens-done': {
        readonly zh: "已思考 · ~{{n}} tokens";
        readonly en: "Thought · ~{{n}} tokens";
    };
    readonly 'history-search-title': {
        readonly zh: "搜索历史";
        readonly en: "Search history";
    };
    readonly 'history-search-placeholder': {
        readonly zh: "输入以搜索…";
        readonly en: "Type to search…";
    };
    readonly 'history-search-empty': {
        readonly zh: "没有匹配的命令";
        readonly en: "No matching commands";
    };
    readonly 'time-now': {
        readonly zh: "刚刚";
        readonly en: "now";
    };
    readonly 'time-minutes-ago': {
        readonly zh: "{{n}} 分钟前";
        readonly en: "{{n}}m ago";
    };
    readonly 'time-hours-ago': {
        readonly zh: "{{n}} 小时前";
        readonly en: "{{n}}h ago";
    };
    readonly 'time-days-ago': {
        readonly zh: "{{n}} 天前";
        readonly en: "{{n}}d ago";
    };
    readonly 'search-no-matches': {
        readonly zh: "无匹配";
        readonly en: "no matches";
    };
    readonly 'rename-current': {
        readonly zh: "当前名称  {{title}}";
        readonly en: "Current title  {{title}}";
    };
    readonly 'rename-done': {
        readonly zh: "已重命名为「{{title}}」";
        readonly en: "Renamed to \"{{title}}\"";
    };
    readonly 'compact-summary-folded': {
        readonly zh: "摘要已折叠";
        readonly en: "Summary folded";
    };
    readonly 'new-message': {
        readonly zh: "↓ {{n}} 条新消息";
        readonly en: "↓ 1 new message";
    };
    readonly 'new-messages': {
        readonly zh: "↓ {{n}} 条新消息";
        readonly en: "↓ {{n}} new messages";
    };
    readonly 'back-to-bottom': {
        readonly zh: "↓ 回到底部（Enter/End）";
        readonly en: "↓ back to bottom (Enter/End)";
    };
    readonly 'theme-builtin-base': {
        readonly zh: "内置 · {{base}} 基底";
        readonly en: "Built-in · {{base}} base";
    };
    readonly 'theme-auto-base': {
        readonly zh: "内置 · 跟随系统/终端背景自动选择 light/dark";
        readonly en: "Built-in · follows the system/terminal background (light/dark)";
    };
    readonly 'theme-user-base': {
        readonly zh: "{{base}} 基底 · ~/.dsh-tui/themes/{{name}}.json";
        readonly en: "{{base}} base · ~/.dsh-tui/themes/{{name}}.json";
    };
    readonly 'theme-plugin-base': {
        readonly zh: "插件 · {{base}} 基底 · {{name}}";
        readonly en: "Plugin · {{base}} base · {{name}}";
    };
    readonly 'theme-preview-title': {
        readonly zh: "主题预览";
        readonly en: "Theme preview";
    };
    readonly 'theme-preview-follow': {
        readonly zh: "跟焦点实时预览";
        readonly en: "Live, follows focus";
    };
    readonly 'context-unavailable': {
        readonly zh: "当前会话没有已加载的上下文";
        readonly en: "No loaded context is available for this session";
    };
    readonly 'context-panel-sections': {
        readonly zh: "系统提示词 · {{n}} 段";
        readonly en: "System prompt · {{n}} sections";
    };
    readonly 'context-panel-files': {
        readonly zh: "工作区指令 · {{n}} 个文件";
        readonly en: "Workspace instructions · {{n}} files";
    };
    readonly 'context-panel-runtime': {
        readonly zh: "运行时上下文 · {{n}} 项";
        readonly en: "Runtime context · {{n}} items";
    };
    readonly 'context-panel-skills': {
        readonly zh: "技能 · {{n}}";
        readonly en: "Skills · {{n}}";
    };
    readonly 'context-panel-tools': {
        readonly zh: "工具 · {{n}}";
        readonly en: "Tools · {{n}}";
    };
    readonly 'question-provider-occupied': {
        readonly zh: "⚠️ 问卷通道已被非宿主组件 {{id}} 占用，模型提问可能被代答（本界面未接入问卷）";
        readonly en: "⚠️ The questionnaire channel is held by a non-host component ({{id}}); model questions may be answered by it (this UI did not take the seat)";
    };
    readonly 'question-provider-occupied-unverified': {
        readonly zh: "⚠️ 问卷通道被一个自报为 {{id}} 的组件占用——身份未经宿主验证，模型提问可能被代答（本界面未接入问卷）";
        readonly en: "⚠️ The questionnaire channel is held by a component self-reporting as {{id}} — identity not host-verified; model questions may be answered by it (this UI did not take the seat)";
    };
    readonly 'question-provider-occupied-unknown': {
        readonly zh: "身份未知";
        readonly en: "identity unknown";
    };
    readonly 'question-select-or-answer': {
        readonly zh: "至少选择一个选项，或在最后一行输入回答";
        readonly en: "Select at least one option, or type an answer on the last line";
    };
    readonly 'question-answer-or-check': {
        readonly zh: "输入回答或勾选选项后再提交";
        readonly en: "Type an answer or check options before submitting";
    };
    readonly 'question-type-answer-first': {
        readonly zh: "先输入回答内容再提交";
        readonly en: "Type your answer before submitting";
    };
    readonly 'question-header-progress': {
        readonly zh: " 📋 提问 · 第 {{position}}/{{total}} 题{{remaining}} ";
        readonly en: " 📋 Question {{position}}/{{total}} {{remaining}} ";
    };
    readonly 'question-remaining-more': {
        readonly zh: " · 还剩 {{n}} 题";
        readonly en: " · {{n}} left";
    };
    readonly 'question-hint-type': {
        readonly zh: "输入回答";
        readonly en: "Type answer";
    };
    readonly 'question-hint-paste': {
        readonly zh: "{{key}} 粘贴";
        readonly en: "{{key}} paste";
    };
    readonly 'question-hint-enter': {
        readonly zh: "Enter 提交";
        readonly en: "Enter submit";
    };
    readonly 'question-hint-back': {
        readonly zh: "↑ 返回选项";
        readonly en: "↑ back to options";
    };
    readonly 'question-hint-esc': {
        readonly zh: "Esc 中断";
        readonly en: "Esc cancel";
    };
    readonly 'question-hint-previous': {
        readonly zh: "Esc 上一题";
        readonly en: "Esc previous question";
    };
    readonly 'question-hint-switch': {
        readonly zh: "←/→ 换题";
        readonly en: "←/→ switch question";
    };
    readonly 'question-hint-switch-input': {
        readonly zh: "行首←/行尾→ 换题";
        readonly en: "←/→ at the text edge switches question";
    };
    readonly 'question-hint-cancel': {
        readonly zh: "Ctrl+C 取消整批";
        readonly en: "Ctrl+C cancel batch";
    };
    readonly 'question-hint-selected': {
        readonly zh: "已选 {{n}}";
        readonly en: "Selected {{n}}";
    };
    readonly 'question-hint-select': {
        readonly zh: "↑/↓ 选择";
        readonly en: "↑/↓ select";
    };
    readonly 'question-hint-multi': {
        readonly zh: "Space 多选";
        readonly en: "Space multi-select";
    };
    readonly 'question-hint-attach': {
        readonly zh: "输入文字附带回答";
        readonly en: "Type text to attach an answer";
    };
    readonly 'question-fold-waiting': {
        readonly zh: "正在等你回答";
        readonly en: "Waiting for your answer";
    };
    readonly 'question-fold-expand': {
        readonly zh: "{{combo}} 展开";
        readonly en: "{{combo}} to expand";
    };
    readonly 'question-fold-hint': {
        readonly zh: "{{combo}} 折叠 / 点标题行收起";
        readonly en: "{{combo}} to fold / click the header";
    };
    readonly 'question-detail-scroll': {
        readonly zh: "… {{count}} 行未显示 · {{up}}/{{down}} 翻阅";
        readonly en: {
            readonly one: "… {{count}} line outside view · {{up}}/{{down}} to scroll";
            readonly other: "… {{count}} lines outside view · {{up}}/{{down}} to scroll";
        };
    };
    readonly 'question-submit-selection': {
        readonly zh: "提交选择（Enter）";
        readonly en: "Submit selection (Enter)";
    };
    readonly 'question-custom-tab': {
        readonly zh: "自定义回答";
        readonly en: "Custom answer";
    };
    readonly 'question-attached-label': {
        readonly zh: "（附加：{{label}}）";
        readonly en: "(attached: {{label}})";
    };
    readonly 'question-direct-input': {
        readonly zh: "直接输入…";
        readonly en: "Type directly…";
    };
    readonly 'question-paste-not-text': {
        readonly zh: "剪贴板内容是图片或文件，无法作为文字粘贴";
        readonly en: "Clipboard holds an image or file — not pastable as text";
    };
    readonly 'question-paste-too-long': {
        readonly zh: "粘贴内容过长（最多 {{n}} 个字符），请精简后再试";
        readonly en: "Pasted content is too long (max {{n}} characters) — trim it and try again";
    };
    readonly 'approval-waiting': {
        readonly zh: " ⏳ 等待审批 · {{tool}} ";
        readonly en: " Awaiting approval · {{tool}} ";
    };
    readonly 'approval-external-hint': {
        readonly zh: "外部来源：该审批未关联当前会话的活跃工具调用，命令文本可能被伪造，请核实后再决定";
        readonly en: "External origin: this approval is not tied to a live tool call of this session — the command text may be forged; verify before deciding";
    };
    readonly 'approval-proceed': {
        readonly zh: "要允许这次操作吗？";
        readonly en: "Allow this operation?";
    };
    readonly 'approval-yes': {
        readonly zh: "允许（仅本次）";
        readonly en: "Yes, allow once";
    };
    readonly 'approval-no': {
        readonly zh: "拒绝";
        readonly en: "No";
    };
    readonly 'approval-always': {
        readonly zh: "允许，且不再询问";
        readonly en: "Yes, and don't ask again";
    };
    readonly 'approval-hint': {
        readonly zh: "↑/↓ 选择 · Enter 确认 · Esc 拒绝";
        readonly en: "↑/↓ select · Enter confirm · Esc reject";
    };
    readonly 'approval-hint-feedback': {
        readonly zh: "↑/↓/Tab 选择 · Enter 确认 · 选中拒绝后可输入理由 · Esc 拒绝";
        readonly en: "↑/↓/Tab select · Enter confirm · on No, type a reason · Esc reject";
    };
    readonly 'approval-hint-preview': {
        readonly zh: "↑/↓ 选择 · Enter 确认 · Esc 拒绝 · {{up}}/{{down}} 翻阅预览";
        readonly en: "↑/↓ select · Enter confirm · Esc reject · {{up}}/{{down}} scroll preview";
    };
    readonly 'approval-feedback-row': {
        readonly zh: "{{label}}：{{reason}}";
        readonly en: "{{label}}: {{reason}}";
    };
    readonly 'approval-subagent': {
        readonly zh: "来自子代理 {{id}} 的请求";
        readonly en: "Requested by subagent {{id}}";
    };
    readonly 'approval-blocked-path': {
        readonly zh: "涉及允许目录之外的路径：{{path}}";
        readonly en: "Outside the allowed directories: {{path}}";
    };
    readonly 'panel-preview-omitted': {
        readonly zh: "… 另有 {{count}} 行未显示";
        readonly en: {
            readonly one: "… {{count}} more line not shown";
            readonly other: "… {{count}} more lines not shown";
        };
    };
    readonly 'subagent-model': {
        readonly zh: "模型";
        readonly en: "Model";
    };
    readonly 'subagent-duration': {
        readonly zh: "时长";
        readonly en: "Duration";
    };
    readonly 'subagent-status-label': {
        readonly zh: "状态";
        readonly en: "Status";
    };
    readonly 'subagent-status-cancelled': {
        readonly zh: "已取消";
        readonly en: "Cancelled";
    };
    readonly 'subagent-count-running': {
        readonly zh: "运行中";
        readonly en: "running";
    };
    readonly 'subagent-count-completed': {
        readonly zh: "已完成";
        readonly en: "completed";
    };
    readonly 'subagent-count-failed': {
        readonly zh: "失败";
        readonly en: "failed";
    };
    readonly 'subagent-started': {
        readonly zh: "开始时间";
        readonly en: "Started";
    };
    readonly 'subagent-completed': {
        readonly zh: "完成时间";
        readonly en: "Completed";
    };
    readonly 'subagent-error-label': {
        readonly zh: "错误";
        readonly en: "Error";
    };
    readonly 'subagent-output-label': {
        readonly zh: "输出";
        readonly en: "Output";
    };
    readonly 'subagent-no-output': {
        readonly zh: "暂无输出";
        readonly en: "No output yet";
    };
    readonly 'subagent-dashboard-title': {
        readonly zh: " 子代理面板 ";
        readonly en: " Subagent Dashboard ";
    };
    readonly 'subagent-dashboard-hint-basic': {
        readonly zh: "↑/↓ 浏览 · Esc 关闭";
        readonly en: "↑/↓ browse · Esc close";
    };
    readonly 'subagent-dashboard-hint-detail': {
        readonly zh: "↑/↓ 选择 · Enter 查看详情 · Esc 关闭";
        readonly en: "↑/↓ select · Enter view detail · Esc close";
    };
    readonly 'subagent-card-prefix': {
        readonly zh: "子代理：";
        readonly en: "Subagent: ";
    };
    readonly 'subagent-mode-continuable': {
        readonly zh: "♻ 可继续";
        readonly en: "♻ continuable";
    };
    readonly 'subagent-mode-one-shot': {
        readonly zh: "◇ 一次性";
        readonly en: "◇ one-shot";
    };
    readonly 'subagent-tab-summary': {
        readonly zh: "摘要";
        readonly en: "Summary";
    };
    readonly 'subagent-no-summary': {
        readonly zh: "暂无摘要";
        readonly en: "No summary yet";
    };
    readonly 'subagent-thinking-fold': {
        readonly zh: "思考 · {{count}} 段 · {{chars}} 字";
        readonly en: "Thinking · {{count}} paras · {{chars}} chars";
    };
    readonly 'subagent-thinking-expand': {
        readonly zh: "Enter 展开";
        readonly en: "Enter expand";
    };
    readonly 'subagent-thinking-collapse': {
        readonly zh: "Enter 收起";
        readonly en: "Enter collapse";
    };
    readonly 'subagent-conclusion': {
        readonly zh: "结论";
        readonly en: "Conclusion";
    };
    readonly 'subagent-hint-fold': {
        readonly zh: "Enter 思考折叠";
        readonly en: "Enter thinking";
    };
    readonly 'subagent-no-tools': {
        readonly zh: "暂无工具调用";
        readonly en: "No tool calls";
    };
    readonly 'subagent-last-tool': {
        readonly zh: "最近工具";
        readonly en: "last tool";
    };
    readonly 'subagent-tools-kept': {
        readonly zh: "显示 {{kept}} 条记录（共 {{reported}} 次工具调用，其余未保留）";
        readonly en: "{{kept}} records shown ({{reported}} tool uses in total; the rest were not kept)";
    };
    readonly 'subagent-tab-transcript': {
        readonly zh: "转录";
        readonly en: "Transcript";
    };
    readonly 'subagent-transcript-loading': {
        readonly zh: "正在读取子代理转录…";
        readonly en: "Reading the subagent transcript…";
    };
    readonly 'subagent-transcript-unavailable': {
        readonly zh: "子代理转录暂时读不到";
        readonly en: "Subagent transcript unavailable";
    };
    readonly 'subagent-transcript-empty': {
        readonly zh: "子代理转录为空";
        readonly en: "The subagent transcript is empty";
    };
    readonly 'subagent-transcript-history': {
        readonly zh: "历史";
        readonly en: "history";
    };
    readonly 'subagent-transcript-live': {
        readonly zh: "实时";
        readonly en: "live";
    };
    readonly 'subagent-transcript-readonly': {
        readonly zh: "只读";
        readonly en: "read-only";
    };
    readonly 'subagent-transcript-load-older': {
        readonly zh: "载入更早 {{count}} 条";
        readonly en: "Load {{count}} older";
    };
    readonly 'subagent-thinking-count-only': {
        readonly zh: "思考内容不可见 · 约 {{tokens}} tokens";
        readonly en: "Thinking not shown · ~{{tokens}} tokens";
    };
    readonly 'subagent-thinking-unavailable': {
        readonly zh: "思考内容不可见";
        readonly en: "Thinking not shown";
    };
    readonly 'subagent-transcript-retained': {
        readonly zh: "已保留 {{count}} 条";
        readonly en: "{{count}} lines retained";
    };
    readonly 'subagent-transcript-parent': {
        readonly zh: "父代理 {{id}}";
        readonly en: "parent {{id}}";
    };
    readonly 'subagent-transcript-old-format': {
        readonly zh: "旧格式：没有记录父代理，按深度 {{depth}} 显示";
        readonly en: "old format: no parent recorded; shown at depth {{depth}}";
    };
    readonly 'subagent-hint-page': {
        readonly zh: "切页";
        readonly en: "page";
    };
    readonly 'subagent-hint-scroll': {
        readonly zh: "滚动";
        readonly en: "scroll";
    };
    readonly 'subagent-hint-back': {
        readonly zh: "返回";
        readonly en: "back";
    };
    readonly 'subagent-hint-compose': {
        readonly zh: "发消息";
        readonly en: "compose";
    };
    readonly 'subagent-empty-hint': {
        readonly zh: "让主代理发起 Task 后，子代理会出现在这里";
        readonly en: "Subagents appear here once the main agent starts Task delegations";
    };
    readonly 'team-dashboard-title': {
        readonly zh: " 代理团队 ";
        readonly en: " Agent Team ";
    };
    readonly 'team-status-provisioning': {
        readonly zh: "准备中";
        readonly en: "provisioning";
    };
    readonly 'team-status-running': {
        readonly zh: "运行中";
        readonly en: "running";
    };
    readonly 'team-status-idle': {
        readonly zh: "空闲";
        readonly en: "idle";
    };
    readonly 'team-status-active': {
        readonly zh: "活跃";
        readonly en: "active";
    };
    readonly 'team-status-failed': {
        readonly zh: "失败";
        readonly en: "failed";
    };
    readonly 'team-members-title': {
        readonly zh: "成员";
        readonly en: "Members";
    };
    readonly 'team-lead-row': {
        readonly zh: "lead · 当前会话";
        readonly en: "lead · this session";
    };
    readonly 'team-lead-row-peer': {
        readonly zh: "lead";
        readonly en: "lead";
    };
    readonly 'team-self-mark': {
        readonly zh: "当前会话";
        readonly en: "this session";
    };
    readonly 'team-others-title': {
        readonly zh: "其他子代理";
        readonly en: "Other subagents";
    };
    readonly 'team-tasks-title': {
        readonly zh: "任务板 · {{completed}}/{{total}}";
        readonly en: "Tasks · {{completed}}/{{total}}";
    };
    readonly 'team-tasks-empty': {
        readonly zh: "暂无任务";
        readonly en: "No tasks";
    };
    readonly 'team-tasks-count': {
        readonly zh: "任务 {{completed}}/{{total}}";
        readonly en: "tasks {{completed}}/{{total}}";
    };
    readonly 'team-last-run-failed': {
        readonly zh: "上一轮失败 {{error}}";
        readonly en: "last run failed {{error}}";
    };
    readonly 'team-task-blocked': {
        readonly zh: "阻塞";
        readonly en: "blocked";
    };
    readonly 'team-failure': {
        readonly zh: "团队记录被拒：{{failure}}";
        readonly en: "Team record rejected: {{failure}}";
    };
    readonly 'team-cmd-unavailable': {
        readonly zh: "当前内核没有 Agent Teams。";
        readonly en: "The current kernel has no Agent Teams.";
    };
    readonly 'team-cmd-usage': {
        readonly zh: "未知子命令「{{sub}}」。用法：/team [status]";
        readonly en: "Unknown subcommand \"{{sub}}\". Usage: /team [status]";
    };
    readonly 'team-cmd-switch-moved': {
        readonly zh: "团队开关已改为 /plugin enable|disable {{bundle}}；/team 只报告状态。";
        readonly en: "The team switch moved to /plugin enable|disable {{bundle}}; /team only reports status.";
    };
    readonly 'team-cmd-not-enabled': {
        readonly zh: "团队服务未运行（bundle 未启用、启用后尚未生效，或激活失败）。开启/应用：/plugin enable {{bundle}}；需要时重启。";
        readonly en: "The team service is not running (bundle off, enabled but not applied yet, or activation failed). Enable/apply with /plugin enable {{bundle}}; restart if needed.";
    };
    readonly 'team-cmd-no-manager-route': {
        readonly zh: "本次启动没有 profile 插件服务，无法在会话内切换。在终端用 dsh plugin --profile {{profile}} add {{bundle}}@<已装 DSH 版本>（关闭用 remove），然后重启；版本须与已装 DSH 完全一致。";
        readonly en: "This launch has no profile plugin service, so the team cannot be switched here. In a terminal run dsh plugin --profile {{profile}} add {{bundle}}@<your DSH version> (remove to switch off), then restart; the version must match the installed DSH exactly.";
    };
    readonly 'team-cmd-bundle-absent': {
        readonly zh: "本次运行的 DSH 安装不自带团队包（/plugin list 不显示它）：先把 DSH 换到自带团队包的版本线，再重启并开启。";
        readonly en: "The running DSH installation does not ship the team bundle (/plugin list does not show it): switch DSH to a line that ships the team packages first, then restart and enable it.";
    };
    readonly 'team-cmd-no-manager': {
        readonly zh: "本次启动没有 profile 插件服务：只能报告团队服务状态。";
        readonly en: "This launch has no profile plugin service: only the team service state can be reported.";
    };
    readonly 'team-cmd-bundle': {
        readonly zh: "团队 bundle：{{state}}";
        readonly en: "Team bundle: {{state}}";
    };
    readonly 'team-cmd-bundle-unknown': {
        readonly zh: "团队 bundle：未知（插件服务没有列出该包）";
        readonly en: "Team bundle: unknown (the plugin service does not list it)";
    };
    readonly 'team-cmd-on': {
        readonly zh: "已开启";
        readonly en: "on";
    };
    readonly 'team-cmd-off': {
        readonly zh: "已关闭";
        readonly en: "off";
    };
    readonly 'team-cmd-service': {
        readonly zh: "团队服务：{{state}}";
        readonly en: "Team service: {{state}}";
    };
    readonly 'team-cmd-running': {
        readonly zh: "运行中";
        readonly en: "running";
    };
    readonly 'team-cmd-pending-on': {
        readonly zh: "profile 已开启团队，但服务没有运行：重启后生效，或服务激活失败（见日志）。";
        readonly en: "The profile has the team on but the service is not running: it applies after a restart, or the service failed to activate (see the log).";
    };
    readonly 'team-cmd-pending-off': {
        readonly zh: "profile 已关闭团队，但服务仍在运行：重启后生效。";
        readonly en: "The profile has the team off but the service is still running: it applies after a restart.";
    };
    readonly 'team-cmd-no-members': {
        readonly zh: "本会话没有 teammate。";
        readonly en: "No teammates in this session.";
    };
    readonly 'team-cmd-members': {
        readonly zh: "本会话 teammate：{{total}} 个，其中 {{active}} 个运行中或准备中。";
        readonly en: "Teammates in this session: {{total}}, {{active}} running or provisioning.";
    };
    readonly 'team-cmd-members-unseen': {
        readonly zh: "本会话 teammate：{{total}} 个，其中 {{active}} 个运行中或准备中，{{unseen}} 个可能在运行（从 teammate 会话里看不到）。";
        readonly en: "Teammates in this session: {{total}}, {{active}} running or provisioning, {{unseen}} may be running (not visible from a teammate).";
    };
    readonly 'agent-view-title': {
        readonly zh: "子代理转录";
        readonly en: "Agent transcript";
    };
    readonly 'agent-view-readonly': {
        readonly zh: "只读";
        readonly en: "read-only";
    };
    readonly 'agent-view-live': {
        readonly zh: "实时";
        readonly en: "live";
    };
    readonly 'agent-view-history': {
        readonly zh: "历史";
        readonly en: "history";
    };
    readonly 'agent-view-back': {
        readonly zh: "返回来源";
        readonly en: "back to source";
    };
    readonly 'agent-view-open-action': {
        readonly zh: "主屏查看";
        readonly en: "open in main view";
    };
    readonly 'agent-view-source-chat': {
        readonly zh: "来自聊天";
        readonly en: "from chat";
    };
    readonly 'agent-view-source-dashboard': {
        readonly zh: "来自代理面板";
        readonly en: "from agents panel";
    };
    readonly 'agent-view-source-detail': {
        readonly zh: "来自详情";
        readonly en: "from detail";
    };
    readonly 'agent-view-source-card': {
        readonly zh: "来自转录卡";
        readonly en: "from transcript card";
    };
    readonly 'agent-view-no-transcript': {
        readonly zh: "此代理没有可查看的转录";
        readonly en: "No transcript for this agent";
    };
    readonly 'agent-view-retained-tail': {
        readonly zh: "没有完整历史，只显示最近 {{count}} 条输出";
        readonly en: "No full history; showing the last {{count}} output lines";
    };
    readonly 'agent-view-panel-title': {
        readonly zh: "工作台";
        readonly en: "workbench";
    };
    readonly 'agent-view-panel-metadata': {
        readonly zh: "信息";
        readonly en: "metadata";
    };
    readonly 'agent-view-panel-tools': {
        readonly zh: "工具";
        readonly en: "tools";
    };
    readonly 'agent-view-parent-context': {
        readonly zh: "父代理与同级";
        readonly en: "parent & siblings";
    };
    readonly 'agent-view-field-status': {
        readonly zh: "状态";
        readonly en: "status";
    };
    readonly 'agent-view-field-mode': {
        readonly zh: "模式";
        readonly en: "mode";
    };
    readonly 'agent-view-field-model': {
        readonly zh: "模型";
        readonly en: "model";
    };
    readonly 'agent-view-field-tokens': {
        readonly zh: "token";
        readonly en: "tokens";
    };
    readonly 'agent-view-field-duration': {
        readonly zh: "时长";
        readonly en: "duration";
    };
    readonly 'agent-view-field-run': {
        readonly zh: "运行";
        readonly en: "run";
    };
    readonly 'agent-view-field-session': {
        readonly zh: "会话";
        readonly en: "session";
    };
    readonly 'agent-view-field-depth': {
        readonly zh: "深度";
        readonly en: "depth";
    };
    readonly 'agent-view-tools-none': {
        readonly zh: "无工具记录";
        readonly en: "no tool records";
    };
    readonly 'agent-view-tools-reported': {
        readonly zh: "共 {{reported}} 次 · 显示 {{kept}}";
        readonly en: "{{reported}} in total · {{kept}} shown";
    };
    readonly 'agent-view-tools-more': {
        readonly zh: "还有 {{count}} 条";
        readonly en: "{{count}} more";
    };
    readonly 'agent-view-parent-main': {
        readonly zh: "↑ 主循环";
        readonly en: "↑ main loop";
    };
    readonly 'agent-view-parent-unknown': {
        readonly zh: "父代理未知";
        readonly en: "parent unknown";
    };
    readonly 'agent-view-parent-agent': {
        readonly zh: "父代理 {{id}}";
        readonly en: "parent {{id}}";
    };
    readonly 'agent-view-parent-not-in-roster': {
        readonly zh: "父代理 {{id}}（不在当前列表）";
        readonly en: "parent {{id}} (not in the list)";
    };
    readonly 'agent-view-siblings-none': {
        readonly zh: "没有同级代理";
        readonly en: "no siblings";
    };
    readonly 'agent-view-siblings-more': {
        readonly zh: "还有 {{count}} 个同级";
        readonly en: "{{count}} more siblings";
    };
    readonly 'agent-view-select-sibling': {
        readonly zh: "Tab 工作台 · 切换同级";
        readonly en: "Tab workbench · switch siblings";
    };
    readonly 'agent-view-select-sibling-focused': {
        readonly zh: "↑↓ 选择 · ⏎ 切换 · Esc 退出面板";
        readonly en: "↑↓ select · ⏎ switch · Esc leave panel";
    };
    readonly 'agents-peers-title': {
        readonly zh: "其他会话的代理";
        readonly en: "agents in other sessions";
    };
    readonly 'agents-peers-empty': {
        readonly zh: "列表为空";
        readonly en: "none";
    };
    readonly 'agents-peers-note': {
        readonly zh: "无法从这里给其他会话的代理发消息";
        readonly en: "agents in other sessions cannot be messaged from here";
    };
    readonly 'subagent-count-nested': {
        readonly zh: "嵌套";
        readonly en: "nested";
    };
    readonly 'subagent-nested-mark': {
        readonly zh: "嵌套子代理";
        readonly en: "nested subagent";
    };
    readonly 'agent-message-source-user': {
        readonly zh: "用户";
        readonly en: "user";
    };
    readonly 'agent-message-source-parent': {
        readonly zh: "父代理";
        readonly en: "parent";
    };
    readonly 'agent-message-source-child': {
        readonly zh: "子代理";
        readonly en: "child";
    };
    readonly 'agent-message-from-to': {
        readonly zh: "{{from}} → {{to}}";
        readonly en: "{{from}} → {{to}}";
    };
    readonly 'agent-message-unknown-target': {
        readonly zh: "收发方未知";
        readonly en: "unknown sender/recipient";
    };
    readonly 'agent-message-no-delivery-fact': {
        readonly zh: "送达状态未知";
        readonly en: "delivery status unknown";
    };
    readonly 'agent-message-delivery-issued': {
        readonly zh: "已发出";
        readonly en: "issued";
    };
    readonly 'agent-message-delivery-queued': {
        readonly zh: "已入队";
        readonly en: "queued";
    };
    readonly 'agent-message-delivery-delivered': {
        readonly zh: "已送达";
        readonly en: "delivered";
    };
    readonly 'agent-message-delivery-held': {
        readonly zh: "暂扣";
        readonly en: "held";
    };
    readonly 'agent-message-delivery-refused': {
        readonly zh: "已拒收";
        readonly en: "refused";
    };
    readonly 'agent-message-delivery-expired': {
        readonly zh: "已过期";
        readonly en: "expired";
    };
    readonly 'agent-message-delivery-unknown': {
        readonly zh: "未知";
        readonly en: "unknown";
    };
    readonly 'agent-message-via-parent-mediated': {
        readonly zh: "经父代理转发";
        readonly en: "via parent relay";
    };
    readonly 'agent-message-via-direct-continuable': {
        readonly zh: "直发子代理";
        readonly en: "direct to child";
    };
    readonly 'agent-message-via-agent-relay': {
        readonly zh: "代理中继";
        readonly en: "agent relay";
    };
    readonly 'agent-message-compose-title': {
        readonly zh: "发送给 {{name}}";
        readonly en: "Send to {{name}}";
    };
    readonly 'agent-message-submitted': {
        readonly zh: "最近发送";
        readonly en: "submitted";
    };
    readonly 'agent-message-inbox-note': {
        readonly zh: "已送进对方收件箱，不代表已读或已执行";
        readonly en: "in the inbox; not necessarily read or acted on";
    };
    readonly 'agent-message-unavailable': {
        readonly zh: "当前无法发送";
        readonly en: "sending is unavailable right now";
    };
    readonly 'agent-message-target-ambiguous': {
        readonly zh: "有同名代理，按 id {{id}} 区分";
        readonly en: "duplicate names; told apart by id {{id}}";
    };
    readonly 'agent-message-target-nameless': {
        readonly zh: "此代理没有可用的名称，无法发送";
        readonly en: "this agent has no name to address; cannot send";
    };
    readonly 'agent-message-target-not-resumable': {
        readonly zh: "目标代理已无法恢复";
        readonly en: "target cannot be resumed";
    };
    readonly 'agent-message-parent-unavailable': {
        readonly zh: "父代理不可用，未发送";
        readonly en: "parent unavailable; not sent";
    };
    readonly 'agent-message-unauthorized': {
        readonly zh: "没有向该代理发消息的权限";
        readonly en: "not allowed to message this agent";
    };
    readonly 'agent-message-delivery-unavailable': {
        readonly zh: "当前无法投递给目标代理";
        readonly en: "delivery to the target is unavailable";
    };
    readonly 'send-message-card-resuming': {
        readonly zh: "唤醒中";
        readonly en: "resuming";
    };
    readonly 'send-message-card-resumed': {
        readonly zh: "已唤醒 {{id}}";
        readonly en: "resumed {{id}}";
    };
    readonly 'send-message-card-args': {
        readonly zh: "── 参数 ──";
        readonly en: "── args ──";
    };
    readonly 'send-message-card-result': {
        readonly zh: "── 结果 ──";
        readonly en: "── result ──";
    };
    readonly 'send-message-card-summary-label': {
        readonly zh: "摘要";
        readonly en: "summary";
    };
    readonly 'agent-message-dispatch-failed': {
        readonly zh: "发送失败";
        readonly en: "dispatch failed";
    };
    readonly 'agent-message-parent-interrupted': {
        readonly zh: "父回合被中断，未送达";
        readonly en: "parent turn interrupted; not delivered";
    };
    readonly 'agent-message-draft-retained': {
        readonly zh: "草稿已保留";
        readonly en: "draft retained";
    };
    readonly 'agent-message-hint-queue': {
        readonly zh: "Enter 发送（排在父代理当前回合之后，不打断）· Esc 退出输入";
        readonly en: "Enter send (after the parent's current turn, no interrupt) · Esc leave input";
    };
    readonly 'agent-message-hint-queue-steer': {
        readonly zh: "Enter 排队 · Ctrl+Enter 插话 · Esc 退出输入";
        readonly en: "Enter queue · Ctrl+Enter steer · Esc leave input";
    };
    readonly 'agent-message-hint-nameless': {
        readonly zh: "此代理没有名称：只能查看，不能发送";
        readonly en: "nameless agent: view only, cannot send";
    };
    readonly 'agent-messages-tab': {
        readonly zh: "消息";
        readonly en: "Messages";
    };
    readonly 'jobs-card-prefix': {
        readonly zh: "任务：";
        readonly en: "job: ";
    };
    readonly 'jobs-status-running': {
        readonly zh: "运行中";
        readonly en: "running";
    };
    readonly 'jobs-status-stopping': {
        readonly zh: "停止中";
        readonly en: "stopping";
    };
    readonly 'jobs-status-completed': {
        readonly zh: "已完成";
        readonly en: "completed";
    };
    readonly 'jobs-status-failed': {
        readonly zh: "失败";
        readonly en: "failed";
    };
    readonly 'jobs-status-killed': {
        readonly zh: "已停止";
        readonly en: "killed";
    };
    readonly 'jobs-panel-title': {
        readonly zh: " 后台任务 ";
        readonly en: " Background Jobs ";
    };
    readonly 'jobs-panel-count-running': {
        readonly zh: "运行中";
        readonly en: "running";
    };
    readonly 'jobs-panel-count-completed': {
        readonly zh: "已完成";
        readonly en: "completed";
    };
    readonly 'jobs-panel-count-failed': {
        readonly zh: "失败";
        readonly en: "failed";
    };
    readonly 'jobs-panel-empty': {
        readonly zh: "当前会话暂无后台任务";
        readonly en: "No background jobs in the current session";
    };
    readonly 'jobs-panel-empty-hint': {
        readonly zh: "后台运行的命令（run_in_background）会出现在这里";
        readonly en: "Commands the agent runs in the background appear here";
    };
    readonly 'jobs-panel-hint': {
        readonly zh: "↑/↓ 选择 · e 展开/收起 · k 两次停止 · Esc 关闭";
        readonly en: "↑/↓ select · e expand/fold · press k twice to stop · Esc close";
    };
    readonly 'jobs-kill-armed': {
        readonly zh: "再按 k 确认停止";
        readonly en: "press k again to confirm";
    };
    readonly 'jobs-panel-started': {
        readonly zh: "开始";
        readonly en: "started";
    };
    readonly 'jobs-panel-finished': {
        readonly zh: "结束";
        readonly en: "finished";
    };
    readonly 'jobs-panel-context-title': {
        readonly zh: "后台任务 {{id}}";
        readonly en: "Background job {{id}}";
    };
    readonly 'jobs-panel-context-heading': {
        readonly zh: "后台任务 {{id}}（{{status}}）";
        readonly en: "Background job {{id}} ({{status}})";
    };
    readonly 'jobs-panel-context-command': {
        readonly zh: "命令：{{command}}";
        readonly en: "Command: {{command}}";
    };
    readonly 'jobs-panel-context-output': {
        readonly zh: "输出（末 {{n}} 行）：";
        readonly en: "Output (last {{n}} lines):";
    };
    readonly 'jobs-panel-context-no-output': {
        readonly zh: "（暂无输出）";
        readonly en: "(no output yet)";
    };
    readonly 'jobs-panel-output': {
        readonly zh: "输出";
        readonly en: "output";
    };
    readonly 'jobs-panel-output-at': {
        readonly zh: "输出更新于";
        readonly en: "output updated";
    };
    readonly 'jobs-panel-no-output-yet': {
        readonly zh: "（暂无镜像输出——agent 读取后显示）";
        readonly en: "(no mirrored output yet — appears when the agent reads it)";
    };
    readonly 'jobs-output-gap': {
        readonly zh: "……较早的输出已丢弃……";
        readonly en: "……earlier output discarded……";
    };
    readonly 'jobs-output-dropped': {
        readonly zh: "部分输出未保留";
        readonly en: "some output not retained";
    };
    readonly 'jobs-progress-latest': {
        readonly zh: "进度";
        readonly en: "progress";
    };
    readonly 'jobs-progress-updated-at': {
        readonly zh: "更新 {{time}}";
        readonly en: "updated {{time}}";
    };
    readonly 'jobs-progress-source': {
        readonly zh: "来源 {{source}}";
        readonly en: "source {{source}}";
    };
    readonly 'jobs-timeline': {
        readonly zh: "时间线（最近）";
        readonly en: "timeline (latest)";
    };
    readonly 'jobs-timeline-started': {
        readonly zh: "启动";
        readonly en: "started";
    };
    readonly 'jobs-timeline-progress': {
        readonly zh: "进度";
        readonly en: "progress";
    };
    readonly 'jobs-timeline-output': {
        readonly zh: "输出";
        readonly en: "output";
    };
    readonly 'jobs-timeline-gap': {
        readonly zh: "缺口";
        readonly en: "gap";
    };
    readonly 'jobs-timeline-settled': {
        readonly zh: "结束";
        readonly en: "ended";
    };
    readonly 'jobs-timeline-gap-count': {
        readonly zh: "输出缺口 {{n}} 处";
        readonly en: "{{n}} output gaps";
    };
    readonly 'jobs-timeline-events-unavailable': {
        readonly zh: "时间线不可用（任务在本次启动前就已开始）";
        readonly en: "timeline unavailable (the job started before this launch)";
    };
    readonly 'jobs-output-retained-tail': {
        readonly zh: "仅保留最近 {{n}} 行";
        readonly en: "last {{n}} lines retained";
    };
    readonly 'jobs-output-spill': {
        readonly zh: "完整输出落盘：{{path}}";
        readonly en: "full output retained at: {{path}}";
    };
    readonly 'jobs-toast-completed': {
        readonly zh: "后台任务完成：{{label}}（{{id}} · 用时 {{duration}}）";
        readonly en: "Background job completed: {{label}} ({{id}} · {{duration}})";
    };
    readonly 'jobs-toast-failed': {
        readonly zh: "后台任务失败：{{label}}（{{id}} · {{detail}}）";
        readonly en: "Background job failed: {{label}} ({{id}} · {{detail}})";
    };
    readonly 'jobs-toast-killed': {
        readonly zh: "后台任务已停止：{{label}}（{{id}} · 用时 {{duration}}）";
        readonly en: "Background job killed: {{label}} ({{id}} · {{duration}})";
    };
    readonly 'jobs-kill-failed': {
        readonly zh: "无法停止任务 {{id}}（任务不存在或任务服务未挂载）";
        readonly en: "Could not kill job {{id}} (unknown job or jobs service not mounted)";
    };
    readonly 'jobs-detail-unknown': {
        readonly zh: "状态未知";
        readonly en: "status unknown";
    };
    readonly 'jobs-steer-killed': {
        readonly zh: "我通过 /jobs 面板停止了后台任务 {{id}}（{{label}}）";
        readonly en: "I killed background job {{id}} ({{label}}) via the /jobs panel";
    };
    readonly 'jobs-group-title': {
        readonly zh: "后台任务 ×{{count}}";
        readonly en: "background jobs ×{{count}}";
    };
    readonly 'jobs-group-folded': {
        readonly zh: "已折叠 {{count}} 个后台任务";
        readonly en: "{{count}} background jobs folded";
    };
    readonly 'jobs-group-running': {
        readonly zh: "{{count}} 运行中";
        readonly en: "{{count}} running";
    };
    readonly 'jobs-group-completed': {
        readonly zh: "{{count}} 已完成";
        readonly en: "{{count}} completed";
    };
    readonly 'jobs-group-failed': {
        readonly zh: "{{count}} 失败";
        readonly en: "{{count}} failed";
    };
    readonly 'jobs-group-killed': {
        readonly zh: "{{count}} 已停止";
        readonly en: "{{count}} killed";
    };
    readonly 'jobs-group-all-completed': {
        readonly zh: "全部完成";
        readonly en: "all completed";
    };
    readonly 'jobs-group-elapsed': {
        readonly zh: "合计 {{duration}}";
        readonly en: "{{duration}} total";
    };
    readonly 'jobs-group-hint-expand': {
        readonly zh: "点击展开";
        readonly en: "click to expand";
    };
    readonly 'jobs-group-hint-fold': {
        readonly zh: "点击折叠";
        readonly en: "click to fold";
    };
    readonly 'plan-review-fallback-header': {
        readonly zh: "计划评审";
        readonly en: "Plan review";
    };
    readonly 'plan-review-feedback-placeholder': {
        readonly zh: "输入反馈，告诉模型要改什么…";
        readonly en: "Tell the model what to change…";
    };
    readonly 'plan-review-approve-needs-empty': {
        readonly zh: "请先清空反馈再批准（或在输入行回车提交反馈）";
        readonly en: "Clear the feedback to approve (or press Enter on the input row to send it)";
    };
    readonly 'plan-review-hint': {
        readonly zh: "↑/↓ 选择 · 1/2 快选 · 打字输入反馈 · {{paste}} 粘贴 · Enter 提交 · Esc 打断评审";
        readonly en: "↑/↓ select · 1/2 quick-pick · type feedback · {{paste}} paste · Enter submit · Esc dismiss";
    };
    readonly 'provider-unavailable': {
        readonly zh: "/provider 需要经 dsh profile 启动（settings / credentials / llm-pi-ai 服务未挂载）";
        readonly en: "/provider requires starting through a dsh profile (settings / credentials / llm-pi-ai services not mounted)";
    };
    readonly 'provider-q-mode': {
        readonly zh: "要添加哪种模型提供方？";
        readonly en: "Which kind of model provider do you want to add?";
    };
    readonly 'provider-opt-catalog': {
        readonly zh: "内置 provider";
        readonly en: "Built-in provider";
    };
    readonly 'provider-opt-catalog-desc': {
        readonly zh: "openai、anthropic、deepseek 等内置目录，自动继承端点与协议";
        readonly en: "Built-in catalog such as openai, anthropic, deepseek — endpoint and protocol inherited";
    };
    readonly 'provider-opt-custom': {
        readonly zh: "自定义 API 端点";
        readonly en: "Custom API endpoint";
    };
    readonly 'provider-opt-custom-desc': {
        readonly zh: "OpenAI / Anthropic 兼容的网关或自建服务";
        readonly en: "An OpenAI/Anthropic-compatible gateway or self-hosted server";
    };
    readonly 'provider-q-catalog': {
        readonly zh: "选择 provider";
        readonly en: "Choose a provider";
    };
    readonly 'provider-opt-other-route': {
        readonly zh: "其他（手动输入路由名）";
        readonly en: "Other (enter a route name)";
    };
    readonly 'provider-opt-other-route-desc': {
        readonly zh: "目录里没列出的 catalog 路由";
        readonly en: "A catalog route not listed above";
    };
    readonly 'provider-q-route-id': {
        readonly zh: "输入路由名";
        readonly en: "Enter a route name";
    };
    readonly 'provider-q-route-id-detail': {
        readonly zh: "小写字母开头，可含数字与连字符，如 my-gateway";
        readonly en: "Lowercase letter first, digits and dashes allowed, e.g. my-gateway";
    };
    readonly 'provider-route-id-invalid': {
        readonly zh: "路由名不合法：须以小写字母开头，仅含小写字母 / 数字 / 连字符";
        readonly en: "Invalid route name: must start with a lowercase letter, only lowercase letters / digits / dashes";
    };
    readonly 'provider-q-apikey': {
        readonly zh: "输入 API key";
        readonly en: "Enter the API key";
    };
    readonly 'provider-q-apikey-detail': {
        readonly zh: "密钥将写入 ~/.dsh/.credentials.yaml（权限 0600），不会出现在会话记录中";
        readonly en: "The key is stored in ~/.dsh/.credentials.yaml (mode 0600) and never shown in the transcript";
    };
    readonly 'provider-q-baseurl-choice': {
        readonly zh: "是否覆盖默认 API 端点（baseURL）？";
        readonly en: "Override the default API endpoint (baseURL)?";
    };
    readonly 'provider-opt-baseurl-skip': {
        readonly zh: "跳过，使用默认端点";
        readonly en: "Skip — use the default endpoint";
    };
    readonly 'provider-opt-baseurl-input': {
        readonly zh: "现在输入 baseURL";
        readonly en: "Enter a baseURL now";
    };
    readonly 'provider-q-baseurl': {
        readonly zh: "输入 baseURL";
        readonly en: "Enter the baseURL";
    };
    readonly 'provider-q-protocol': {
        readonly zh: "选择 API 协议";
        readonly en: "Choose the wire protocol";
    };
    readonly 'provider-protocol-completions-desc': {
        readonly zh: "OpenAI Chat Completions 兼容（大多数网关）";
        readonly en: "OpenAI Chat Completions compatible (most gateways)";
    };
    readonly 'provider-protocol-responses-desc': {
        readonly zh: "OpenAI Responses API";
        readonly en: "OpenAI Responses API";
    };
    readonly 'provider-protocol-anthropic-desc': {
        readonly zh: "Anthropic Messages API";
        readonly en: "Anthropic Messages API";
    };
    readonly 'provider-discovery-running': {
        readonly zh: "正在探测该端点公布的模型…";
        readonly en: "Discovering the models this endpoint advertises…";
    };
    readonly 'provider-discovery-failed': {
        readonly zh: "模型探测失败，改为手动输入模型 id";
        readonly en: "Model discovery failed — enter model ids manually instead";
    };
    readonly 'provider-q-models': {
        readonly zh: "选择要启用的模型（可在输入行逗号分隔补充）";
        readonly en: "Select the models to enable (add more comma-separated on the input row)";
    };
    readonly 'provider-model-edit-hint': {
        readonly zh: "聚焦模型 / 输入自定义 id 后按 Tab 编辑能力";
        readonly en: "Tab edits the focused model or last manual id";
    };
    readonly 'provider-model-editor-title': {
        readonly zh: "编辑模型能力";
        readonly en: "Edit model capabilities";
    };
    readonly 'provider-model-context-window': {
        readonly zh: "上下文窗口";
        readonly en: "Context window";
    };
    readonly 'provider-model-max-tokens': {
        readonly zh: "最大输出 token";
        readonly en: "Max output tokens";
    };
    readonly 'provider-model-reasoning-efforts': {
        readonly zh: "支持的推理档位";
        readonly en: "Supported reasoning efforts";
    };
    readonly 'provider-model-multimodal': {
        readonly zh: "多模态（图片）";
        readonly en: "Multimodal (images)";
    };
    readonly 'provider-model-multimodal-short': {
        readonly zh: "图片";
        readonly en: "image";
    };
    readonly 'provider-model-save': {
        readonly zh: "保存能力草稿";
        readonly en: "Save capability draft";
    };
    readonly 'provider-model-save-short': {
        readonly zh: "保存";
        readonly en: "save";
    };
    readonly 'provider-model-enter-to-save': {
        readonly zh: "Enter 保存";
        readonly en: "Enter saves";
    };
    readonly 'provider-model-inherit': {
        readonly zh: "继承默认";
        readonly en: "Inherit default";
    };
    readonly 'provider-model-default-capacity': {
        readonly zh: "目录/端点公布：{{n}}";
        readonly en: "Catalog/endpoint reports: {{n}}";
    };
    readonly 'provider-model-default-image': {
        readonly zh: "继承默认 · 文本+图片";
        readonly en: "Inherit · text+images";
    };
    readonly 'provider-model-default-text': {
        readonly zh: "继承默认 · 仅文本";
        readonly en: "Inherit · text only";
    };
    readonly 'provider-model-input-image': {
        readonly zh: "是 · 文本+图片";
        readonly en: "Yes · text+images";
    };
    readonly 'provider-model-input-text': {
        readonly zh: "否 · 仅文本";
        readonly en: "No · text only";
    };
    readonly 'provider-model-capacity-hint': {
        readonly zh: "正整数/K/M；留空恢复继承";
        readonly en: "Positive tokens / K / M; blank inherits";
    };
    readonly 'provider-model-reasoning-hint': {
        readonly zh: "none 禁用 · 如 off,low,high,max=ultra";
        readonly en: "none disables · e.g. off,low,high,max=ultra";
    };
    readonly 'provider-model-input-hint': {
        readonly zh: "←/→ 或空格切换；目前支持文本/图片";
        readonly en: "←/→ or Space changes text/image support";
    };
    readonly 'provider-model-capacity-invalid': {
        readonly zh: "容量必须为正的安全整数（支持 K/M）";
        readonly en: "Capacity must be a positive safe integer (K/M supported)";
    };
    readonly 'provider-model-reasoning-invalid': {
        readonly zh: "档位须为 off/minimal/low/medium/high/xhigh/max；不能重复或只含 off";
        readonly en: "Use off/minimal/low/medium/high/xhigh/max; no duplicates or off-only list";
    };
    readonly 'provider-model-input-invalid': {
        readonly zh: "至少保留文本或图片输入";
        readonly en: "Keep at least one text or image input modality";
    };
    readonly 'provider-model-field-too-long': {
        readonly zh: "字段最多 {{n}} 个字符";
        readonly en: "Field limit: {{n}} characters";
    };
    readonly 'provider-model-paste-text-only': {
        readonly zh: "此字段只接受文本粘贴";
        readonly en: "This field only accepts text paste";
    };
    readonly 'provider-model-reasoning-unavailable': {
        readonly zh: "推理档位编辑需要 DSH 0.2.0-rc.1+";
        readonly en: "Reasoning effort editing requires DSH 0.2.0-rc.1+";
    };
    readonly 'provider-model-reasoning-unavailable-short': {
        readonly zh: "上游版本不支持";
        readonly en: "unsupported by host";
    };
    readonly 'provider-model-override-unavailable': {
        readonly zh: "保持整个 catalog 时的单模型覆盖需要 DSH 0.2.0-rc.2+；请更新 DSH 后重试";
        readonly en: "Per-model overrides while keeping the full catalog require DSH 0.2.0-rc.2+; update DSH and retry";
    };
    readonly 'provider-model-edited': {
        readonly zh: "（能力已编辑）";
        readonly en: "(capabilities edited)";
    };
    readonly 'provider-models-stored-only': {
        readonly zh: "模型探测失败，仍可编辑已有模型的能力";
        readonly en: "Discovery failed; stored model capabilities are still editable";
    };
    readonly 'provider-line-model-capabilities': {
        readonly zh: "能力覆盖：{{models}}";
        readonly en: "Capability overrides: {{models}}";
    };
    readonly 'hint-provider-model-editor': {
        readonly zh: "↑/↓/Tab 字段 · Enter 保存 · Esc 返回";
        readonly en: "↑/↓/Tab fields · Enter save · Esc back";
    };
    readonly 'provider-q-models-fallback': {
        readonly zh: "输入模型 id（逗号分隔）";
        readonly en: "Enter model ids (comma-separated)";
    };
    readonly 'provider-models-required': {
        readonly zh: "自定义端点至少需要一个模型 id";
        readonly en: "A custom endpoint needs at least one model id";
    };
    readonly 'provider-q-confirm': {
        readonly zh: "确认写入该 provider 配置？";
        readonly en: "Write this provider configuration?";
    };
    readonly 'provider-route-exists-warning': {
        readonly zh: "⚠ 该路由已有配置，写入将覆盖现有设置";
        readonly en: "⚠ This route is already configured — writing overwrites it";
    };
    readonly 'provider-opt-confirm-write': {
        readonly zh: "写入并启用";
        readonly en: "Write and enable";
    };
    readonly 'provider-opt-confirm-cancel': {
        readonly zh: "取消";
        readonly en: "Cancel";
    };
    readonly 'provider-line-action-added': {
        readonly zh: "✓ {{route}} · 已添加";
        readonly en: "✓ {{route}} · added";
    };
    readonly 'provider-line-action-updated': {
        readonly zh: "✓ {{route}} · 配置已更新";
        readonly en: "✓ {{route}} · configuration updated";
    };
    readonly 'provider-line-action-updated-models': {
        readonly zh: "✓ {{route}} · 模型列表已更新";
        readonly en: "✓ {{route}} · model list updated";
    };
    readonly 'provider-line-action-deleted': {
        readonly zh: "✓ {{route}} · 已删除";
        readonly en: "✓ {{route}} · deleted";
    };
    readonly 'provider-line-route': {
        readonly zh: "路由：{{route}}";
        readonly en: "Route: {{route}}";
    };
    readonly 'provider-line-keyref': {
        readonly zh: "密钥引用：{{ref}}（已写入 ~/.dsh/.credentials.yaml）";
        readonly en: "Key ref: {{ref}} (stored in ~/.dsh/.credentials.yaml)";
    };
    readonly 'provider-line-keyref-preview': {
        readonly zh: "密钥引用：{{ref}}（确认后写入 ~/.dsh/.credentials.yaml）";
        readonly en: "Key ref: {{ref}} (will be stored in ~/.dsh/.credentials.yaml after confirmation)";
    };
    readonly 'provider-line-keyref-env': {
        readonly zh: "密钥引用：{{ref}}（进程环境已提供同名变量，跳过写入）";
        readonly en: "Key ref: {{ref}} (already in the process environment, write skipped)";
    };
    readonly 'provider-line-endpoint': {
        readonly zh: "端点：{{url}}";
        readonly en: "Endpoint: {{url}}";
    };
    readonly 'provider-line-models': {
        readonly zh: "模型：{{models}}";
        readonly en: "Models: {{models}}";
    };
    readonly 'provider-line-models-catalog': {
        readonly zh: "模型：整个 catalog（未收窄）";
        readonly en: "Models: the whole catalog (not narrowed)";
    };
    readonly 'provider-models-delta-added': {
        readonly zh: "新增 {{n}}";
        readonly en: "+{{n}}";
    };
    readonly 'provider-models-delta-removed': {
        readonly zh: "移除 {{n}}";
        readonly en: "-{{n}}";
    };
    readonly 'provider-models-delta-wrap': {
        readonly zh: "（{{parts}}）";
        readonly en: " ({{parts}})";
    };
    readonly 'provider-row-model-new': {
        readonly zh: "线上新增";
        readonly en: "new on endpoint";
    };
    readonly 'provider-live-fetch-failed': {
        readonly zh: "端点模型列表拉取失败，仅显示内置目录";
        readonly en: "Live model fetch failed — showing the installed catalog only";
    };
    readonly 'provider-catalog-fetch-failed': {
        readonly zh: "内置目录读取失败，线上模型容量不会写入 catalog 配置";
        readonly en: "Installed catalog lookup failed — endpoint capacities will not be written into the catalog profile";
    };
    readonly 'provider-live-fetch-unavailable': {
        readonly zh: "该路由无法安全实时拉取模型，已回退到内置目录";
        readonly en: "Live model fetch is unavailable for this route — showing the installed catalog only";
    };
    readonly 'provider-catalog-models-only': {
        readonly zh: "该 catalog 路由的协议无法确定，线上新增模型请先改用自定义端点并指定协议";
        readonly en: "This catalog route has no single known protocol; use a custom endpoint with an explicit protocol for new models";
    };
    readonly 'provider-catalog-snapshot-note': {
        readonly zh: "下方 {{n}} 项来自内置目录快照；该路由未设置 baseURL，无法实时拉取端点模型";
        readonly en: "The {{n}} items below come from the installed catalog snapshot; this route sets no baseURL, so its endpoint cannot be probed live";
    };
    readonly 'provider-rollback-ok': {
        readonly zh: "已回滚刚写入的密钥";
        readonly en: "Rolled back the just-written key";
    };
    readonly 'provider-rollback-failed': {
        readonly zh: "密钥回滚失败，请手动检查 ~/.dsh/.credentials.yaml";
        readonly en: "Key rollback failed — check ~/.dsh/.credentials.yaml manually";
    };
    readonly 'provider-write-failed': {
        readonly zh: "provider 配置写入失败 · {{{err}}}";
        readonly en: "Failed to write the provider configuration · {{{err}}}";
    };
    readonly 'provider-cancelled': {
        readonly zh: "已取消添加 provider";
        readonly en: "Provider setup cancelled";
    };
    readonly 'provider-success': {
        readonly zh: "provider {{route}} 已添加";
        readonly en: "Provider {{route}} added";
    };
    readonly 'provider-switch-hint': {
        readonly zh: "运行 /model 可切换到新 provider 的模型";
        readonly en: "Run /model to switch to the new provider’s models";
    };
    readonly 'provider-q-switch': {
        readonly zh: "立即切换到新 provider？";
        readonly en: "Switch to the new provider now?";
    };
    readonly 'provider-opt-switch-now': {
        readonly zh: "切换到 {{model}}";
        readonly en: "Switch to {{model}}";
    };
    readonly 'provider-opt-switch-keep': {
        readonly zh: "保持当前模型";
        readonly en: "Keep the current model";
    };
    readonly 'provider-opt-oauth': {
        readonly zh: "账号登录（OAuth）";
        readonly en: "Account sign-in (OAuth)";
    };
    readonly 'provider-opt-oauth-desc': {
        readonly zh: "使用当前宿主支持的账号登录，无需 API key";
        readonly en: "Sign in with an account supported by this host — no API key";
    };
    readonly 'provider-q-oauth': {
        readonly zh: "登录哪个账号？";
        readonly en: "Sign in to which account?";
    };
    readonly 'provider-oauth-state-in': {
        readonly zh: "已登录 · 令牌到期 {{time}}";
        readonly en: "Signed in · token expires {{time}}";
    };
    readonly 'provider-oauth-state-in-no-expiry': {
        readonly zh: "已登录";
        readonly en: "Signed in";
    };
    readonly 'provider-oauth-state-expired': {
        readonly zh: "已登录但令牌已过期，重新登录即可恢复";
        readonly en: "Signed in but the token expired — sign in again to restore";
    };
    readonly 'provider-q-oauth-signed': {
        readonly zh: "{{provider}} 已登录，接下来？";
        readonly en: "{{provider}} is signed in — what next?";
    };
    readonly 'provider-opt-oauth-relogin': {
        readonly zh: "重新登录";
        readonly en: "Sign in again";
    };
    readonly 'provider-opt-oauth-relogin-desc': {
        readonly zh: "更换账号或刷新已有凭据";
        readonly en: "Switch accounts or refresh the stored credential";
    };
    readonly 'provider-opt-oauth-logout': {
        readonly zh: "登出";
        readonly en: "Sign out";
    };
    readonly 'provider-opt-oauth-logout-desc': {
        readonly zh: "删除本地保存的 OAuth 凭据";
        readonly en: "Remove the locally stored OAuth credential";
    };
    readonly 'provider-oauth-none': {
        readonly zh: "没有可 OAuth 登录的 provider（检查 OAuth 模块是否挂载）";
        readonly en: "No OAuth-capable providers (check whether the OAuth module is mounted)";
    };
    readonly 'provider-oauth-login-ok': {
        readonly zh: "{{provider}} 登录成功";
        readonly en: "Signed in to {{provider}}";
    };
    readonly 'provider-oauth-login-failed': {
        readonly zh: "OAuth 登录失败 · {{{err}}}";
        readonly en: "OAuth sign-in failed · {{{err}}}";
    };
    readonly 'provider-oauth-logout-ok': {
        readonly zh: "{{provider}} 已登出";
        readonly en: "Signed out of {{provider}}";
    };
    readonly 'provider-line-oauth-provider': {
        readonly zh: "路由：{{provider}}";
        readonly en: "Route: {{provider}}";
    };
    readonly 'provider-line-oauth-flow': {
        readonly zh: "登录方式：{{flow}}";
        readonly en: "Sign-in: {{flow}}";
    };
    readonly 'provider-line-oauth-expires': {
        readonly zh: "令牌到期：{{time}}";
        readonly en: "Token expires: {{time}}";
    };
    readonly 'provider-line-oauth-out': {
        readonly zh: "已登出，本地 OAuth 凭据已删除";
        readonly en: "Signed out — the stored OAuth credential was removed";
    };
    readonly 'oauth-event-auth-url': {
        readonly zh: "打开以下 URL 完成授权（本地回调会自动结束登录）：\n{{url}}";
        readonly en: "Open this URL to authorize (a local callback completes sign-in):\n{{url}}";
    };
    readonly 'oauth-event-device-code': {
        readonly zh: "访问 {{uri}} 并输入以下代码：\n  {{code}}";
        readonly en: "Visit {{uri}} and enter this code:\n  {{code}}";
    };
    readonly 'oauth-copy-link': {
        readonly zh: "复制授权链接";
        readonly en: "Copy authorization link";
    };
    readonly 'oauth-copy-code': {
        readonly zh: "复制代码";
        readonly en: "Copy code";
    };
    readonly 'oauth-open-again': {
        readonly zh: "重新打开浏览器";
        readonly en: "Open browser again";
    };
    readonly 'oauth-cancel': {
        readonly zh: "取消登录";
        readonly en: "Cancel sign-in";
    };
    readonly 'oauth-auth-url-opened': {
        readonly zh: "授权页面已在浏览器打开，请在浏览器中完成登录。";
        readonly en: "Authorization page opened in your browser — complete the sign-in there.";
    };
    readonly 'oauth-auth-url-opened-fallback': {
        readonly zh: "若页面未打开，请复制下方链接手动访问。";
        readonly en: "If it did not open, copy the link below and open it by hand.";
    };
    readonly 'oauth-auth-url-manual': {
        readonly zh: "打开以下 URL 完成授权。";
        readonly en: "Open this URL to authorize.";
    };
    readonly 'oauth-auth-url-copy-hint': {
        readonly zh: "链接较长，换行后不宜手选；可使用复制操作。";
        readonly en: "Copy the link below (it is too long to select reliably once wrapped):";
    };
    readonly 'oauth-device-opened': {
        readonly zh: "请在已打开的浏览器页面（{{uri}}）输入以下代码：";
        readonly en: "Enter this code on the page opened in your browser ({{uri}}):";
    };
    readonly 'oauth-device-manual': {
        readonly zh: "访问 {{uri}} 并输入以下代码：";
        readonly en: "Visit {{uri}} and enter this code:";
    };
    readonly 'oauth-secret-unmasked': {
        readonly zh: "此输入界面不会隐藏内容，请留意屏幕可见范围";
        readonly en: "Input is not masked on this surface — mind your screen";
    };
    readonly 'oauth-copied': {
        readonly zh: "已复制，可粘贴到需要的位置。";
        readonly en: "Copied — paste it where you need it.";
    };
    readonly 'oauth-copy-failed': {
        readonly zh: "复制失败；请手动选取文字。";
        readonly en: "Copy failed — no clipboard helper answered; select the text manually.";
    };
    readonly 'oauth-reopened': {
        readonly zh: "已在浏览器重新打开。";
        readonly en: "Reopened in your browser.";
    };
    readonly 'oauth-open-failed': {
        readonly zh: "无法打开浏览器，请改为复制链接。";
        readonly en: "Could not open the browser; copy the link instead.";
    };
    readonly 'oauth-waiting': {
        readonly zh: "等待授权…";
        readonly en: "Waiting for authorization…";
    };
    readonly 'oauth-choose-action': {
        readonly zh: "请选择一个操作。";
        readonly en: "Choose an action.";
    };
    readonly 'provider-q-action': {
        readonly zh: "要做什么？";
        readonly en: "What do you want to do?";
    };
    readonly 'provider-opt-action-add': {
        readonly zh: "添加新 provider";
        readonly en: "Add a new provider";
    };
    readonly 'provider-opt-action-add-desc': {
        readonly zh: "内置目录或自定义 API 端点";
        readonly en: "Built-in catalog or a custom API endpoint";
    };
    readonly 'provider-opt-action-edit': {
        readonly zh: "编辑已有 provider";
        readonly en: "Edit an existing provider";
    };
    readonly 'provider-opt-action-edit-desc': {
        readonly zh: "修改密钥、端点、协议、模型，或删除该 provider";
        readonly en: "Change the key, endpoint, protocol, or models — or delete the provider";
    };
    readonly 'provider-q-edit': {
        readonly zh: "选择要编辑的 provider";
        readonly en: "Choose a provider to edit";
    };
    readonly 'provider-none-configured': {
        readonly zh: "没有已配置的 provider，先用「添加新 provider」创建";
        readonly en: "No configured providers — create one with “Add a new provider” first";
    };
    readonly 'provider-row-models': {
        readonly zh: "{{n}} 个模型";
        readonly en: "{{n}} models";
    };
    readonly 'provider-row-catalog': {
        readonly zh: "整个 catalog";
        readonly en: "whole catalog";
    };
    readonly 'provider-row-key-shadowed': {
        readonly zh: "密钥来自环境变量";
        readonly en: "key from the environment";
    };
    readonly 'provider-q-edit-menu': {
        readonly zh: "{{route}} 要编辑哪一项？";
        readonly en: "What would you like to change for {{route}}?";
    };
    readonly 'provider-opt-edit-key': {
        readonly zh: "编辑 API Key";
        readonly en: "Edit API Key";
    };
    readonly 'provider-opt-edit-baseurl': {
        readonly zh: "编辑 Base URL";
        readonly en: "Edit Base URL";
    };
    readonly 'provider-opt-edit-protocol': {
        readonly zh: "编辑 wire protocol";
        readonly en: "Edit wire protocol";
    };
    readonly 'provider-opt-edit-models': {
        readonly zh: "编辑模型列表";
        readonly en: "Edit model list";
    };
    readonly 'provider-opt-edit-delete': {
        readonly zh: "删除该 provider";
        readonly en: "Delete this provider";
    };
    readonly 'provider-opt-edit-delete-desc': {
        readonly zh: "移除配置与 API key";
        readonly en: "Remove the configuration and the API key";
    };
    readonly 'provider-key-env-not-editable': {
        readonly zh: "{{route}} 的 API key 来自环境变量（{{ref}}），无法在此修改";
        readonly en: "{{route}}’s API key comes from the environment ({{ref}}) and cannot be edited here";
    };
    readonly 'provider-key-no-ref': {
        readonly zh: "{{route}} 未配置密钥引用（没有可持久化的 API key），无法在此修改";
        readonly en: "{{route}} has no credential ref (no persisted API key) and cannot be edited here";
    };
    readonly 'provider-line-key-none': {
        readonly zh: "密钥：未配置（无密钥引用，环境提供时按需读取）";
        readonly en: "Key: none configured (no credential ref; resolved from environment when present)";
    };
    readonly 'provider-key-empty': {
        readonly zh: "API key 不能为空，未作修改";
        readonly en: "API key cannot be empty — no change made";
    };
    readonly 'provider-q-key-overwrite-confirm': {
        readonly zh: "密钥 {{ref}} 被多个 provider 共用，确认覆盖？";
        readonly en: "Key ref {{ref}} is shared by several providers — overwrite it?";
    };
    readonly 'provider-opt-key-overwrite-yes': {
        readonly zh: "覆盖共用密钥";
        readonly en: "Overwrite the shared key";
    };
    readonly 'provider-key-overwrite-warning': {
        readonly zh: "⚠ 该密钥还被 {{routes}} 使用，写入新 key 会同时替换它们的凭据";
        readonly en: "⚠ This key is also used by {{routes}}; writing a new one rotates the credential for all of them";
    };
    readonly 'provider-row-model-missing': {
        readonly zh: "本次未发现（保留现有配置）";
        readonly en: "not found in this discovery (kept as configured)";
    };
    readonly 'provider-edit-no-changes': {
        readonly zh: "没有做任何修改";
        readonly en: "No changes made";
    };
    readonly 'provider-line-key-kept': {
        readonly zh: "密钥：保持不变（{{ref}}）";
        readonly en: "Key: unchanged ({{ref}})";
    };
    readonly 'provider-line-key-updated': {
        readonly zh: "密钥引用：{{ref}}（已更新）";
        readonly en: "Key ref: {{ref}} (updated)";
    };
    readonly 'provider-edit-current': {
        readonly zh: "当前值：{{value}}";
        readonly en: "Current: {{value}}";
    };
    readonly 'provider-edit-success': {
        readonly zh: "provider {{route}} 已更新";
        readonly en: "Provider {{route}} updated";
    };
    readonly 'provider-edit-cancelled': {
        readonly zh: "已取消编辑 provider";
        readonly en: "Provider edit cancelled";
    };
    readonly 'provider-q-delete-confirm': {
        readonly zh: "确认删除 provider {{route}}？";
        readonly en: "Delete provider {{route}}?";
    };
    readonly 'provider-opt-delete-yes': {
        readonly zh: "删除配置和密钥";
        readonly en: "Delete config and key";
    };
    readonly 'provider-delete-cancelled': {
        readonly zh: "已取消删除 provider";
        readonly en: "Provider deletion cancelled";
    };
    readonly 'provider-delete-success': {
        readonly zh: "provider {{route}} 已删除";
        readonly en: "Provider {{route}} deleted";
    };
    readonly 'provider-delete-failed': {
        readonly zh: "删除失败 · {{{err}}}";
        readonly en: "Failed to delete · {{{err}}}";
    };
    readonly 'provider-line-deleted-key': {
        readonly zh: "已删除密钥引用 {{ref}}";
        readonly en: "Removed key ref {{ref}}";
    };
    readonly 'provider-line-deleted-key-shadowed': {
        readonly zh: "密钥引用 {{ref}} 来自环境变量，未删除";
        readonly en: "Key ref {{ref}} comes from the environment; not removed";
    };
    readonly 'provider-delete-shared-warning': {
        readonly zh: "⚠ 密钥 {{ref}} 与 {{routes}} 共用，删除本 provider 不会移除该密钥";
        readonly en: "⚠ Key ref {{ref}} is shared with {{routes}}; deleting this provider keeps the key";
    };
    readonly 'provider-line-deleted-key-shared': {
        readonly zh: "密钥引用 {{ref}} 仍被 {{routes}} 使用，未删除";
        readonly en: "Key ref {{ref}} is still used by {{routes}}; not removed";
    };
    readonly 'provider-line-deleted-key-reserved': {
        readonly zh: "密钥引用 {{ref}} 属于宿主保留命名空间，未删除";
        readonly en: "Key ref {{ref}} is in the host-reserved credential namespace; not removed";
    };
    readonly 'provider-unknown-ref-users': {
        readonly zh: "（引用查询不可用）";
        readonly en: "(ref query unavailable)";
    };
    readonly 'provider-line-deleted-key-cleanup-failed': {
        readonly zh: "密钥引用 {{ref}} 清理失败，请手动检查 ~/.dsh/.credentials.yaml";
        readonly en: "Failed to remove key ref {{ref}} — check ~/.dsh/.credentials.yaml manually";
    };
    readonly 'provider-delete-key-cleanup-failed': {
        readonly zh: "provider {{route}} 已删除，但密钥 {{ref}} 清理失败，请手动处理";
        readonly en: "Provider {{route}} deleted, but removing key {{ref}} failed — clean it up manually";
    };
    readonly 'cmd-desc-new': {
        readonly zh: "新开会话";
    };
    readonly 'cmd-desc-clear': {
        readonly zh: "清空当前会话";
    };
    readonly 'cmd-desc-compact': {
        readonly zh: "压缩会话历史";
    };
    readonly 'cmd-desc-compact-unavailable': {
        readonly zh: "压缩会话历史（当前 agent 预设未挂载压缩服务，不可用）";
        readonly en: "Summarize earlier turns to free context space (unavailable: this agent preset mounts no compaction service)";
    };
    readonly 'cmd-desc-plan-unavailable': {
        readonly zh: "切换计划模式（当前 agent 未注册 /plan 命令，不可用）";
        readonly en: "Toggle plan mode (unavailable: this agent has no /plan command registered)";
    };
    readonly 'cmd-desc-resume': {
        readonly zh: "恢复历史会话";
    };
    readonly 'cmd-desc-agentview': {
        readonly zh: "打开会话总览";
    };
    readonly 'cmd-desc-bg': {
        readonly zh: "打开会话总览（DSH 先转后台）";
    };
    readonly 'cmd-desc-background': {
        readonly zh: "打开会话总览（DSH 先转后台）";
    };
    readonly 'cmd-desc-rename': {
        readonly zh: "重命名当前会话";
    };
    readonly 'cmd-desc-recap': {
        readonly zh: "生成最近会话活动摘要（可应用建议标题）";
    };
    readonly 'cmd-desc-quit': {
        readonly zh: "退出 dsh-tui";
    };
    readonly 'cmd-desc-q': {
        readonly zh: "退出 dsh-tui";
    };
    readonly 'cmd-desc-rewind': {
        readonly zh: "回退会话到历史消息";
    };
    readonly 'cmd-desc-tree': {
        readonly zh: "浏览会话分叉树（回退/分叉/切分支）";
    };
    readonly 'cmd-desc-fork': {
        readonly zh: "把当前会话分叉为可恢复副本";
    };
    readonly 'cmd-desc-export': {
        readonly zh: "导出会话为 Markdown 文件";
    };
    readonly 'cmd-desc-context': {
        readonly zh: "查看已加载的上下文明细";
    };
    readonly 'cmd-desc-status': {
        readonly zh: "查看会话状态";
    };
    readonly 'cmd-desc-cost': {
        readonly zh: "查看会话 token 用量";
    };
    readonly 'cmd-desc-balance': {
        readonly zh: "查看 DeepSeek 账户余额";
    };
    readonly 'cmd-desc-config': {
        readonly zh: "查看 dsh-tui 配置来源";
    };
    readonly 'cmd-desc-reload': {
        readonly zh: "重读偏好文件并立即生效";
    };
    readonly 'cmd-desc-settings': {
        readonly zh: "查看和编辑插件设置";
    };
    readonly 'cmd-desc-doctor': {
        readonly zh: "运行环境检查";
    };
    readonly 'cmd-desc-migrate': {
        readonly zh: "从其他编程代理导入对话（claude-code/codex/omp/zcode/grok-build）";
    };
    readonly 'cmd-desc-init': {
        readonly zh: "在工作目录创建 AGENTS.md";
    };
    readonly 'cmd-desc-agents': {
        readonly zh: "查看本会话的子代理";
    };
    readonly 'cmd-desc-team': {
        readonly zh: "团队模式：团队服务运行时查看状态（开关用 /plugin enable|disable）";
    };
    readonly 'cmd-desc-jobs': {
        readonly zh: "查看本会话的后台任务";
    };
    readonly 'cmd-desc-panel': {
        readonly zh: "侧栏面板：开关 / 聚焦 / 缩放 / 切换";
        readonly en: "Side panel: toggle / focus / zoom / switch";
    };
    readonly 'cmd-desc-kernel': {
        readonly zh: "选择内核（切换后重启进入）";
        readonly en: "Choose the kernel (restarts into it)";
    };
    readonly 'cmd-desc-dsh': {
        readonly zh: "切换到 DSH 内核（重启进入新会话）";
    };
    readonly 'cmd-desc-codex': {
        readonly zh: "切换到 Codex 内核（重启进入新会话）";
    };
    readonly 'cmd-desc-claude': {
        readonly zh: "切换到 Claude 内核（重启进入新会话）";
    };
    readonly 'cmd-desc-channel': {
        readonly zh: "渠道档案：切换 / 导入 / 查看映射（Claude）";
        readonly en: "Channel profiles: switch / import / view mappings (Claude)";
    };
    readonly 'panel-title-todo': {
        readonly zh: "待办";
        readonly en: "Todo";
    };
    readonly 'panel-title-jobs': {
        readonly zh: "任务";
        readonly en: "Jobs";
    };
    readonly 'panel-title-agents': {
        readonly zh: "代理";
        readonly en: "Agents";
    };
    readonly 'panel-title-companion': {
        readonly zh: "伙伴";
        readonly en: "Companion";
    };
    readonly 'panel-title-trajectory': {
        readonly zh: "轨迹";
        readonly en: "Trajectory";
    };
    readonly 'panel-title-info': {
        readonly zh: "信息";
        readonly en: "Info";
    };
    readonly 'panel-title-workspace': {
        readonly zh: "工作区";
        readonly en: "Workspace";
    };
    readonly 'panel-desc-todo': {
        readonly zh: "目标与待办清单，Enter 勾选完成";
        readonly en: "Goal and todo checklist; Enter ticks items done";
    };
    readonly 'panel-desc-info': {
        readonly zh: "模型、上下文与消耗的信息栏";
        readonly en: "Model, context and cost readout";
    };
    readonly 'panel-desc-trajectory': {
        readonly zh: "回合轨迹：耗时、工具与重试";
        readonly en: "Per-turn trace: timing, tools, retries";
    };
    readonly 'panel-desc-jobs': {
        readonly zh: "后台任务名册与实时输出";
        readonly en: "Background jobs roster and live output";
    };
    readonly 'panel-desc-agents': {
        readonly zh: "子代理列表与详情";
        readonly en: "Subagent list and detail";
    };
    readonly 'panel-desc-workspace': {
        readonly zh: "工作区目录与最近会话";
        readonly en: "Workspace directories and recent sessions";
    };
    readonly 'panel-desc-btw': {
        readonly zh: "侧问线程：不打断主线的旁路问答";
        readonly en: "btw threads: side questions without derailing";
    };
    readonly 'panel-desc-companion': {
        readonly zh: "桌面宠物：状态、互动与通知气泡";
        readonly en: "Desktop pet: mood, interactions, notice bubbles";
    };
    readonly 'panel-trajectory-empty': {
        readonly zh: "本次会话还没有轨迹：发出第一条消息后，这里会画出唤醒带与账本。";
        readonly en: "No trajectory yet — the wake band and ledger appear once this session has turns.";
    };
    readonly 'panel-trajectory-hint': {
        readonly zh: "↑/↓ 选中 · Enter 展开 · Tab 热点 · ⤢ 全屏";
        readonly en: "↑/↓ select · Enter expand · Tab hotspots · ⤢ fullscreen";
    };
    readonly 'trajectory-unsupported': {
        readonly zh: "当前内核不提供轨迹数据，本会话没有可显示的时间线。";
        readonly en: "This kernel provides no trajectory data; there is no session timeline to show.";
    };
    readonly 'trajectory-unsupported-fullscreen': {
        readonly zh: "当前内核没有轨迹数据，⤢ 全屏不可用。";
        readonly en: "This kernel has no trajectory data, so ⤢ fullscreen is unavailable.";
    };
    readonly 'trajectory-unsupported-exit': {
        readonly zh: "q / Esc 返回对话";
        readonly en: "q / Esc to return";
    };
    readonly 'trajectory-time-observed': {
        readonly zh: "时间为收到事件的时刻";
        readonly en: "time is when the event was received";
    };
    readonly 'trajectory-wait-elapsed': {
        readonly zh: "已等待 {{duration}}";
        readonly en: "waiting {{duration}}";
    };
    readonly 'trajectory-inspect-unavailable': {
        readonly zh: "事件原文已读不到（可能已被压缩）";
        readonly en: "source event no longer readable (likely compacted)";
    };
    readonly 'trajectory-view-agent': {
        readonly zh: "代理 {{label}}";
        readonly en: "agent {{label}}";
    };
    readonly 'trajectory-view-parent': {
        readonly zh: "父回合 {{turn}}";
        readonly en: "parent turn {{turn}}";
    };
    readonly 'trajectory-view-descendants': {
        readonly zh: "后代 {{label}}";
        readonly en: "descendants {{label}}";
    };
    readonly 'trajectory-drill-hint': {
        readonly zh: "a 只看该代理";
        readonly en: "a focus this agent";
    };
    readonly 'trajectory-scope-hint-panel': {
        readonly zh: "a 切换范围";
        readonly en: "a cycle scope";
    };
    readonly 'trajectory-scope-hint': {
        readonly zh: "a 切换范围 · Esc 返回会话";
        readonly en: "a cycle scope · Esc back to session";
    };
    readonly 'trajectory-backend-label': {
        readonly zh: "轨迹源：{{name}}";
        readonly en: "trajectory source: {{name}}";
    };
    readonly 'trajectory-backend-dsh': {
        readonly zh: "DSH 会话日志";
        readonly en: "DSH session log";
    };
    readonly 'trajectory-backend-agent-events': {
        readonly zh: "会话事件";
        readonly en: "session events";
    };
    readonly 'info-section-session': {
        readonly zh: "会话";
        readonly en: "Session";
    };
    readonly 'info-section-model': {
        readonly zh: "模型";
        readonly en: "Model";
    };
    readonly 'info-section-context': {
        readonly zh: "上下文";
        readonly en: "Context";
    };
    readonly 'info-section-runtime': {
        readonly zh: "运行时";
        readonly en: "Runtime";
    };
    readonly 'info-row-title': {
        readonly zh: "标题";
        readonly en: "Title";
    };
    readonly 'info-row-session-id': {
        readonly zh: "会话 ID";
        readonly en: "Session ID";
    };
    readonly 'info-row-agent-id': {
        readonly zh: "代理 ID";
        readonly en: "Agent ID";
    };
    readonly 'info-row-cwd': {
        readonly zh: "工作目录";
        readonly en: "Working dir";
    };
    readonly 'info-row-branch': {
        readonly zh: "分支";
        readonly en: "Branch";
    };
    readonly 'info-row-model': {
        readonly zh: "模型";
        readonly en: "Model";
    };
    readonly 'info-row-effort': {
        readonly zh: "思考深度";
        readonly en: "Effort";
    };
    readonly 'info-row-mode': {
        readonly zh: "工作模式";
        readonly en: "Mode";
    };
    readonly 'info-row-approval': {
        readonly zh: "权限";
        readonly en: "Permissions";
    };
    readonly 'info-row-context': {
        readonly zh: "上下文占用";
        readonly en: "Context";
    };
    readonly 'info-row-window': {
        readonly zh: "上下文窗口";
        readonly en: "Window";
    };
    readonly 'info-row-tokens': {
        readonly zh: "Token 用量";
        readonly en: "Tokens";
    };
    readonly 'info-row-cache': {
        readonly zh: "缓存命中";
        readonly en: "Cache hit";
    };
    readonly 'info-row-cost': {
        readonly zh: "消耗额度";
        readonly en: "Spend";
    };
    readonly 'info-row-tps': {
        readonly zh: "生成速度";
        readonly en: "Throughput";
    };
    readonly 'info-row-status': {
        readonly zh: "状态";
        readonly en: "Status";
    };
    readonly 'info-row-activity': {
        readonly zh: "动作";
        readonly en: "Activity";
    };
    readonly 'info-row-jobs': {
        readonly zh: "后台任务";
        readonly en: "Background jobs";
    };
    readonly 'info-row-subagents': {
        readonly zh: "子代理";
        readonly en: "Subagents";
    };
    readonly 'info-value-none': {
        readonly zh: "—";
        readonly en: "—";
    };
    readonly 'panel-workspace-current': {
        readonly zh: "当前工作区";
        readonly en: "Current workspace";
    };
    readonly 'panel-workspace-list': {
        readonly zh: "已登记工作区 ×{{n}}";
        readonly en: "Registered workspaces ×{{n}}";
    };
    readonly 'panel-workspace-empty': {
        readonly zh: "还没有登记的工作区（用 /workspace open <目录> 添加）";
        readonly en: "No registered workspaces yet (/workspace open <dir> to add one)";
    };
    readonly 'panel-workspace-missing': {
        readonly zh: "目录不存在";
        readonly en: "directory missing";
    };
    readonly 'panel-workspace-sessions': {
        readonly zh: "{{n}} 个会话";
        readonly en: "{{n}} sessions";
    };
    readonly 'panel-workspace-loading': {
        readonly zh: "正在读取工作区…";
        readonly en: "Loading workspaces…";
    };
    readonly 'panel-workspace-failed': {
        readonly zh: "读取工作区失败 · {{err}}";
        readonly en: "Failed to load workspaces · {{err}}";
    };
    readonly 'panel-workspace-hint': {
        readonly zh: "↑/↓ 选择 · Enter 打开工作区主页 · r 刷新";
        readonly en: "↑/↓ select · Enter opens the workspace home · r refresh";
    };
    readonly 'companion-mood-sleeping': {
        readonly zh: "睡觉中";
        readonly en: "Sleeping";
    };
    readonly 'companion-mood-idle': {
        readonly zh: "发呆";
        readonly en: "Idle";
    };
    readonly 'companion-mood-waiting': {
        readonly zh: "等待回复";
        readonly en: "Waiting";
    };
    readonly 'companion-mood-thinking': {
        readonly zh: "思考中";
        readonly en: "Thinking";
    };
    readonly 'companion-mood-working': {
        readonly zh: "工作中";
        readonly en: "Working";
    };
    readonly 'companion-mood-responding': {
        readonly zh: "回复中";
        readonly en: "Responding";
    };
    readonly 'companion-mood-attention': {
        readonly zh: "需要你";
        readonly en: "Needs you";
    };
    readonly 'companion-mood-celebrate': {
        readonly zh: "完成啦";
        readonly en: "Done!";
    };
    readonly 'companion-mood-error': {
        readonly zh: "出错了";
        readonly en: "Error";
    };
    readonly 'companion-stats-working': {
        readonly zh: "{{duration}} · {{count}} 个工具";
        readonly en: "{{duration}} · {{count}} tools";
    };
    readonly 'companion-hint': {
        readonly zh: "点它戳一戳 · 连点挠痒痒 · 拖拽拎起来";
        readonly en: "click to poke · rapid clicks tickle · drag to carry";
    };
    readonly 'companion-cramped': {
        readonly zh: "好挤呀！{{name}}暂时躲起来了~";
        readonly en: "So cramped! {{name}} is hiding for now~";
    };
    readonly 'companion-now-playing': {
        readonly zh: "当前动作：{{anim}}";
        readonly en: "Now: {{anim}}";
    };
    readonly 'companion-stat-subagents': {
        readonly zh: "子代理 ×{{n}}";
        readonly en: "subagents ×{{n}}";
    };
    readonly 'companion-stat-sessions': {
        readonly zh: "会话 ×{{n}}";
        readonly en: "sessions ×{{n}}";
    };
    readonly 'picker-title-panel': {
        readonly zh: "打开面板";
        readonly en: "Open panel";
    };
    readonly 'panel-sent-to-chat': {
        readonly zh: "已附加到输入框：{{title}}（Esc 可撤）";
        readonly en: "Attached to the composer: {{title}} (Esc to remove)";
    };
    readonly 'panel-context-detached': {
        readonly zh: "已从输入框撤回，不再附加到主聊天";
        readonly en: "Removed from the composer";
    };
    readonly 'companion-send-title': {
        readonly zh: "伙伴状态";
        readonly en: "Companion status";
    };
    readonly 'panel-hint-focused': {
        readonly zh: "Esc 聊天 · ←/→ 切换";
        readonly en: "Esc chat · ←/→ panels";
    };
    readonly 'panel-hint-send-to-chat': {
        readonly zh: "s 送聊天";
        readonly en: "s to chat";
    };
    readonly 'panel-hint-zoom-width': {
        readonly zh: "z 缩放 · +/- 调宽";
        readonly en: "z zoom · +/- width";
    };
    readonly 'panel-hint-unfocused': {
        readonly zh: "Ctrl+B 聚焦侧栏";
        readonly en: "Ctrl+B focus panel";
    };
    readonly 'panel-empty-none': {
        readonly zh: "没有已启用的面板（/panel manage 管理）";
        readonly en: "No enabled panels (/panel manage)";
    };
    readonly 'panel-too-narrow': {
        readonly zh: "宽度不足（需 ≥ {{min}} 列）";
        readonly en: "Too narrow (needs ≥ {{min}} cols)";
    };
    readonly 'panel-error-title': {
        readonly zh: "面板渲染出错";
        readonly en: "Panel render error";
    };
    readonly 'panel-error-hint': {
        readonly zh: "该面板已被隔离，聊天不受影响";
        readonly en: "This panel is isolated; chat is unaffected";
    };
    readonly 'panel-plugin-disabled': {
        readonly zh: "面板已禁用（连续崩溃）";
        readonly en: "Panel disabled (repeated crashes)";
    };
    readonly 'panel-plugin-disabled-hint': {
        readonly zh: "本会话内不再挂载该插件面板；重启后恢复";
        readonly en: "This plugin panel stays unmounted for the session; restart resets it";
    };
    readonly 'panel-plugin-disabled-toast': {
        readonly zh: "插件面板因连续崩溃已被禁用";
        readonly en: "A plugin panel was disabled after repeated crashes";
    };
    readonly 'panel-send-to-chat-denied': {
        readonly zh: "Send to Chat 需要 panels.chat.attach 授权（后续版本）";
        readonly en: "Send to Chat requires the panels.chat.attach grant (coming in a later version)";
    };
    readonly 'sugg-panel-toggle-desc': {
        readonly zh: "开关侧栏";
        readonly en: "Toggle the sidebar";
    };
    readonly 'sugg-panel-focus-desc': {
        readonly zh: "聚焦侧栏面板";
        readonly en: "Focus the side panel";
    };
    readonly 'sugg-panel-zoom-desc': {
        readonly zh: "缩放当前面板";
        readonly en: "Zoom the active panel";
    };
    readonly 'sugg-panel-id-desc': {
        readonly zh: "打开该面板";
        readonly en: "Open this panel";
    };
    readonly 'sugg-plugin-list-desc': {
        readonly zh: "列出额外插件与实验性功能";
        readonly en: "List added plugins and experimental features";
    };
    readonly 'sugg-plugin-info-desc': {
        readonly zh: "查单个条目或待装 spec";
        readonly en: "Describe an installed plugin or an install spec";
    };
    readonly 'sugg-plugin-registries-desc': {
        readonly zh: "查看安装源";
        readonly en: "Show where installations ask";
    };
    readonly 'sugg-plugin-check-desc': {
        readonly zh: "校验清单，不安装";
        readonly en: "Validate a manifest without installing it";
    };
    readonly 'sugg-plugin-install-desc': {
        readonly zh: "把这个插件装进当前 profile";
        readonly en: "Install a plugin bundle into this profile";
    };
    readonly 'sugg-plugin-remove-desc': {
        readonly zh: "把这个插件从 profile 卸载";
        readonly en: "Uninstall a plugin bundle from this profile";
    };
    readonly 'sugg-plugin-enable-desc': {
        readonly zh: "重新启用一个 bundle 或行";
        readonly en: "Switch a plugin bundle or row back on";
    };
    readonly 'sugg-plugin-disable-desc': {
        readonly zh: "关闭一个 bundle 或行";
        readonly en: "Switch a plugin bundle or row off";
    };
    readonly 'sugg-plugin-spec-path-desc': {
        readonly zh: "示例：本地目录或仓库路径";
        readonly en: "Example: a local directory";
    };
    readonly 'sugg-plugin-spec-git-desc': {
        readonly zh: "示例：git 仓库 URL";
        readonly en: "Example: a git URL";
    };
    readonly 'sugg-plugin-spec-package-desc': {
        readonly zh: "示例：registry 包名（@版本 可钉死）";
        readonly en: "Example: a registry package, @version pins it";
    };
    readonly 'panel-unavailable-hint': {
        readonly zh: "侧栏需要全屏且内容区 ≥93 列；该面板没有整屏形态";
        readonly en: "Sidebar needs fullscreen and ≥93 content columns; this panel has no fullscreen form";
    };
    readonly 'cmd-desc-activity': {
        readonly zh: "切换工作状态指示器预设";
    };
    readonly 'cmd-desc-preset': {
        readonly zh: "切换 Agent 预设（含梁神模式）";
    };
    readonly 'cmd-desc-theme': {
        readonly zh: "切换配色主题（auto 跟随系统，或内置/静态 JSON/插件主题）";
    };
    readonly 'cmd-desc-color': {
        readonly zh: "设置当前会话强调色（输入框边框与会话标签）";
    };
    readonly 'cmd-desc-lang': {
        readonly zh: "切换界面语言（en / zh）";
    };
    readonly 'cmd-desc-model': {
        readonly zh: "查看当前模型";
    };
    readonly 'cmd-desc-thinking': {
        readonly zh: "显示或隐藏思考过程";
    };
    readonly 'cmd-desc-tokens': {
        readonly zh: "查看会话 token 用量";
    };
    readonly 'cmd-desc-provider': {
        readonly zh: "添加、编辑或删除模型提供方（内置目录或自定义 API 端点）";
    };
    readonly 'cmd-desc-login': {
        readonly zh: "查看 API 凭证状态";
    };
    readonly 'cmd-desc-logout': {
        readonly zh: "清除 API 凭证";
    };
    readonly 'cmd-desc-add-dir': {
        readonly zh: "查看文件系统策略范围";
    };
    readonly 'cmd-desc-hooks': {
        readonly zh: "查看 hooks 状态";
    };
    readonly 'cmd-desc-mcp': {
        readonly zh: "查看 MCP 状态";
    };
    readonly 'cmd-desc-skills': {
        readonly zh: "列出所有可用技能";
    };
    readonly 'cmd-desc-plugin': {
        readonly zh: "插件诊断；`list` 列额外插件与可开启的实验性功能，`info` 查单个条目或待装 spec";
    };
    readonly 'cmd-desc-update': {
        readonly zh: "更新 dsh-tui 并重启";
    };
    readonly 'cmd-desc-vim': {
        readonly zh: "切换 vim 模式";
    };
    readonly 'cmd-desc-terminal-setup': {
        readonly zh: "查看终端配置建议";
    };
    readonly 'cmd-desc-connect': {
        readonly zh: "连接远程机器";
    };
    readonly 'cmd-desc-workspace': {
        readonly zh: "切换、重命名或打开工作区";
    };
    readonly 'cmd-desc-workspace-resume': {
        readonly zh: "切换到另一个工作区";
        readonly en: "Switch to another workspace";
    };
    readonly 'cmd-desc-workspace-rename': {
        readonly zh: "重命名当前工作区";
        readonly en: "Rename the current workspace";
    };
    readonly 'cmd-desc-workspace-open': {
        readonly zh: "打开路径或工作区 URI";
        readonly en: "Open a path or workspace URI";
    };
    readonly 'cmd-desc-help': {
        readonly zh: "查看快捷键与命令";
    };
    readonly 'cmd-desc-restart': {
        readonly zh: "重启 dsh-tui 并恢复当前会话";
    };
    readonly 'cmd-desc-exit': {
        readonly zh: "退出 dsh-tui";
    };
    readonly 'cmd-desc-plan': {
        readonly zh: "切换计划模式（/plan off 退出）";
    };
    readonly 'cmd-desc-goal': {
        readonly zh: "设置或查看会话目标";
    };
    readonly 'cmd-desc-feedback': {
        readonly zh: "提交使用反馈";
    };
    readonly 'lang-current': {
        readonly zh: "当前语言  {{lang}}";
        readonly en: "Current language  {{lang}}";
    };
    readonly 'lang-switch-hint': {
        readonly zh: "切换      /lang en | /lang zh";
        readonly en: "Switch      /lang en | /lang zh";
    };
    readonly 'lang-persist-hint': {
        readonly zh: "持久化    ~/.dsh-tui/lang.json（重启后仍生效；DSH_TUI_LANG 优先）";
        readonly en: "Persisted    ~/.dsh-tui/lang.json (survives restart; DSH_TUI_LANG wins)";
    };
    readonly 'lang-switched': {
        readonly zh: "语言已切换：{{lang}}（已保存）";
        readonly en: "Language switched: {{lang}} (saved)";
    };
    readonly 'lang-unknown': {
        readonly zh: "未知语言「{{lang}}」· /lang 查看全部（en / zh）";
        readonly en: "Unknown language \"{{lang}}\" · /lang to view all (en / zh)";
    };
    readonly 'lang-switch-failed': {
        readonly zh: "语言「{{lang}}」切换失败（无法写入 ~/.dsh-tui/lang.json）";
        readonly en: "Language \"{{lang}}\" switch failed (cannot write ~/.dsh-tui/lang.json)";
    };
    readonly 'lang-picker-title': {
        readonly zh: "界面语言";
        readonly en: "UI language";
    };
    readonly 'lang-zh-desc': {
        readonly zh: "简体中文（默认）";
        readonly en: "Simplified Chinese (default)";
    };
    readonly 'lang-en-desc': {
        readonly zh: "English（英文）";
        readonly en: "English";
    };
    readonly 'status-cache-label': {
        readonly zh: "缓存 ";
        readonly en: "cache ";
    };
    readonly 'traj-title': {
        readonly zh: "轨迹";
        readonly en: "Trajectory";
    };
    readonly 'traj-totals': {
        readonly zh: "{{turns}} 轮 · {{steps}} 步";
        readonly en: "{{turns}} turns · {{steps}} rows";
    };
    readonly 'traj-errors': {
        readonly zh: "{{n}} 错";
        readonly en: "{{n}} failed";
    };
    readonly 'traj-retries': {
        readonly zh: "{{n}} 重试";
        readonly en: "{{n}} retries";
    };
    readonly 'traj-matches': {
        readonly zh: "{{n}}/{{total}} 匹配";
        readonly en: "{{n}}/{{total}} matched";
    };
    readonly 'traj-tab-timeline': {
        readonly zh: "时序";
        readonly en: "Timeline";
    };
    readonly 'traj-tab-hotspot': {
        readonly zh: "热点";
        readonly en: "Hotspot";
    };
    readonly 'traj-hot-tools': {
        readonly zh: "工具";
        readonly en: "Tools";
    };
    readonly 'traj-hot-model': {
        readonly zh: "模型";
        readonly en: "Model";
    };
    readonly 'traj-hot-turns': {
        readonly zh: "轮次";
        readonly en: "Turns";
    };
    readonly 'traj-sort-duration': {
        readonly zh: "按耗时";
        readonly en: "by duration";
    };
    readonly 'traj-sort-count': {
        readonly zh: "按次数";
        readonly en: "by count";
    };
    readonly 'traj-sort-tokens': {
        readonly zh: "按 token";
        readonly en: "by tokens";
    };
    readonly 'traj-proj-sequence': {
        readonly zh: "序号等宽";
        readonly en: "even";
    };
    readonly 'traj-proj-time': {
        readonly zh: "真实墙钟";
        readonly en: "wall-clock";
    };
    readonly 'traj-proj-compressed': {
        readonly zh: "压缩空闲";
        readonly en: "compressed";
    };
    readonly 'traj-hint-timeline': {
        readonly zh: "**↑/↓** 移动 · **←/→** 视图 · **[ ]** 跳错 · **{ }** 跳轮 · **/** 查询 · **m** 投影 · **enter** 详情 · **q** 退出";
        readonly en: "**↑/↓** move · **←/→** view · **[ ]** failures · **{ }** turns · **/** query · **m** projection · **enter** detail · **q** exit";
    };
    readonly 'traj-hint-hotspot': {
        readonly zh: "**↑/↓** 移动 · **←/→** 视图 · **t** 排序 · **enter** 回时序定位 · **q** 退出";
        readonly en: "**↑/↓** move · **←/→** view · **t** sort · **enter** locate in timeline · **q** exit";
    };
    readonly 'traj-hint-query': {
        readonly zh: "**tool:** **kind:** **turn:** **err:** **run:** **>10s** **tok>1k** · 裸词全文 · **enter** 确认 · **esc** 清除";
        readonly en: "**tool:** **kind:** **turn:** **err:** **run:** **>10s** **tok>1k** · bare word = full text · **enter** apply · **esc** clear";
    };
    readonly 'traj-hint-expanded': {
        readonly zh: "**j/k** 翻页 · **enter/esc** 收起 · **q** 退出";
        readonly en: "**j/k** page · **enter/esc** collapse · **q** exit";
    };
    readonly 'traj-hint-failure': {
        readonly zh: "{{key}} 看完整轨迹";
        readonly en: "{{key}} for the full trajectory";
    };
    readonly 'launchpad-placeholder': {
        readonly zh: "说点什么，或输入 / 看命令…";
        readonly en: "Say something, or type / for commands…";
    };
    readonly 'launchpad-tip': {
        readonly zh: "输入 / 看全部命令，/setup 可随时重跑引导";
        readonly en: "Type / for every command; /setup re-runs the guide anytime";
    };
    readonly 'launchpad-tip-2': {
        readonly zh: "Ctrl+V 直接粘贴，Shift+Enter 进入聊天页换行";
        readonly en: "Ctrl+V pastes; Shift+Enter opens chat with a newline";
    };
    readonly 'launchpad-tip-3': {
        readonly zh: "参数行四段都能点：模型 · 思考深度 · 模式 · 权限";
        readonly en: "Every param chip is clickable: model · effort · mode · permission";
    };
    readonly 'launchpad-tip-prefix': {
        readonly zh: "Tips：";
        readonly en: "Tips: ";
    };
    readonly 'launchpad-action-continue': {
        readonly zh: "继续上次";
        readonly en: "Continue";
    };
    readonly 'launchpad-action-continue-titled': {
        readonly zh: "继续「{{title}}」";
        readonly en: "Continue \"{{title}}\"";
    };
    readonly 'launchpad-action-sessions-workspace': {
        readonly zh: "会话与工作区";
        readonly en: "Sessions & workspaces";
    };
    readonly 'launchpad-action-settings': {
        readonly zh: "设置";
        readonly en: "Settings";
    };
    readonly 'launchpad-action-backend': {
        readonly zh: "内核";
        readonly en: "Kernel";
    };
    readonly 'launchpad-action-backend-named': {
        readonly zh: "内核 · {{name}}";
        readonly en: "Kernel · {{name}}";
    };
    readonly 'launchpad-action-help': {
        readonly zh: "帮助";
        readonly en: "Help";
    };
    readonly 'launchpad-action-jobs': {
        readonly zh: "后台任务";
        readonly en: "Background jobs";
    };
    readonly 'launchpad-action-update': {
        readonly zh: "有新版本";
        readonly en: "Update available";
    };
    readonly 'launchpad-action-star': {
        readonly zh: "投喂一颗 Star";
        readonly en: "Feed us a star";
    };
    readonly 'kernel-label-dsh': {
        readonly zh: "DeepSeek Harness";
        readonly en: "DeepSeek Harness";
    };
    readonly 'kernel-label-claude': {
        readonly zh: "Claude Agent";
        readonly en: "Claude Agent";
    };
    readonly 'kernel-label-codex': {
        readonly zh: "Codex";
        readonly en: "Codex";
    };
    readonly 'kernel-login-in-session': {
        readonly zh: "未登录";
        readonly en: "Not signed in";
    };
    readonly 'kernel-unavailable-not-installed': {
        readonly zh: "未安装";
        readonly en: "Not installed";
    };
    readonly 'kernel-unavailable-too-old': {
        readonly zh: "版本过旧 · 需升级";
        readonly en: "Too old · upgrade needed";
    };
    readonly 'kernel-switch-restarting': {
        readonly zh: "正在以 {{name}} 内核重启…";
        readonly en: "Restarting on the {{name}} kernel…";
    };
    readonly 'kernel-handoff-starting': {
        readonly zh: "正在切换到 {{name}}，启动新会话…";
        readonly en: "Switching to {{name}} and starting a new session…";
    };
    readonly 'kernel-handoff-session-kept': {
        readonly zh: "当前会话仍保留，可随时切回";
        readonly en: "The current session is preserved; switch back anytime";
    };
    readonly 'kernel-handoff-stage-start': {
        readonly zh: "正在启动 {{name}}…";
        readonly en: "Starting {{name}}…";
    };
    readonly 'kernel-handoff-failed': {
        readonly zh: "切换未完成（{{reason}}）。当前会话仍保留。";
        readonly en: "Switch did not complete ({{reason}}). The current session is preserved.";
    };
    readonly 'kernel-handoff-failed-reason-boot': {
        readonly zh: "新会话启动失败";
        readonly en: "the new session failed to start";
    };
    readonly 'kernel-handoff-failed-reason-spawn': {
        readonly zh: "无法启动替换进程";
        readonly en: "could not spawn the replacement process";
    };
    readonly 'kernel-handoff-crashed': {
        readonly zh: "新会话异常退出（代码 {{code}}）。";
        readonly en: "The new session exited abnormally (code {{code}}).";
    };
    readonly 'kernel-handoff-safe-hint': {
        readonly zh: "可运行 dsh-tui safe 进入安全模式诊断。";
        readonly en: "Run dsh-tui safe for read-only diagnostics.";
    };
    readonly 'kernel-picker-title': {
        readonly zh: "选择内核";
        readonly en: "Choose kernel";
    };
    readonly 'kernel-probing': {
        readonly zh: "检测中…";
        readonly en: "Checking…";
    };
    readonly 'kernel-already-current': {
        readonly zh: "已经是当前内核";
        readonly en: "Already the current kernel";
    };
    readonly 'kernel-switch-unavailable': {
        readonly zh: "当前环境不支持切换内核";
        readonly en: "Switching kernels is unavailable here";
    };
    readonly 'kernel-switch-while-working': {
        readonly zh: "回合运行中，无法切换内核";
        readonly en: "Cannot switch kernels while a turn is running";
    };
    readonly 'kernel-memory-fallback': {
        readonly zh: "上次选择的 {{name}} 内核启动失败，已先以 DSH 内核启动：{{reason}}";
        readonly en: "The remembered {{name}} kernel failed to start; booted on DSH instead: {{reason}}";
    };
    readonly 'resume-target-revoked': {
        readonly zh: "无法恢复上次会话：它由「{{from}}」后端记录，而本次启动使用的是「{{kernel}}」后端。启动恢复只针对所选后端——要恢复「{{from}}」记下的那条：dsh-tui --backend {{from}} --resume；要恢复本次所选后端自己的上次会话：dsh-tui --backend {{kernelId}} --resume；也可以去掉 --resume 重新启动。";
        readonly en: "Cannot resume the last session: it was recorded by the \"{{from}}\" backend while this launch runs on \"{{kernel}}\". Startup recovery only ever targets the selected backend — to reopen the session \"{{from}}\" recorded: `dsh-tui --backend {{from}} --resume`; to reopen the last session of this launch's backend: `dsh-tui --backend {{kernelId}} --resume`; or drop --resume to start fresh.";
    };
    readonly 'resume-target-revoked-uninstalled': {
        readonly zh: "无法恢复上次会话：它由「{{from}}」后端记录，而该后端本次启动未安装（或已不在此 profile 的注册表里），本次启动使用的是「{{kernel}}」后端。恢复它要先装上该后端，再运行 dsh-tui --backend {{from}} --resume；或去掉 --resume 重新启动。";
        readonly en: "Cannot resume the last session: it was recorded by the \"{{from}}\" backend, which is not installed for this launch (or is no longer in this profile's registry), while this launch runs on \"{{kernel}}\". Resuming it needs that backend installed first, then `dsh-tui --backend {{from}} --resume`; or drop --resume to start fresh.";
    };
    readonly 'resume-target-revoked-retry': {
        readonly zh: "安全模式重试：忽略由「{{from}}」后端记录的上次会话（本次启动用的是「{{kernel}}」），按冷启动继续。";
        readonly en: "Safe-mode retry: ignoring the last session recorded by the \"{{from}}\" backend (this launch runs on \"{{kernel}}\") and continuing with a cold start.";
    };
    readonly 'resume-backend-unavailable': {
        readonly zh: "无法恢复会话：本次启动指定的后端「{{backend}}」不可用（未安装或 id 不合法；已注册：{{installed}}），而要恢复的会话「{{session}}」属于它。回落 DSH 只会把别的后端的会话 id 交给 dsh，因此本次启动失败——装上该后端后重试，或去掉 --resume 重新启动。";
        readonly en: "Cannot resume: the backend named for this launch, \"{{backend}}\", is unavailable (not installed, or not a valid id; registered: {{installed}}), and the session \"{{session}}\" belongs to it. Falling back to DSH would only hand another backend's session id to dsh, so this launch fails — install the backend and retry, or drop --resume to start fresh.";
    };
    readonly 'kernel-pinned-hint': {
        readonly zh: "启动参数已指定内核：本次会按你的选择重启，下次直接启动仍按参数进入。";
        readonly en: "A startup flag pins the kernel: this restart follows your choice, a later direct launch follows the flag.";
    };
    readonly 'kernel-not-installed-installable': {
        readonly zh: "未安装 · 按 Enter 安装";
        readonly en: "Not installed · Enter to install";
    };
    readonly 'sdk-install-title': {
        readonly zh: "安装内核依赖";
        readonly en: "Install kernel dependencies";
    };
    readonly 'sdk-install-confirm-what': {
        readonly zh: "将安装 {{specifier}}（验证版本：{{version}}）";
        readonly en: "This installs {{specifier}} (validated version: {{version}})";
    };
    readonly 'sdk-install-confirm-where': {
        readonly zh: "安装位置：{{dir}}";
        readonly en: "Install location: {{dir}}";
    };
    readonly 'sdk-install-confirm-note': {
        readonly zh: "只安装到当前 profile 目录。需要网络与 pnpm。";
        readonly en: "Installs only into the current profile directory. Needs network and pnpm.";
    };
    readonly 'sdk-install-confirm-hint': {
        readonly zh: "**Enter** 安装 · Esc 返回";
        readonly en: "**Enter** install · Esc back";
    };
    readonly 'sdk-install-checking': {
        readonly zh: "正在检查 pnpm…";
        readonly en: "Checking pnpm…";
    };
    readonly 'sdk-install-running': {
        readonly zh: "正在安装，可能需要一分钟…";
        readonly en: "Installing… this can take a minute";
    };
    readonly 'sdk-install-running-sub': {
        readonly zh: "Esc 取消";
        readonly en: "Esc to cancel";
    };
    readonly 'sdk-install-done': {
        readonly zh: "依赖安装完成，返回内核选择查看可用状态。";
        readonly en: "Dependencies installed. Return to the kernel picker to check availability.";
    };
    readonly 'sdk-install-rebuilt': {
        readonly zh: "检测到 pnpm store 漂移，已自动重建依赖后装好。";
        readonly en: "pnpm store drift detected — dependencies were rebuilt automatically.";
    };
    readonly 'sdk-install-done-hint': {
        readonly zh: "**Enter** 返回内核选择 · Esc 关闭";
        readonly en: "**Enter** back to the kernel picker · Esc close";
    };
    readonly 'sdk-install-failed': {
        readonly zh: "安装失败（pnpm 退出码 {{code}}）。可手动安装：";
        readonly en: "Install failed (pnpm exit code {{code}}). Manual install:";
    };
    readonly 'sdk-install-manual': {
        readonly zh: "{{command}}";
        readonly en: "{{command}}";
    };
    readonly 'sdk-install-failed-hint': {
        readonly zh: "r 重试 · Esc 返回";
        readonly en: "r retry · Esc back";
    };
    readonly 'sdk-install-pnpm-missing': {
        readonly zh: "未检测到 pnpm。先运行 npm install -g pnpm 再回来重试，或手动安装：";
        readonly en: "pnpm was not found. Run npm install -g pnpm first and retry, or install manually:";
    };
    readonly 'sdk-install-cancelled': {
        readonly zh: "已取消安装。";
        readonly en: "Install cancelled.";
    };
    readonly 'sdk-install-no-target-standalone': {
        readonly zh: "当前是独立构建，没有可安装的 profile 目录；一键安装暂不支持。";
        readonly en: "This is a standalone build — there is no profile directory to install into; one-click install is unavailable here.";
    };
    readonly 'sdk-install-no-target-no-profile': {
        readonly zh: "本次启动未关联 dsh profile（源码运行或 --config 启动），没有可安装的目录；请用 dsh --profile 启动后重试。";
        readonly en: "This launch has no dsh profile (source checkout or --config start), so there is no install directory; launch via dsh --profile and retry.";
    };
    readonly 'sdk-install-exit-hint': {
        readonly zh: "Esc 返回";
        readonly en: "Esc back";
    };
    readonly 'channel-picker-title': {
        readonly zh: "渠道档案";
        readonly en: "Channel profiles";
    };
    readonly 'channel-empty-hint': {
        readonly zh: "还没有渠道：从 settings.json 导入一个，或直接编辑 channels.json（路径见「查看映射」）。";
        readonly en: "No channels yet: import one from settings.json, or edit channels.json directly (the path is in the mapping view).";
    };
    readonly 'channel-row-summary': {
        readonly zh: "{{models}} 条精确映射 · {{tiers}} 条档位规则";
        readonly en: "{{models}} exact mappings · {{tiers}} tier rules";
    };
    readonly 'channel-action-import': {
        readonly zh: "＋ 从 settings.json 导入";
        readonly en: "＋ Import from settings.json";
    };
    readonly 'channel-action-view': {
        readonly zh: "≡ 查看映射";
        readonly en: "≡ View mappings";
    };
    readonly 'channel-picker-hint': {
        readonly zh: "↑↓ 移动 · Enter 切换/执行 · Esc 关闭";
        readonly en: "↑↓ move · Enter switch/run · Esc close";
    };
    readonly 'channel-already-active': {
        readonly zh: "已是当前渠道";
        readonly en: "Already the active channel";
    };
    readonly 'channel-switch-while-working': {
        readonly zh: "回合运行中，无法切换或改动渠道";
        readonly en: "Cannot switch or change channels while a turn is running";
    };
    readonly 'channel-switched': {
        readonly zh: "已切换到 {{name}}，模型显示已刷新";
        readonly en: "Switched to {{name}}; the model display refreshed";
    };
    readonly 'channel-import-done': {
        readonly zh: "已导入渠道 {{name}}（重复导入会刷新它）";
        readonly en: "Imported channel {{name}} (a re-import refreshes it)";
    };
    readonly 'channel-import-none': {
        readonly zh: "settings.json 里没有可导入的映射（ANTHROPIC_BASE_URL / ANTHROPIC_*_MODEL）";
        readonly en: "Nothing importable in settings.json (ANTHROPIC_BASE_URL / ANTHROPIC_*_MODEL)";
    };
    readonly 'channel-map-none': {
        readonly zh: "当前没有激活的渠道（/channel 里选一个）";
        readonly en: "No active channel (pick one in /channel)";
    };
    readonly 'channel-map-heading': {
        readonly zh: "当前渠道：{{name}}";
        readonly en: "Active channel: {{name}}";
    };
    readonly 'channel-map-models-heading': {
        readonly zh: "精确映射（models）";
        readonly en: "Exact mappings (models)";
    };
    readonly 'channel-map-models-none': {
        readonly zh: "精确映射（models）：无";
        readonly en: "Exact mappings (models): none";
    };
    readonly 'channel-map-tiers-heading': {
        readonly zh: "档位规则（tiers）";
        readonly en: "Tier rules (tiers)";
    };
    readonly 'channel-map-tiers-none': {
        readonly zh: "档位规则（tiers）：无";
        readonly en: "Tier rules (tiers): none";
    };
    readonly 'channel-map-row': {
        readonly zh: "{{from}} → {{to}}";
        readonly en: "{{from}} → {{to}}";
    };
    readonly 'channel-map-file-hint': {
        readonly zh: "编辑 ~/.dsh-tui/backends/claude/channels.json 可增删映射，改动会立即反映到模型显示。";
        readonly en: "Edit ~/.dsh-tui/backends/claude/channels.json to change mappings; the model display follows the changes right away.";
    };
    readonly 'channel-row-summary-conn': {
        readonly zh: "{{url}} · token {{token}} · 环境变量 {{env}} · 精确 {{models}} · 档位 {{tiers}}";
        readonly en: "{{url}} · token {{token}} · env {{env}} · exact {{models}} · tiers {{tiers}}";
    };
    readonly 'channel-row-no-url': {
        readonly zh: "未设 baseUrl";
        readonly en: "no baseUrl";
    };
    readonly 'channel-action-add': {
        readonly zh: "＊ 新增渠道（向导）";
        readonly en: "＊ Add a channel (wizard)";
    };
    readonly 'channel-action-manage': {
        readonly zh: "⚙ 管理渠道（编辑/删除）";
        readonly en: "⚙ Manage channels (edit/delete)";
    };
    readonly 'channel-switch-restart': {
        readonly zh: "已切换到 {{name}}：连接信息不同，正在以新会话重启……";
        readonly en: "Switched to {{name}}: the connection differs — restarting with a fresh session…";
    };
    readonly 'channel-switch-restart-unavailable': {
        readonly zh: "已切换到 {{name}}，新连接从下次会话起生效";
        readonly en: "Switched to {{name}}; the new connection applies from the next session";
    };
    readonly 'channel-wiz-active-channel': {
        readonly zh: "激活渠道";
        readonly en: "the active channel";
    };
    readonly 'channel-wiz-q-action': {
        readonly zh: "要做什么？";
        readonly en: "What would you like to do?";
    };
    readonly 'channel-wiz-opt-add': {
        readonly zh: "新增渠道";
        readonly en: "Add a channel";
    };
    readonly 'channel-wiz-opt-add-desc': {
        readonly zh: "名字 → baseUrl → token → 映射来源，向导一次配好";
        readonly en: "Name → baseUrl → token → mapping source, in one pass";
    };
    readonly 'channel-wiz-opt-manage': {
        readonly zh: "管理已有渠道";
        readonly en: "Manage an existing channel";
    };
    readonly 'channel-wiz-opt-manage-desc': {
        readonly zh: "编辑 baseUrl / token / 映射，或删除";
        readonly en: "Edit baseUrl / token / mappings, or delete";
    };
    readonly 'channel-wiz-cancelled': {
        readonly zh: "已取消（未写入任何内容）";
        readonly en: "Cancelled (nothing was written)";
    };
    readonly 'channel-wiz-q-name': {
        readonly zh: "渠道名字（id 由它派生）";
        readonly en: "Channel name (its id is derived from it)";
    };
    readonly 'channel-wiz-q-name-detail': {
        readonly zh: "例如 智谱、packycode；重复的名字会刷新同一条渠道";
        readonly en: "e.g. ZhiPu, packycode; the same name refreshes the same channel";
    };
    readonly 'channel-wiz-name-required': {
        readonly zh: "名字不能为空";
        readonly en: "The name cannot be empty";
    };
    readonly 'channel-wiz-q-clash': {
        readonly zh: "名字「{{name}}」会派生出与它相同的渠道 ID（{{id}}），继续将覆盖该渠道的连接与凭据。覆盖？";
        readonly en: "The name would derive the same channel id ({{id}}) as \"{{name}}\" — continuing replaces that channel's connection and stored token. Overwrite?";
    };
    readonly 'channel-wiz-opt-clash-overwrite': {
        readonly zh: "覆盖该渠道";
        readonly en: "Overwrite that channel";
    };
    readonly 'channel-wiz-opt-clash-overwrite-desc': {
        readonly zh: "旧渠道的 baseUrl/token/映射将被本次输入替换";
        readonly en: "Replaces the old channel's baseUrl/token/mappings with this input";
    };
    readonly 'channel-wiz-opt-clash-cancel': {
        readonly zh: "取消（不写入任何内容）";
        readonly en: "Cancel (nothing is written)";
    };
    readonly 'channel-wiz-opt-clash-cancel-desc': {
        readonly zh: "换一个名字重试即可避开冲突";
        readonly en: "Retry with a different name to avoid the clash";
    };
    readonly 'channel-wiz-q-baseurl': {
        readonly zh: "API base URL（留空跳过）";
        readonly en: "API base URL (leave blank to skip)";
    };
    readonly 'channel-wiz-q-baseurl-detail': {
        readonly zh: "渠道的中转端点，如 https://open.bigmodel.cn/api/anthropic；settings.json 当前值：{{current}}";
        readonly en: "The relay endpoint, e.g. https://open.bigmodel.cn/api/anthropic; settings.json currently says: {{current}}";
    };
    readonly 'channel-wiz-q-token': {
        readonly zh: "渠道 Token（留空跳过）";
        readonly en: "Channel token (leave blank to skip)";
    };
    readonly 'channel-wiz-q-token-detail': {
        readonly zh: "存入 ~/.dsh/.credentials.yaml（权限 0600），channels.json 只存引用，不存明文";
        readonly en: "Stored in ~/.dsh/.credentials.yaml (mode 0600); channels.json keeps only a reference, never the token itself";
    };
    readonly 'channel-wiz-q-tiers': {
        readonly zh: "模型映射来源？";
        readonly en: "Model mapping source?";
    };
    readonly 'channel-wiz-opt-tiers-absorb': {
        readonly zh: "从 settings.json 导入档位规则";
        readonly en: "Import the tier rules from settings.json";
    };
    readonly 'channel-wiz-opt-tiers-absorb-desc': {
        readonly zh: "导入 {{n}} 条 ANTHROPIC_*_MODEL 档位规则";
        readonly en: "Imports {{n}} ANTHROPIC_*_MODEL tier rules";
    };
    readonly 'channel-wiz-opt-tiers-skip': {
        readonly zh: "跳过（以后可再导入或手编 channels.json）";
        readonly en: "Skip (import later or hand-edit channels.json)";
    };
    readonly 'channel-wiz-opt-tiers-skip-desc': {
        readonly zh: "渠道先只有连接信息";
        readonly en: "The channel starts connection-only";
    };
    readonly 'channel-wiz-save-failed': {
        readonly zh: "写入失败（详情见调试日志）";
        readonly en: "The write failed (see the debug log)";
    };
    readonly 'channel-wiz-saved': {
        readonly zh: "已保存渠道 {{name}}";
        readonly en: "Saved channel {{name}}";
    };
    readonly 'channel-wiz-q-switch': {
        readonly zh: "立即切换到 {{name}}？";
        readonly en: "Switch to {{name}} now?";
    };
    readonly 'channel-wiz-opt-switch-yes': {
        readonly zh: "切换（连接不同会以新会话重启）";
        readonly en: "Switch (a different connection restarts with a fresh session)";
    };
    readonly 'channel-wiz-opt-switch-no': {
        readonly zh: "先不切（/channel 里随时可切）";
        readonly en: "Not now (switch any time in /channel)";
    };
    readonly 'channel-wiz-empty': {
        readonly zh: "还没有渠道可管理（先新增或导入）";
        readonly en: "No channels to manage yet (add or import one first)";
    };
    readonly 'channel-wiz-q-pick': {
        readonly zh: "管理哪条渠道？";
        readonly en: "Which channel?";
    };
    readonly 'channel-wiz-row-mapping-only': {
        readonly zh: "仅映射（未管理连接）";
        readonly en: "mapping-only (connection not managed)";
    };
    readonly 'channel-wiz-q-edit': {
        readonly zh: "编辑 {{name}} 的什么？";
        readonly en: "Edit what of {{name}}?";
    };
    readonly 'channel-wiz-opt-edit-baseurl': {
        readonly zh: "baseUrl";
        readonly en: "baseUrl";
    };
    readonly 'channel-wiz-opt-edit-token': {
        readonly zh: "token";
        readonly en: "token";
    };
    readonly 'channel-wiz-opt-edit-tiers': {
        readonly zh: "从 settings.json 刷新映射";
        readonly en: "Refresh mappings from settings.json";
    };
    readonly 'channel-wiz-opt-edit-tiers-desc': {
        readonly zh: "当前 {{n}} 条档位规则，将被 settings.json 的值替换";
        readonly en: "{{n}} tier rules now; replaced by settings.json's values";
    };
    readonly 'channel-wiz-opt-edit-delete': {
        readonly zh: "删除这条渠道";
        readonly en: "Delete this channel";
    };
    readonly 'channel-wiz-opt-edit-delete-desc': {
        readonly zh: "连同凭据库里的 token 一起删";
        readonly en: "Removes the stored token too";
    };
    readonly 'channel-wiz-opt-edit-done': {
        readonly zh: "完成（不改动）";
        readonly en: "Done (change nothing)";
    };
    readonly 'channel-wiz-token-present': {
        readonly zh: "已存 token（输入新值替换，- 清除）";
        readonly en: "token stored (type a new one to replace, - to clear)";
    };
    readonly 'channel-wiz-token-absent': {
        readonly zh: "未存 token（输入即保存）";
        readonly en: "no token stored (typing stores one)";
    };
    readonly 'channel-wiz-q-delete': {
        readonly zh: "删除 {{name}}？";
        readonly en: "Delete {{name}}?";
    };
    readonly 'channel-wiz-opt-delete-yes': {
        readonly zh: "删除";
        readonly en: "Delete";
    };
    readonly 'channel-wiz-opt-delete-no': {
        readonly zh: "取消";
        readonly en: "Cancel";
    };
    readonly 'channel-wiz-deleted': {
        readonly zh: "已删除渠道 {{name}}";
        readonly en: "Deleted channel {{name}}";
    };
    readonly 'channel-wiz-q-edit-value-hint': {
        readonly zh: "留空保持不变；输入 - 清除该值";
        readonly en: "Leave blank to keep; type - to clear";
    };
    readonly 'channel-wiz-summary-heading': {
        readonly zh: "即将保存渠道：{{name}}";
        readonly en: "About to save the channel: {{name}}";
    };
    readonly 'channel-wiz-summary-url-set': {
        readonly zh: "baseUrl：将设置";
        readonly en: "baseUrl: will be set";
    };
    readonly 'channel-wiz-summary-url-skip': {
        readonly zh: "baseUrl：不设置";
        readonly en: "baseUrl: not set";
    };
    readonly 'channel-wiz-summary-token-set': {
        readonly zh: "token：将写入凭据库（0600）";
        readonly en: "token: stored in the credential store (0600)";
    };
    readonly 'channel-wiz-summary-token-skip': {
        readonly zh: "token：不设置";
        readonly en: "token: not set";
    };
    readonly 'channel-wiz-summary-tiers': {
        readonly zh: "档位规则：导入 {{n}} 条";
        readonly en: "tier rules: {{n}} imported";
    };
    readonly 'channel-wiz-summary-tiers-none': {
        readonly zh: "档位规则：无";
        readonly en: "tier rules: none";
    };
    readonly 'channel-wiz-summary-store': {
        readonly zh: "channels.json 不保存 token 明文；新连接在下次启动会话时生效";
        readonly en: "channels.json never stores the token itself; the connection applies when the next session starts";
    };
    readonly 'launchpad-continue-none': {
        readonly zh: "没有可继续的会话，已打开历史会话列表";
        readonly en: "No session to continue — opened the session list";
    };
    readonly 'launchpad-continue-failed': {
        readonly zh: "继续上次会话失败，已打开历史会话列表";
        readonly en: "Could not resume the last session — opened the session list";
    };
    readonly 'launchpad-first-run': {
        readonly zh: "第一次用 dsh-TUI？花一分钟跑一遍引导，把 API Key、语言、主题、模型一次配好。";
        readonly en: "New to dsh-TUI? One minute of setup wires up your API key, language, theme and model.";
    };
    readonly 'onboarding-title': {
        readonly zh: "欢迎使用 dsh-TUI";
        readonly en: "Welcome to dsh-TUI";
    };
    readonly 'onboarding-step-progress': {
        readonly zh: "第 {{n}} / {{total}} 步";
        readonly en: "Step {{n}} of {{total}}";
    };
    readonly 'onboarding-step-apikey-title': {
        readonly zh: "API Key 与连通性";
        readonly en: "API key and connectivity";
    };
    readonly 'onboarding-step-apikey-desc': {
        readonly zh: "确认 DEEPSEEK_API_KEY 已就位，并真的连一次服务端。";
        readonly en: "Confirm DEEPSEEK_API_KEY is in place and actually reach the API.";
    };
    readonly 'onboarding-step-look-title': {
        readonly zh: "语言与主题";
        readonly en: "Language and theme";
    };
    readonly 'onboarding-step-look-desc': {
        readonly zh: "换成你顺眼的语言和配色；移动光标即可实时预览。";
        readonly en: "Pick the language and colors you like — moving the cursor previews them live.";
    };
    readonly 'onboarding-step-model-title': {
        readonly zh: "模型与工作区";
        readonly en: "Model and workspace";
    };
    readonly 'onboarding-step-model-desc': {
        readonly zh: "定下默认模型、推理强度，以及这次要在哪个目录里干活。";
        readonly en: "Choose the default model, reasoning effort, and the directory to work in.";
    };
    readonly 'onboarding-step-keys-title': {
        readonly zh: "快捷键与招式";
        readonly en: "Shortcuts and commands";
    };
    readonly 'onboarding-step-keys-desc': {
        readonly zh: "几个最省时间的键和最常用的命令，每一张都能直接点开试试。";
        readonly en: "The few keys and commands that save the most time — click any card to try it.";
    };
    readonly 'onboarding-key-checking': {
        readonly zh: "正在读取凭证…";
        readonly en: "Reading credentials…";
    };
    readonly 'onboarding-key-configured': {
        readonly zh: "已检测到 DEEPSEEK_API_KEY";
        readonly en: "DEEPSEEK_API_KEY detected";
    };
    readonly 'onboarding-key-source-env': {
        readonly zh: "来源：环境变量";
        readonly en: "Source: environment variable";
    };
    readonly 'onboarding-key-source-config': {
        readonly zh: "来源：配置文件";
        readonly en: "Source: config file";
    };
    readonly 'onboarding-key-source-unknown': {
        readonly zh: "来源：未知";
        readonly en: "Source: unknown";
    };
    readonly 'onboarding-key-missing': {
        readonly zh: "还没检测到 DEEPSEEK_API_KEY";
        readonly en: "No DEEPSEEK_API_KEY yet";
    };
    readonly 'onboarding-key-shape': {
        readonly zh: "形如 sk-…（只判断存在与否，永远不显示完整值）";
        readonly en: "Looks like sk-… (presence only — the value is never printed)";
    };
    readonly 'onboarding-key-howto-env': {
        readonly zh: "设置一个环境变量再重启：";
        readonly en: "Set an environment variable and restart:";
    };
    readonly 'onboarding-key-howto-config': {
        readonly zh: "或写进 dsh 的配置里：";
        readonly en: "Or put it in the dsh config:";
    };
    readonly 'onboarding-key-retry': {
        readonly zh: "重新检查";
        readonly en: "Check again";
    };
    readonly 'onboarding-conn-running': {
        readonly zh: "正在连接 DeepSeek…";
        readonly en: "Connecting to DeepSeek…";
    };
    readonly 'onboarding-conn-ok': {
        readonly zh: "连通正常";
        readonly en: "Connected";
    };
    readonly 'onboarding-conn-models': {
        readonly zh: "{{count}} 个可用模型";
        readonly en: "{{count}} models available";
    };
    readonly 'onboarding-conn-balance': {
        readonly zh: "余额 {{amount}}";
        readonly en: "Balance {{amount}}";
    };
    readonly 'onboarding-conn-balance-none': {
        readonly zh: "本次没有返回余额信息";
        readonly en: "No balance returned this time";
    };
    readonly 'onboarding-conn-fail-no-key': {
        readonly zh: "没有可用的凭证，连通性检查没法开始";
        readonly en: "No usable credential, so the check cannot start";
    };
    readonly 'onboarding-conn-fail-network': {
        readonly zh: "网络不通：检查代理、防火墙或离线环境";
        readonly en: "Network unreachable: check proxy, firewall or offline setup";
    };
    readonly 'onboarding-conn-fail-unauthorized': {
        readonly zh: "凭证被拒绝：检查 key 是否复制完整、是否已失效";
        readonly en: "Credential rejected: check the key is complete and still valid";
    };
    readonly 'onboarding-conn-fail-http': {
        readonly zh: "服务端返回 HTTP {{status}}：稍后重试";
        readonly en: "Server returned HTTP {{status}}: retry shortly";
    };
    readonly 'onboarding-conn-fail-invalid': {
        readonly zh: "返回内容无法解析：可能被代理或网关改写";
        readonly en: "Unparseable response: a proxy or gateway may be rewriting it";
    };
    readonly 'onboarding-conn-fail-unknown': {
        readonly zh: "连通性检查没通过";
        readonly en: "The connectivity check did not pass";
    };
    readonly 'onboarding-look-preview-note': {
        readonly zh: "移动光标即时预览；选中即保存";
        readonly en: "Moving the cursor previews live; picking saves it";
    };
    readonly 'onboarding-model-workspace': {
        readonly zh: "工作区";
        readonly en: "Workspace";
    };
    readonly 'onboarding-model-workspace-note': {
        readonly zh: "切换工作区会新建一个会话";
        readonly en: "Switching the workspace starts a new session";
    };
    readonly 'onboarding-model-loading': {
        readonly zh: "正在读取模型列表…";
        readonly en: "Loading the model list…";
    };
    readonly 'onboarding-model-empty': {
        readonly zh: "没有读到可用模型（可先跳过，用 /provider 配置）";
        readonly en: "No models available yet (skip, then configure with /provider)";
    };
    readonly 'onboarding-model-back': {
        readonly zh: "← 返回分组（Esc）";
        readonly en: "← Back to providers (Esc)";
    };
    readonly 'onboarding-model-switch-failed': {
        readonly zh: "模型「{{name}}」切换失败";
        readonly en: "Could not switch to model \"{{name}}\"";
    };
    readonly 'onboarding-model-switched': {
        readonly zh: "默认模型已切换为 {{name}}";
        readonly en: "Default model switched to {{name}}";
    };
    readonly 'onboarding-effort-switched': {
        readonly zh: "推理强度已设为 {{name}}";
        readonly en: "Reasoning effort set to {{name}}";
    };
    readonly 'onboarding-workspace-switched': {
        readonly zh: "工作区已切换：{{name}}";
        readonly en: "Workspace switched: {{name}}";
    };
    readonly 'onboarding-workspace-failed': {
        readonly zh: "工作区「{{name}}」切换失败";
        readonly en: "Could not switch to workspace \"{{name}}\"";
    };
    readonly 'onboarding-cards-title': {
        readonly zh: "先记这六张，够用很久";
        readonly en: "Six cards that cover most of it";
    };
    readonly 'onboarding-card-cmd-title': {
        readonly zh: "命令菜单";
        readonly en: "Command menu";
    };
    readonly 'onboarding-card-cmd-desc': {
        readonly zh: "输入 / 打开全部命令，Tab 补全";
        readonly en: "Type / for every command, Tab to complete";
    };
    readonly 'onboarding-card-help-title': {
        readonly zh: "帮助与快捷键";
        readonly en: "Help and shortcuts";
    };
    readonly 'onboarding-card-help-desc': {
        readonly zh: "一张表看懂全部键位";
        readonly en: "Every key in one table";
    };
    readonly 'onboarding-card-model-title': {
        readonly zh: "换模型";
        readonly en: "Switch model";
    };
    readonly 'onboarding-card-model-desc': {
        readonly zh: "列出全部 provider 与模型";
        readonly en: "List every provider and model";
    };
    readonly 'onboarding-card-sessions-title': {
        readonly zh: "会话与工作区";
        readonly en: "Sessions and workspaces";
    };
    readonly 'onboarding-card-sessions-desc': {
        readonly zh: "找回旧会话、换工作区、后台并行";
        readonly en: "Reopen old sessions, switch workspace, work in parallel";
    };
    readonly 'onboarding-card-rewind-title': {
        readonly zh: "回退一步";
        readonly en: "Rewind";
    };
    readonly 'onboarding-card-rewind-desc': {
        readonly zh: "退回到任意一条消息重来";
        readonly en: "Go back to any earlier message";
    };
    readonly 'onboarding-card-interrupt-title': {
        readonly zh: "打断与后台";
        readonly en: "Interrupt and background";
    };
    readonly 'onboarding-card-interrupt-desc': {
        readonly zh: "停下手上的活；或把它丢到后台继续跑";
        readonly en: "Stop the current turn, or push it to the background";
    };
    readonly 'onboarding-card-try': {
        readonly zh: "试一下";
        readonly en: "Try it";
    };
    readonly 'onboarding-card-tried': {
        readonly zh: "已经试过";
        readonly en: "Tried";
    };
    readonly 'onboarding-hint': {
        readonly zh: "**←/→** 换步骤 · **Enter** 执行这一步 / 下一步 · **Esc** 跳过引导";
        readonly en: "**←/→** step · **Enter** act on this step / go next · **Esc** skip the guide";
    };
    readonly 'onboarding-hint-last': {
        readonly zh: "**Enter** 完成 · **Esc** 跳过引导";
        readonly en: "**Enter** finish · **Esc** skip the guide";
    };
    readonly 'onboarding-skipped': {
        readonly zh: "已跳过首次引导，随时可用 /setup 重跑";
        readonly en: "Setup skipped — run /setup whenever you like";
    };
    readonly 'onboarding-finished': {
        readonly zh: "引导完成";
        readonly en: "Setup complete";
    };
    readonly 'onboarding-write-failed': {
        readonly zh: "这次引导没能记进 ~/.dsh-tui/onboarding.json，下次启动可能还会再问一次";
        readonly en: "Could not record the guide in ~/.dsh-tui/onboarding.json, so it may ask again next launch";
    };
    readonly 'cmd-desc-setup': {
        readonly zh: "重跑首次引导（API Key / 语言主题 / 模型工作区 / 快捷键）";
    };
    readonly 'capability-failed': Readonly<{
        zh: "{{name}} 失败 · {{err}}";
        en: "{{name}} failed · {{err}}";
    }>;
    readonly 'status-rate-limit-five-hour': Readonly<{
        zh: "5小时";
        en: "5h";
    }>;
    readonly 'status-rate-limit-seven-day': Readonly<{
        zh: "7天";
        en: "7d";
    }>;
    readonly 'doctor-unknown': Readonly<{
        zh: "未知";
        en: "unknown";
    }>;
    readonly 'effort-invalid': Readonly<{
        zh: "未知推理等级 {{id}}（当前模型可选：{{ids}}）";
        en: "Unknown reasoning effort {{id}} (this model offers: {{ids}})";
    }>;
    readonly 'tool-name-bash': Readonly<{
        zh: "Bash";
        en: "Bash";
    }>;
    readonly 'tool-name-edit': Readonly<{
        zh: "编辑";
        en: "Edit";
    }>;
    readonly 'rewind-first-message': Readonly<{
        zh: "不能回退到第一条消息之前";
        en: "Cannot rewind past the very first message";
    }>;
    readonly 'rename-failed': Readonly<{
        zh: "重命名失败 · {{err}}";
        en: "Rename failed · {{err}}";
    }>;
    readonly 'rename-usage': Readonly<{
        zh: "用法  /rename <新名称>";
        en: "Usage  /rename <new title>";
    }>;
};
export type I18nKey = keyof typeof dict;
export type I18nParams = Record<string, string | number>;
/** Emitted on every language switch so React screens can re-render. */
type Listener = () => void;
/** Subscribe to language switches (mirrors themePrefs subscription style). */
export declare function subscribeLang(listener: Listener): () => void;
/** The currently active language. */
export declare function getLang(): Lang;
/** Switch the active language and notify subscribers. */
export declare function setLang(lang: Lang): void;
/** Is a string a valid shipped language code? */
export declare function isLang(value: unknown): value is Lang;
/**
 * Translate a dictionary key into the active language, substituting
 * `{{name}}` placeholders with params. Missing keys render the key itself
 * so a typo is visible instead of silently blank.
 * @param key - Dictionary key (see dict).
 * @param params - Placeholder values.
 */
export declare function t(key: I18nKey, params?: I18nParams): string;
/**
 * Translate a runtime-computed key (e.g. `cmd-desc-${name}`), falling back
 * to the given text when the key is missing or has no entry in the active
 * language — unlike {@link t}, which renders the key itself. Used where the
 * fallback holds the authoritative text (command descriptions: the en copy
 * lives in `LOCAL_COMMANDS` / the DSH registry, the dict carries zh only).
 * @param key - Dictionary key, computed at runtime so it is not type-checked.
 * @param fallback - Text used when no translation exists.
 * @param params - Placeholder values substituted into whichever text wins.
 */
export declare function tOr(key: string, fallback: string, params?: I18nParams): string;
/** Read-only view of the dictionary for audits (scripts/verify-i18n.ts). */
export declare const i18nDict: Readonly<Record<string, {
    readonly zh?: I18nText;
    readonly en?: I18nText;
}>>;
/**
 * Parse a persisted `{ lang }` value; anything else yields undefined.
 * @param text - Raw file contents.
 */
export declare function parseLangPref(text: string): Lang | undefined;
/** The persisted `/lang` choice, or undefined when unset or invalid. */
export declare function readLangPref(dir?: string): Lang | undefined;
/** Persist the chosen language (best effort). */
export declare function writeLangPref(lang: Lang, dir?: string): boolean;
/**
 * Guess the user's language from the OS locale (`LC_ALL`, `LC_MESSAGES`,
 * `LANG`). Only consulted when nothing else (env var, cordis.yml `lang`,
 * persisted `/lang` choice) pinned a language. `zh*` maps to zh; every
 * other stated locale (en, but also fr/de/ja/…) maps to en — English is
 * the lingua-franca fallback for a locale we don't ship, and a German
 * user must not get a Chinese UI. The POSIX/C locale means "no locale
 * selected" and conventionally maps to English — importantly it is what
 * CI runners (LANG=C.UTF-8) report, so tests asserting English UI copy
 * stay deterministic. Only an ABSENT locale (typical on Windows, where
 * these POSIX vars don't exist and imply nothing about the user) keeps
 * the zh default.
 */
export declare function detectLocaleLang(): Lang;
/**
 * Resolve the startup language: `DSH_TUI_LANG` when it holds a valid value
 * (pinned at process start — the repro/verify scripts rely on this for
 * deterministic UI copy), else the persisted `/lang` choice, else the OS
 * locale guess, else `zh` (the original hard-coded language). The
 * cordis.yml `lang` precedence lives in plugin.apply.
 */
export declare function resolveStartupLang(): Lang;
export {};
//# sourceMappingURL=i18n.d.ts.map