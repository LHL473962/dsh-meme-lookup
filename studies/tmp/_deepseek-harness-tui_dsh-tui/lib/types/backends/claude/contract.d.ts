/**
 * Version contract of the Claude backend.
 * The SDK is pinned exactly (`package.json` optional peer + dev dependency);
 * the CLI it drives is validated per version read from
 * `system/init.claude_code_version`. Drift is reported (startup notice and a
 * `/doctor` line), never a hard stop: capability detection
 * (`init.capabilities`) decides behaviour, the version only explains it.
 */
/** Backend id of the Claude Agent backend (`AgentSessionRef.backendId`). */
export declare const CLAUDE_BACKEND_ID = "claude";
/** User-facing backend name. Brand guidance allows "Claude Agent", never
 *  "Claude Code". */
export declare const CLAUDE_BACKEND_LABEL = "Claude Agent";
/** How a user re-enters a Claude session from a shell: the launcher's
 *  backend flag plus the session id (DSH's `resume.txt` never holds one). */
export declare function claudeResumeCommand(sessionId: string): string;
/** The exact `@anthropic-ai/claude-agent-sdk` version this backend is
 *  validated against (mirrors the package.json pin). */
export declare const VALIDATED_SDK_VERSION = "0.3.287";
/** What the picker's install wizard adds, at that pin. Lives here rather than
 *  in install.ts because the backend's manifest declares it, and a manifest may
 *  import nothing but this import-free module (P0 D3 / §4.4). */
export declare const CLAUDE_SDK_SPECIFIER = "@anthropic-ai/claude-agent-sdk@0.3.287";
/** CLI versions validated with {@link VALIDATED_SDK_VERSION} (the SDK's own
 *  `manifest.json` parity version). */
export declare const VALIDATED_CLI_VERSIONS: readonly string[];
/** Init capabilities this backend relies on when present (feature-detected,
 *  never version-sniffed). */
export declare const CLI_CAPABILITY: {
    /** `command_lifecycle` frames: user rows land on `started`. */
    readonly lifecycle: "msg_lifecycle_v1";
    /** `interrupt()` answers with `still_queued`. */
    readonly interruptReceipt: "interrupt_receipt_v1";
    /** `interrupt` honours `cancel_queued` (drop queued inputs with the turn). */
    readonly interruptCancelQueued: "interrupt_cancel_queued_v1";
};
/** The CLI version when it is outside the validated set, else undefined. */
export declare function cliVersionDrift(version: string | undefined): string | undefined;
/** The SDK version when it differs from the pin, else undefined. */
export declare function sdkVersionDrift(version: string | undefined): string | undefined;
//# sourceMappingURL=contract.d.ts.map