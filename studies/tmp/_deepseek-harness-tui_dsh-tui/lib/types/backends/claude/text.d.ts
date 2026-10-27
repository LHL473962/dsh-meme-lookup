/**
 * The Claude backend's own copy (B-3): every string this backend puts on
 * screen, in the languages the TUI ships, keyed as the host dictionary
 * happened to key them so the move stayed reviewable.
 *
 * Why a backend carries its own text (D2): the host's dictionary
 * (`src/i18n.ts`) is not readable from a backend, and a plugin must not be
 * able to pass itself off as first-party copy. The shape and the two rules
 * (`{{name}}` placeholders, `count` plurals) are shared
 * (`src/backends/shared/localized-text.ts`), so the mechanism cannot drift.
 *
 * The language is read live from the host (`BackendHost.locale`), installed
 * by `detect()`/`open()` and by `openClaudeSession`: a `/lang` switch
 * applies to the next string, exactly as `t()` behaved. Before any of those
 * run there is no host to ask, and the fallback is `zh` — the same
 * last-resort default `src/i18n.ts` documents for its own resolution order.
 */
import type { BackendLocale } from '../../agent/backend.js';
import type { ElicitationText } from '../shared/elicitation.js';
import { type LocalizedText, type TextParams } from '../shared/localized-text.js';
/**
 * Every string of this backend. `zh` and `en` are both required
 * (`scripts/verify-i18n.ts` checks the same invariants the host dictionary
 * gets: language completeness, placeholder parity, single-brace typos, and
 * that no key here is dead).
 */
declare const texts: {
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
    readonly 'claude-permission-denied': {
        readonly zh: "{{tool}} 被权限规则拒绝";
        readonly en: "{{tool}} was denied by a permission rule";
    };
    readonly 'claude-permission-denied-reason': {
        readonly zh: "{{tool}} 被自动拒绝：{{reason}}";
        readonly en: "{{tool}} was denied automatically: {{reason}}";
    };
    readonly 'claude-denied-reason': {
        readonly zh: "拒绝原因：{{reason}}";
        readonly en: "Denied: {{reason}}";
    };
    readonly 'claude-question-unreadable': {
        readonly zh: "无法读取这次提问的内容，已拒绝";
        readonly en: "The question could not be read and was declined";
    };
    readonly 'claude-always-rules-session': {
        readonly zh: "允许，本次会话不再询问 {{rules}}";
        readonly en: "Yes, and don't ask again for {{rules}} this session";
    };
    readonly 'claude-always-rules-project': {
        readonly zh: "允许，本项目不再询问 {{rules}}";
        readonly en: "Yes, and don't ask again for {{rules}} in this project";
    };
    readonly 'claude-always-rules-user': {
        readonly zh: "允许，所有项目都不再询问 {{rules}}";
        readonly en: "Yes, and don't ask again for {{rules}} in any project";
    };
    readonly 'claude-always-accept-edits': {
        readonly zh: "允许，本次会话自动接受编辑";
        readonly en: "Yes, and auto-accept edits this session";
    };
    readonly 'claude-always-mode': {
        readonly zh: "允许，并切换到 {{mode}} 模式";
        readonly en: "Yes, and switch to {{mode}} mode";
    };
    readonly 'claude-always-directories': {
        readonly zh: "允许，并允许访问 {{dirs}}";
        readonly en: "Yes, and allow access to {{dirs}}";
    };
    readonly 'claude-plan-review-header': {
        readonly zh: "计划评审";
        readonly en: "Plan review";
    };
    readonly 'claude-plan-review-question': {
        readonly zh: "Claude 准备好了计划，要开始执行吗？";
        readonly en: "Claude has a plan. Ready to start?";
    };
    readonly 'claude-plan-accept-edits': {
        readonly zh: "批准，并自动接受编辑";
        readonly en: "Yes, and auto-accept edits";
    };
    readonly 'claude-plan-accept-edits-desc': {
        readonly zh: "退出计划模式，之后的文件编辑不再逐个询问";
        readonly en: "Leave plan mode; file edits no longer ask one by one";
    };
    readonly 'claude-plan-manual': {
        readonly zh: "批准，编辑仍逐个确认";
        readonly en: "Yes, and approve each edit";
    };
    readonly 'claude-plan-manual-desc': {
        readonly zh: "退出计划模式，回到默认权限模式";
        readonly en: "Leave plan mode for the default permission mode";
    };
    readonly 'claude-plan-keep': {
        readonly zh: "继续规划";
        readonly en: "No, keep planning";
    };
    readonly 'claude-plan-keep-desc': {
        readonly zh: "可在输入行写下要修改的地方";
        readonly en: "Type what to change on the input row";
    };
    readonly 'claude-plan-approved': {
        readonly zh: "计划已批准，开始执行";
        readonly en: "Plan approved; starting";
    };
    readonly 'claude-plan-kept': {
        readonly zh: "计划未批准，继续规划";
        readonly en: "Plan not approved; planning continues";
    };
    readonly 'claude-model-unknown': {
        readonly zh: "Claude 没有模型 {{model}}（/model 查看可用模型）";
        readonly en: "Claude has no model {{model}} (see /model)";
    };
    readonly 'claude-mode-default': {
        readonly zh: "默认";
        readonly en: "Default";
    };
    readonly 'claude-mode-acceptEdits': {
        readonly zh: "自动接受编辑";
        readonly en: "Accept edits";
    };
    readonly 'claude-mode-plan': {
        readonly zh: "计划模式";
        readonly en: "Plan mode";
    };
    readonly 'claude-mode-auto': {
        readonly zh: "自动审批";
        readonly en: "Auto";
    };
    readonly 'claude-mode-dontAsk': {
        readonly zh: "不询问";
        readonly en: "Don't ask";
    };
    readonly 'claude-mode-bypassPermissions': {
        readonly zh: "跳过权限";
        readonly en: "Bypass permissions";
    };
    readonly 'claude-mode-desc-default': {
        readonly zh: "默认：每个危险操作前都询问";
        readonly en: "Default: asks before every risky action";
    };
    readonly 'claude-mode-desc-acceptEdits': {
        readonly zh: "自动接受文件编辑，其他操作仍询问";
        readonly en: "Auto-accepts file edits, still asks for the rest";
    };
    readonly 'claude-mode-desc-plan': {
        readonly zh: "计划模式：只读，先出方案不动手";
        readonly en: "Plan mode: read-only, proposes before acting";
    };
    readonly 'claude-mode-desc-auto': {
        readonly zh: "自动审批：由模型分类器判定";
        readonly en: "Auto: a model classifier decides";
    };
    readonly 'claude-mode-desc-dontAsk': {
        readonly zh: "不询问：未预先批准的操作一律拒绝";
        readonly en: "Don't ask: anything not pre-approved is denied";
    };
    readonly 'claude-mode-desc-bypassPermissions': {
        readonly zh: "跳过全部权限检查（谨慎使用）";
        readonly en: "Skips every permission check (use with care)";
    };
    readonly 'claude-effort-low': {
        readonly zh: "低";
        readonly en: "Low";
    };
    readonly 'claude-effort-medium': {
        readonly zh: "中";
        readonly en: "Medium";
    };
    readonly 'claude-effort-high': {
        readonly zh: "高";
        readonly en: "High";
    };
    readonly 'claude-effort-xhigh': {
        readonly zh: "超高";
        readonly en: "Extra high";
    };
    readonly 'claude-effort-max': {
        readonly zh: "最高";
        readonly en: "Max";
    };
    readonly 'claude-auth-failed-login': {
        readonly zh: "Claude 凭证仍被拒绝：用 /login 重新登录，或设置 ANTHROPIC_API_KEY、在终端运行 claude login";
        readonly en: "Claude still refuses the credential: sign in again with /login, set ANTHROPIC_API_KEY, or run `claude login` in a terminal";
    };
    readonly 'claude-auth-reconnected': {
        readonly zh: "凭证已刷新并重新连接同一会话，请重发上一条消息";
        readonly en: "Credential renewed and the same session reconnected; send your last message again";
    };
    readonly 'claude-auth-refresh-failed': {
        readonly zh: "刷新 Claude 凭证失败{{detail}}（可用 /login 重新登录）";
        readonly en: "Renewing the Claude credential failed{{detail}} (sign in again with /login)";
    };
    readonly 'claude-channel-token-missing': {
        readonly zh: "渠道 {{name}}（{{host}}）指向自定义端点，但没有可用的 token，已拒绝启动，以免向中转端点发送不带凭据的请求。请在 /channel → 管理渠道 里补上 token，或换一个渠道后重试。";
        readonly en: "Channel {{name}} ({{host}}) points at a custom endpoint but has no usable token, so the session was not started (no unauthenticated requests to a relay). Add a token under /channel → Manage channels, or switch to another channel, then retry.";
    };
    readonly 'claude-channel-helper-conflict': {
        readonly zh: "settings.json 配置了 apiKeyHelper，与当前渠道冲突：它生成的 x-api-key 会随请求发到渠道端点。请从 settings.json 删掉 apiKeyHelper，或在 /channel 里停用该渠道后再启动。";
        readonly en: "settings.json sets apiKeyHelper, which conflicts with the active channel: the x-api-key it produces would be sent to the channel endpoint. Remove apiKeyHelper from settings.json, or deactivate the channel in /channel, then retry.";
    };
    readonly 'claude-auth-refresh-status': {
        readonly zh: " · HTTP {{status}}";
        readonly en: " · HTTP {{status}}";
    };
    readonly 'claude-auth-reconnect-failed': {
        readonly zh: "重新连接 Claude 会话失败；可用 /login 重新登录";
        readonly en: "Reconnecting the Claude session failed; sign in again with /login";
    };
    readonly 'claude-auth-reconnect-deferred': {
        readonly zh: "当前回合结束后再用新凭证重新连接";
        readonly en: "Reconnecting with the new credential once the current turn ends";
    };
    readonly 'claude-auth-reconnect-forced': {
        readonly zh: "等待当前回合结束超时，现在重新连接，正在运行的回合会被中断";
        readonly en: "The turn did not finish in time; reconnecting now, which interrupts the running turn";
    };
    readonly 'claude-auth-inputs-dropped': {
        readonly zh: "重新连接失败，{{n}} 条尚未开始的消息未能送达";
        readonly en: "Reconnecting failed; {{n}} message(s) that had not started were not delivered";
    };
    readonly 'claude-auth-route': {
        readonly zh: "未使用订阅登录：{{route}}";
        readonly en: "Subscription sign-in not used: {{route}}";
    };
    readonly 'claude-route-custom-endpoint': {
        readonly zh: "自定义端点 {{host}}（ANTHROPIC_BASE_URL）";
        readonly en: "custom endpoint {{host}} (ANTHROPIC_BASE_URL)";
    };
    readonly 'claude-route-custom-oauth': {
        readonly zh: "自定义 OAuth 部署";
        readonly en: "custom OAuth deployment";
    };
    readonly 'claude-route-unix-socket': {
        readonly zh: "Unix 套接字（ANTHROPIC_UNIX_SOCKET）";
        readonly en: "Unix socket (ANTHROPIC_UNIX_SOCKET)";
    };
    readonly 'claude-route-gateway': {
        readonly zh: "云网关";
        readonly en: "cloud gateway";
    };
    readonly 'claude-route-api-key-helper': {
        readonly zh: "设置中的 apiKeyHelper";
        readonly en: "apiKeyHelper in settings";
    };
    readonly 'claude-route-settings-unreadable': {
        readonly zh: "无法读取 Claude 设置，无法确认连接方式";
        readonly en: "Claude settings could not be read, so the connection route is unknown";
    };
    readonly 'claude-auth-source': {
        readonly zh: "凭证来源：{{source}}";
        readonly en: "Credential: {{source}}";
    };
    readonly 'claude-auth-missing-hint': {
        readonly zh: "未找到 Claude 凭证：用 /login 登录 anthropic，或设置 ANTHROPIC_API_KEY、在终端运行 claude login";
        readonly en: "No Claude credential found: sign in to anthropic with /login, set ANTHROPIC_API_KEY, or run `claude login` in a terminal";
    };
    readonly 'claude-auth-cli': {
        readonly zh: "CLI 报告 · apiKeySource：{{source}} · tokenSource：{{token}}";
        readonly en: "CLI reports · apiKeySource: {{source}} · tokenSource: {{token}}";
    };
    readonly 'claude-auth-source-dsh-auth': {
        readonly zh: "dsh-auth anthropic 登录";
        readonly en: "dsh-auth anthropic sign-in";
    };
    readonly 'claude-auth-source-dsh-auth-expires': {
        readonly zh: "dsh-auth anthropic 登录（令牌到期 {{time}}）";
        readonly en: "dsh-auth anthropic sign-in (token expires {{time}})";
    };
    readonly 'claude-auth-source-cloud': {
        readonly zh: "云厂商 {{provider}}（环境变量）";
        readonly en: "Cloud provider {{provider}} (environment)";
    };
    readonly 'claude-auth-source-claude-login': {
        readonly zh: "本机 claude login";
        readonly en: "Local `claude login`";
    };
    readonly 'claude-auth-account': {
        readonly zh: "账户：{{account}}";
        readonly en: "Account: {{account}}";
    };
    readonly 'claude-side-query-empty': {
        readonly zh: "会话还没有保存任何对话，暂无内容可问";
        readonly en: "The session has no saved conversation to ask about yet";
    };
    readonly 'claude-side-query-no-answer': {
        readonly zh: "没有得到回答";
        readonly en: "No answer was received";
    };
    readonly 'claude-process-exited': {
        readonly zh: "Claude 进程已退出：{{reason}}";
        readonly en: "The Claude process exited: {{reason}}";
    };
    readonly 'claude-process-ended': {
        readonly zh: "会话流已结束";
        readonly en: "the session stream ended";
    };
    readonly 'claude-cancel-forced': {
        readonly zh: "中断 30 秒未得到确认，已强制结束本回合";
        readonly en: "The interrupt was not confirmed within 30s; the turn was force-closed";
    };
    readonly 'claude-version-drift': {
        readonly zh: "Claude CLI {{version}} 未经本版 dsh-tui 验证（已验证：{{validated}}），继续运行";
        readonly en: "Claude CLI {{version}} is not validated with this dsh-tui (validated: {{validated}}); continuing";
    };
    readonly 'claude-sdk-drift': {
        readonly zh: "Claude Agent SDK {{version}} 与验证版本 {{validated}} 不一致，继续运行";
        readonly en: "Claude Agent SDK {{version}} differs from the validated {{validated}}; continuing";
    };
    readonly 'claude-sdk-missing': {
        readonly zh: "未安装 Claude Agent SDK：在 dsh-tui 安装目录运行 pnpm add @anthropic-ai/claude-agent-sdk@{{version}}";
        readonly en: "The Claude Agent SDK is not installed: run pnpm add @anthropic-ai/claude-agent-sdk@{{version}} in the dsh-tui install directory";
    };
    readonly 'claude-sdk-missing-found-cli': {
        readonly zh: "已发现本机 Claude Code {{version}}（{{path}}）";
        readonly en: "Found a local Claude Code {{version}} ({{path}})";
    };
    readonly 'claude-sdk-missing-found-cli-path': {
        readonly zh: "已发现本机 Claude Code：{{path}}";
        readonly en: "Found a local Claude Code: {{path}}";
    };
    readonly 'claude-resume-not-found': {
        readonly zh: "本机 Claude 会话库中没有会话 {{id}}";
        readonly en: "No Claude session {{id}} in the local session store";
    };
    readonly 'claude-rewind-files-unavailable': {
        readonly zh: "该会话没有可用的文件检查点";
        readonly en: "No file checkpoints are available for this session";
    };
    readonly 'claude-fork-empty': {
        readonly zh: "会话还没有保存任何消息，无可分叉的内容";
        readonly en: "Nothing to fork yet — the session has no saved messages";
    };
    readonly 'claude-task-unnamed': {
        readonly zh: "任务 {{id}}（标题未恢复）";
        readonly en: "Task {{id}} (subject not recovered)";
    };
    readonly 'claude-task-output-refused': {
        readonly zh: "不读取任务 {{id}} 的输出：路径不在 Claude 的目录内";
        readonly en: "Not reading the output of task {{id}}: the path is outside the Claude directories";
    };
    readonly 'claude-task-output-missing': {
        readonly zh: "任务 {{id}} 的输出文件还不存在";
        readonly en: "The output file of task {{id}} does not exist yet";
    };
    readonly 'claude-task-output-unknown': {
        readonly zh: "任务 {{id}} 没有报告输出文件";
        readonly en: "Task {{id}} reported no output file";
    };
    readonly 'claude-transcript-missing': {
        readonly zh: "找不到会话 {{id}} 的转录文件";
        readonly en: "The transcript file of session {{id}} was not found";
    };
    readonly 'claude-transcript-too-large': {
        readonly zh: "会话转录超过 {{mb}} MB，不读取";
        readonly en: "The session transcript is larger than {{mb}} MB; not reading it";
    };
    readonly 'claude-rewind-not-found': {
        readonly zh: "该消息不在会话已保存的对话链中";
        readonly en: "That message is not in the session's saved conversation";
    };
    readonly 'claude-images-too-many': {
        readonly zh: "一条消息最多附 {{n}} 张图片";
        readonly en: "A message carries at most {{n}} images";
    };
    readonly 'claude-images-too-large': {
        readonly zh: "这条消息的图片合计超过 {{mb}} MB";
        readonly en: "The images of this message exceed {{mb}} MB together";
    };
    readonly 'claude-image-too-large': {
        readonly zh: "图片 {{name}} 超过 {{mb}} MB";
        readonly en: "The image {{name}} exceeds {{mb}} MB";
    };
    readonly 'claude-image-type-refused': {
        readonly zh: "Claude 不接受图片 {{name}} 的格式（{{type}}）";
        readonly en: "Claude does not take the format of {{name}} ({{type}})";
    };
    readonly 'claude-image-unreadable': {
        readonly zh: "无法读取图片 {{name}}：{{err}}";
        readonly en: "The image {{name}} could not be read: {{err}}";
    };
    readonly 'claude-image-gone': {
        readonly zh: "暂存的图片已不在内存中，请重新粘贴";
        readonly en: "the staged image is no longer in memory; paste it again";
    };
    readonly 'claude-session-closed': {
        readonly zh: "Claude 会话已关闭";
        readonly en: "The Claude session is closed";
    };
    readonly 'claude-start-timeout': {
        readonly zh: "Claude CLI 未在时限内完成启动握手";
        readonly en: "The Claude CLI did not finish its start handshake in time";
    };
    readonly 'claude-start-mode-downgraded': {
        readonly zh: "设置中的权限模式 {{mode}} 需在 /permission 里显式选择，本会话先以 default 启动";
        readonly en: "The configured permission mode {{mode}} needs an explicit choice in /permission; this session starts in default";
    };
    readonly 'claude-start-mode-env': {
        readonly zh: "权限模式由 DSH_TUI_CLAUDE_PERMISSION_MODE 指定：{{mode}}";
        readonly en: "Permission mode set by DSH_TUI_CLAUDE_PERMISSION_MODE: {{mode}}";
    };
    readonly 'claude-start-mode-env-ignored': {
        readonly zh: "已忽略 DSH_TUI_CLAUDE_PERMISSION_MODE={{mode}}（只接受 default/acceptEdits/plan/dontAsk/bypassPermissions）";
        readonly en: "Ignored DSH_TUI_CLAUDE_PERMISSION_MODE={{mode}} (accepts default/acceptEdits/plan/dontAsk/bypassPermissions)";
    };
    readonly 'claude-start-mode-bypass-not-carried': {
        readonly zh: "上次的「跳过权限」不会带到新会话，本会话照常审批；可用 /permission 重新开启";
        readonly en: "Bypass permissions from the last session is not carried into a new one; approvals are on. Turn it back on with /permission";
    };
    readonly 'claude-input-refused': {
        readonly zh: "Claude 拒绝了这条输入";
        readonly en: "Claude refused this input";
    };
    readonly 'claude-assistant-error': {
        readonly zh: "Claude 错误：{{error}}";
        readonly en: "Claude error: {{error}}";
    };
    readonly 'claude-api-retry': {
        readonly zh: "API 重试 {{attempt}}/{{max}}{{detail}}…";
        readonly en: "API retry {{attempt}}/{{max}}{{detail}}…";
    };
    readonly 'claude-api-retry-status': {
        readonly zh: " · HTTP {{status}}";
        readonly en: " · HTTP {{status}}";
    };
    readonly 'claude-notification-turn': {
        readonly zh: "后台任务完成，模型继续处理";
        readonly en: "A background task finished; the model continues";
    };
    readonly 'claude-model-fallback': {
        readonly zh: "{{original}} 拒绝了这次请求{{category}}，已改用 {{model}} 重试（本会话之后都用它）";
        readonly en: "{{original}} declined this request{{category}}; retried on {{model}} (the session continues on it)";
    };
    readonly 'claude-model-fallback-local': {
        readonly zh: "一个子任务改由 {{model}} 回答（{{original}} 拒绝了它），会话模型不变";
        readonly en: "A side task was answered by {{model}} ({{original}} declined it); the session model is unchanged";
    };
    readonly 'claude-model-refused': {
        readonly zh: "{{model}} 拒绝了这次请求{{category}}，没有可用的回退模型";
        readonly en: "{{model}} declined this request{{category}} and no fallback model is available";
    };
    readonly 'claude-refusal-category-suffix': {
        readonly zh: "（类别：{{category}}）";
        readonly en: " (category: {{category}})";
    };
    readonly 'claude-rate-limit-warning': {
        readonly zh: "订阅用量接近{{window}}上限（{{percent}}%）{{resets}}";
        readonly en: "Approaching the {{window}} usage limit ({{percent}}%){{resets}}";
    };
    readonly 'claude-rate-limit-rejected': {
        readonly zh: "已达到{{window}}用量上限{{resets}}";
        readonly en: "The {{window}} usage limit is reached{{resets}}";
    };
    readonly 'claude-rate-limit-resets': {
        readonly zh: "，{{time}}重置";
        readonly en: " — resets {{time}}";
    };
    readonly 'claude-rate-limit-in': {
        readonly zh: "{{duration}}后";
        readonly en: "in {{duration}}";
    };
    readonly 'claude-auth-status-error': {
        readonly zh: "Claude 认证出错：{{error}}";
        readonly en: "Claude authentication error: {{error}}";
    };
    readonly 'claude-memory-recalled': {
        readonly zh: "已回忆 {{count}} 条记忆";
        readonly en: {
            readonly one: "Recalled {{count}} memory";
            readonly other: "Recalled {{count}} memories";
        };
    };
    readonly 'claude-memory-synthesized': {
        readonly zh: "已从记忆中归纳相关上下文";
        readonly en: "Recalled a summary of relevant memories";
    };
    readonly 'claude-activity-thinking': {
        readonly zh: "思考中";
        readonly en: "Thinking";
    };
    readonly 'claude-activity-waiting': {
        readonly zh: "等待确认";
        readonly en: "Waiting for approval";
    };
    readonly 'claude-activity-done': {
        readonly zh: "完成";
        readonly en: "Done";
    };
    readonly 'claude-activity-done-tools': {
        readonly zh: "完成 · {{count}} 个工具";
        readonly en: {
            readonly one: "Done · 1 tool";
            readonly other: "Done · {{count}} tools";
        };
    };
    readonly 'claude-refusal-header': {
        readonly zh: "模型拒绝";
        readonly en: "Model declined";
    };
    readonly 'claude-refusal-question': {
        readonly zh: "{{model}} 拒绝了这次请求，要换模型重试吗？";
        readonly en: "{{model}} declined this request. Retry on another model?";
    };
    readonly 'claude-refusal-this-model': {
        readonly zh: "当前模型";
        readonly en: "The current model";
    };
    readonly 'claude-refusal-retry': {
        readonly zh: "用 {{model}} 重试";
        readonly en: "Retry on {{model}}";
    };
    readonly 'claude-refusal-retry-desc': {
        readonly zh: "本次请求改由回退模型回答";
        readonly en: "The fallback model answers this request";
    };
    readonly 'claude-refusal-cancel': {
        readonly zh: "取消";
        readonly en: "Cancel";
    };
    readonly 'claude-refusal-cancel-desc': {
        readonly zh: "保留拒绝结果，结束本回合";
        readonly en: "Keep the refusal and end the turn";
    };
    readonly 'claude-refusal-category': {
        readonly zh: "拒绝类别：{{category}}";
        readonly en: "Refusal category: {{category}}";
    };
    readonly 'claude-doctor-cli': {
        readonly zh: "Claude CLI: {{path}}（{{source}}）· 版本 {{version}}";
        readonly en: "Claude CLI: {{path}} ({{source}}) · version {{version}}";
    };
    readonly 'claude-doctor-bundled': {
        readonly zh: "SDK 自带二进制";
        readonly en: "SDK bundled binary";
    };
    readonly 'claude-doctor-sdk': {
        readonly zh: "Claude Agent SDK {{version}}（已验证 {{validated}}）";
        readonly en: "Claude Agent SDK {{version}} (validated {{validated}})";
    };
    readonly 'claude-doctor-mode': {
        readonly zh: "起始权限模式: {{mode}}（来源 {{source}}）";
        readonly en: "Start permission mode: {{mode}} (from {{source}})";
    };
    readonly 'elicit-skip': {
        readonly zh: "跳过";
        readonly en: "Skip";
    };
    readonly 'elicit-skip-desc': {
        readonly zh: "这一项不填";
        readonly en: "Leave this field empty";
    };
    readonly 'elicit-optional': {
        readonly zh: "{{title}}（可选）";
        readonly en: "{{title}} (optional)";
    };
    readonly 'elicit-yes': {
        readonly zh: "是";
        readonly en: "Yes";
    };
    readonly 'elicit-no': {
        readonly zh: "否";
        readonly en: "No";
    };
    readonly 'elicit-send': {
        readonly zh: "发送";
        readonly en: "Send";
    };
    readonly 'elicit-send-desc': {
        readonly zh: "把这些回答交给 MCP 服务器";
        readonly en: "Give these answers to the MCP server";
    };
    readonly 'elicit-decline': {
        readonly zh: "拒绝";
        readonly en: "Decline";
    };
    readonly 'elicit-decline-desc': {
        readonly zh: "不提供，告诉服务器你拒绝了";
        readonly en: "Provide nothing; tell the server you declined";
    };
    readonly 'elicit-confirm': {
        readonly zh: "把回答发送给 MCP 服务器 {{server}}？";
        readonly en: "Send your answers to the MCP server {{server}}?";
    };
    readonly 'elicit-invalid': {
        readonly zh: "请重新填写：{{reason}}";
        readonly en: "Please answer again: {{reason}}";
    };
    readonly 'elicit-invalid-required': {
        readonly zh: "这一项必填";
        readonly en: "this field is required";
    };
    readonly 'elicit-invalid-choice': {
        readonly zh: "请选择一项";
        readonly en: "pick one of the options";
    };
    readonly 'elicit-invalid-number': {
        readonly zh: "需要一个数字";
        readonly en: "a number is expected";
    };
    readonly 'elicit-invalid-integer': {
        readonly zh: "需要一个整数";
        readonly en: "a whole number is expected";
    };
    readonly 'elicit-invalid-min': {
        readonly zh: "不能小于 {{min}}";
        readonly en: "must be at least {{min}}";
    };
    readonly 'elicit-invalid-max': {
        readonly zh: "不能大于 {{max}}";
        readonly en: "must be at most {{max}}";
    };
    readonly 'elicit-invalid-min-length': {
        readonly zh: "至少 {{n}} 个字符";
        readonly en: "at least {{n}} characters";
    };
    readonly 'elicit-invalid-max-length': {
        readonly zh: "至多 {{n}} 个字符";
        readonly en: "at most {{n}} characters";
    };
    readonly 'elicit-invalid-min-items': {
        readonly zh: "至少选 {{n}} 项";
        readonly en: "pick at least {{n}}";
    };
    readonly 'elicit-invalid-max-items': {
        readonly zh: "至多选 {{n}} 项";
        readonly en: "pick at most {{n}}";
    };
    readonly 'elicit-invalid-email': {
        readonly zh: "需要一个邮箱地址";
        readonly en: "an email address is expected";
    };
    readonly 'elicit-invalid-uri': {
        readonly zh: "需要一个完整的网址（URI）";
        readonly en: "a full URI is expected";
    };
    readonly 'elicit-invalid-date': {
        readonly zh: "需要日期（YYYY-MM-DD）";
        readonly en: "a date is expected (YYYY-MM-DD)";
    };
    readonly 'elicit-invalid-date-time': {
        readonly zh: "需要日期时间（ISO 8601）";
        readonly en: "a date and time is expected (ISO 8601)";
    };
    readonly 'elicit-invalid-pattern': {
        readonly zh: "格式不符合要求";
        readonly en: "the format does not match";
    };
    readonly 'elicit-invalid-json': {
        readonly zh: "需要 JSON 形式的值";
        readonly en: "a JSON value is expected";
    };
    readonly 'elicit-kind-number': {
        readonly zh: "数字";
        readonly en: "number";
    };
    readonly 'elicit-kind-integer': {
        readonly zh: "整数";
        readonly en: "whole number";
    };
    readonly 'elicit-hint-range': {
        readonly zh: "{{kind}}，{{min}}–{{max}}";
        readonly en: "{{kind}}, {{min}}–{{max}}";
    };
    readonly 'elicit-hint-min': {
        readonly zh: "{{kind}}，不小于 {{min}}";
        readonly en: "{{kind}}, at least {{min}}";
    };
    readonly 'elicit-hint-max': {
        readonly zh: "{{kind}}，不大于 {{max}}";
        readonly en: "{{kind}}, at most {{max}}";
    };
    readonly 'elicit-hint-json': {
        readonly zh: "以 JSON 形式输入";
        readonly en: "enter it as JSON";
    };
    readonly 'elicit-hint-format': {
        readonly zh: "格式：{{format}}";
        readonly en: "format: {{format}}";
    };
    readonly 'elicit-url-notice': {
        readonly zh: "MCP 服务器 {{server}} 请你在浏览器中打开：{{url}}";
        readonly en: "The MCP server {{server}} asks you to open: {{url}}";
    };
    readonly 'elicit-url-question': {
        readonly zh: "MCP 服务器 {{server}} 需要你在浏览器中完成一步";
        readonly en: "The MCP server {{server}} needs you to finish a step in the browser";
    };
    readonly 'elicit-url-detail': {
        readonly zh: "打开下面的链接完成后选「继续」；完成时服务器也可能自动关闭这个面板";
        readonly en: "Open the link below, then choose Continue; the server may also close this panel when it is done";
    };
    readonly 'elicit-url-accept': {
        readonly zh: "继续（已打开链接）";
        readonly en: "Continue (link opened)";
    };
    readonly 'elicit-url-accept-desc': {
        readonly zh: "告诉服务器你同意并已打开链接";
        readonly en: "Tell the server you agreed and opened the link";
    };
    readonly 'elicit-url-complete': {
        readonly zh: "MCP 服务器 {{server}} 确认已完成";
        readonly en: "The MCP server {{server}} confirmed it is done";
    };
    readonly 'elicit-url-missing': {
        readonly zh: "MCP 服务器 {{server}} 请求打开链接却没有给出网址，已拒绝";
        readonly en: "The MCP server {{server}} asked to open a link but gave none; declined";
    };
    readonly 'elicit-unsupported': {
        readonly zh: "MCP 服务器 {{server}} 的请求（{{mode}}）无法在此显示，已拒绝";
        readonly en: "The request of the MCP server {{server}} ({{mode}}) cannot be shown here; declined";
    };
    readonly 'channel-conn-settings-mismatch': {
        readonly zh: "settings.json 的 ANTHROPIC_BASE_URL 与当前渠道 {{name}} 不一致；本会话按渠道配置连接（settings.json 不改，直接运行 claude 时仍按它）";
        readonly en: "The ANTHROPIC_BASE_URL in settings.json differs from the active channel {{name}}; this session connects as the channel says (settings.json is left as is for running claude directly)";
    };
    readonly 'channel-conn-creds-superseded': {
        readonly zh: "本会话使用渠道凭据，settings.json 里的 {{keys}} 本次不生效（settings.json 不改，直接运行 claude 时仍会用到）";
        readonly en: "This session uses the channel credential; {{keys}} from settings.json do not apply (settings.json is left as is for running claude directly)";
    };
};
/** Read-only view of {@link texts} for audits (scripts/verify-i18n.ts and the
 *  backend's own gates), mirroring `i18nDict` on the host side. */
export declare const claudeTexts: Readonly<Record<string, {
    readonly zh: LocalizedText;
    readonly en: LocalizedText;
}>>;
/** A key of {@link texts}; a typo is a compile error. */
export type ClaudeTextKey = keyof typeof texts;
/** Values substituted into a string of {@link texts}. */
export type ClaudeTextParams = TextParams;
/** Install the language source (`BackendHost.locale`). Called on every
 *  `detect()`/`open()`/`openClaudeSession()`, so a session started after a
 *  `/lang` switch writes in the new language. */
export declare function installClaudeLocale(source: () => BackendLocale): void;
/** The language this backend is writing in right now. */
export declare function claudeLocale(): BackendLocale;
/**
 * The raw template of one key in the active language, without substitution:
 * the elicitation flow fills its own placeholders
 * (see {@link claudeElicitationText}). A key with no text in this language
 * renders as the key itself, so a typo is visible rather than blank.
 * `params.count` still picks the plural form: whoever passes it is the one
 * that knows the number (the elicitation callers pass none).
 */
export declare function claudeTemplate(key: ClaudeTextKey, params?: ClaudeTextParams): string;
/** One string of this backend in the active language. */
export declare function claudeText(key: ClaudeTextKey, params?: ClaudeTextParams): string;
/**
 * The elicitation copy of one flow, in the language showing when the flow
 * opens: the option labels of a flow are fixed then, because answers are
 * matched against the strings the panel showed (a language switch meanwhile
 * must not turn a valid answer into a mismatch).
 */
export declare function claudeElicitationText(): ElicitationText;
export {};
//# sourceMappingURL=text.d.ts.map