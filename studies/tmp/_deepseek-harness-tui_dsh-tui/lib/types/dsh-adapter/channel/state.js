import { normalizeJobGroupFold, normalizePageMargin, normalizeScrollGutter, normalizeStatusBar, normalizeToolBackground } from '../../tuiDisplayPrefs.js';
import { normalizeActivityPreset } from '../../components/activityFrames.js';
import { normalizeSplashFont } from '../../components/splashFonts.js';
import { normalizeBrandSetting } from '../../branding.js';
/** The DSH backend's user-facing name (capability snapshot default). */
export const DSH_BACKEND_LABEL = 'DSH';
/**
 * A startup open that failed for a reason `/new` cannot fix (the in-process
 * DSH kernel's composition failed: there is no DSH to open a session on).
 * Its `hint` replaces the failure row's `/new` hint (`startup-open-failed-hint`).
 */
export class StartupOpenError extends Error {
    hint;
    constructor(message, hint, options) {
        super(message, options);
        this.hint = hint;
        this.name = 'StartupOpenError';
    }
}
/**
 * Neutral observable fields only. Behaviour is assembled explicitly by the
 * composition root after each specialist owner exists, so this factory cannot
 * acquire services, subscribe, or create a second authority bag.
 */
export function createInitialChannelView(options, input) {
    return {
        effortLevels: undefined, version: 0, ready: options.startup === undefined, startupFailure: undefined, rows: [], selection: undefined, status: 'starting', sessionTitle: '', sessionColor: '',
        agentId: input.agentId, sessionId: input.sessionId, agentBindingGeneration: 0, model: options.model, modelDisplay: undefined, provider: options.provider,
        tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, peak: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, idle: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } },
        cwd: options.cwd, displayCwd: input.cwdDescription, workingDirectory: undefined, gitBranch: undefined, working: false,
        compaction: undefined,
        cancelPending: false, spinnerMode: 'requesting', responseChars: 0, activeToolCount: 0,
        turnStart: 0, lastUserText: '', notifications: [], contextWindow: undefined,
        reasoningEffort: options.effort, mode: input.mode, modeIndex: 0,
        activityFrames: normalizeActivityPreset(options.activityFrames), configuredProvider: options.configuredProvider,
        configuredModel: options.configuredModel, configuredPreset: options.configuredPreset,
        configuredActivityFrames: options.configuredActivityFrames, configuredLang: options.configuredLang,
        diffLayout: options.diffLayout ?? 'auto', thinkingFold: options.thinkingFold ?? 'preview',
        jobGroupFold: normalizeJobGroupFold(options.jobGroupFold),
        toolBackground: normalizeToolBackground(options.toolBackground), scrollGutter: normalizeScrollGutter(options.scrollGutter),
        pageMargin: normalizePageMargin(options.pageMargin), foldTerminalCommand: options.foldTerminalCommand === true,
        turnUsageRow: options.turnUsageRow === true,
        promptSessionLabel: options.promptSessionLabel === true, expandEditor: options.expandEditor !== false,
        smoothStreaming: options.smoothStreaming !== false, statusBar: normalizeStatusBar(options.statusBar),
        whale: options.whale !== false, whaleIdle: options.whaleIdle !== false, whaleGirl: options.whaleGirl === true, splashFont: normalizeSplashFont(options.splashFont), brand: normalizeBrandSetting(options.brand), minimalUi: options.minimalUi === true, activityEnabled: options.activity !== false,
        contextBarEnabled: options.contextBar !== false, agentPreset: options.agentPreset, goal: undefined,
        todos: [], loadedContext: undefined, pending: [], commandList: [], lastUsage: undefined, turnUsage: undefined, turnOutcome: undefined,
        tps: undefined, tpsSamples: [], contextSegments: { system: 0, prompt: 0, assistant: 0, thinking: 0, tools: 0 },
        // 费用估算输入：主会话按模型分桶 + 子代理快照。与 tokens 并行累计，
        // tokens 的既有语义/显示不变（DESIGN D2）。
        mainCost: {}, subagentCost: [],
        subagents: [], backgroundJobs: [],
    };
}
