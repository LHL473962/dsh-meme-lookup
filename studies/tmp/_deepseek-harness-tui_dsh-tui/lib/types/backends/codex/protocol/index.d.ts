export type { ClientInfo } from './generated/ClientInfo.js';
export type { ClientNotification } from './generated/ClientNotification.js';
export type { ClientRequest } from './generated/ClientRequest.js';
export type { InitializeCapabilities } from './generated/InitializeCapabilities.js';
export type { InitializeParams } from './generated/InitializeParams.js';
export type { InitializeResponse } from './generated/InitializeResponse.js';
export type { RequestId } from './generated/RequestId.js';
export type { ServerNotification } from './generated/ServerNotification.js';
export type { ServerRequest } from './generated/ServerRequest.js';
export type { AccountRateLimitsUpdatedNotification } from './generated/v2/AccountRateLimitsUpdatedNotification.js';
export type { CommandAction } from './generated/v2/CommandAction.js';
export type { CommandExecutionApprovalDecision } from './generated/v2/CommandExecutionApprovalDecision.js';
export type { CommandExecutionRequestApprovalParams } from './generated/v2/CommandExecutionRequestApprovalParams.js';
export type { CommandExecutionRequestApprovalResponse } from './generated/v2/CommandExecutionRequestApprovalResponse.js';
export type { ErrorNotification } from './generated/v2/ErrorNotification.js';
export type { FileChangeApprovalDecision } from './generated/v2/FileChangeApprovalDecision.js';
export type { FileChangeRequestApprovalParams } from './generated/v2/FileChangeRequestApprovalParams.js';
export type { FileChangeRequestApprovalResponse } from './generated/v2/FileChangeRequestApprovalResponse.js';
export type { FileUpdateChange } from './generated/v2/FileUpdateChange.js';
export type { PermissionsRequestApprovalParams } from './generated/v2/PermissionsRequestApprovalParams.js';
export type { PermissionsRequestApprovalResponse } from './generated/v2/PermissionsRequestApprovalResponse.js';
export type { ThreadItem } from './generated/v2/ThreadItem.js';
export type { ThreadResumeParams } from './generated/v2/ThreadResumeParams.js';
export type { ThreadResumeResponse } from './generated/v2/ThreadResumeResponse.js';
export type { ThreadStartParams } from './generated/v2/ThreadStartParams.js';
export type { ThreadStartResponse } from './generated/v2/ThreadStartResponse.js';
export type { ThreadTokenUsageUpdatedNotification } from './generated/v2/ThreadTokenUsageUpdatedNotification.js';
export type { ThreadTurnsListParams } from './generated/v2/ThreadTurnsListParams.js';
export type { ThreadTurnsListResponse } from './generated/v2/ThreadTurnsListResponse.js';
export type { ToolRequestUserInputParams } from './generated/v2/ToolRequestUserInputParams.js';
export type { ToolRequestUserInputResponse } from './generated/v2/ToolRequestUserInputResponse.js';
export type { Turn } from './generated/v2/Turn.js';
export type { TurnInterruptParams } from './generated/v2/TurnInterruptParams.js';
export type { TurnStartParams } from './generated/v2/TurnStartParams.js';
export type { TurnStartResponse } from './generated/v2/TurnStartResponse.js';
export type { TurnSteerParams } from './generated/v2/TurnSteerParams.js';
export type { TurnSteerResponse } from './generated/v2/TurnSteerResponse.js';
export type { UserInput } from './generated/v2/UserInput.js';
/** Client → server requests and notifications the backend sends. */
export declare const CLIENT: {
    readonly initialize: "initialize";
    readonly initialized: "initialized";
    readonly threadStart: "thread/start";
    readonly threadResume: "thread/resume";
    readonly threadFork: "thread/fork";
    readonly threadUnsubscribe: "thread/unsubscribe";
    readonly threadList: "thread/list";
    readonly threadLoadedList: "thread/loaded/list";
    readonly threadRead: "thread/read";
    readonly threadTurnsList: "thread/turns/list";
    readonly threadNameSet: "thread/name/set";
    readonly threadArchive: "thread/archive";
    readonly threadCompactStart: "thread/compact/start";
    readonly threadSettingsUpdate: "thread/settings/update";
    readonly turnStart: "turn/start";
    readonly turnSteer: "turn/steer";
    readonly turnInterrupt: "turn/interrupt";
    readonly modelList: "model/list";
    readonly collaborationModeList: "collaborationMode/list";
    readonly permissionProfileList: "permissionProfile/list";
    readonly reviewStart: "review/start";
    readonly skillsList: "skills/list";
    readonly mcpServerStatusList: "mcpServerStatus/list";
    readonly mcpServerReload: "config/mcpServer/reload";
    readonly accountRateLimitsRead: "account/rateLimits/read";
    readonly gitDiffToRemote: "gitDiffToRemote";
    readonly threadGoalGet: "thread/goal/get";
    readonly threadGoalSet: "thread/goal/set";
    readonly threadGoalClear: "thread/goal/clear";
    readonly backgroundTerminalsList: "thread/backgroundTerminals/list";
    readonly backgroundTerminalsTerminate: "thread/backgroundTerminals/terminate";
    readonly configRead: "config/read";
    readonly accountRead: "account/read";
    readonly accountLoginStart: "account/login/start";
    readonly accountLoginCancel: "account/login/cancel";
};
/** Server notifications the backend reads. */
export declare const NOTIFY: {
    readonly error: "error";
    readonly threadStarted: "thread/started";
    readonly threadStatusChanged: "thread/status/changed";
    readonly threadArchived: "thread/archived";
    readonly threadDeleted: "thread/deleted";
    readonly threadClosed: "thread/closed";
    readonly threadNameUpdated: "thread/name/updated";
    readonly threadSettingsUpdated: "thread/settings/updated";
    readonly threadTokenUsageUpdated: "thread/tokenUsage/updated";
    readonly threadCompacted: "thread/compacted";
    readonly threadGoalUpdated: "thread/goal/updated";
    readonly threadGoalCleared: "thread/goal/cleared";
    readonly turnStarted: "turn/started";
    readonly turnCompleted: "turn/completed";
    readonly turnDiffUpdated: "turn/diff/updated";
    readonly turnPlanUpdated: "turn/plan/updated";
    readonly hookStarted: "hook/started";
    readonly hookCompleted: "hook/completed";
    readonly itemStarted: "item/started";
    readonly itemCompleted: "item/completed";
    readonly agentMessageDelta: "item/agentMessage/delta";
    readonly planDelta: "item/plan/delta";
    readonly reasoningSummaryTextDelta: "item/reasoning/summaryTextDelta";
    readonly reasoningSummaryPartAdded: "item/reasoning/summaryPartAdded";
    readonly reasoningTextDelta: "item/reasoning/textDelta";
    readonly commandOutputDelta: "item/commandExecution/outputDelta";
    readonly terminalInteraction: "item/commandExecution/terminalInteraction";
    readonly mcpToolCallProgress: "item/mcpToolCall/progress";
    readonly serverRequestResolved: "serverRequest/resolved";
    readonly autoApprovalReviewStarted: "item/autoApprovalReview/started";
    readonly autoApprovalReviewCompleted: "item/autoApprovalReview/completed";
    readonly strictReviewRequired: "autoApprovalReview/strictReviewRequired";
    readonly accountRateLimitsUpdated: "account/rateLimits/updated";
    readonly accountUpdated: "account/updated";
    readonly accountLoginCompleted: "account/login/completed";
    readonly mcpServerStartupStatusUpdated: "mcpServer/startupStatus/updated";
    readonly skillsChanged: "skills/changed";
    readonly modelRerouted: "model/rerouted";
    readonly modelVerification: "model/verification";
    readonly warning: "warning";
    readonly guardianWarning: "guardianWarning";
    readonly configWarning: "configWarning";
    readonly deprecationNotice: "deprecationNotice";
};
/** Server → client requests the backend answers. */
export declare const SERVER_REQUEST: {
    readonly commandApproval: "item/commandExecution/requestApproval";
    readonly fileChangeApproval: "item/fileChange/requestApproval";
    readonly permissionsApproval: "item/permissions/requestApproval";
    readonly userInput: "item/tool/requestUserInput";
    readonly elicitation: "mcpServer/elicitation/request";
    readonly dynamicToolCall: "item/tool/call";
    readonly chatgptAuthTokensRefresh: "account/chatgptAuthTokens/refresh";
    readonly attestation: "attestation/generate";
    readonly currentTime: "currentTime/read";
    readonly legacyApplyPatchApproval: "applyPatchApproval";
    readonly legacyExecCommandApproval: "execCommandApproval";
};
/**
 * High-rate notifications the backend never reads, suppressed at
 * `initialize` (`optOutNotificationMethods`): raw response items, file
 * watches, realtime, fuzzy search, external-agent import, the app list.
 */
export declare const OPT_OUT_NOTIFICATIONS: readonly ["rawResponseItem/completed", "rawResponse/completed", "fs/changed", "thread/realtime/started", "thread/realtime/itemAdded", "thread/realtime/item/started", "thread/realtime/item/transcript/delta", "thread/realtime/item/completed", "thread/realtime/transcript/delta", "thread/realtime/transcript/done", "thread/realtime/outputAudio/delta", "thread/realtime/sdp", "thread/realtime/error", "thread/realtime/closed", "fuzzyFileSearch/sessionUpdated", "fuzzyFileSearch/sessionCompleted", "externalAgentConfig/import/progress", "externalAgentConfig/import/completed", "app/list/updated"];
/** Every name in the tables above (the contract gate's input). */
export declare const PROTOCOL_NAMES: {
    readonly client: ("turn/start" | "initialized" | "initialize" | "thread/start" | "thread/resume" | "thread/fork" | "thread/archive" | "thread/unsubscribe" | "thread/name/set" | "thread/goal/set" | "thread/goal/get" | "thread/goal/clear" | "thread/settings/update" | "thread/compact/start" | "thread/backgroundTerminals/list" | "thread/backgroundTerminals/terminate" | "thread/list" | "thread/loaded/list" | "thread/read" | "thread/turns/list" | "skills/list" | "turn/steer" | "turn/interrupt" | "review/start" | "model/list" | "permissionProfile/list" | "collaborationMode/list" | "config/mcpServer/reload" | "mcpServerStatus/list" | "account/login/start" | "account/login/cancel" | "account/rateLimits/read" | "config/read" | "account/read" | "gitDiffToRemote")[];
    readonly notifications: readonly [...("error" | "warning" | "thread/started" | "thread/status/changed" | "thread/archived" | "thread/deleted" | "thread/closed" | "skills/changed" | "thread/name/updated" | "thread/goal/updated" | "thread/goal/cleared" | "thread/settings/updated" | "thread/tokenUsage/updated" | "turn/started" | "hook/started" | "turn/completed" | "hook/completed" | "turn/diff/updated" | "turn/plan/updated" | "item/started" | "item/autoApprovalReview/started" | "item/autoApprovalReview/completed" | "autoApprovalReview/strictReviewRequired" | "item/completed" | "item/agentMessage/delta" | "item/plan/delta" | "item/commandExecution/outputDelta" | "item/commandExecution/terminalInteraction" | "serverRequest/resolved" | "item/mcpToolCall/progress" | "mcpServer/startupStatus/updated" | "account/updated" | "account/rateLimits/updated" | "item/reasoning/summaryTextDelta" | "item/reasoning/summaryPartAdded" | "item/reasoning/textDelta" | "thread/compacted" | "model/rerouted" | "model/verification" | "guardianWarning" | "deprecationNotice" | "configWarning" | "account/login/completed")[], "rawResponseItem/completed", "rawResponse/completed", "fs/changed", "thread/realtime/started", "thread/realtime/itemAdded", "thread/realtime/item/started", "thread/realtime/item/transcript/delta", "thread/realtime/item/completed", "thread/realtime/transcript/delta", "thread/realtime/transcript/done", "thread/realtime/outputAudio/delta", "thread/realtime/sdp", "thread/realtime/error", "thread/realtime/closed", "fuzzyFileSearch/sessionUpdated", "fuzzyFileSearch/sessionCompleted", "externalAgentConfig/import/progress", "externalAgentConfig/import/completed", "app/list/updated"];
    readonly serverRequests: ("item/commandExecution/requestApproval" | "item/fileChange/requestApproval" | "item/tool/requestUserInput" | "mcpServer/elicitation/request" | "item/permissions/requestApproval" | "item/tool/call" | "account/chatgptAuthTokens/refresh" | "attestation/generate" | "currentTime/read" | "applyPatchApproval" | "execCommandApproval")[];
};
//# sourceMappingURL=index.d.ts.map