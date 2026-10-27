import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, } from "react";
import { MarkdownText } from "@deepseek-ai/dsh-client-ui-primitives";
import { ReMeClient } from "../reme/client.js";
import { parseMarkdownFrontmatter } from "./frontmatter.js";
export const statusEn = {
    nav: "ReMe Status",
    title: "ReMe Status",
    description: "Monitor memory capture, consolidation, service health, and your ReMe workspace.",
    workspace: "Your memory workspace",
    overview: "Overview",
    autoMemory: "Auto Memory",
    autoDream: "Memory Consolidation",
    components: "Components",
    journal: "Journal",
    knowledge: "Personal Knowledge Base",
    website: "ReMe website",
    openReMe: "Open ReMe",
    runDream: "Consolidate Memory Now",
    runningDream: "Consolidating…",
    loading: "Loading ReMe status…",
    unavailable: "ReMe status is unavailable.",
    connected: "Connected",
    disconnected: "Unavailable",
    healthy: "Healthy",
    unhealthy: "Needs attention",
    enabled: "Enabled",
    disabled: "Disabled",
    running: "Running",
    idle: "Idle",
    stopping: "Stopping",
    version: "Version",
    endpoint: "Service URL",
    lastRefresh: "Last refreshed",
    serviceHealth: "Service health",
    processMemory: "Process memory",
    componentMemory: "Component memory",
    activeSessions: "Active sessions",
    queuedTurns: "Queued turns",
    runningTasks: "Running tasks",
    queuedTasks: "Queued tasks",
    everyTurns: "Submission interval",
    turnsUnit: "completed turns",
    turnUnit: "completed turn",
    recentTasks: "Recent submissions",
    capturePipeline: "Capture pipeline",
    conversationTurns: "Conversation turns",
    submissionQueue: "Submission queue",
    longTermMemory: "Long-term memory",
    pipelineReady: "Ready for completed conversations",
    activity: "Activity",
    noTasks: "No automatic-memory submissions in this process yet.",
    taskQueued: "Queued",
    taskRunning: "Running",
    taskCompleted: "Completed",
    taskFailed: "Failed",
    taskCancelled: "Cancelled",
    messages: "messages",
    turns: "turns",
    lastError: "Latest error",
    schedule: "Schedule",
    consolidationFlow: "Consolidation flow",
    journalSource: "Journal entries",
    organizeKnowledge: "Organize and connect",
    knowledgeOutput: "Personal knowledge base",
    nextConsolidation: "Next consolidation",
    timezone: "Timezone",
    nextRun: "Next run",
    lastRun: "Last run",
    never: "Not run in this process",
    noSchedule: "No run scheduled",
    dreamCompleted: "Memory consolidation completed.",
    dreamFailed: "Memory consolidation failed",
    componentDetails: "Component health and resource usage",
    healthyComponents: "healthy components",
    infrastructure: "Memory infrastructure",
    noInstances: "No configured instance",
    started: "Started",
    notStarted: "Not started",
    instance: "Instance",
    fileGraph: "File graph",
    fileStore: "File store",
    keywordIndex: "Keyword index",
    embeddingStore: "Embedding store",
    modelName: "Model",
    dimensions: "Dimensions",
    cacheSize: "Cache entries",
    nodes: "Nodes",
    edges: "Edges",
    virtualNodes: "Virtual nodes",
    pendingNodes: "Pending nodes",
    chunks: "Chunks",
    embeddedChunks: "Embedded chunks",
    documents: "Documents",
    vocabulary: "Vocabulary",
    memoryUsage: "Memory",
    serverConfig: "Server configuration (redacted)",
    fileListLoading: "Loading files…",
    fileListEmpty: "No files yet.",
    fileListLimited: "Showing the newest 5,000 files.",
    fileCount: "files",
    fileUnit: "file",
    searchFiles: "Search files…",
    noSearchResults: "No matching files.",
    documentMetadata: "Document metadata",
    documentContent: "Document content",
    selectFile: "Select a file to preview its contents.",
    fileLoadFailed: "Could not load this file.",
    copyCode: "Copy",
    copiedCode: "Copied",
    footnotes: "Footnotes",
    journalDescription: "Daily notes captured from conversations and sources.",
    knowledgeDescription: "Consolidated knowledge organized for long-term recall.",
};
export const statusZh = {
    nav: "ReMe 状态",
    title: "ReMe 状态",
    description: "查看记忆写入、知识整理、服务健康和 ReMe 工作区。",
    workspace: "你的记忆工作区",
    overview: "总览",
    autoMemory: "自动记忆",
    autoDream: "记忆整理",
    components: "组件",
    journal: "日记",
    knowledge: "个人知识库",
    website: "ReMe 官网",
    openReMe: "打开 ReMe",
    runDream: "立即整理",
    runningDream: "正在整理…",
    loading: "正在加载 ReMe 状态…",
    unavailable: "ReMe 状态不可用。",
    connected: "已连接",
    disconnected: "连接失败",
    healthy: "健康",
    unhealthy: "需要处理",
    enabled: "已启用",
    disabled: "未启用",
    running: "运行中",
    idle: "空闲",
    stopping: "正在停止",
    version: "版本",
    endpoint: "服务地址",
    lastRefresh: "最近刷新",
    serviceHealth: "服务健康",
    processMemory: "进程内存",
    componentMemory: "组件内存",
    activeSessions: "活跃会话",
    queuedTurns: "待处理回合",
    runningTasks: "运行中任务",
    queuedTasks: "排队任务",
    everyTurns: "提交间隔",
    turnsUnit: "个完成回合",
    turnUnit: "个完成回合",
    recentTasks: "最近提交",
    capturePipeline: "记忆写入流程",
    conversationTurns: "对话回合",
    submissionQueue: "提交队列",
    longTermMemory: "长期记忆",
    pipelineReady: "等待已完成的对话",
    activity: "运行记录",
    noTasks: "本次 DSH 运行期间还没有自动记忆提交。",
    taskQueued: "排队中",
    taskRunning: "运行中",
    taskCompleted: "已完成",
    taskFailed: "失败",
    taskCancelled: "已取消",
    messages: "条消息",
    turns: "个回合",
    lastError: "最近错误",
    schedule: "执行计划",
    consolidationFlow: "记忆整理流程",
    journalSource: "日记记录",
    organizeKnowledge: "整理与关联",
    knowledgeOutput: "个人知识库",
    nextConsolidation: "下次整理",
    timezone: "时区",
    nextRun: "下次执行",
    lastRun: "最近执行",
    never: "本次运行期间尚未执行",
    noSchedule: "当前没有执行计划",
    dreamCompleted: "记忆整理已完成。",
    dreamFailed: "记忆整理失败",
    componentDetails: "组件健康与资源占用",
    healthyComponents: "个健康组件",
    infrastructure: "记忆基础设施",
    noInstances: "未配置实例",
    started: "已启动",
    notStarted: "未启动",
    instance: "实例",
    fileGraph: "文件图谱",
    fileStore: "文件存储",
    keywordIndex: "关键词索引",
    embeddingStore: "向量存储",
    modelName: "模型",
    dimensions: "向量维度",
    cacheSize: "缓存条目",
    nodes: "节点",
    edges: "边",
    virtualNodes: "虚拟节点",
    pendingNodes: "待处理节点",
    chunks: "内容块",
    embeddedChunks: "已生成向量",
    documents: "文档",
    vocabulary: "词汇量",
    memoryUsage: "内存占用",
    serverConfig: "服务端配置（已脱敏）",
    fileListLoading: "正在加载文件…",
    fileListEmpty: "还没有文件。",
    fileListLimited: "当前显示最近的 5,000 个文件。",
    fileCount: "个文件",
    fileUnit: "个文件",
    searchFiles: "搜索文件…",
    noSearchResults: "没有匹配的文件。",
    documentMetadata: "文档元数据",
    documentContent: "文档内容",
    selectFile: "选择一个文件查看内容。",
    fileLoadFailed: "无法读取这个文件。",
    copyCode: "复制",
    copiedCode: "已复制",
    footnotes: "脚注",
    journalDescription: "从对话和其他来源自动沉淀的每日记录。",
    knowledgeDescription: "经过整理、适合长期检索和持续积累的个人知识。",
};
/** Render the independent ReMe monitoring and workspace page. */
export function ReMeStatusPage({ scope, rpc, t, }) {
    const snapshot = useSyncExternalStore((listener) => scope.subscribe(listener), () => scope.getSnapshot());
    const settings = snapshot.value;
    const [tab, setTab] = useState("overview");
    const [data, setData] = useState({ loading: true, error: "" });
    const [runningDream, setRunningDream] = useState(false);
    const refresh = useCallback(async (runtimeOnly = false) => {
        if (settings === undefined)
            return;
        const controller = new AbortController();
        if (!runtimeOnly)
            setData((current) => ({ ...current, loading: true, error: "" }));
        try {
            const runtimePromise = loadRuntime(rpc, controller.signal);
            if (runtimeOnly) {
                const runtime = await runtimePromise;
                setData((current) => ({ ...current, runtime }));
                return;
            }
            const client = diagnosticClient(settings);
            const [health, status, config, runtime] = await Promise.all([
                client.healthCheck({ signal: controller.signal }),
                client.status({ signal: controller.signal }),
                client.appConfig({ signal: controller.signal }),
                runtimePromise,
            ]);
            const failed = [health, status, config].find((result) => !result.ok);
            setData((current) => ({
                ...current,
                loading: false,
                error: failed?.error ?? "",
                refreshedAt: new Date().toISOString(),
                health: health.health,
                memory: status.memory,
                runtime,
                appConfig: isRecord(config.answer) ? config.answer : undefined,
            }));
        }
        catch (error) {
            if (controller.signal.aborted)
                return;
            setData((current) => ({
                ...current,
                loading: false,
                error: error instanceof Error ? error.message : String(error),
            }));
        }
    }, [rpc, settings]);
    useEffect(() => {
        void refresh();
    }, [refresh]);
    useEffect(() => {
        if (settings === undefined)
            return;
        const timer = window.setInterval(() => {
            if (!document.hidden)
                void refresh(true);
        }, 5000);
        return () => window.clearInterval(timer);
    }, [refresh, settings]);
    if (snapshot.status === "unavailable")
        return null;
    if (settings === undefined) {
        return _jsx("p", { className: "reme-status-state", children: t("loading") });
    }
    const runDream = async () => {
        if (runningDream)
            return;
        setRunningDream(true);
        setData((current) => ({ ...current, error: "", dreamAction: undefined }));
        const result = await diagnosticClient(settings).autoDream({
            hint: settings.dreamHint,
        });
        setData((current) => ({
            ...current,
            error: result.ok ? "" : `${t("dreamFailed")}: ${result.error ?? ""}`,
            dreamAction: result.ok ? t("dreamCompleted") : undefined,
        }));
        setRunningDream(false);
        void refresh();
    };
    const tabs = [
        ["overview", "overview"],
        ["auto-memory", "autoMemory"],
        ["auto-dream", "autoDream"],
        ["components", "components"],
        ["journal", "journal"],
        ["knowledge", "knowledge"],
    ];
    return (_jsxs("section", { className: "reme-status-page", children: [_jsx("header", { className: "reme-status-page-header", children: _jsxs("div", { children: [_jsx("h2", { children: t("title") }), _jsx("p", { children: t("description") })] }) }), _jsx("div", { className: "reme-status-tabs", role: "tablist", children: tabs.map(([id, label]) => (_jsx("button", { type: "button", role: "tab", "aria-selected": tab === id, className: tab === id ? "active" : "", onClick: () => setTab(id), children: t(label) }, id))) }), data.error ? (_jsx("div", { className: "reme-status-notice error", role: "status", children: data.error })) : null, data.dreamAction ? (_jsx("div", { className: "reme-status-notice success", role: "status", children: data.dreamAction })) : null, _jsxs("div", { className: "reme-status-tab-panel", role: "tabpanel", children: [tab === "overview" ? (_jsx(Overview, { settings: settings, data: data, t: t })) : null, tab === "auto-memory" ? (_jsx(AutoMemory, { runtime: data.runtime, t: t })) : null, tab === "auto-dream" ? (_jsx(AutoDream, { runtime: data.runtime, runningDream: runningDream, onRunDream: () => void runDream(), t: t })) : null, tab === "components" ? (_jsx(Components, { health: data.health, memory: data.memory, t: t })) : null, tab === "journal" ? (_jsx(MemoryFiles, { kind: "journal", settings: settings, directory: directoryFrom(data.appConfig, "daily_dir", "daily"), t: t })) : null, tab === "knowledge" ? (_jsx(MemoryFiles, { kind: "knowledge", settings: settings, directory: directoryFrom(data.appConfig, "digest_dir", "digest"), t: t })) : null] })] }));
}
function Overview({ settings, data, t, }) {
    const connected = data.health !== undefined && !data.error;
    const autoMemory = data.runtime?.autoMemory;
    const autoDream = data.runtime?.autoDream;
    return (_jsxs(_Fragment, { children: [_jsxs("section", { className: "reme-status-overview-hero", children: [_jsxs("div", { className: "reme-status-overview-brand", children: [_jsx("div", { className: "reme-status-brand-mark", "aria-hidden": "true", children: "Re" }), _jsxs("div", { children: [_jsx("span", { className: "reme-status-eyebrow", children: "ReMe Memory" }), _jsx("h3", { children: t("workspace") }), _jsx("p", { children: settings.endpoint })] })] }), _jsxs("div", { className: "reme-status-overview-health", children: [_jsx(StatusBadge, { tone: connected && data.health?.healthy ? "ok" : "bad", label: connected
                                    ? t(data.health?.healthy ? "connected" : "unhealthy")
                                    : t("disconnected") }), _jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: t("version") }), _jsx("dd", { children: data.health?.version ?? "—" })] }), _jsxs("div", { children: [_jsx("dt", { children: t("lastRefresh") }), _jsx("dd", { children: formatDate(data.refreshedAt, "—") })] })] })] }), _jsxs("div", { className: "reme-status-overview-actions", children: [_jsx("a", { className: "reme-status-button", href: "https://reme.agentscope.io", target: "_blank", rel: "noreferrer", children: t("website") }), _jsx("a", { className: "reme-status-button primary", href: settings.endpoint, target: "_blank", rel: "noreferrer", children: t("openReMe") })] })] }), _jsxs("div", { className: "reme-status-capability-grid", children: [_jsxs("article", { children: [_jsxs("div", { children: [_jsx("span", { children: t("autoMemory") }), _jsx("strong", { children: t(autoMemory?.enabled ? "enabled" : "disabled") })] }), _jsx("small", { children: autoMemory?.enabled
                                    ? `${t("everyTurns")}: ${autoMemory.interval} ${t(autoMemory.interval === 1 ? "turnUnit" : "turnsUnit")}`
                                    : t("disabled") })] }), _jsxs("article", { children: [_jsxs("div", { children: [_jsx("span", { children: t("autoDream") }), _jsx("strong", { children: t(autoDream?.running
                                            ? "running"
                                            : autoDream?.enabled
                                                ? "enabled"
                                                : "disabled") })] }), _jsx("small", { children: formatDate(autoDream?.nextRunAt, t("noSchedule")) })] })] }), _jsxs("div", { className: "reme-status-metric-grid", children: [_jsx(MetricCard, { title: t("processMemory"), value: data.memory?.process_rss ?? "—" }), _jsx(MetricCard, { title: t("componentMemory"), value: data.memory?.components_total ?? "—" }), _jsx(MetricCard, { title: t("activeSessions"), value: String(autoMemory?.activeSessions ?? 0) }), _jsx(MetricCard, { title: t("queuedTurns"), value: String(autoMemory?.queuedTurns ?? 0) })] }), data.appConfig ? (_jsxs("details", { className: "reme-status-details", children: [_jsx("summary", { children: t("serverConfig") }), _jsx("pre", { children: JSON.stringify(data.appConfig, null, 2) })] })) : null] }));
}
function AutoMemory({ runtime, t, }) {
    const memory = runtime?.autoMemory;
    const busy = (memory?.tasksRunning ?? 0) > 0 || (memory?.queuedTurns ?? 0) > 0;
    return (_jsxs("section", { className: "reme-memory-dashboard", children: [_jsxs("div", { className: "reme-memory-feature-hero capture", children: [_jsxs("div", { className: "reme-memory-feature-copy", children: [_jsx("span", { className: "reme-status-eyebrow", children: t("autoMemory") }), _jsx("h3", { children: t(busy ? "running" : "idle") }), _jsx("p", { children: memory?.enabled
                                    ? `${t("everyTurns")}: ${memory.interval} ${t(memory.interval === 1 ? "turnUnit" : "turnsUnit")}`
                                    : t("disabled") })] }), _jsxs("div", { className: `reme-memory-orbit ${busy ? "busy" : ""}`, children: [_jsx("span", {}), _jsx("strong", { children: memory?.queuedTurns ?? 0 }), _jsx("small", { children: t("queuedTurns") })] }), _jsx(StatusBadge, { tone: memory?.enabled ? "ok" : "muted", label: t(memory?.enabled ? "enabled" : "disabled") })] }), _jsxs("div", { className: "reme-memory-stat-row", children: [_jsx(MetricCard, { title: t("activeSessions"), value: String(memory?.activeSessions ?? 0) }), _jsx(MetricCard, { title: t("queuedTurns"), value: String(memory?.queuedTurns ?? 0) }), _jsx(MetricCard, { title: t("runningTasks"), value: String(memory?.tasksRunning ?? 0) }), _jsx(MetricCard, { title: t("queuedTasks"), value: String(memory?.tasksQueued ?? 0) })] }), _jsxs("section", { className: "reme-memory-flow-card", children: [_jsx("h3", { children: t("capturePipeline") }), _jsxs("div", { className: "reme-memory-flow", children: [_jsx(FlowStep, { index: "01", label: t("conversationTurns") }), _jsx(FlowStep, { index: "02", label: t("submissionQueue"), detail: String(memory?.tasksQueued ?? 0) }), _jsx(FlowStep, { index: "03", label: t("longTermMemory") })] }), _jsx("p", { children: t("pipelineReady") })] }), memory?.lastError ? (_jsxs("div", { className: "reme-status-notice error", children: [_jsx("strong", { children: t("lastError") }), _jsx("span", { children: memory.lastError })] })) : null, _jsxs("section", { className: "reme-status-task-section", children: [_jsx("div", { className: "reme-status-section-heading", children: _jsxs("div", { children: [_jsx("h3", { children: t("activity") }), _jsx("p", { children: t("recentTasks") })] }) }), memory?.recentTasks.length ? (_jsx("div", { className: "reme-status-task-list", children: memory.recentTasks.map((task) => (_jsxs("details", { children: [_jsxs("summary", { children: [_jsx(StatusBadge, { tone: task.phase === "completed"
                                                ? "ok"
                                                : task.phase === "failed" || task.phase === "cancelled"
                                                    ? "bad"
                                                    : "progress", label: t(taskPhaseKey(task.phase)) }), _jsx("strong", { children: formatDate(task.finishedAt ?? task.startedAt ?? task.queuedAt, "—") }), _jsx("small", { children: `${task.turns} ${t("turns")} · ${task.messages} ${t("messages")}` })] }), _jsx("p", { children: task.error ?? task.result ?? "—" })] }, task.id))) })) : (_jsx("div", { className: "reme-status-empty", children: t("noTasks") }))] })] }));
}
function AutoDream({ runtime, runningDream, onRunDream, t, }) {
    const dream = runtime?.autoDream;
    return (_jsxs("section", { className: "reme-memory-dashboard", children: [_jsxs("div", { className: "reme-consolidation-hero", children: [_jsxs("div", { className: "reme-consolidation-heading", children: [_jsx("span", { className: "reme-status-eyebrow", children: t("autoDream") }), _jsx("h3", { children: t("nextConsolidation") }), _jsx("strong", { children: formatDate(dream?.nextRunAt, t("noSchedule")) }), _jsxs("div", { children: [_jsx(StatusBadge, { tone: dream?.running ? "progress" : dream?.enabled ? "ok" : "muted", label: t(dream?.running
                                            ? "running"
                                            : dream?.enabled
                                                ? "enabled"
                                                : "disabled") }), _jsx("code", { children: dream?.cron ?? "—" }), _jsx("small", { children: dream?.timezone ?? "—" })] })] }), _jsxs("button", { type: "button", className: "reme-consolidation-action", disabled: runningDream || dream?.running === true, onClick: onRunDream, children: [_jsx("span", { "aria-hidden": "true", children: "\u2726" }), _jsx("strong", { children: t(runningDream || dream?.running ? "runningDream" : "runDream") })] })] }), _jsxs("section", { className: "reme-memory-flow-card consolidation", children: [_jsx("h3", { children: t("consolidationFlow") }), _jsxs("div", { className: "reme-memory-flow", children: [_jsx(FlowStep, { index: "01", label: t("journalSource") }), _jsx(FlowStep, { index: "02", label: t("organizeKnowledge") }), _jsx(FlowStep, { index: "03", label: t("knowledgeOutput") })] })] }), _jsxs("div", { className: "reme-consolidation-details", children: [_jsx(MetricCard, { title: t("schedule"), value: dream?.cron ?? "—" }), _jsx(MetricCard, { title: t("timezone"), value: dream?.timezone ?? "—" }), _jsx(MetricCard, { title: t("lastRun"), value: formatDate(dream?.lastFinishedAt ?? dream?.lastStartedAt, t("never")) })] }), dream?.lastResult ? (_jsxs("div", { className: `reme-status-notice ${dream.lastResult === "completed" ? "success" : "error"}`, children: [_jsx("strong", { children: t("lastRun") }), _jsx("span", { children: dream.lastError ??
                            t(dream.lastResult === "completed"
                                ? "dreamCompleted"
                                : "dreamFailed") })] })) : null] }));
}
function Components({ health, memory, t, }) {
    const groups = [];
    for (const [group, instances] of Object.entries(health?.components ?? {})) {
        const entries = Object.entries(instances);
        if (!entries.length)
            groups.push({ group });
        else
            groups.push(...entries.map(([name, component]) => ({ group, name, component })));
    }
    const healthyCount = groups.filter(({ component }) => component?.is_healthy === true ||
        (component?.is_started === true && component.is_healthy !== false)).length;
    const configuredCount = groups.filter(({ component }) => component !== undefined).length;
    return (_jsxs("section", { className: "reme-status-components", children: [_jsxs("div", { className: "reme-components-hero", children: [_jsxs("div", { children: [_jsx("span", { className: "reme-status-eyebrow", children: t("infrastructure") }), _jsx("h3", { children: t("components") }), _jsx("p", { children: t("componentDetails") })] }), _jsxs("div", { className: "reme-components-score", children: [_jsx("strong", { children: healthyCount }), _jsxs("span", { children: ["/ ", configuredCount] }), _jsx("small", { children: t("healthyComponents") })] }), _jsx(StatusBadge, { tone: health?.healthy ? "ok" : "bad", label: t(health?.healthy ? "healthy" : "unhealthy") })] }), _jsx("div", { className: "reme-status-component-grid", children: groups.map(({ group, name, component }) => (_jsx(ComponentBlock, { group: group, name: name, component: component, memory: name ? memory?.components[group]?.[name]?.human : undefined, t: t }, `${group}:${name ?? "none"}`))) })] }));
}
function ComponentBlock({ group, name, component, memory, t, }) {
    const facts = component
        ? Object.entries(component).filter(([key, value]) => key !== "is_started" &&
            key !== "is_healthy" &&
            key !== "memory" &&
            value !== null &&
            value !== undefined)
        : [];
    if (memory)
        facts.push(["memory", memory]);
    const ok = component?.is_healthy === true ||
        (component?.is_started === true && component?.is_healthy !== false);
    return (_jsxs("article", { className: `reme-status-component ${ok ? "healthy" : ""}`, children: [_jsxs("header", { children: [_jsxs("div", { className: "reme-component-identity", children: [_jsx("span", { "aria-hidden": "true", children: componentInitial(group) }), _jsxs("div", { children: [_jsx("strong", { children: componentGroupLabel(group, t) }), name && name !== "default" ? (_jsx("small", { children: `${t("instance")}: ${name}` })) : null] })] }), _jsx(StatusBadge, { tone: component === undefined ? "muted" : ok ? "ok" : "bad", label: component === undefined
                            ? t("noInstances")
                            : t(ok
                                ? "healthy"
                                : component.is_started === false
                                    ? "notStarted"
                                    : "unhealthy") })] }), facts.length ? (_jsx("dl", { children: facts.map(([key, value]) => (_jsxs("div", { children: [_jsx("dt", { children: componentFieldLabel(key, t) }), _jsx("dd", { children: formatComponentValue(value) })] }, key))) })) : null] }));
}
function MemoryFiles({ kind, settings, directory, t, }) {
    const markdownLabels = useMemo(() => ({
        code: { copyLabel: t("copyCode"), copiedLabel: t("copiedCode") },
        footnotes: t("footnotes"),
    }), [t]);
    const [files, setFiles] = useState([]);
    const [limited, setLimited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState();
    const [content, setContent] = useState();
    const [contentLoading, setContentLoading] = useState(false);
    const [query, setQuery] = useState("");
    const openFile = useCallback(async (path, signal) => {
        setSelected(path);
        setContentLoading(true);
        setError("");
        const result = await diagnosticClient(settings).loadFile(path, {
            signal,
        });
        if (signal?.aborted)
            return;
        setContentLoading(false);
        if (!result.ok) {
            setContent(undefined);
            setError(result.error ?? t("fileLoadFailed"));
            return;
        }
        setContent(result.content ?? "");
    }, [settings, t]);
    useEffect(() => {
        const controller = new AbortController();
        void diagnosticClient(settings)
            .listFiles(directory, { signal: controller.signal })
            .then((result) => {
            if (controller.signal.aborted)
                return;
            setFiles(result.files);
            setLimited(result.limited);
            setError(result.ok ? "" : result.error ?? "");
            if (result.files[0] !== undefined)
                void openFile(result.files[0], controller.signal);
        })
            .finally(() => {
            if (!controller.signal.aborted)
                setLoading(false);
        });
        return () => controller.abort();
    }, [directory, openFile, settings]);
    const visibleFiles = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return normalized
            ? files.filter((path) => path.toLowerCase().includes(normalized))
            : files;
    }, [files, query]);
    const document = useMemo(() => parseMarkdownFrontmatter(content ?? ""), [content]);
    const relativePath = selected?.slice(directory.length).replace(/^\//, "");
    return (_jsxs("section", { className: "reme-status-files", children: [_jsxs("div", { className: `reme-library-hero ${kind}`, children: [_jsx("span", { className: "reme-library-mark", "aria-hidden": "true", children: kind === "journal" ? "J" : "K" }), _jsxs("div", { children: [_jsx("h3", { children: t(kind) }), _jsx("p", { children: t(kind === "journal"
                                    ? "journalDescription"
                                    : "knowledgeDescription") })] }), _jsxs("div", { className: "reme-library-count", children: [_jsx("strong", { children: files.length }), _jsx("span", { children: t(files.length === 1 ? "fileUnit" : "fileCount") }), _jsx("code", { children: directory })] })] }), error ? _jsx("div", { className: "reme-status-notice error", children: error }) : null, _jsxs("div", { className: "reme-status-file-browser", children: [_jsxs("aside", { children: [_jsxs("div", { className: "reme-file-search", children: [_jsx("input", { type: "search", value: query, placeholder: t("searchFiles"), onChange: (event) => setQuery(event.currentTarget.value) }), _jsx("span", { children: visibleFiles.length })] }), loading ? (_jsx("div", { className: "reme-status-empty", children: t("fileListLoading") })) : null, !loading && !files.length ? (_jsx("div", { className: "reme-status-empty", children: t("fileListEmpty") })) : null, !loading && files.length > 0 && !visibleFiles.length ? (_jsx("div", { className: "reme-status-empty", children: t("noSearchResults") })) : null, visibleFiles.map((path) => (_jsxs("button", { type: "button", className: selected === path ? "active" : "", onClick: () => void openFile(path), title: path, children: [_jsx("i", { "aria-hidden": "true", children: kind === "journal" ? "J" : "K" }), _jsxs("span", { children: [_jsx("strong", { children: fileName(path) }), _jsx("small", { children: path.slice(directory.length).replace(/^\//, "") })] })] }, path))), limited ? (_jsx("div", { className: "reme-status-file-limit", children: t("fileListLimited") })) : null] }), _jsxs("article", { children: [contentLoading ? (_jsx("div", { className: "reme-status-empty", children: t("loading") })) : null, !contentLoading && content === undefined ? (_jsx("div", { className: "reme-status-empty", children: t("selectFile") })) : null, !contentLoading && content !== undefined ? (_jsxs("div", { className: "reme-document-preview", children: [_jsx("header", { children: _jsxs("div", { children: [_jsx("span", { children: kind === "journal" ? t("journal") : t("knowledge") }), _jsx("h3", { children: fileName(selected ?? "") }), _jsx("code", { children: relativePath })] }) }), document.entries.length ? (_jsxs("section", { className: "reme-frontmatter", children: [_jsx("h4", { children: t("documentMetadata") }), _jsx("dl", { children: document.entries.map(({ key, value }, index) => (_jsxs("div", { children: [_jsx("dt", { children: key }), _jsx("dd", { children: value || "—" })] }, `${key}:${index}`))) })] })) : null, _jsxs("section", { className: "reme-document-content", children: [_jsx("h4", { children: t("documentContent") }), _jsx("div", { className: "reme-status-markdown", children: _jsx(MarkdownText, { text: document.body, labels: markdownLabels }) })] })] })) : null] })] })] }));
}
function MetricCard({ title, value, }) {
    return (_jsxs("div", { className: "reme-status-metric-card", children: [_jsx("span", { children: title }), _jsx("strong", { children: value })] }));
}
function FlowStep({ index, label, detail, }) {
    return (_jsxs("div", { className: "reme-memory-flow-step", children: [_jsx("span", { children: index }), _jsx("strong", { children: label }), detail ? _jsx("small", { children: detail }) : null] }));
}
function StatusBadge({ tone, label, }) {
    return (_jsxs("span", { className: `reme-status-badge ${tone}`, children: [_jsx("i", {}), label] }));
}
async function loadRuntime(rpc, signal) {
    const result = await rpc.call("/api", "remeStatus/runtime", { args: {} }, signal);
    if (!result.ok)
        throw new Error(result.error.message || result.error.code);
    if (!isRuntimeSnapshot(result.value))
        throw new Error("Invalid ReMe runtime status response");
    return result.value;
}
function isRuntimeSnapshot(value) {
    return (isRecord(value) &&
        isRecord(value.autoMemory) &&
        isRecord(value.autoDream) &&
        typeof value.phase === "string");
}
function diagnosticClient(settings) {
    return new ReMeClient({
        endpoint: settings.endpoint,
        requestTimeoutMs: settings.requestTimeoutMs,
        backgroundTimeoutMs: settings.backgroundTimeoutMs,
    });
}
function directoryFrom(config, field, fallback) {
    const value = config?.[field];
    return typeof value === "string" && value.trim()
        ? value.replace(/^\/+|\/+$/g, "")
        : fallback;
}
function taskPhaseKey(phase) {
    return {
        queued: "taskQueued",
        running: "taskRunning",
        completed: "taskCompleted",
        failed: "taskFailed",
        cancelled: "taskCancelled",
    }[phase];
}
function componentGroupLabel(group, t) {
    const labels = {
        embedding_store: "embeddingStore",
        file_graph: "fileGraph",
        file_store: "fileStore",
        keyword_index: "keywordIndex",
    };
    return labels[group] === undefined ? readableName(group) : t(labels[group]);
}
function componentFieldLabel(field, t) {
    const labels = {
        model_name: "modelName",
        dimensions: "dimensions",
        cache_size: "cacheSize",
        n_nodes: "nodes",
        n_edges: "edges",
        n_virtual: "virtualNodes",
        n_pending: "pendingNodes",
        n_chunks: "chunks",
        n_chunks_with_embedding: "embeddedChunks",
        n_docs: "documents",
        vocab_size: "vocabulary",
        memory: "memoryUsage",
    };
    return labels[field] === undefined ? readableName(field) : t(labels[field]);
}
function readableName(value) {
    return value
        .split("_")
        .map((part) => part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part)
        .join(" ");
}
function componentInitial(group) {
    return group
        .split("_")
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
}
function fileName(path) {
    return path.split("/").at(-1) || path;
}
function formatComponentValue(value) {
    if (typeof value === "string" || typeof value === "number")
        return String(value);
    if (typeof value === "boolean")
        return value ? "✓" : "—";
    return JSON.stringify(value);
}
function formatDate(value, fallback) {
    if (!value)
        return fallback;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleString();
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=status-page.js.map