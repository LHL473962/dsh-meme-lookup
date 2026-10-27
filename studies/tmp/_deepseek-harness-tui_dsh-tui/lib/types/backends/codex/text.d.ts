/**
 * The Codex backend's own copy (B-5): every string this backend puts on
 * screen, in the languages the TUI ships, keyed as the host dictionary
 * happened to key them so the move stayed reviewable.
 *
 * Why a backend carries its own text (D2): the host's dictionary
 * (`src/i18n.ts`) is not readable from a backend, and a plugin must not be
 * able to pass itself off as first-party copy. The shape and the rule
 * (`{{name}}` placeholders) are shared
 * (`src/backends/shared/localized-text.ts`), so the mechanism cannot drift.
 * The shared type also allows the `one`/`other` plural pair; no codex string
 * uses it (counted: no `t()` call passes `count`), so this backend carries no
 * plural selectors, unlike claude.
 *
 * The language is read live from the host (`BackendHost.locale`), installed by
 * `detect()`/`open()`: a `/lang` switch applies to the next string, exactly
 * as `t()` behaved. Before either runs there is no host to ask, and the
 * fallback is `zh` — the same last-resort default `src/i18n.ts` documents for
 * its own resolution order.
 */
import type { BackendLocale } from '../../agent/backend.js';
import type { ElicitationText } from '../shared/elicitation.js';
import { type LocalizedText, type TextParams } from '../shared/localized-text.js';
/**
 * Every string of this backend. `zh` and `en` are both required
 * (`scripts/verify-i18n.ts` checks the same invariants the host dictionary
 * gets: language completeness, placeholder parity and single-brace typos).
 */
declare const texts: {
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
    readonly 'codex-approve-accept': {
        readonly zh: "是，执行";
        readonly en: "Yes, proceed";
    };
    readonly 'codex-approve-decline': {
        readonly zh: "否，跳过它继续";
        readonly en: "No, continue without running it";
    };
    readonly 'codex-approve-cancel': {
        readonly zh: "否，并告诉 Codex 怎么做";
        readonly en: "No, and tell Codex what to do differently";
    };
    readonly 'codex-approve-decline-files': {
        readonly zh: "否，不应用这些改动，继续";
        readonly en: "No, continue without these changes";
    };
    readonly 'codex-approve-grant-turn': {
        readonly zh: "是，本回合授予这些权限";
        readonly en: "Yes, grant these permissions for this turn";
    };
    readonly 'codex-approve-deny-permissions': {
        readonly zh: "否，不授予权限继续";
        readonly en: "No, continue without permissions";
    };
    readonly 'codex-approve-stdin-name': {
        readonly zh: "终端输入";
        readonly en: "Terminal input";
    };
    readonly 'codex-approve-stdin': {
        readonly zh: "向运行中的终端写入输入";
        readonly en: "writes input to a running terminal";
    };
    readonly 'codex-approve-network-context': {
        readonly zh: "访问网络主机 {{host}}（{{protocol}}）";
        readonly en: "network access to {{host}} ({{protocol}})";
    };
    readonly 'codex-approve-extra-permissions': {
        readonly zh: "额外权限：{{what}}";
        readonly en: "extra permissions: {{what}}";
    };
    readonly 'codex-approve-cwd': {
        readonly zh: "在 {{cwd}} 中运行";
        readonly en: "runs in {{cwd}}";
    };
    readonly 'codex-approve-prefix': {
        readonly zh: "是，以后以 `{{prefix}}` 开头的命令不再询问";
        readonly en: "Yes, and don't ask again for commands that start with `{{prefix}}`";
    };
    readonly 'codex-approve-session-command': {
        readonly zh: "是，本会话内此命令不再询问";
        readonly en: "Yes, and don't ask again for this command in this session";
    };
    readonly 'codex-approve-session-files': {
        readonly zh: "是，本会话内这些文件不再询问";
        readonly en: "Yes, and don't ask again for these files";
    };
    readonly 'codex-approve-session-permissions': {
        readonly zh: "是，本会话内都授予这些权限";
        readonly en: "Yes, grant these permissions for this session";
    };
    readonly 'codex-approve-network': {
        readonly zh: "是，以后允许访问 {{host}}";
        readonly en: "Yes, and allow {{host}} in the future";
    };
    readonly 'codex-permissions-name': {
        readonly zh: "额外权限";
        readonly en: "Extra permissions";
    };
    readonly 'codex-perm-network': {
        readonly zh: "联网";
        readonly en: "network";
    };
    readonly 'codex-perm-read': {
        readonly zh: "读取 {{paths}}";
        readonly en: "read {{paths}}";
    };
    readonly 'codex-perm-write': {
        readonly zh: "写入 {{paths}}";
        readonly en: "write {{paths}}";
    };
    readonly 'codex-declined': {
        readonly zh: "已拒绝";
        readonly en: "Declined";
    };
    readonly 'codex-interrupted': {
        readonly zh: "已中断";
        readonly en: "Interrupted";
    };
    readonly 'codex-tool-failed': {
        readonly zh: "执行失败";
        readonly en: "Failed";
    };
    readonly 'codex-tool-unfinished': {
        readonly zh: "回合结束时仍未完成";
        readonly en: "Unfinished when the turn ended";
    };
    readonly 'codex-turn-failed': {
        readonly zh: "回合失败";
        readonly en: "The turn failed";
    };
    readonly 'codex-turn-start-failed': {
        readonly zh: "Codex 没有接受这条消息：{{err}}";
        readonly en: "Codex did not take this message: {{err}}";
    };
    readonly 'codex-steer-fallback': {
        readonly zh: "当前回合无法插话，这条消息会在回合结束后发送";
        readonly en: "The running turn cannot take this message now; it will be sent when the turn ends";
    };
    readonly 'codex-cancel-forced': {
        readonly zh: "中断 15 秒未得到确认，已在本地结束本回合";
        readonly en: "The interrupt was not confirmed within 15s; the turn was closed here";
    };
    readonly 'codex-session-closed': {
        readonly zh: "Codex 会话已关闭";
        readonly en: "The Codex session is closed";
    };
    readonly 'codex-retrying': {
        readonly zh: "请求失败，Codex 正在重试：{{message}}";
        readonly en: "The request failed; Codex is retrying: {{message}}";
    };
    readonly 'codex-rerouted': {
        readonly zh: "模型已由 {{from}} 改为 {{to}}（{{reason}}）";
        readonly en: "The model was rerouted from {{from}} to {{to}} ({{reason}})";
    };
    readonly 'codex-system-error': {
        readonly zh: "Codex 报告该会话出现系统错误";
        readonly en: "Codex reported a system error on this thread";
    };
    readonly 'codex-review-start': {
        readonly zh: "开始代码审查：{{review}}";
        readonly en: "Code review started: {{review}}";
    };
    readonly 'codex-auto-review-started': {
        readonly zh: "自动审查中…";
        readonly en: "Auto-review in progress…";
    };
    readonly 'codex-auto-review-approved': {
        readonly zh: "自动审查：已批准";
        readonly en: "Auto-review: approved";
    };
    readonly 'codex-auto-review-denied': {
        readonly zh: "自动审查：已拒绝";
        readonly en: "Auto-review: denied";
    };
    readonly 'codex-auto-review-ended': {
        readonly zh: "自动审查已结束";
        readonly en: "Auto-review ended";
    };
    readonly 'codex-strict-review': {
        readonly zh: "本回合之后的命令需要先通过审查";
        readonly en: "Further commands in this turn need a review first";
    };
    readonly 'codex-hook-started': {
        readonly zh: "hook {{event}} 运行中…";
        readonly en: "Hook {{event}} running…";
    };
    readonly 'codex-hook-done': {
        readonly zh: "hook {{event}} 完成 {{duration}}";
        readonly en: "Hook {{event}} finished {{duration}}";
    };
    readonly 'codex-hook-failed': {
        readonly zh: "hook {{event}} 失败 {{duration}}";
        readonly en: "Hook {{event}} failed {{duration}}";
    };
    readonly 'codex-mcp-failed': {
        readonly zh: "MCP 服务器 {{name}} 启动失败：{{error}}";
        readonly en: "The MCP server {{name}} failed to start: {{error}}";
    };
    readonly 'codex-thread-closed': {
        readonly zh: "该会话已在别处关闭，仍可继续对话";
        readonly en: "This thread was closed elsewhere; you can keep talking";
    };
    readonly 'codex-thread-archived': {
        readonly zh: "该会话已在别处归档，仍可继续对话";
        readonly en: "This thread was archived elsewhere; you can keep talking";
    };
    readonly 'codex-thread-deleted': {
        readonly zh: "该会话已在别处删除";
        readonly en: "This thread was deleted elsewhere";
    };
    readonly 'codex-rate-limit-reached': {
        readonly zh: "已达到 Codex 用量上限（{{kind}}）";
        readonly en: "The Codex usage limit is reached ({{kind}})";
    };
    readonly 'codex-hint-unauthorized': {
        readonly zh: "Codex 凭据无效或已过期：在终端运行 codex login 重新登录";
        readonly en: "The Codex credential is invalid or expired: sign in again with `codex login` in a terminal";
    };
    readonly 'codex-hint-context': {
        readonly zh: "上下文已满：可以用 /compact 压缩后继续";
        readonly en: "The context is full: run /compact and continue";
    };
    readonly 'codex-hint-limit': {
        readonly zh: "已达到用量上限，稍后再试";
        readonly en: "A usage limit is reached; try again later";
    };
    readonly 'codex-hint-sandbox': {
        readonly zh: "沙箱出错：Linux 上请安装 bubblewrap（例如 apt install bubblewrap）";
        readonly en: "Sandbox error: on Linux install bubblewrap (e.g. apt install bubblewrap)";
    };
    readonly 'codex-connection-lost': {
        readonly zh: "Codex 进程退出，正在重连…";
        readonly en: "The Codex process exited; reconnecting…";
    };
    readonly 'codex-connection-failed': {
        readonly zh: "Codex 进程无法启动：{{err}}";
        readonly en: "The Codex process cannot start: {{err}}";
    };
    readonly 'codex-connection-dead': {
        readonly zh: "连接已断开且无法恢复，请重新打开会话";
        readonly en: "The connection is gone for good; please reopen the session";
    };
    readonly 'codex-reconnected': {
        readonly zh: "已重新连接 Codex";
        readonly en: "Reconnected to Codex";
    };
    readonly 'codex-not-installed': {
        readonly zh: "未找到 codex：npm i -g @openai/codex 或 brew install codex，或设置 CODEX_EXECUTABLE";
        readonly en: "codex was not found: npm i -g @openai/codex or brew install codex, or set CODEX_EXECUTABLE";
    };
    readonly 'codex-too-old': {
        readonly zh: "codex {{version}} 太旧（至少 {{min}}）：请升级";
        readonly en: "codex {{version}} is too old (needs {{min}}): please upgrade";
    };
    readonly 'codex-auth-missing-hint': {
        readonly zh: "未检测到 Codex 凭据：启动后用 /login 登录，或设置 OPENAI_API_KEY";
        readonly en: "No Codex credential found: sign in with /login after start, or set OPENAI_API_KEY";
    };
    readonly 'codex-start-failed': {
        readonly zh: "Codex app-server 启动失败：{{err}}";
        readonly en: "The Codex app-server failed to start: {{err}}";
    };
    readonly 'codex-open-failed': {
        readonly zh: "无法打开 Codex 会话：{{err}}";
        readonly en: "Could not open the Codex thread: {{err}}";
    };
    readonly 'codex-thread-busy': {
        readonly zh: "Codex 会话 {{id}} 正被另一个 Codex 进程使用，先关闭那边再打开";
        readonly en: "The Codex thread {{id}} is in use by another Codex process; close it there first";
    };
    readonly 'codex-resume-not-found': {
        readonly zh: "找不到 Codex 会话 {{id}}（{{err}}）";
        readonly en: "The Codex thread {{id}} was not found ({{err}})";
    };
    readonly 'codex-version-drift': {
        readonly zh: "codex {{version}} 未经本版 dsh-tui 验证（已验证：{{validated}}），继续运行";
        readonly en: "codex {{version}} is not validated with this dsh-tui (validated: {{validated}}); continuing";
    };
    readonly 'codex-doctor-cli': {
        readonly zh: "Codex CLI: {{path}}（{{source}}）· 版本 {{version}}";
        readonly en: "Codex CLI: {{path}} ({{source}}) · version {{version}}";
    };
    readonly 'codex-doctor-home': {
        readonly zh: "Codex 主目录: {{home}}";
        readonly en: "Codex home: {{home}}";
    };
    readonly 'codex-doctor-thread': {
        readonly zh: "Codex 会话: {{id}} · provider {{provider}} · 模型 {{model}}";
        readonly en: "Codex thread: {{id}} · provider {{provider}} · model {{model}}";
    };
    readonly 'codex-doctor-mode': {
        readonly zh: "权限模式: {{mode}}";
        readonly en: "Permission mode: {{mode}}";
    };
    readonly 'codex-doctor-bubblewrap': {
        readonly zh: "未找到 bubblewrap：Codex 改用自带沙箱；建议用系统包管理器安装 bubblewrap";
        readonly en: "bubblewrap was not found: Codex uses its bundled sandbox; installing bubblewrap from the system package manager is recommended";
    };
    readonly 'codex-mode-read-only': {
        readonly zh: "只读";
        readonly en: "Read Only";
    };
    readonly 'codex-mode-read-only-desc': {
        readonly zh: "只读取文件；命令和修改需审批";
        readonly en: "Read files; commands and changes require approval";
    };
    readonly 'codex-mode-auto': {
        readonly zh: "默认";
        readonly en: "Default";
    };
    readonly 'codex-mode-auto-desc': {
        readonly zh: "可修改工作区；工作区外和网络操作需审批";
        readonly en: "Edit the workspace; ask before outside-workspace or network access";
    };
    readonly 'codex-mode-full-access': {
        readonly zh: "完全访问";
        readonly en: "Full Access";
    };
    readonly 'codex-mode-full-access-desc': {
        readonly zh: "关闭沙箱和审批，仅通过显式选择进入";
        readonly en: "Disable sandbox and approvals; explicit selection only";
    };
    readonly 'codex-mode-plan': {
        readonly zh: "计划";
        readonly en: "Plan";
    };
    readonly 'codex-mode-plan-desc': {
        readonly zh: "先调研和规划，保留当前权限档";
        readonly en: "Research and plan, preserving the current permissions";
    };
    readonly 'codex-mode-invalid': {
        readonly zh: "未知 Codex 模式：{{mode}}";
        readonly en: "Unknown Codex mode: {{mode}}";
    };
    readonly 'codex-settings-deferred': {
        readonly zh: "当前 Codex 版本不支持即时改设置，选择将在下一回合生效";
        readonly en: "This Codex version cannot update idle settings; your choices apply on the next turn";
    };
    readonly 'codex-capability-unavailable': {
        readonly zh: "当前 Codex 版本不支持 {{feature}}，请升级";
        readonly en: "This Codex version does not support {{feature}}; please upgrade";
    };
    readonly 'codex-effort-none': {
        readonly zh: "无";
        readonly en: "None";
    };
    readonly 'codex-effort-minimal': {
        readonly zh: "极低";
        readonly en: "Minimal";
    };
    readonly 'codex-effort-low': {
        readonly zh: "低";
        readonly en: "Low";
    };
    readonly 'codex-effort-medium': {
        readonly zh: "中";
        readonly en: "Medium";
    };
    readonly 'codex-effort-high': {
        readonly zh: "高";
        readonly en: "High";
    };
    readonly 'codex-effort-xhigh': {
        readonly zh: "极高";
        readonly en: "Extra high";
    };
    readonly 'codex-effort-ultra': {
        readonly zh: "超高";
        readonly en: "Ultra";
    };
    readonly 'codex-command-idle': {
        readonly zh: "请先结束或中断当前回合";
        readonly en: "Finish or interrupt the current turn first";
    };
    readonly 'codex-command-review': {
        readonly zh: "审查未提交改动、分支、提交或自定义范围";
        readonly en: "Review working changes, a branch, a commit, or custom instructions";
    };
    readonly 'codex-command-diff': {
        readonly zh: "显示最近回合的文件差异";
        readonly en: "Show the latest turn's file diff";
    };
    readonly 'codex-command-plan': {
        readonly zh: "切换到 Plan 模式，可附带提示词";
        readonly en: "Enter Plan mode, optionally with a prompt";
    };
    readonly 'codex-command-usage': {
        readonly zh: "查看 Codex 额度和重置时间";
        readonly en: "Show Codex usage limits and reset times";
    };
    readonly 'codex-diff-empty': {
        readonly zh: "没有文件差异";
        readonly en: "No file differences";
    };
    readonly 'codex-usage-window': {
        readonly zh: "{{name}}：已用 {{used}}% · 重置 {{reset}}";
        readonly en: "{{name}}: {{used}}% used · resets {{reset}}";
    };
    readonly 'codex-usage-credits': {
        readonly zh: "额度余额 {{balance}} · 不限量：{{unlimited}}";
        readonly en: "Credits {{balance}} · unlimited: {{unlimited}}";
    };
    readonly 'codex-usage-unavailable': {
        readonly zh: "当前 provider 未提供额度信息";
        readonly en: "The current provider supplies no usage-limit information";
    };
    readonly 'codex-yes': {
        readonly zh: "是";
        readonly en: "yes";
    };
    readonly 'codex-no': {
        readonly zh: "否";
        readonly en: "no";
    };
    readonly 'codex-question-auto-answered': {
        readonly zh: "问卷等待超时，已按服务端设置选择默认答案";
        readonly en: "The question timed out; the server's default answer was selected";
    };
    readonly 'codex-plan-implement': {
        readonly zh: "要实施这个计划吗？";
        readonly en: "Implement this plan?";
    };
    readonly 'codex-plan-yes': {
        readonly zh: "是，实施这个计划";
        readonly en: "Yes, implement this plan";
    };
    readonly 'codex-plan-clear': {
        readonly zh: "是，清空上下文后实施";
        readonly en: "Yes, clear context and implement";
    };
    readonly 'codex-plan-stay': {
        readonly zh: "否，留在 Plan 模式";
        readonly en: "No, stay in Plan mode";
    };
    readonly 'codex-plan-action-failed': {
        readonly zh: "无法开始实施计划：{{error}}";
        readonly en: "Could not start implementing the plan: {{error}}";
    };
    readonly 'codex-bwrap-warning': {
        readonly zh: "未找到 bubblewrap，沙箱命令可能失败。请安装（如 apt install bubblewrap），或在 /permission 中明确选择完全访问";
        readonly en: "bubblewrap was not found; sandboxed commands may fail. Install it (e.g. apt install bubblewrap), or explicitly select Full Access in /permission";
    };
    readonly 'codex-model-waiting': {
        readonly zh: "等待模型响应…";
        readonly en: "Waiting for the model…";
    };
    readonly 'codex-model-stalled': {
        readonly zh: "模型长时间无响应，可按 Esc 中断";
        readonly en: "The model has not responded for a long time; press Esc to interrupt";
    };
    readonly 'codex-working-command': {
        readonly zh: "运行 {{command}}";
        readonly en: "Running {{command}}";
    };
    readonly 'codex-working-files': {
        readonly zh: "编辑 {{files}}";
        readonly en: "Editing {{files}}";
    };
    readonly 'codex-working-subagents': {
        readonly zh: "等待子代理";
        readonly en: "Waiting for subagents";
    };
    readonly 'codex-working-thinking': {
        readonly zh: "思考中…";
        readonly en: "Thinking…";
    };
    readonly 'codex-channel-url-required': {
        readonly zh: "渠道连接缺少 base URL，请用 /channel 配置";
        readonly en: "The channel connection has no base URL; configure it with /channel";
    };
    readonly 'codex-channel-token-missing': {
        readonly zh: "渠道 {{name}} 缺少可用令牌，请用 /channel 补充";
        readonly en: "Channel {{name}} has no usable token; add one with /channel";
    };
    readonly 'codex-channel-store-unavailable': {
        readonly zh: "宿主未提供渠道令牌库，无法保存令牌";
        readonly en: "The host did not provide a channel token store; the token cannot be saved";
    };
    readonly 'codex-channel-token-write-failed': {
        readonly zh: "渠道令牌保存失败，连接未更新";
        readonly en: "The channel token could not be saved; the connection was not updated";
    };
    readonly 'codex-auth-login-needed': {
        readonly zh: "Codex 需要凭据：用 /login 登录";
        readonly en: "Codex needs credentials: sign in with /login";
    };
    readonly 'codex-provider-env-key-missing': {
        readonly zh: "provider {{provider}} 缺 {{env}}：Codex 会拒绝每个回合；导出它或写进 ~/.dsh/.credentials.yaml";
        readonly en: "Provider {{provider}} is missing {{env}}: Codex rejects every turn. Export it or store it in ~/.dsh/.credentials.yaml";
    };
    readonly 'codex-auth-refresh-failed': {
        readonly zh: "ChatGPT 订阅令牌刷新失败，已停止注入；用 /login 重新登录，或使用自己的 Codex 登录";
        readonly en: "The ChatGPT subscription token refresh failed; injection stopped. Use /login again or your own Codex login";
    };
    readonly 'codex-auth-login-failed': {
        readonly zh: "Codex 登录未完成，已停止托管令牌注入；请用 /login 重试";
        readonly en: "Codex login did not complete; managed token injection stopped. Retry with /login";
    };
    readonly 'codex-auth-claims-missing': {
        readonly zh: "内置 OAuth 令牌缺少 ChatGPT 账户信息，未注入；请用 /login 重新登录";
        readonly en: "The built-in OAuth token has no ChatGPT account identity and was not injected; sign in again with /login";
    };
    readonly 'codex-auth-source-channel': {
        readonly zh: "凭据来源：渠道 {{name}}";
        readonly en: "Credential source: channel {{name}}";
    };
    readonly 'codex-auth-source-oauth': {
        readonly zh: "凭据来源：dsh-auth ChatGPT 订阅";
        readonly en: "Credential source: dsh-auth ChatGPT subscription";
    };
    readonly 'codex-auth-source-native': {
        readonly zh: "凭据来源：Codex 自己的登录";
        readonly en: "Credential source: Codex native login";
    };
    readonly 'codex-auth-source-api-key': {
        readonly zh: "凭据来源：API key";
        readonly en: "Credential source: API key";
    };
    readonly 'codex-auth-source-missing': {
        readonly zh: "凭据来源：未登录";
        readonly en: "Credential source: not signed in";
    };
    readonly 'codex-auth-source-unknown': {
        readonly zh: "凭据来源：由 Codex 配置管理（无法确定）";
        readonly en: "Credential source: managed by Codex configuration (unknown)";
    };
    readonly 'codex-auth-plan': {
        readonly zh: "订阅：{{plan}}";
        readonly en: "Subscription: {{plan}}";
    };
    readonly 'codex-auth-host': {
        readonly zh: "Provider 主机：{{host}}";
        readonly en: "Provider host: {{host}}";
    };
    readonly 'codex-auth-route-blocked': {
        readonly zh: "当前路由不接受内置订阅令牌；请使用自己的 Codex 登录或 /channel 渠道";
        readonly en: "This route does not accept built-in subscription tokens; use your own Codex login or /channel";
    };
    readonly 'codex-auth-channel-active': {
        readonly zh: "当前使用渠道凭据；请在 /channel 管理连接，不改动 OpenAI 登录";
        readonly en: "Channel credentials are active; manage the connection in /channel without changing OpenAI login";
    };
    readonly 'codex-auth-api-key-required': {
        readonly zh: "请输入非空 API key";
        readonly en: "Enter a non-empty API key";
    };
    readonly 'codex-login-choose': {
        readonly zh: "选择 Codex 登录方式";
        readonly en: "Choose a Codex sign-in method";
    };
    readonly 'codex-login-oauth': {
        readonly zh: "内置 ChatGPT OAuth";
        readonly en: "Built-in ChatGPT OAuth";
    };
    readonly 'codex-login-oauth-desc': {
        readonly zh: "复用 dsh-auth 登录，只向第一方路由提供内存令牌";
        readonly en: "Use dsh-auth; supply in-memory tokens only to first-party routes";
    };
    readonly 'codex-login-device': {
        readonly zh: "Codex 设备码登录";
        readonly en: "Codex device-code login";
    };
    readonly 'codex-login-device-desc': {
        readonly zh: "在浏览器输入设备码，凭据由 Codex 保存";
        readonly en: "Enter a device code in a browser; Codex stores the credential";
    };
    readonly 'codex-login-api-key': {
        readonly zh: "API key";
        readonly en: "API key";
    };
    readonly 'codex-login-api-key-prompt': {
        readonly zh: "输入 OpenAI API key";
        readonly en: "Enter an OpenAI API key";
    };
    readonly 'codex-login-api-key-storage': {
        readonly zh: "此方式会把 API key 写入用户的 Codex 凭据存储";
        readonly en: "This method writes the API key into your Codex credential store";
    };
    readonly 'codex-login-device-code': {
        readonly zh: "在验证页面输入设备码：{{code}}";
        readonly en: "Enter this device code on the verification page: {{code}}";
    };
    readonly 'codex-login-device-wait': {
        readonly zh: "等待浏览器授权完成；可取消此次登录";
        readonly en: "Waiting for browser authorization; you can cancel this login";
    };
    readonly 'codex-login-cancel': {
        readonly zh: "取消此次登录";
        readonly en: "Cancel this login";
    };
    readonly 'codex-login-success': {
        readonly zh: "Codex 登录已完成";
        readonly en: "Codex sign-in completed";
    };
    readonly 'codex-goal-usage-limited': {
        readonly zh: "Codex 用量额度已达到上限";
        readonly en: "The Codex usage limit was reached";
    };
    readonly 'codex-goal-budget-limited': {
        readonly zh: "目标的 token 预算已用尽";
        readonly en: "The goal token budget was exhausted";
    };
    readonly 'codex-goal-blocked': {
        readonly zh: "Codex 目标暂时受阻";
        readonly en: "The Codex goal is blocked";
    };
    readonly 'codex-tasks-unsupported': {
        readonly zh: "此 Codex 不支持后台终端监控，任务能力已关闭";
        readonly en: "This Codex does not support background terminal monitoring; task controls are unavailable";
    };
    readonly 'codex-terminal-ended': {
        readonly zh: "终端已不在运行列表中；退出状态不可用";
        readonly en: "The terminal is no longer running; exit status is unavailable";
    };
    readonly 'codex-terminal-stopped': {
        readonly zh: "后台终端已停止";
        readonly en: "The background terminal was stopped";
    };
    readonly 'codex-terminal-no-output': {
        readonly zh: "此后台终端暂没有可读取的输出";
        readonly en: "No readable output is available for this background terminal";
    };
    readonly 'codex-side-open-failed': {
        readonly zh: "无法创建临时旁问会话";
        readonly en: "Could not create the ephemeral side-question thread";
    };
    readonly 'codex-images-too-many': {
        readonly zh: "Codex 一条消息最多接受 {{n}} 张图片";
        readonly en: "Codex accepts at most {{n}} images per message";
    };
    readonly 'codex-image-type-refused': {
        readonly zh: "图片 {{name}} 的格式 {{type}} 不受 Codex 支持";
        readonly en: "Image {{name}} uses {{type}}, which Codex does not accept";
    };
    readonly 'codex-image-unreadable': {
        readonly zh: "无法读取图片 {{name}}";
        readonly en: "Image {{name}} could not be read";
    };
    readonly 'codex-image-too-large': {
        readonly zh: "图片 {{name}} 超过 Codex 的 {{mb}} MiB 限制";
        readonly en: "Image {{name}} exceeds the Codex {{mb}} MiB limit";
    };
    readonly 'codex-images-too-large': {
        readonly zh: "本条消息的图片总大小超过 {{mb}} MiB";
        readonly en: "The message images exceed {{mb}} MiB in total";
    };
    readonly 'codex-image-dimensions-refused': {
        readonly zh: "图片 {{name}} 超过 {{px}} 像素限制，请缩小后重试";
        readonly en: "Image {{name}} exceeds the {{px}} pixel limit; resize it and retry";
    };
    readonly 'codex-history-fetch-failed': {
        readonly zh: "Codex 更早历史连续读取失败，暂时停止预取；可重新打开会话后重试";
        readonly en: "Earlier Codex history could not be read after three attempts; reopen the session to retry";
    };
    readonly 'codex-preview-image': {
        readonly zh: "[图片]";
        readonly en: "[Image]";
    };
    readonly 'codex-archive-busy': {
        readonly zh: "该 Codex 会话由活动中的内部任务使用，暂时无法归档";
        readonly en: "This Codex thread is owned by an active internal worker and cannot be archived yet";
    };
    readonly 'codex-orphan-request': {
        readonly zh: "无法确定 Codex 子代理请求所属会话，已取消该请求";
        readonly en: "Could not find the session owning a Codex subagent request; the request was cancelled";
    };
    readonly 'codex-channel-url-invalid': {
        readonly zh: "渠道 URL 只接受 HTTPS（HTTP 仅限 localhost/127.0.0.1），不能含账号密码、查询串、片段或疑似密钥路径";
        readonly en: "A channel URL must use HTTPS (HTTP only on localhost/127.0.0.1), without userinfo, query, fragment, or key-like path segments";
    };
    readonly 'codex-channel-id-invalid': {
        readonly zh: "渠道 ID 只能含字母、数字、下划线和连字符";
        readonly en: "A channel ID may only contain letters, digits, underscores and hyphens";
    };
    readonly 'codex-channel-wire-api-invalid': {
        readonly zh: "Codex 渠道仅支持 Responses API";
        readonly en: "Codex channels only support the Responses API";
    };
    readonly 'codex-channel-env-invalid': {
        readonly zh: "渠道 env 只能存非凭据变量；令牌请填入令牌输入框";
        readonly en: "Channel env may only hold non-credential variables; use the token input for credentials";
    };
    readonly 'codex-anchor-missing': {
        readonly zh: "找不到这条消息的原生回合，无法 fork 或回退";
        readonly en: "The native turn for this message is unavailable; it cannot be forked or rewound";
    };
    readonly 'codex-rewind-files-unsupported': {
        readonly zh: "Codex 仅支持对话回退，不恢复工作区文件";
        readonly en: "Codex supports conversation rewind only; workspace files are not restored";
    };
    readonly 'codex-rewind-upgrade': {
        readonly zh: "此处回退需要 Codex app-server {{min}} 或更新版本；请升级并重启 Codex 服务，或先加载更早消息后重试";
        readonly en: "Rewinding here requires Codex app-server {{min}} or newer; upgrade and restart the Codex server, or load earlier messages and retry";
    };
    readonly 'codex-goals-unsupported': {
        readonly zh: "此 Codex 不支持目标管理，目标能力已关闭";
        readonly en: "This Codex does not support goal management; goal controls are unavailable";
    };
    readonly 'codex-subagent-unavailable': {
        readonly zh: "无法读取此 Codex 子代理的历史";
        readonly en: "This Codex subagent history is unavailable";
    };
    readonly 'codex-reconnect-incomplete': {
        readonly zh: "Codex 恢复缺口超过读取预算或游标失效，请重新打开会话";
        readonly en: "Codex recovery exceeded its history budget or could not reach a known turn; reopen the session";
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
};
/** Read-only view of {@link texts} for audits (`scripts/verify-i18n.ts` and the
 *  backend's own gates), mirroring `i18nDict` on the host side. */
export declare const codexTexts: Readonly<Record<string, {
    readonly zh: LocalizedText;
    readonly en: LocalizedText;
}>>;
/** A key of {@link texts}; a typo is a compile error. */
export type CodexTextKey = keyof typeof texts;
/** Values substituted into a string of {@link texts}. */
export type CodexTextParams = TextParams;
/** Install the language source (`BackendHost.locale`). Called on every
 *  `detect()`/`open()`, so a session started after a `/lang` switch writes in
 *  the new language. */
export declare function installCodexLocale(source: () => BackendLocale): void;
/** The language this backend is writing in right now. */
export declare function codexLocale(): BackendLocale;
/** The raw template of one key in the active language, without substitution:
 *  the elicitation flow fills its own placeholders (see
 *  {@link codexElicitationText}). */
export declare function codexTemplate(key: CodexTextKey): string;
/**
 * The elicitation copy of one flow, in the language showing when the flow
 * opens: the option labels of a flow are fixed then, because answers are
 * matched against the strings the panel showed (a language switch meanwhile
 * must not turn a valid answer into a mismatch).
 */
export declare function codexElicitationText(): ElicitationText;
/** One string of this backend in the active language. */
export declare function codexText(key: CodexTextKey, params?: CodexTextParams): string;
export {};
//# sourceMappingURL=text.d.ts.map