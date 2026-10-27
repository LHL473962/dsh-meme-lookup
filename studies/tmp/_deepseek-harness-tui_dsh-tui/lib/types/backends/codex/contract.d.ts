/**
 * Version contract of the Codex backend (docs/codex-backend-design.md D3).
 * There is no npm dependency: the backend drives the user's own `codex`
 * binary over `codex app-server`, and the protocol types under
 * `protocol/generated/` are that binary's generator output, vendored by
 * `scripts/codex-protocol-sync.mjs`. `verify:codex-contract` checks the
 * digest below against the tree and every protocol name the backend handles
 * against the generated unions.
 *
 * Version policy: a binary on the same minor line as a validated version and
 * not older than it is compatible (`0.160.x` ≥ `0.160.1`); anything else on
 * or above {@link MIN_CODEX_VERSION} runs with a drift notice; below it the
 * backend reports itself not installed, with an upgrade hint.
 */
/** Backend id of the Codex backend (`AgentSessionRef.backendId`). */
export declare const CODEX_BACKEND_ID = "codex";
/** User-facing backend name. */
export declare const CODEX_BACKEND_LABEL = "Codex";
/** How a user re-enters a Codex thread from a shell. */
export declare function codexResumeCommand(threadId: string): string;
/** The `codex-cli` versions the backend is validated against. */
export declare const VALIDATED_CODEX_VERSIONS: readonly string[];
/**
 * The oldest `codex-cli` the backend starts on (C0 V16): 0.144.0's generated
 * protocol carries every method, notification, server request and item type
 * this backend uses, and its handshake / thread start / model list were
 * observed working. Anything below the validated line still runs with a
 * drift notice.
 */
export declare const MIN_CODEX_VERSION = "0.144.0";
/** Oldest verified server for `thread/fork.beforeTurnId`; older servers can
 *  silently ignore the field and fork the entire conversation. */
export declare const MIN_CODEX_BEFORE_TURN_FORK_VERSION = "0.160.1";
/** The `codex-cli` version `protocol/generated/` was generated from. */
export declare const PROTOCOL_VERSION = "0.160.1";
/** Digest of `protocol/generated/` (scripts/lib/codex-protocol-digest.mjs). */
export declare const PROTOCOL_DIGEST = "sha256:3843848c108242f7364b986c80fefd6cd37aec4ab2863b0e2b6fb7bc86feb6f7";
/** `X.Y.Z` (with an optional pre-release tail) from `codex --version`
 *  output (`codex-cli 0.160.1`), else undefined. */
export declare function parseCodexVersion(text: string): string | undefined;
/** Compare two versions by their numeric triple (pre-release tails ignored);
 *  undefined when either does not parse. */
export declare function compareCodexVersions(a: string, b: string): number | undefined;
/** Whether a version is at least {@link MIN_CODEX_VERSION} (an unreadable
 *  version is given the benefit of the doubt: drift, never a refusal). */
export declare function codexVersionSupported(version: string | undefined): boolean;
/** The version when it is outside the validated range, else undefined. */
export declare function codexVersionDrift(version: string | undefined): string | undefined;
//# sourceMappingURL=contract.d.ts.map