export { name, apply } from './dsh-adapter/plugin-host.js';
export type { TuiPluginHost, HostGrantFacade } from './dsh-adapter/plugin-host.js';
export type { BackendAdmissionProbe } from './dsh-adapter/backend-registry.js';
export type { HostContract, HostDescriptor, ContractCoordinate, ContractRef, NegotiationDecision, PermissionEntry, PermissionRegistry } from './adapter/standard/types.js';
export type { TuiPluginStorage, PluginStorageErrorCode, TuiPluginStorageRuntime } from './dsh-adapter/plugin-storage.js';
export { PluginStorageError, STORAGE_KEY_MAX_LENGTH, STORAGE_MAX_BYTES, STORAGE_MAX_KEYS } from './dsh-adapter/plugin-storage.js';
export { OBSERVE_CALLBACK_QUEUE_LIMIT, OBSERVE_CALLBACK_TIMEOUT_MS, OBSERVE_CONTENT_MAX_CHARS, OBSERVE_ID_MAX_CHARS, OBSERVE_IMAGE_BASE64_MAX_CHARS, OBSERVE_IMAGE_MAX_BYTES, OBSERVE_SCOPE_MAX_CHARS, OBSERVE_SUMMARY_CELLS, } from './dsh-adapter/message-observer.js';
export type { MessagesObserveContentBlock, MessagesObserveEnvelope, MessagesObserveListener, MessagesObservePayload, TuiMessageObserverRuntime, } from './dsh-adapter/message-observer.js';
export type { LedgerEntry, LedgerOperation, LedgerResult, TuiEffectLedgerRuntime } from './dsh-adapter/effect-ledger.js';
export { COMMAND_ERROR_CODES, hasCommandErrorCode, mapCommandError, withCommandErrorMapping, } from './dsh-adapter/command-errors.js';
export type { CommandErrorCode, CodedCommandError } from './dsh-adapter/command-errors.js';
export { DECISION_EVENT_PERMISSIONS, } from './dsh-adapter/decision-guard.js';
export { DECISION_HANDLER_TIMEOUT_MS, DECISION_TOTAL_TIMEOUT_MS, } from './dsh-adapter/extension-events.js';
export { DECISION_EVENTS_COORDINATE, TUI_EXTENSION_API_VERSION, TUI_DECISION_EVENT_NAMES, TUI_EXTENSION_PERMISSION_NAMES, } from './adapter/standard/tui-extension.js';
//# sourceMappingURL=plugin-host.d.ts.map