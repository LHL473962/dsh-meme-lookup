/**
 * Startup-warning filter for the Claude Agent SDK (a deliberate-integration
 * note, not a bug): this profile pre-approves the todo-panel tool family
 * additively via `allowedTools` (see options.ts) and can start a session in
 * the remembered `bypassPermissions` mode. In both cases the SDK calls
 * `process.emitWarning(msg, { code: 'CLAUDE_SDK_CAN_USE_TOOL_SHADOWED' })`
 * to say canUseTool is shadowed for those calls. That choice is ours and
 * intentional — the per-boot stderr warning only alarms the user (it reads
 * like a defect, and it surfaced verbatim in a user crash report).
 *
 * Suppression mechanism, chosen from a probed Node 24 fact: the default
 * warning printer is itself a `warning` listener (listenerCount is >= 1 on a
 * bare boot) and keeps printing even when user listeners are added, so
 * listening cannot filter. The one reliable lever is not emitting the
 * warning at all: wrap `process.emitWarning` and drop exactly that code,
 * forwarding everything else to the original untouched (node keeps its own
 * native formatting for passthrough warnings).
 *
 * @module dsh-tui/backends/claude/sdk-warnings
 */
/** Whether one warning code is the SDK's canUseTool-shadow notice. */
export declare function isSuppressedSdkWarningCode(code: string | undefined): boolean;
//# sourceMappingURL=sdk-warnings.d.ts.map