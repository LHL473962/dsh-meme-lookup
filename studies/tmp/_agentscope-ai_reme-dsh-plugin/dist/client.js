window.__ModuleLoader__.load({
  id: "@agentscope-ai/reme-dsh-plugin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    
    // src/client/index.tsx
    var index_exports = {};
    __export(index_exports, {
      apply: () => apply,
      inject: () => inject
    });
    module.exports = __toCommonJS(index_exports);
    var import_react2 = require("react");
    
    // src/client/status-page.tsx
    var import_react = require("react");
    var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
    
    // src/reme/client.ts
    var ReMeClient = class {
      configSource;
      constructor(config) {
        this.configSource = typeof config === "function" ? config : () => config;
      }
      async search(query, options = {}) {
        const config = this.configSource();
        return this.request(
          "search",
          {
            query,
            limit: options.limit,
            min_score: options.minScore
          },
          config,
          config.requestTimeoutMs,
          options.signal
        );
      }
      async autoMemory(messages, sessionId, options = {}) {
        const config = this.configSource();
        return this.request(
          "auto_memory",
          {
            messages,
            session_id: sessionId,
            memory_hint: options.memoryHint || "",
            date: options.date || ""
          },
          config,
          config.backgroundTimeoutMs,
          options.signal
        );
      }
      async autoDream(options = {}) {
        const config = this.configSource();
        return this.request(
          "auto_dream",
          {
            date: options.date || "",
            hint: options.hint || ""
          },
          config,
          config.backgroundTimeoutMs,
          options.signal
        );
      }
      async healthCheck(options = {}) {
        const config = this.configSource();
        const result = await this.request(
          "health_check",
          {},
          config,
          config.requestTimeoutMs,
          options.signal
        );
        return {
          ...result,
          health: healthFrom(result.metadata?.health)
        };
      }
      async status(options = {}) {
        const config = this.configSource();
        const result = await this.request(
          "status",
          {},
          config,
          config.requestTimeoutMs,
          options.signal
        );
        return {
          ...result,
          memory: memoryFrom(result.metadata?.status)
        };
      }
      async appConfig(options = {}) {
        const config = this.configSource();
        return this.request(
          "app_config",
          {},
          config,
          config.requestTimeoutMs,
          options.signal
        );
      }
      async listFiles(path, options = {}) {
        const config = this.configSource();
        const limit = options.limit ?? 5e3;
        const result = await this.request(
          "list",
          {
            path,
            recursive: true,
            sort_by: "mtime",
            extensions: ["md", "markdown", "txt", "yaml", "yml"],
            limit
          },
          config,
          config.requestTimeoutMs,
          options.signal
        );
        const items = result.metadata?.items;
        const files = Array.isArray(items) ? items.filter((item) => typeof item === "string") : [];
        return { ...result, files, limited: files.length >= limit };
      }
      async loadFile(path, options = {}) {
        const config = this.configSource();
        const result = await this.request(
          "load",
          { path },
          config,
          config.requestTimeoutMs,
          options.signal
        );
        return {
          ...result,
          content: result.ok ? String(result.answer ?? "") : void 0,
          path: typeof result.metadata?.path === "string" ? result.metadata.path : void 0,
          mtime: typeof result.metadata?.mtime === "string" ? result.metadata.mtime : void 0
        };
      }
      async request(job, payload, config, timeoutMs, externalSignal) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const signal = externalSignal ? AbortSignal.any([externalSignal, controller.signal]) : controller.signal;
        try {
          const response = await fetch(`${config.endpoint}/${job}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal
          });
          const body = await response.json().catch(() => ({}));
          const ok = response.ok && body.success !== false;
          return {
            ok,
            status: response.status,
            answer: body.answer ?? "",
            metadata: body.metadata ?? {},
            error: ok ? "" : String(body.answer || body.detail || `HTTP ${response.status}`)
          };
        } catch (error) {
          return {
            ok: false,
            status: 0,
            answer: "",
            metadata: {},
            error: error instanceof Error ? error.message : String(error)
          };
        } finally {
          clearTimeout(timer);
        }
      }
    };
    function healthFrom(value) {
      if (!isRecord(value) || typeof value.version !== "string" || typeof value.healthy !== "boolean")
        return void 0;
      if (!isRecord(value.components)) return void 0;
      return value;
    }
    function memoryFrom(value) {
      if (!isRecord(value) || !isRecord(value.memory)) return void 0;
      const memory = value.memory;
      if (typeof memory.process_rss_bytes !== "number" || typeof memory.process_rss !== "string")
        return void 0;
      return memory;
    }
    function isRecord(value) {
      return typeof value === "object" && value !== null && !Array.isArray(value);
    }
    
    // src/client/frontmatter.ts
    var FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
    function parseMarkdownFrontmatter(content) {
      const match = FRONTMATTER_PATTERN.exec(content);
      if (!match) return { body: content, entries: [] };
      const entries = [];
      for (const line of (match[1] ?? "").split(/\r?\n/)) {
        const separator = line.indexOf(":");
        if (separator > 0 && !/^\s/.test(line)) {
          entries.push({
            key: line.slice(0, separator).trim(),
            value: line.slice(separator + 1).trim()
          });
          continue;
        }
        const previous = entries.at(-1);
        const continuation = line.trim();
        if (previous !== void 0 && continuation) {
          previous.value = previous.value ? `${previous.value}
    ${continuation}` : continuation;
        }
      }
      return { body: content.slice(match[0].length), entries };
    }
    
    // src/client/status-page.tsx
    var import_jsx_runtime = require("react/jsx-runtime");
    var statusEn = {
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
      runningDream: "Consolidating\u2026",
      loading: "Loading ReMe status\u2026",
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
      fileListLoading: "Loading files\u2026",
      fileListEmpty: "No files yet.",
      fileListLimited: "Showing the newest 5,000 files.",
      fileCount: "files",
      fileUnit: "file",
      searchFiles: "Search files\u2026",
      noSearchResults: "No matching files.",
      documentMetadata: "Document metadata",
      documentContent: "Document content",
      selectFile: "Select a file to preview its contents.",
      fileLoadFailed: "Could not load this file.",
      copyCode: "Copy",
      copiedCode: "Copied",
      footnotes: "Footnotes",
      journalDescription: "Daily notes captured from conversations and sources.",
      knowledgeDescription: "Consolidated knowledge organized for long-term recall."
    };
    var statusZh = {
      nav: "ReMe \u72B6\u6001",
      title: "ReMe \u72B6\u6001",
      description: "\u67E5\u770B\u8BB0\u5FC6\u5199\u5165\u3001\u77E5\u8BC6\u6574\u7406\u3001\u670D\u52A1\u5065\u5EB7\u548C ReMe \u5DE5\u4F5C\u533A\u3002",
      workspace: "\u4F60\u7684\u8BB0\u5FC6\u5DE5\u4F5C\u533A",
      overview: "\u603B\u89C8",
      autoMemory: "\u81EA\u52A8\u8BB0\u5FC6",
      autoDream: "\u8BB0\u5FC6\u6574\u7406",
      components: "\u7EC4\u4EF6",
      journal: "\u65E5\u8BB0",
      knowledge: "\u4E2A\u4EBA\u77E5\u8BC6\u5E93",
      website: "ReMe \u5B98\u7F51",
      openReMe: "\u6253\u5F00 ReMe",
      runDream: "\u7ACB\u5373\u6574\u7406",
      runningDream: "\u6B63\u5728\u6574\u7406\u2026",
      loading: "\u6B63\u5728\u52A0\u8F7D ReMe \u72B6\u6001\u2026",
      unavailable: "ReMe \u72B6\u6001\u4E0D\u53EF\u7528\u3002",
      connected: "\u5DF2\u8FDE\u63A5",
      disconnected: "\u8FDE\u63A5\u5931\u8D25",
      healthy: "\u5065\u5EB7",
      unhealthy: "\u9700\u8981\u5904\u7406",
      enabled: "\u5DF2\u542F\u7528",
      disabled: "\u672A\u542F\u7528",
      running: "\u8FD0\u884C\u4E2D",
      idle: "\u7A7A\u95F2",
      stopping: "\u6B63\u5728\u505C\u6B62",
      version: "\u7248\u672C",
      endpoint: "\u670D\u52A1\u5730\u5740",
      lastRefresh: "\u6700\u8FD1\u5237\u65B0",
      serviceHealth: "\u670D\u52A1\u5065\u5EB7",
      processMemory: "\u8FDB\u7A0B\u5185\u5B58",
      componentMemory: "\u7EC4\u4EF6\u5185\u5B58",
      activeSessions: "\u6D3B\u8DC3\u4F1A\u8BDD",
      queuedTurns: "\u5F85\u5904\u7406\u56DE\u5408",
      runningTasks: "\u8FD0\u884C\u4E2D\u4EFB\u52A1",
      queuedTasks: "\u6392\u961F\u4EFB\u52A1",
      everyTurns: "\u63D0\u4EA4\u95F4\u9694",
      turnsUnit: "\u4E2A\u5B8C\u6210\u56DE\u5408",
      turnUnit: "\u4E2A\u5B8C\u6210\u56DE\u5408",
      recentTasks: "\u6700\u8FD1\u63D0\u4EA4",
      capturePipeline: "\u8BB0\u5FC6\u5199\u5165\u6D41\u7A0B",
      conversationTurns: "\u5BF9\u8BDD\u56DE\u5408",
      submissionQueue: "\u63D0\u4EA4\u961F\u5217",
      longTermMemory: "\u957F\u671F\u8BB0\u5FC6",
      pipelineReady: "\u7B49\u5F85\u5DF2\u5B8C\u6210\u7684\u5BF9\u8BDD",
      activity: "\u8FD0\u884C\u8BB0\u5F55",
      noTasks: "\u672C\u6B21 DSH \u8FD0\u884C\u671F\u95F4\u8FD8\u6CA1\u6709\u81EA\u52A8\u8BB0\u5FC6\u63D0\u4EA4\u3002",
      taskQueued: "\u6392\u961F\u4E2D",
      taskRunning: "\u8FD0\u884C\u4E2D",
      taskCompleted: "\u5DF2\u5B8C\u6210",
      taskFailed: "\u5931\u8D25",
      taskCancelled: "\u5DF2\u53D6\u6D88",
      messages: "\u6761\u6D88\u606F",
      turns: "\u4E2A\u56DE\u5408",
      lastError: "\u6700\u8FD1\u9519\u8BEF",
      schedule: "\u6267\u884C\u8BA1\u5212",
      consolidationFlow: "\u8BB0\u5FC6\u6574\u7406\u6D41\u7A0B",
      journalSource: "\u65E5\u8BB0\u8BB0\u5F55",
      organizeKnowledge: "\u6574\u7406\u4E0E\u5173\u8054",
      knowledgeOutput: "\u4E2A\u4EBA\u77E5\u8BC6\u5E93",
      nextConsolidation: "\u4E0B\u6B21\u6574\u7406",
      timezone: "\u65F6\u533A",
      nextRun: "\u4E0B\u6B21\u6267\u884C",
      lastRun: "\u6700\u8FD1\u6267\u884C",
      never: "\u672C\u6B21\u8FD0\u884C\u671F\u95F4\u5C1A\u672A\u6267\u884C",
      noSchedule: "\u5F53\u524D\u6CA1\u6709\u6267\u884C\u8BA1\u5212",
      dreamCompleted: "\u8BB0\u5FC6\u6574\u7406\u5DF2\u5B8C\u6210\u3002",
      dreamFailed: "\u8BB0\u5FC6\u6574\u7406\u5931\u8D25",
      componentDetails: "\u7EC4\u4EF6\u5065\u5EB7\u4E0E\u8D44\u6E90\u5360\u7528",
      healthyComponents: "\u4E2A\u5065\u5EB7\u7EC4\u4EF6",
      infrastructure: "\u8BB0\u5FC6\u57FA\u7840\u8BBE\u65BD",
      noInstances: "\u672A\u914D\u7F6E\u5B9E\u4F8B",
      started: "\u5DF2\u542F\u52A8",
      notStarted: "\u672A\u542F\u52A8",
      instance: "\u5B9E\u4F8B",
      fileGraph: "\u6587\u4EF6\u56FE\u8C31",
      fileStore: "\u6587\u4EF6\u5B58\u50A8",
      keywordIndex: "\u5173\u952E\u8BCD\u7D22\u5F15",
      embeddingStore: "\u5411\u91CF\u5B58\u50A8",
      modelName: "\u6A21\u578B",
      dimensions: "\u5411\u91CF\u7EF4\u5EA6",
      cacheSize: "\u7F13\u5B58\u6761\u76EE",
      nodes: "\u8282\u70B9",
      edges: "\u8FB9",
      virtualNodes: "\u865A\u62DF\u8282\u70B9",
      pendingNodes: "\u5F85\u5904\u7406\u8282\u70B9",
      chunks: "\u5185\u5BB9\u5757",
      embeddedChunks: "\u5DF2\u751F\u6210\u5411\u91CF",
      documents: "\u6587\u6863",
      vocabulary: "\u8BCD\u6C47\u91CF",
      memoryUsage: "\u5185\u5B58\u5360\u7528",
      serverConfig: "\u670D\u52A1\u7AEF\u914D\u7F6E\uFF08\u5DF2\u8131\u654F\uFF09",
      fileListLoading: "\u6B63\u5728\u52A0\u8F7D\u6587\u4EF6\u2026",
      fileListEmpty: "\u8FD8\u6CA1\u6709\u6587\u4EF6\u3002",
      fileListLimited: "\u5F53\u524D\u663E\u793A\u6700\u8FD1\u7684 5,000 \u4E2A\u6587\u4EF6\u3002",
      fileCount: "\u4E2A\u6587\u4EF6",
      fileUnit: "\u4E2A\u6587\u4EF6",
      searchFiles: "\u641C\u7D22\u6587\u4EF6\u2026",
      noSearchResults: "\u6CA1\u6709\u5339\u914D\u7684\u6587\u4EF6\u3002",
      documentMetadata: "\u6587\u6863\u5143\u6570\u636E",
      documentContent: "\u6587\u6863\u5185\u5BB9",
      selectFile: "\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u67E5\u770B\u5185\u5BB9\u3002",
      fileLoadFailed: "\u65E0\u6CD5\u8BFB\u53D6\u8FD9\u4E2A\u6587\u4EF6\u3002",
      copyCode: "\u590D\u5236",
      copiedCode: "\u5DF2\u590D\u5236",
      footnotes: "\u811A\u6CE8",
      journalDescription: "\u4ECE\u5BF9\u8BDD\u548C\u5176\u4ED6\u6765\u6E90\u81EA\u52A8\u6C89\u6DC0\u7684\u6BCF\u65E5\u8BB0\u5F55\u3002",
      knowledgeDescription: "\u7ECF\u8FC7\u6574\u7406\u3001\u9002\u5408\u957F\u671F\u68C0\u7D22\u548C\u6301\u7EED\u79EF\u7D2F\u7684\u4E2A\u4EBA\u77E5\u8BC6\u3002"
    };
    function ReMeStatusPage({
      scope,
      rpc,
      t
    }) {
      const snapshot = (0, import_react.useSyncExternalStore)(
        (listener) => scope.subscribe(listener),
        () => scope.getSnapshot()
      );
      const settings = snapshot.value;
      const [tab, setTab] = (0, import_react.useState)("overview");
      const [data, setData] = (0, import_react.useState)({ loading: true, error: "" });
      const [runningDream, setRunningDream] = (0, import_react.useState)(false);
      const refresh = (0, import_react.useCallback)(
        async (runtimeOnly = false) => {
          if (settings === void 0) return;
          const controller = new AbortController();
          if (!runtimeOnly)
            setData((current) => ({ ...current, loading: true, error: "" }));
          try {
            const runtimePromise = loadRuntime(rpc, controller.signal);
            if (runtimeOnly) {
              const runtime2 = await runtimePromise;
              setData((current) => ({ ...current, runtime: runtime2 }));
              return;
            }
            const client = diagnosticClient(settings);
            const [health, status, config, runtime] = await Promise.all([
              client.healthCheck({ signal: controller.signal }),
              client.status({ signal: controller.signal }),
              client.appConfig({ signal: controller.signal }),
              runtimePromise
            ]);
            const failed = [health, status, config].find((result) => !result.ok);
            setData((current) => ({
              ...current,
              loading: false,
              error: failed?.error ?? "",
              refreshedAt: (/* @__PURE__ */ new Date()).toISOString(),
              health: health.health,
              memory: status.memory,
              runtime,
              appConfig: isRecord2(config.answer) ? config.answer : void 0
            }));
          } catch (error) {
            if (controller.signal.aborted) return;
            setData((current) => ({
              ...current,
              loading: false,
              error: error instanceof Error ? error.message : String(error)
            }));
          }
        },
        [rpc, settings]
      );
      (0, import_react.useEffect)(() => {
        void refresh();
      }, [refresh]);
      (0, import_react.useEffect)(() => {
        if (settings === void 0) return;
        const timer = window.setInterval(() => {
          if (!document.hidden) void refresh(true);
        }, 5e3);
        return () => window.clearInterval(timer);
      }, [refresh, settings]);
      if (snapshot.status === "unavailable") return null;
      if (settings === void 0) {
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "reme-status-state", children: t("loading") });
      }
      const runDream = async () => {
        if (runningDream) return;
        setRunningDream(true);
        setData((current) => ({ ...current, error: "", dreamAction: void 0 }));
        const result = await diagnosticClient(settings).autoDream({
          hint: settings.dreamHint
        });
        setData((current) => ({
          ...current,
          error: result.ok ? "" : `${t("dreamFailed")}: ${result.error ?? ""}`,
          dreamAction: result.ok ? t("dreamCompleted") : void 0
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
        ["knowledge", "knowledge"]
      ];
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-status-page", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { className: "reme-status-page-header", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("title") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("description") })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-tabs", role: "tablist", children: tabs.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": tab === id,
            className: tab === id ? "active" : "",
            onClick: () => setTab(id),
            children: t(label)
          },
          id
        )) }),
        data.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-notice error", role: "status", children: data.error }) : null,
        data.dreamAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-notice success", role: "status", children: data.dreamAction }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-tab-panel", role: "tabpanel", children: [
          tab === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, { settings, data, t }) : null,
          tab === "auto-memory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutoMemory, { runtime: data.runtime, t }) : null,
          tab === "auto-dream" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            AutoDream,
            {
              runtime: data.runtime,
              runningDream,
              onRunDream: () => void runDream(),
              t
            }
          ) : null,
          tab === "components" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Components, { health: data.health, memory: data.memory, t }) : null,
          tab === "journal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MemoryFiles,
            {
              kind: "journal",
              settings,
              directory: directoryFrom(data.appConfig, "daily_dir", "daily"),
              t
            }
          ) : null,
          tab === "knowledge" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MemoryFiles,
            {
              kind: "knowledge",
              settings,
              directory: directoryFrom(data.appConfig, "digest_dir", "digest"),
              t
            }
          ) : null
        ] })
      ] });
    }
    function Overview({
      settings,
      data,
      t
    }) {
      const connected = data.health !== void 0 && !data.error;
      const autoMemory = data.runtime?.autoMemory;
      const autoDream = data.runtime?.autoDream;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-status-overview-hero", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-overview-brand", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-brand-mark", "aria-hidden": "true", children: "Re" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "reme-status-eyebrow", children: "ReMe Memory" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("workspace") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: settings.endpoint })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-overview-health", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              StatusBadge,
              {
                tone: connected && data.health?.healthy ? "ok" : "bad",
                label: connected ? t(data.health?.healthy ? "connected" : "unhealthy") : t("disconnected")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("version") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: data.health?.version ?? "\u2014" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("lastRefresh") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatDate(data.refreshedAt, "\u2014") })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-overview-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "a",
              {
                className: "reme-status-button",
                href: "https://reme.agentscope.io",
                target: "_blank",
                rel: "noreferrer",
                children: t("website")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "a",
              {
                className: "reme-status-button primary",
                href: settings.endpoint,
                target: "_blank",
                rel: "noreferrer",
                children: t("openReMe")
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-capability-grid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("autoMemory") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t(autoMemory?.enabled ? "enabled" : "disabled") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: autoMemory?.enabled ? `${t("everyTurns")}: ${autoMemory.interval} ${t(
              autoMemory.interval === 1 ? "turnUnit" : "turnsUnit"
            )}` : t("disabled") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("autoDream") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t(
                autoDream?.running ? "running" : autoDream?.enabled ? "enabled" : "disabled"
              ) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: formatDate(autoDream?.nextRunAt, t("noSchedule")) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-metric-grid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("processMemory"),
              value: data.memory?.process_rss ?? "\u2014"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("componentMemory"),
              value: data.memory?.components_total ?? "\u2014"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("activeSessions"),
              value: String(autoMemory?.activeSessions ?? 0)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("queuedTurns"),
              value: String(autoMemory?.queuedTurns ?? 0)
            }
          )
        ] }),
        data.appConfig ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "reme-status-details", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: t("serverConfig") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: JSON.stringify(data.appConfig, null, 2) })
        ] }) : null
      ] });
    }
    function AutoMemory({
      runtime,
      t
    }) {
      const memory = runtime?.autoMemory;
      const busy = (memory?.tasksRunning ?? 0) > 0 || (memory?.queuedTurns ?? 0) > 0;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-memory-dashboard", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-memory-feature-hero capture", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-memory-feature-copy", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "reme-status-eyebrow", children: t("autoMemory") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t(busy ? "running" : "idle") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: memory?.enabled ? `${t("everyTurns")}: ${memory.interval} ${t(
              memory.interval === 1 ? "turnUnit" : "turnsUnit"
            )}` : t("disabled") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `reme-memory-orbit ${busy ? "busy" : ""}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: memory?.queuedTurns ?? 0 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t("queuedTurns") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            StatusBadge,
            {
              tone: memory?.enabled ? "ok" : "muted",
              label: t(memory?.enabled ? "enabled" : "disabled")
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-memory-stat-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("activeSessions"),
              value: String(memory?.activeSessions ?? 0)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("queuedTurns"),
              value: String(memory?.queuedTurns ?? 0)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("runningTasks"),
              value: String(memory?.tasksRunning ?? 0)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("queuedTasks"),
              value: String(memory?.tasksQueued ?? 0)
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-memory-flow-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("capturePipeline") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-memory-flow", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, { index: "01", label: t("conversationTurns") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              FlowStep,
              {
                index: "02",
                label: t("submissionQueue"),
                detail: String(memory?.tasksQueued ?? 0)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, { index: "03", label: t("longTermMemory") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("pipelineReady") })
        ] }),
        memory?.lastError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-notice error", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("lastError") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: memory.lastError })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-status-task-section", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-section-heading", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("activity") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("recentTasks") })
          ] }) }),
          memory?.recentTasks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-task-list", children: memory.recentTasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                StatusBadge,
                {
                  tone: task.phase === "completed" ? "ok" : task.phase === "failed" || task.phase === "cancelled" ? "bad" : "progress",
                  label: t(taskPhaseKey(task.phase))
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDate(
                task.finishedAt ?? task.startedAt ?? task.queuedAt,
                "\u2014"
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: `${task.turns} ${t("turns")} \xB7 ${task.messages} ${t(
                "messages"
              )}` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: task.error ?? task.result ?? "\u2014" })
          ] }, task.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-empty", children: t("noTasks") })
        ] })
      ] });
    }
    function AutoDream({
      runtime,
      runningDream,
      onRunDream,
      t
    }) {
      const dream = runtime?.autoDream;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-memory-dashboard", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-consolidation-hero", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-consolidation-heading", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "reme-status-eyebrow", children: t("autoDream") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("nextConsolidation") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDate(dream?.nextRunAt, t("noSchedule")) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                StatusBadge,
                {
                  tone: dream?.running ? "progress" : dream?.enabled ? "ok" : "muted",
                  label: t(
                    dream?.running ? "running" : dream?.enabled ? "enabled" : "disabled"
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: dream?.cron ?? "\u2014" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: dream?.timezone ?? "\u2014" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              className: "reme-consolidation-action",
              disabled: runningDream || dream?.running === true,
              onClick: onRunDream,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "\u2726" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t(runningDream || dream?.running ? "runningDream" : "runDream") })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-memory-flow-card consolidation", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("consolidationFlow") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-memory-flow", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, { index: "01", label: t("journalSource") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, { index: "02", label: t("organizeKnowledge") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowStep, { index: "03", label: t("knowledgeOutput") })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-consolidation-details", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, { title: t("schedule"), value: dream?.cron ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, { title: t("timezone"), value: dream?.timezone ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            MetricCard,
            {
              title: t("lastRun"),
              value: formatDate(
                dream?.lastFinishedAt ?? dream?.lastStartedAt,
                t("never")
              )
            }
          )
        ] }),
        dream?.lastResult ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: `reme-status-notice ${dream.lastResult === "completed" ? "success" : "error"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("lastRun") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dream.lastError ?? t(
                dream.lastResult === "completed" ? "dreamCompleted" : "dreamFailed"
              ) })
            ]
          }
        ) : null
      ] });
    }
    function Components({
      health,
      memory,
      t
    }) {
      const groups = [];
      for (const [group, instances] of Object.entries(health?.components ?? {})) {
        const entries = Object.entries(instances);
        if (!entries.length) groups.push({ group });
        else
          groups.push(
            ...entries.map(([name, component]) => ({ group, name, component }))
          );
      }
      const healthyCount = groups.filter(
        ({ component }) => component?.is_healthy === true || component?.is_started === true && component.is_healthy !== false
      ).length;
      const configuredCount = groups.filter(
        ({ component }) => component !== void 0
      ).length;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-status-components", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-components-hero", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "reme-status-eyebrow", children: t("infrastructure") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t("components") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("componentDetails") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-components-score", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: healthyCount }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              "/ ",
              configuredCount
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: t("healthyComponents") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            StatusBadge,
            {
              tone: health?.healthy ? "ok" : "bad",
              label: t(health?.healthy ? "healthy" : "unhealthy")
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-component-grid", children: groups.map(({ group, name, component }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ComponentBlock,
          {
            group,
            name,
            component,
            memory: name ? memory?.components[group]?.[name]?.human : void 0,
            t
          },
          `${group}:${name ?? "none"}`
        )) })
      ] });
    }
    function ComponentBlock({
      group,
      name,
      component,
      memory,
      t
    }) {
      const facts = component ? Object.entries(component).filter(
        ([key, value]) => key !== "is_started" && key !== "is_healthy" && key !== "memory" && value !== null && value !== void 0
      ) : [];
      if (memory) facts.push(["memory", memory]);
      const ok = component?.is_healthy === true || component?.is_started === true && component?.is_healthy !== false;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { className: `reme-status-component ${ok ? "healthy" : ""}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-component-identity", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: componentInitial(group) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: componentGroupLabel(group, t) }),
              name && name !== "default" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: `${t("instance")}: ${name}` }) : null
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            StatusBadge,
            {
              tone: component === void 0 ? "muted" : ok ? "ok" : "bad",
              label: component === void 0 ? t("noInstances") : t(
                ok ? "healthy" : component.is_started === false ? "notStarted" : "unhealthy"
              )
            }
          )
        ] }),
        facts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", { children: facts.map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: componentFieldLabel(key, t) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatComponentValue(value) })
        ] }, key)) }) : null
      ] });
    }
    function MemoryFiles({
      kind,
      settings,
      directory,
      t
    }) {
      const markdownLabels = (0, import_react.useMemo)(
        () => ({
          code: { copyLabel: t("copyCode"), copiedLabel: t("copiedCode") },
          footnotes: t("footnotes")
        }),
        [t]
      );
      const [files, setFiles] = (0, import_react.useState)([]);
      const [limited, setLimited] = (0, import_react.useState)(false);
      const [loading, setLoading] = (0, import_react.useState)(true);
      const [error, setError] = (0, import_react.useState)("");
      const [selected, setSelected] = (0, import_react.useState)();
      const [content, setContent] = (0, import_react.useState)();
      const [contentLoading, setContentLoading] = (0, import_react.useState)(false);
      const [query, setQuery] = (0, import_react.useState)("");
      const openFile = (0, import_react.useCallback)(
        async (path, signal) => {
          setSelected(path);
          setContentLoading(true);
          setError("");
          const result = await diagnosticClient(settings).loadFile(path, {
            signal
          });
          if (signal?.aborted) return;
          setContentLoading(false);
          if (!result.ok) {
            setContent(void 0);
            setError(result.error ?? t("fileLoadFailed"));
            return;
          }
          setContent(result.content ?? "");
        },
        [settings, t]
      );
      (0, import_react.useEffect)(() => {
        const controller = new AbortController();
        void diagnosticClient(settings).listFiles(directory, { signal: controller.signal }).then((result) => {
          if (controller.signal.aborted) return;
          setFiles(result.files);
          setLimited(result.limited);
          setError(result.ok ? "" : result.error ?? "");
          if (result.files[0] !== void 0)
            void openFile(result.files[0], controller.signal);
        }).finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
      }, [directory, openFile, settings]);
      const visibleFiles = (0, import_react.useMemo)(() => {
        const normalized = query.trim().toLowerCase();
        return normalized ? files.filter((path) => path.toLowerCase().includes(normalized)) : files;
      }, [files, query]);
      const document2 = (0, import_react.useMemo)(
        () => parseMarkdownFrontmatter(content ?? ""),
        [content]
      );
      const relativePath = selected?.slice(directory.length).replace(/^\//, "");
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-status-files", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `reme-library-hero ${kind}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "reme-library-mark", "aria-hidden": "true", children: kind === "journal" ? "J" : "K" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t(kind) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t(
              kind === "journal" ? "journalDescription" : "knowledgeDescription"
            ) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-library-count", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: files.length }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(files.length === 1 ? "fileUnit" : "fileCount") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: directory })
          ] })
        ] }),
        error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-notice error", children: error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-file-browser", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-file-search", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "search",
                  value: query,
                  placeholder: t("searchFiles"),
                  onChange: (event) => setQuery(event.currentTarget.value)
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: visibleFiles.length })
            ] }),
            loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-empty", children: t("fileListLoading") }) : null,
            !loading && !files.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-empty", children: t("fileListEmpty") }) : null,
            !loading && files.length > 0 && !visibleFiles.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-empty", children: t("noSearchResults") }) : null,
            visibleFiles.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                type: "button",
                className: selected === path ? "active" : "",
                onClick: () => void openFile(path),
                title: path,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true", children: kind === "journal" ? "J" : "K" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: fileName(path) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: path.slice(directory.length).replace(/^\//, "") })
                  ] })
                ]
              },
              path
            )),
            limited ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-file-limit", children: t("fileListLimited") }) : null
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
            contentLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-empty", children: t("loading") }) : null,
            !contentLoading && content === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-empty", children: t("selectFile") }) : null,
            !contentLoading && content !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-document-preview", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: kind === "journal" ? t("journal") : t("knowledge") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: fileName(selected ?? "") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: relativePath })
              ] }) }),
              document2.entries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-frontmatter", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: t("documentMetadata") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", { children: document2.entries.map(({ key, value }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: key }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: value || "\u2014" })
                ] }, `${key}:${index}`)) })
              ] }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "reme-document-content", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: t("documentContent") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "reme-status-markdown", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.MarkdownText, { text: document2.body, labels: markdownLabels }) })
              ] })
            ] }) : null
          ] })
        ] })
      ] });
    }
    function MetricCard({
      title,
      value
    }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-status-metric-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: value })
      ] });
    }
    function FlowStep({
      index,
      label,
      detail
    }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reme-memory-flow-step", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: label }),
        detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: detail }) : null
      ] });
    }
    function StatusBadge({
      tone,
      label
    }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `reme-status-badge ${tone}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
        label
      ] });
    }
    async function loadRuntime(rpc, signal) {
      const result = await rpc.call(
        "/api",
        "remeStatus/runtime",
        { args: {} },
        signal
      );
      if (!result.ok) throw new Error(result.error.message || result.error.code);
      if (!isRuntimeSnapshot(result.value))
        throw new Error("Invalid ReMe runtime status response");
      return result.value;
    }
    function isRuntimeSnapshot(value) {
      return isRecord2(value) && isRecord2(value.autoMemory) && isRecord2(value.autoDream) && typeof value.phase === "string";
    }
    function diagnosticClient(settings) {
      return new ReMeClient({
        endpoint: settings.endpoint,
        requestTimeoutMs: settings.requestTimeoutMs,
        backgroundTimeoutMs: settings.backgroundTimeoutMs
      });
    }
    function directoryFrom(config, field, fallback) {
      const value = config?.[field];
      return typeof value === "string" && value.trim() ? value.replace(/^\/+|\/+$/g, "") : fallback;
    }
    function taskPhaseKey(phase) {
      return {
        queued: "taskQueued",
        running: "taskRunning",
        completed: "taskCompleted",
        failed: "taskFailed",
        cancelled: "taskCancelled"
      }[phase];
    }
    function componentGroupLabel(group, t) {
      const labels = {
        embedding_store: "embeddingStore",
        file_graph: "fileGraph",
        file_store: "fileStore",
        keyword_index: "keywordIndex"
      };
      return labels[group] === void 0 ? readableName(group) : t(labels[group]);
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
        memory: "memoryUsage"
      };
      return labels[field] === void 0 ? readableName(field) : t(labels[field]);
    }
    function readableName(value) {
      return value.split("_").map(
        (part) => part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part
      ).join(" ");
    }
    function componentInitial(group) {
      return group.split("_").map((part) => part.charAt(0).toUpperCase()).slice(0, 2).join("");
    }
    function fileName(path) {
      return path.split("/").at(-1) || path;
    }
    function formatComponentValue(value) {
      if (typeof value === "string" || typeof value === "number")
        return String(value);
      if (typeof value === "boolean") return value ? "\u2713" : "\u2014";
      return JSON.stringify(value);
    }
    function formatDate(value, fallback) {
      if (!value) return fallback;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? fallback : date.toLocaleString();
    }
    function isRecord2(value) {
      return typeof value === "object" && value !== null && !Array.isArray(value);
    }
    
    // src/client/styles.ts
    var styles = `
    .reme-settings-fields{min-width:0;margin:0;padding:0;border:0}
    .reme-settings-card{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-2)}
    .reme-settings-muted{font-size:13px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}
    .reme-settings-pending{flex:none;border-radius:999px;padding:1px 8px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:17px;font-weight:500;white-space:nowrap}
    .reme-settings-body{padding:0 16px 8px}.reme-settings-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 0;border-bottom:1px solid var(--dsw-alias-border-l2)}
    .reme-settings-status{flex:1 0 100%;min-width:0;display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5}.reme-settings-status+.reme-settings-button{margin-left:auto}.reme-settings-status .endpoint{color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.reme-settings-dot{width:8px;height:8px;flex:none;border-radius:50%;background:var(--dsw-alias-label-tertiary)}.reme-settings-dot.ok{background:#21a366}.reme-settings-dot.bad{background:var(--dsw-alias-label-error)}
    .reme-settings-button,.reme-settings-discard,.reme-settings-save{appearance:none;border:1px solid transparent;border-radius:8px;padding:5px 12px;background:none;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:1.5;text-decoration:none;cursor:pointer}.reme-settings-button,.reme-settings-discard{border-color:var(--dsw-alias-border-l2)}.reme-settings-button:hover:not(:disabled),.reme-settings-discard:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.reme-settings-save{padding-inline:14px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.reme-settings-button:disabled,.reme-settings-discard:disabled,.reme-settings-save:disabled,.reme-settings-reset:disabled{opacity:.4;cursor:default}.reme-settings-button:focus-visible,.reme-settings-discard:focus-visible,.reme-settings-save:focus-visible,.reme-settings-reset:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
    .reme-settings-section{padding:14px 0 0}.reme-settings-section h4{margin:0;padding-bottom:8px;font-size:13px;font-weight:600;line-height:1.5;color:var(--dsw-alias-label-primary)}.reme-settings-grid{display:flex;flex-direction:column}
    .reme-settings-field{display:flex;flex-direction:column;gap:6px;padding:12px 0}.reme-settings-field+.reme-settings-field,.reme-settings-check+.reme-settings-field,.reme-settings-field+.reme-settings-check,.reme-settings-check+.reme-settings-check{border-top:1px solid var(--dsw-alias-border-l2)}.reme-settings-field label{font-size:13px;font-weight:500;line-height:1.5;color:var(--dsw-alias-label-primary)}.reme-settings-field small{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}.reme-settings-field input,.reme-settings-field select,.reme-settings-field textarea{box-sizing:border-box;width:100%;min-height:34px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);padding:6px 12px;font:inherit;font-size:13px;line-height:1.5}.reme-settings-field textarea{min-height:74px;resize:vertical}.reme-settings-field input:focus-visible,.reme-settings-field select:focus-visible,.reme-settings-field textarea:focus-visible{outline:none;border-color:var(--dsw-alias-brand-primary)}.reme-settings-field input[aria-invalid=true]{border-color:var(--dsw-alias-label-error)}
    .reme-settings-check{display:flex;align-items:center;gap:9px;padding:12px 0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5}.reme-settings-check input{margin:0;accent-color:var(--dsw-alias-brand-primary)}
    .reme-settings-error,.reme-settings-success{font-size:12px;line-height:1.5}.reme-settings-error{color:var(--dsw-alias-label-error)}.reme-settings-success{color:#168653}.reme-settings-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 0 4px;border-top:1px solid var(--dsw-alias-border-l2)}.reme-settings-reset{appearance:none;border:0;background:none;padding:0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1.5;cursor:pointer}.reme-settings-reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.reme-settings-result{flex:1;min-width:0;display:flex;gap:8px}
    .reme-settings-health{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding-bottom:12px}.reme-settings-metric{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:10px 12px;background:var(--dsw-alias-bg-layer-3)}.reme-settings-metric strong{display:block;margin-bottom:3px;font-size:12px;font-weight:500;line-height:1.5}.reme-settings-metric span{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5;word-break:break-word}
    .reme-settings-components{padding:10px 0 14px;border-top:1px solid var(--dsw-alias-border-l2)}.reme-settings-components h5{margin:0 0 10px;font-size:13px;font-weight:500;line-height:1.5}.reme-settings-component-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.reme-settings-component{min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);padding:10px 12px}.reme-settings-component header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.reme-settings-component header>span:first-child{min-width:0;display:flex;flex-direction:column;gap:2px}.reme-settings-component header strong{font-size:13px;font-weight:600;line-height:1.5}.reme-settings-component header small{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.5}.reme-settings-component-status{flex:none;display:inline-flex;align-items:center;gap:5px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:17px}.reme-settings-component-status i{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-label-tertiary)}.reme-settings-component-status.ok i{background:#21a366}.reme-settings-component-status.bad{color:var(--dsw-alias-label-error)}.reme-settings-component-status.bad i{background:var(--dsw-alias-label-error)}.reme-settings-component dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px;margin:10px 0 0;padding-top:9px;border-top:1px solid var(--dsw-alias-border-l2)}.reme-settings-component dl div{min-width:0}.reme-settings-component dt{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.4}.reme-settings-component dd{margin:2px 0 0;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:500;line-height:1.4;overflow-wrap:anywhere}
    .reme-settings-details{padding:10px 0;border-top:1px solid var(--dsw-alias-border-l2)}.reme-settings-details summary{cursor:pointer;font-size:13px;font-weight:500;line-height:1.5}.reme-settings-details .reme-settings-button{margin-top:10px}.reme-settings-details pre{max-height:320px;overflow:auto;border-radius:8px;background:var(--dsw-alias-bg-layer-3);padding:12px;font-size:11px;white-space:pre-wrap;word-break:break-word}
    .reme-status-page{width:100%;color:var(--dsw-alias-label-primary)}
    .reme-status-page-header{margin-bottom:18px}.reme-status-page-header h2{margin:0;font-size:22px;line-height:1.35}.reme-status-page-header p{max-width:620px;margin:5px 0 0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.55}
    .reme-status-button{appearance:none;display:inline-flex;align-items:center;justify-content:center;min-height:32px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);padding:5px 11px;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;text-decoration:none;cursor:pointer}.reme-status-button:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed);color:var(--dsw-alias-label-primary)}.reme-status-button.primary{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.reme-status-button:disabled{opacity:.45;cursor:default}.reme-status-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
    .reme-status-tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--dsw-alias-border-l2);scrollbar-width:none}.reme-status-tabs::-webkit-scrollbar{display:none}.reme-status-tabs button{position:relative;appearance:none;flex:none;border:0;background:none;padding:10px 13px;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:13px;cursor:pointer}.reme-status-tabs button:hover{color:var(--dsw-alias-label-primary)}.reme-status-tabs button.active{color:var(--dsw-alias-label-primary);font-weight:600}.reme-status-tabs button.active:after{content:"";position:absolute;right:9px;bottom:-1px;left:9px;height:2px;border-radius:2px;background:var(--dsw-alias-label-primary)}.reme-status-tabs button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
    .reme-status-tab-panel{padding:18px 0 8px}.reme-status-state,.reme-status-empty{display:flex;min-height:160px;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px;text-align:center}.reme-status-notice{display:flex;align-items:flex-start;gap:8px;margin-top:12px;border-radius:9px;padding:9px 12px;font-size:12px;line-height:1.5}.reme-status-notice strong{flex:none}.reme-status-notice.error{background:color-mix(in srgb,var(--dsw-alias-label-error) 8%,transparent);color:var(--dsw-alias-label-error)}.reme-status-notice.success{background:color-mix(in srgb,#21a366 9%,transparent);color:#168653}
    .reme-status-overview-hero{position:relative;display:grid;grid-template-columns:minmax(220px,1fr) auto;align-items:center;gap:16px 22px;overflow:hidden;border:1px solid color-mix(in srgb,#21a366 22%,var(--dsw-alias-border-l2));border-radius:16px;background:linear-gradient(125deg,color-mix(in srgb,#21a366 10%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3) 48%,color-mix(in srgb,var(--dsw-alias-brand-primary) 5%,var(--dsw-alias-bg-layer-3)));padding:20px 22px}.reme-status-overview-hero:after{position:absolute;right:-60px;bottom:-90px;width:210px;height:210px;border-radius:50%;background:color-mix(in srgb,#21a366 6%,transparent);content:"";pointer-events:none}.reme-status-overview-brand{display:flex;min-width:0;align-items:center;gap:14px}.reme-status-brand-mark{display:grid;width:48px;height:48px;flex:none;place-items:center;border-radius:14px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);font-size:17px;font-weight:750;letter-spacing:-.5px;box-shadow:0 8px 24px color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent)}.reme-status-eyebrow{color:var(--dsw-alias-label-tertiary);font-size:10px;font-weight:650;letter-spacing:.08em;line-height:1.4;text-transform:uppercase}.reme-status-overview-brand h3{margin:2px 0 0;font-size:18px;line-height:1.4}.reme-status-overview-brand p{max-width:290px;margin:3px 0 0;overflow:hidden;color:var(--dsw-alias-label-tertiary);font-size:11px;text-overflow:ellipsis;white-space:nowrap}.reme-status-overview-health{display:flex;min-width:0;grid-column:1 / -1;align-items:center;gap:18px;border-top:1px solid color-mix(in srgb,#21a366 16%,var(--dsw-alias-border-l2));padding-top:14px}.reme-status-overview-health dl{display:flex;min-width:0;gap:18px;margin:0}.reme-status-overview-health dl div{min-width:0}.reme-status-overview-health dt{color:var(--dsw-alias-label-tertiary);font-size:10px}.reme-status-overview-health dd{margin:2px 0 0;overflow:hidden;font-size:12px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.reme-status-overview-actions{position:relative;z-index:1;display:flex;flex-direction:column;gap:7px}.reme-status-capability-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.reme-status-capability-grid article{display:flex;min-width:0;flex-direction:column;align-items:flex-start;gap:7px;border:1px solid var(--dsw-alias-border-l2);border-radius:11px;background:var(--dsw-alias-bg-layer-3);padding:13px 15px}.reme-status-capability-grid article>div{display:flex;min-width:0;flex-direction:column;gap:3px}.reme-status-capability-grid span,.reme-status-capability-grid small{color:var(--dsw-alias-label-tertiary);font-size:10px}.reme-status-capability-grid strong{font-size:14px}.reme-status-capability-grid small{text-align:left}
    .reme-status-badge{display:inline-flex;align-items:center;gap:6px;width:max-content;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:3px 8px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;line-height:16px}.reme-status-badge i{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-label-tertiary)}.reme-status-badge.ok{border-color:color-mix(in srgb,#21a366 25%,transparent);background:color-mix(in srgb,#21a366 7%,transparent);color:#168653}.reme-status-badge.ok i{background:#21a366;box-shadow:0 0 0 3px color-mix(in srgb,#21a366 12%,transparent)}.reme-status-badge.bad{border-color:color-mix(in srgb,var(--dsw-alias-label-error) 24%,transparent);background:color-mix(in srgb,var(--dsw-alias-label-error) 7%,transparent);color:var(--dsw-alias-label-error)}.reme-status-badge.bad i{background:var(--dsw-alias-label-error)}.reme-status-badge.progress{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 25%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 7%,transparent);color:var(--dsw-alias-brand-primary)}.reme-status-badge.progress i{background:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)}
    .reme-status-metric-grid,.reme-status-dream-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:12px}.reme-status-metric-card{min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-3);padding:12px 14px}.reme-status-metric-card span{display:block;color:var(--dsw-alias-label-tertiary);font-size:11px}.reme-status-metric-card strong{display:block;margin-top:6px;overflow-wrap:anywhere;font-size:17px;font-weight:650}.reme-status-details{margin-top:12px;border-top:1px solid var(--dsw-alias-border-l2);padding:12px 0}.reme-status-details summary{cursor:pointer;font-size:12px;font-weight:600}.reme-status-details pre{max-height:330px;overflow:auto;border-radius:9px;background:var(--dsw-alias-bg-layer-3);padding:12px;font-size:11px;white-space:pre-wrap;word-break:break-word}
    .reme-status-overview-actions{grid-column:1 / -1;flex-direction:row}.reme-status-overview-actions .reme-status-button{flex:1}
    .reme-status-summary-card{display:flex;align-items:center;justify-content:space-between;gap:20px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,var(--dsw-alias-border-l2));border-radius:13px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 7%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3));padding:17px 18px}.reme-status-summary-card>div{display:flex;flex-direction:column;gap:4px}.reme-status-summary-card>div>span{color:var(--dsw-alias-label-tertiary);font-size:11px}.reme-status-summary-card>div>strong{font-size:19px}.reme-status-summary-card>div>small{color:var(--dsw-alias-label-tertiary);font-size:11px}.reme-status-summary-card.dream{background:linear-gradient(135deg,color-mix(in srgb,#7e57c2 7%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3))}
    .reme-status-task-section{margin-top:18px;padding-top:14px;border-top:1px solid var(--dsw-alias-border-l2)}.reme-status-task-section h3,.reme-status-section-heading h3,.reme-status-files-heading h3{margin:0;font-size:14px}.reme-status-task-list{display:grid;gap:7px;margin-top:10px}.reme-status-task-list details{border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-3)}.reme-status-task-list summary{display:grid;grid-template-columns:minmax(90px,auto) 1fr auto;align-items:center;gap:12px;padding:10px 12px;cursor:pointer;list-style:none}.reme-status-task-list summary::-webkit-details-marker{display:none}.reme-status-task-list summary strong{font-size:12px;font-weight:550}.reme-status-task-list summary small{color:var(--dsw-alias-label-tertiary);font-size:11px}.reme-status-task-list p{margin:0;border-top:1px solid var(--dsw-alias-border-l2);padding:10px 12px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
    .reme-status-section-heading,.reme-status-files-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}.reme-status-section-heading p,.reme-status-files-heading p{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px}.reme-status-component-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.reme-status-component{min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:11px;background:var(--dsw-alias-bg-layer-3);padding:13px 14px}.reme-status-component header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.reme-status-component header>div{display:flex;min-width:0;flex-direction:column;gap:2px}.reme-status-component header strong{font-size:13px}.reme-status-component header small{color:var(--dsw-alias-label-tertiary);font-size:10px}.reme-status-component dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 14px;margin:12px 0 0;border-top:1px solid var(--dsw-alias-border-l2);padding-top:11px}.reme-status-component dl div{min-width:0}.reme-status-component dt{color:var(--dsw-alias-label-tertiary);font-size:10px}.reme-status-component dd{margin:3px 0 0;font-size:12px;font-weight:550;overflow-wrap:anywhere}
    .reme-status-files-heading code{max-width:42%;overflow:hidden;border-radius:6px;background:var(--dsw-alias-bg-layer-3);padding:4px 8px;color:var(--dsw-alias-label-tertiary);font-size:11px;text-overflow:ellipsis;white-space:nowrap}.reme-status-file-browser{display:grid;grid-template-columns:minmax(210px,31%) minmax(0,1fr);min-height:510px;overflow:hidden;border:1px solid var(--dsw-alias-border-l2);border-radius:0 0 14px 14px;background:var(--dsw-alias-bg-layer-3)}.reme-status-file-browser>aside{max-height:610px;overflow:auto;border-right:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 52%,var(--dsw-alias-bg-layer-3));padding:8px}.reme-status-file-browser>aside button{appearance:none;display:flex;width:100%;align-items:center;gap:9px;overflow:hidden;border:0;border-radius:9px;background:none;padding:9px;color:var(--dsw-alias-label-secondary);font:inherit;text-align:left;cursor:pointer}.reme-status-file-browser>aside button:hover{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary)}.reme-status-file-browser>aside button.active{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);box-shadow:0 1px 5px color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}.reme-status-file-browser>aside button>i{display:grid;width:25px;height:25px;flex:none;place-items:center;border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,transparent);color:var(--dsw-alias-brand-primary);font-size:10px;font-style:normal;font-weight:700}.reme-status-file-browser>aside button>span{min-width:0}.reme-status-file-browser>aside button strong,.reme-status-file-browser>aside button small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.reme-status-file-browser>aside button strong{font-size:11px;font-weight:600}.reme-status-file-browser>aside button small{margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-status-file-browser>article{max-height:610px;overflow:auto;padding:0}.reme-status-file-limit{padding:9px;color:var(--dsw-alias-label-tertiary);font-size:10px;text-align:center}.reme-status-markdown{font-size:13px;line-height:1.7}
    .reme-memory-dashboard{display:flex;flex-direction:column;gap:12px}.reme-memory-feature-hero{position:relative;display:grid;grid-template-columns:1fr auto;align-items:center;gap:18px;overflow:hidden;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 17%,var(--dsw-alias-border-l2));border-radius:16px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3));padding:20px 22px}.reme-memory-feature-hero:after{position:absolute;right:-45px;top:-70px;width:190px;height:190px;border-radius:50%;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 6%,transparent);content:""}.reme-memory-feature-copy{position:relative;z-index:1}.reme-memory-feature-copy h3{margin:3px 0 0;font-size:23px}.reme-memory-feature-copy p{margin:6px 0 0;color:var(--dsw-alias-label-tertiary);font-size:11px}.reme-memory-feature-hero>.reme-status-badge{position:absolute;right:18px;top:16px;z-index:2}.reme-memory-orbit{position:relative;z-index:1;display:grid;width:94px;height:94px;place-items:center;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,var(--dsw-alias-border-l2));border-radius:50%;background:var(--dsw-alias-bg-layer-3);box-shadow:inset 0 0 0 9px color-mix(in srgb,var(--dsw-alias-brand-primary) 4%,transparent)}.reme-memory-orbit>span{position:absolute;inset:-5px;border:1px dashed color-mix(in srgb,var(--dsw-alias-brand-primary) 28%,transparent);border-radius:50%}.reme-memory-orbit.busy>span{animation:reme-orbit 5s linear infinite}.reme-memory-orbit strong{margin-top:12px;font-size:24px}.reme-memory-orbit small{align-self:start;margin-top:-20px;color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-memory-stat-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.reme-memory-stat-row .reme-status-metric-card{margin:0}.reme-memory-flow-card{border:1px solid var(--dsw-alias-border-l2);border-radius:13px;background:var(--dsw-alias-bg-layer-3);padding:15px 17px}.reme-memory-flow-card>h3{margin:0 0 12px;font-size:12px}.reme-memory-flow-card>p{margin:10px 0 0;color:var(--dsw-alias-label-tertiary);font-size:10px;text-align:center}.reme-memory-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.reme-memory-flow-step{position:relative;display:flex;min-width:0;align-items:center;gap:8px;border-radius:9px;background:var(--dsw-alias-bg-module-platform);padding:10px 11px}.reme-memory-flow-step:not(:last-child):after{position:absolute;right:-17px;width:12px;border-top:1px solid var(--dsw-alias-label-dimmed);content:""}.reme-memory-flow-step>span{display:grid;width:24px;height:24px;flex:none;place-items:center;border-radius:7px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-tertiary);font-size:9px;font-weight:650}.reme-memory-flow-step>strong{min-width:0;font-size:10px;line-height:1.35}.reme-memory-flow-step>small{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:10px}@keyframes reme-orbit{to{transform:rotate(360deg)}}
    .reme-consolidation-hero{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 150px;align-items:stretch;gap:12px;overflow:hidden;border-radius:16px;background:linear-gradient(135deg,color-mix(in srgb,#7656c9 13%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3) 62%);padding:20px 22px}.reme-consolidation-hero:after{position:absolute;right:80px;bottom:-120px;width:260px;height:260px;border:1px solid color-mix(in srgb,#7656c9 12%,transparent);border-radius:50%;content:""}.reme-consolidation-heading{position:relative;z-index:1}.reme-consolidation-heading h3{margin:4px 0 2px;color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500}.reme-consolidation-heading>strong{display:block;font-size:22px;line-height:1.35}.reme-consolidation-heading>div{display:flex;align-items:center;gap:8px;margin-top:13px}.reme-consolidation-heading code,.reme-consolidation-heading small{color:var(--dsw-alias-label-tertiary);font-size:10px}.reme-consolidation-action{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;border:1px solid color-mix(in srgb,#7656c9 18%,var(--dsw-alias-border-l2));border-radius:13px;background:color-mix(in srgb,#7656c9 8%,var(--dsw-alias-bg-layer-3));color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}.reme-consolidation-action>span{font-size:23px}.reme-consolidation-action>strong{font-size:11px}.reme-consolidation-action:hover:not(:disabled){border-color:#7656c9;background:color-mix(in srgb,#7656c9 13%,var(--dsw-alias-bg-layer-3))}.reme-consolidation-action:disabled{opacity:.5;cursor:default}.reme-memory-flow-card.consolidation .reme-memory-flow-step>span{color:#7656c9}.reme-consolidation-details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .reme-components-hero{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:18px;border:1px solid var(--dsw-alias-border-l2);border-radius:15px;background:linear-gradient(135deg,color-mix(in srgb,#21a366 6%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3));padding:18px 20px}.reme-components-hero h3{margin:3px 0 0;font-size:20px}.reme-components-hero p{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:11px}.reme-components-score{display:grid;grid-template-columns:auto auto;align-items:baseline}.reme-components-score strong{font-size:25px}.reme-components-score>span{color:var(--dsw-alias-label-tertiary);font-size:13px}.reme-components-score small{grid-column:1 / -1;color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-status-components .reme-status-component-grid{margin-top:12px}.reme-status-component{position:relative;overflow:hidden;padding:15px}.reme-status-component:before{position:absolute;top:0;right:0;left:0;height:2px;background:var(--dsw-alias-label-dimmed);content:""}.reme-status-component.healthy:before{background:#21a366}.reme-component-identity{display:flex!important;flex-direction:row!important;align-items:center;gap:10px!important}.reme-component-identity>span{display:grid;width:34px;height:34px;flex:none;place-items:center;border-radius:10px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:10px;font-weight:700}.reme-component-identity>div{display:flex;min-width:0;flex-direction:column;gap:2px}
    .reme-library-hero{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:13px;border:1px solid var(--dsw-alias-border-l2);border-bottom:0;border-radius:14px 14px 0 0;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 7%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3));padding:15px 17px}.reme-library-hero.knowledge{background:linear-gradient(135deg,color-mix(in srgb,#7656c9 8%,var(--dsw-alias-bg-layer-3)),var(--dsw-alias-bg-layer-3))}.reme-library-mark{display:grid;width:38px;height:38px;place-items:center;border-radius:11px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);font-size:13px;font-weight:700}.reme-library-hero h3{margin:0;font-size:15px}.reme-library-hero p{margin:3px 0 0;color:var(--dsw-alias-label-tertiary);font-size:10px}.reme-library-count{display:grid;grid-template-columns:auto auto;align-items:baseline;gap:0 4px;text-align:right}.reme-library-count strong{font-size:18px}.reme-library-count span{color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-library-count code{grid-column:1 / -1;margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-file-search{position:sticky;z-index:1;top:-8px;display:flex;align-items:center;gap:6px;background:inherit;padding:0 0 8px}.reme-file-search input{width:100%;min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);padding:7px 9px;color:var(--dsw-alias-label-primary);font:inherit;font-size:10px}.reme-file-search input:focus{border-color:var(--dsw-alias-brand-primary);outline:0}.reme-file-search>span{color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-document-preview>header{position:sticky;z-index:1;top:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-layer-3) 92%,transparent);padding:14px 18px;backdrop-filter:blur(10px)}.reme-document-preview>header span{color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-document-preview>header h3{margin:2px 0;font-size:15px}.reme-document-preview>header code{color:var(--dsw-alias-label-tertiary);font-size:9px}.reme-frontmatter,.reme-document-content{padding:16px 18px}.reme-frontmatter{border-bottom:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-module-platform) 45%,transparent)}.reme-frontmatter h4,.reme-document-content>h4{margin:0 0 11px;color:var(--dsw-alias-label-tertiary);font-size:9px;font-weight:650;letter-spacing:.06em;text-transform:uppercase}.reme-frontmatter dl{display:grid;gap:8px;margin:0}.reme-frontmatter dl>div{display:grid;grid-template-columns:minmax(76px,max-content) minmax(0,1fr);gap:14px}.reme-frontmatter dt{color:var(--dsw-alias-label-tertiary);font:600 10px ui-monospace,SFMono-Regular,monospace}.reme-frontmatter dd{margin:0;overflow-wrap:anywhere;font-size:11px;line-height:1.5;white-space:pre-wrap}.reme-document-content{padding-bottom:38px}
    @media(max-width:900px){.reme-status-metric-grid,.reme-status-dream-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:760px){.reme-settings-health,.reme-settings-component-grid,.reme-status-component-grid,.reme-status-capability-grid{grid-template-columns:1fr}.reme-settings-result{display:none}.reme-status-overview-hero{grid-template-columns:1fr}.reme-status-overview-actions{grid-column:1;grid-row:auto;flex-direction:row}.reme-status-overview-actions .reme-status-button{flex:1}.reme-status-file-browser{grid-template-columns:1fr}.reme-status-file-browser>aside{max-height:210px;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l2)}.reme-status-file-browser>article{min-height:300px}.reme-status-task-list summary{grid-template-columns:1fr}}
    `;
    
    // src/client/index.tsx
    var import_jsx_runtime2 = require("react/jsx-runtime");
    var NS = "reme.settings";
    var STATUS_NS = "reme.status";
    var SETTINGS_NS = "reme-memory";
    var FIELDS = [
      "endpoint",
      "requestTimeoutMs",
      "backgroundTimeoutMs",
      "shutdownTimeoutMs",
      "autoMemoryEnabled",
      "autoMemoryInterval",
      "autoDreamEnabled",
      "dreamCron",
      "dreamHint",
      "rootAgentsOnly",
      "language",
      "searchLimit",
      "timezone"
    ];
    var en = {
      title: "ReMe Memory",
      description: "Turn conversations into lasting memory and grow your personal knowledge base.",
      loading: "Loading configuration\u2026",
      unavailable: "ReMe settings are unavailable.",
      connected: "Connected",
      disconnected: "Unavailable",
      unchecked: "Not checked",
      refresh: "Refresh status",
      website: "ReMe website",
      open: "Open ReMe",
      runDream: "Consolidate Memory Now",
      connection: "Connection and search",
      endpoint: "Service URL",
      endpointHint: "The ReMe HTTP service used by DSH.",
      language: "Guidance language",
      searchLimit: "Default search results",
      requestTimeout: "Search timeout (ms)",
      autoMemory: "Automatic memory",
      autoMemoryEnabled: "Capture completed conversations automatically",
      autoMemoryInterval: "Submit every N completed turns",
      rootOnly: "Exclude subagents",
      timezone: "Workspace timezone",
      autoDream: "Memory consolidation",
      autoDreamEnabled: "Consolidate long-term memory every day",
      dreamTime: "Daily consolidation time",
      dreamHint: "Consolidation guidance",
      advanced: "Advanced",
      backgroundTimeout: "Background request timeout (ms)",
      shutdownTimeout: "Shutdown flush timeout (ms)",
      diagnostics: "Service diagnostics",
      processMemory: "Process memory",
      componentMemory: "Component memory",
      components: "Health components",
      componentInstances: "Component details",
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
      loadConfig: "Load server configuration",
      save: "Save",
      saving: "Saving\u2026",
      discard: "Discard",
      reset: "Reset to deployment defaults",
      unsaved: "Unsaved",
      invalid: "Fix the invalid fields before saving.",
      saveFailed: "The server did not accept all settings.",
      saved: "Settings saved.",
      dreamComplete: "Memory consolidation completed.",
      dreamFailed: "Memory consolidation failed",
      readOnly: "The settings document is read-only.",
      version: "Version",
      healthy: "Healthy",
      unhealthy: "Unhealthy"
    };
    var zh = {
      title: "ReMe Memory",
      description: "\u8BA9\u5BF9\u8BDD\u6C89\u6DC0\u4E3A\u957F\u671F\u8BB0\u5FC6\uFF0C\u6301\u7EED\u6784\u5EFA\u4F60\u7684\u4E2A\u4EBA\u77E5\u8BC6\u5E93\u3002",
      loading: "\u6B63\u5728\u52A0\u8F7D\u914D\u7F6E\u2026",
      unavailable: "ReMe \u8BBE\u7F6E\u4E0D\u53EF\u7528\u3002",
      connected: "\u5DF2\u8FDE\u63A5",
      disconnected: "\u8FDE\u63A5\u5931\u8D25",
      unchecked: "\u5C1A\u672A\u68C0\u67E5",
      refresh: "\u5237\u65B0\u72B6\u6001",
      website: "ReMe \u5B98\u7F51",
      open: "\u6253\u5F00 ReMe",
      runDream: "\u7ACB\u5373\u6574\u7406",
      connection: "\u8FDE\u63A5\u4E0E\u641C\u7D22",
      endpoint: "\u670D\u52A1\u5730\u5740",
      endpointHint: "DSH \u8BBF\u95EE\u7684 ReMe HTTP \u670D\u52A1\u3002",
      language: "\u8BB0\u5FC6\u6307\u5F15\u8BED\u8A00",
      searchLimit: "\u9ED8\u8BA4\u641C\u7D22\u6570\u91CF",
      requestTimeout: "\u641C\u7D22\u8D85\u65F6\uFF08\u6BEB\u79D2\uFF09",
      autoMemory: "\u81EA\u52A8\u8BB0\u5FC6",
      autoMemoryEnabled: "\u81EA\u52A8\u8BB0\u5F55\u5DF2\u5B8C\u6210\u7684\u5BF9\u8BDD",
      autoMemoryInterval: "\u6BCF N \u4E2A\u5B8C\u6210\u56DE\u5408\u63D0\u4EA4\u4E00\u6B21",
      rootOnly: "\u6392\u9664\u5B50 Agent",
      timezone: "Workspace \u65F6\u533A",
      autoDream: "\u8BB0\u5FC6\u6574\u7406",
      autoDreamEnabled: "\u6BCF\u5929\u81EA\u52A8\u6574\u7406\u957F\u671F\u8BB0\u5FC6",
      dreamTime: "\u6BCF\u65E5\u6574\u7406\u65F6\u95F4",
      dreamHint: "\u8BB0\u5FC6\u6574\u7406\u6307\u5F15",
      advanced: "\u9AD8\u7EA7\u8BBE\u7F6E",
      backgroundTimeout: "\u540E\u53F0\u8BF7\u6C42\u8D85\u65F6\uFF08\u6BEB\u79D2\uFF09",
      shutdownTimeout: "\u5173\u95ED\u65F6\u5199\u5165\u7B49\u5F85\uFF08\u6BEB\u79D2\uFF09",
      diagnostics: "\u670D\u52A1\u8BCA\u65AD",
      processMemory: "\u8FDB\u7A0B\u5185\u5B58",
      componentMemory: "\u7EC4\u4EF6\u5185\u5B58",
      components: "\u5065\u5EB7\u7EC4\u4EF6",
      componentInstances: "\u7EC4\u4EF6\u8BE6\u60C5",
      noInstances: "\u672A\u914D\u7F6E\u5B9E\u4F8B",
      started: "\u5DF2\u542F\u52A8",
      notStarted: "\u672A\u542F\u52A8",
      instance: "\u5B9E\u4F8B",
      fileGraph: "\u6587\u4EF6\u56FE\u8C31",
      fileStore: "\u6587\u4EF6\u5B58\u50A8",
      keywordIndex: "\u5173\u952E\u8BCD\u7D22\u5F15",
      embeddingStore: "\u5411\u91CF\u5B58\u50A8",
      modelName: "\u6A21\u578B",
      dimensions: "\u5411\u91CF\u7EF4\u5EA6",
      cacheSize: "\u7F13\u5B58\u6761\u76EE",
      nodes: "\u8282\u70B9",
      edges: "\u8FB9",
      virtualNodes: "\u865A\u62DF\u8282\u70B9",
      pendingNodes: "\u5F85\u5904\u7406\u8282\u70B9",
      chunks: "\u5185\u5BB9\u5757",
      embeddedChunks: "\u5DF2\u751F\u6210\u5411\u91CF",
      documents: "\u6587\u6863",
      vocabulary: "\u8BCD\u6C47\u91CF",
      memoryUsage: "\u5185\u5B58\u5360\u7528",
      serverConfig: "\u670D\u52A1\u7AEF\u914D\u7F6E\uFF08\u5DF2\u8131\u654F\uFF09",
      loadConfig: "\u8BFB\u53D6\u670D\u52A1\u7AEF\u914D\u7F6E",
      save: "\u4FDD\u5B58",
      saving: "\u6B63\u5728\u4FDD\u5B58\u2026",
      discard: "\u653E\u5F03\u4FEE\u6539",
      reset: "\u6062\u590D\u90E8\u7F72\u9ED8\u8BA4\u503C",
      unsaved: "\u672A\u4FDD\u5B58",
      invalid: "\u8BF7\u5148\u4FEE\u6B63\u65E0\u6548\u5B57\u6BB5\u3002",
      saveFailed: "\u670D\u52A1\u7AEF\u672A\u63A5\u53D7\u5168\u90E8\u8BBE\u7F6E\u3002",
      saved: "\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\u3002",
      dreamComplete: "\u8BB0\u5FC6\u6574\u7406\u5DF2\u5B8C\u6210\u3002",
      dreamFailed: "\u8BB0\u5FC6\u6574\u7406\u5931\u8D25",
      readOnly: "\u8BBE\u7F6E\u6587\u4EF6\u5F53\u524D\u53EA\u8BFB\u3002",
      version: "\u7248\u672C",
      healthy: "\u5065\u5EB7",
      unhealthy: "\u5F02\u5E38"
    };
    var inject = ["slots", "locale", "configForms", "connection"];
    function apply(ctx) {
      const t = ctx.locale.bind(NS);
      ctx.effect(
        () => ctx.locale.register(NS, { en, zh }),
        "remeMemory.settingsLocale()"
      );
      ctx.effect(
        () => ctx.locale.register(STATUS_NS, { en: statusEn, zh: statusZh }),
        "remeMemory.statusLocale()"
      );
      ctx.effect(() => installStyles(), "remeMemory.settingsStyles()");
      const scope = ctx.configForms.get(SETTINGS_NS);
      ctx.effect(
        () => ctx.configForms.whileServed(
          [SETTINGS_NS],
          () => ctx.slots.inject(
            "plugins.row.config",
            () => ctx.slots.register(
              {
                name: "plugins.row.config",
                key: "@agentscope-ai/reme-dsh-plugin#reme-memory",
                label: () => t("title"),
                locale: NS,
                inject: () => ({ scope, t })
              },
              ReMeSettingsCard
            )
          )
        ),
        "remeMemory.settingsCard()"
      );
      const statusT = ctx.locale.bind(STATUS_NS);
      const { rpc } = ctx.get("connection");
      ctx.slots.inject(
        "settings.section",
        () => ctx.slots.register(
          {
            name: "settings.section",
            id: "reme-status",
            order: 30,
            label: () => statusT("nav"),
            meta: { icon: "memory" },
            locale: STATUS_NS,
            inject: () => ({ scope, rpc, t: statusT })
          },
          ReMeStatusPage
        )
      );
    }
    function ReMeSettingsCard({
      scope,
      t,
      view
    }) {
      const snapshot = (0, import_react2.useSyncExternalStore)(
        (listener) => scope.subscribe(listener),
        () => scope.getSnapshot()
      );
      const [draftOverride, setDraft] = (0, import_react2.useState)();
      const [resetAll, setResetAll] = (0, import_react2.useState)(false);
      const [saving, setSaving] = (0, import_react2.useState)(false);
      const [saveState, setSaveState] = (0, import_react2.useState)("");
      const value = snapshot.value;
      const draft = draftOverride?.value ?? (value === void 0 ? void 0 : draftFrom(value));
      if (view === "summary") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: t("description") });
      if (snapshot.status === "unavailable") return null;
      const dirty = resetAll || value !== void 0 && draft !== void 0 && !sameDraft(draft, draftFrom(value));
      const validation = draft === void 0 ? void 0 : parseDraft(draft);
      const update = (field, next) => {
        if (value === void 0) return;
        setDraft((current) => ({
          value: { ...current?.value ?? draftFrom(value), [field]: next },
          revision: current ? current.revision : snapshot.revision
        }));
        setResetAll(false);
        setSaveState("");
      };
      const save = async () => {
        if (value === void 0 || draft === void 0 || validation === void 0 || !snapshot.writable || !dirty || saving)
          return;
        setSaving(true);
        setSaveState("");
        try {
          const ops = resetAll ? FIELDS.map((field) => ({ op: "unset", path: [field] })) : FIELDS.flatMap(
            (field) => Object.is(value[field], validation[field]) ? [] : [
              {
                op: "set",
                path: [field],
                value: validation[field]
              }
            ]
          );
          const success = await scope.mutate(
            ops,
            draftOverride?.revision ?? snapshot.revision
          );
          setSaveState(success ? "saved" : "failed");
          if (success) {
            setDraft(void 0);
            setResetAll(false);
          }
        } catch {
          setSaveState("failed");
        } finally {
          setSaving(false);
        }
      };
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "reme-settings-card", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "reme-settings-body", children: [
        dirty ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "reme-settings-pending", children: t("unsaved") }) : null,
        snapshot.status === "loading" || draft === void 0 || value === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "reme-settings-muted", children: t("loading") }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "fieldset",
            {
              className: "reme-settings-fields",
              disabled: saving || !snapshot.writable,
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SettingsForm, { draft, update, t })
            }
          ),
          !snapshot.writable ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "reme-settings-error", role: "status", children: t("readOnly") }) : null,
          validation === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "reme-settings-error", role: "status", children: t("invalid") }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "reme-settings-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "reme-settings-reset",
                disabled: !snapshot.writable || saving,
                onClick: () => {
                  setDraft({
                    value: draftFrom(baseSettings(snapshot.base, value)),
                    revision: snapshot.revision
                  });
                  setResetAll(true);
                  setSaveState("");
                },
                children: t("reset")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "reme-settings-result", role: "status", children: [
              saveState === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "reme-settings-error", children: t("saveFailed") }) : null,
              saveState === "saved" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "reme-settings-success", children: t("saved") }) : null
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "reme-settings-discard",
                disabled: !dirty || saving,
                onClick: () => {
                  setDraft(void 0);
                  setResetAll(false);
                  setSaveState("");
                },
                children: t("discard")
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                type: "button",
                className: "reme-settings-save",
                disabled: !snapshot.writable || !dirty || validation === void 0 || saving,
                onClick: () => void save(),
                children: t(saving ? "saving" : "save")
              }
            )
          ] })
        ] })
      ] }) });
    }
    function SettingsForm({
      draft,
      update,
      t
    }) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "reme-settings-section", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: t("connection") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "reme-settings-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { wide: true, label: t("endpoint"), hint: t("endpointHint"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                value: draft.endpoint,
                "aria-invalid": !validEndpoint(draft.endpoint),
                onChange: (event) => update("endpoint", event.target.value)
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("language"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
              "select",
              {
                value: draft.language,
                onChange: (event) => update("language", event.target.value),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "zh", children: "\u4E2D\u6587" }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "en", children: "English" })
                ]
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("searchLimit"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "number",
                min: "1",
                max: "50",
                value: draft.searchLimit,
                onChange: (event) => update("searchLimit", event.target.value)
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("requestTimeout"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "number",
                min: "1000",
                max: "120000",
                value: draft.requestTimeoutMs,
                onChange: (event) => update("requestTimeoutMs", event.target.value)
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "reme-settings-section", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: t("autoMemory") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "reme-settings-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              Check,
              {
                label: t("autoMemoryEnabled"),
                checked: draft.autoMemoryEnabled,
                onChange: (value) => update("autoMemoryEnabled", value)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              Check,
              {
                label: t("rootOnly"),
                checked: draft.rootAgentsOnly,
                onChange: (value) => update("rootAgentsOnly", value)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("autoMemoryInterval"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "number",
                min: "1",
                max: "1000",
                value: draft.autoMemoryInterval,
                onChange: (event) => update("autoMemoryInterval", event.target.value)
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("timezone"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                value: draft.timezone,
                "aria-invalid": !validTimezone(draft.timezone),
                onChange: (event) => update("timezone", event.target.value)
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "reme-settings-section", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: t("autoDream") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "reme-settings-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              Check,
              {
                label: t("autoDreamEnabled"),
                checked: draft.autoDreamEnabled,
                onChange: (value) => update("autoDreamEnabled", value)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("dreamTime"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "time",
                value: draft.dreamTime,
                onChange: (event) => update("dreamTime", event.target.value)
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { wide: true, label: t("dreamHint"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "textarea",
              {
                value: draft.dreamHint,
                onChange: (event) => update("dreamHint", event.target.value)
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "reme-settings-section", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: t("advanced") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "reme-settings-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("backgroundTimeout"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "number",
                min: "1000",
                max: "3600000",
                value: draft.backgroundTimeoutMs,
                onChange: (event) => update("backgroundTimeoutMs", event.target.value)
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Field, { label: t("shutdownTimeout"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                type: "number",
                min: "100",
                max: "60000",
                value: draft.shutdownTimeoutMs,
                onChange: (event) => update("shutdownTimeoutMs", event.target.value)
              }
            ) })
          ] })
        ] })
      ] });
    }
    function Field({
      label,
      hint,
      wide = false,
      children
    }) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `reme-settings-field${wide ? " wide" : ""}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { children: label }),
        children,
        hint ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: hint }) : null
      ] });
    }
    function Check({
      label,
      checked,
      onChange
    }) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "reme-settings-check", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            type: "checkbox",
            checked,
            onChange: (event) => onChange(event.target.checked)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: label })
      ] });
    }
    function draftFrom(value) {
      return {
        endpoint: value.endpoint,
        requestTimeoutMs: String(value.requestTimeoutMs),
        backgroundTimeoutMs: String(value.backgroundTimeoutMs),
        shutdownTimeoutMs: String(value.shutdownTimeoutMs),
        autoMemoryEnabled: value.autoMemoryEnabled,
        autoMemoryInterval: String(value.autoMemoryInterval),
        autoDreamEnabled: value.autoDreamEnabled,
        dreamTime: timeFromCron(value.dreamCron),
        dreamHint: value.dreamHint,
        rootAgentsOnly: value.rootAgentsOnly,
        language: value.language,
        searchLimit: String(value.searchLimit),
        timezone: value.timezone
      };
    }
    function parseDraft(draft) {
      const requestTimeoutMs = boundedInteger(draft.requestTimeoutMs, 1e3, 12e4);
      const backgroundTimeoutMs = boundedInteger(
        draft.backgroundTimeoutMs,
        1e3,
        36e5
      );
      const shutdownTimeoutMs = boundedInteger(draft.shutdownTimeoutMs, 100, 6e4);
      const autoMemoryInterval = boundedInteger(draft.autoMemoryInterval, 1, 1e3);
      const searchLimit = boundedInteger(draft.searchLimit, 1, 50);
      if (!validEndpoint(draft.endpoint) || !validTimezone(draft.timezone) || !/^\d{2}:\d{2}$/.test(draft.dreamTime))
        return void 0;
      if ([
        requestTimeoutMs,
        backgroundTimeoutMs,
        shutdownTimeoutMs,
        autoMemoryInterval,
        searchLimit
      ].some((value) => value === void 0))
        return void 0;
      const [hour, minute] = draft.dreamTime.split(":");
      return {
        endpoint: draft.endpoint.trim().replace(/\/+$/, ""),
        requestTimeoutMs,
        backgroundTimeoutMs,
        shutdownTimeoutMs,
        autoMemoryEnabled: draft.autoMemoryEnabled,
        autoMemoryInterval,
        autoDreamEnabled: draft.autoDreamEnabled,
        dreamCron: `${Number(minute)} ${Number(hour)} * * *`,
        dreamHint: draft.dreamHint,
        rootAgentsOnly: draft.rootAgentsOnly,
        language: draft.language,
        searchLimit,
        timezone: draft.timezone.trim()
      };
    }
    function boundedInteger(text, minimum, maximum) {
      const value = Number(text);
      return Number.isInteger(value) && value >= minimum && value <= maximum ? value : void 0;
    }
    function validEndpoint(value) {
      try {
        const url = new URL(value.trim());
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }
    function validTimezone(value) {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value.trim() }).format(0);
        return value.trim().length > 0;
      } catch {
        return false;
      }
    }
    function timeFromCron(cron) {
      const match = /^(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\*$/.exec(cron.trim());
      if (match === null) return "";
      return `${String(Number(match[2])).padStart(2, "0")}:${String(
        Number(match[1])
      ).padStart(2, "0")}`;
    }
    function baseSettings(base, fallback) {
      return isRecord3(base) ? base : fallback;
    }
    function sameDraft(left, right) {
      return Object.keys(left).every(
        (key) => Object.is(left[key], right[key])
      );
    }
    function isRecord3(value) {
      return typeof value === "object" && value !== null && !Array.isArray(value);
    }
    function installStyles() {
      const tag = document.createElement("style");
      tag.dataset.pluginCss = "@agentscope-ai/reme-dsh-plugin/settings";
      tag.textContent = styles;
      document.head.appendChild(tag);
      return () => tag.remove();
    }
    
    return module.exports;
  }
});
