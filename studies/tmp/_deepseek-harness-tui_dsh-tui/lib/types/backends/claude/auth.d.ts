/**
 * Claude credentials for the CLI child: which credential the session runs
 * on, and the child environment that selects it.
 *
 * Precedence:
 *  (a) the dsh-auth `anthropic` subscription login (the TUI's own `/login`) →
 *      `CLAUDE_CODE_OAUTH_TOKEN=<access>`, refreshed before spawn when it is
 *      about to expire. `ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` are
 *      then removed from the child environment: the CLI ranks them above an
 *      OAuth token, and a stale key in the shell would silently win;
 *  (b) the user's own environment (`ANTHROPIC_API_KEY` /
 *      `ANTHROPIC_AUTH_TOKEN` / `CLAUDE_CODE_OAUTH_TOKEN`, or a cloud
 *      provider's `CLAUDE_CODE_USE_<PROVIDER>` flag), passed through;
 *  (c) nothing injected: the CLI finds the local `claude login`.
 *
 * (a) applies only on the first-party route (`claudeRouteOf`). A custom
 * `ANTHROPIC_BASE_URL` / `CLAUDE_CODE_API_BASE_URL`, a Unix socket, a cloud or
 * gateway route, a custom OAuth endpoint, an `apiKeyHelper`, a managed
 * `policyHelper` or unreadable settings leave the environment untouched and
 * the token unread: the CLI would send the claude.ai token to that host. The
 * route is read from every place the CLI takes its environment from: the
 * process environment, every global config file it may pick
 * (`<config>/.config.json`, `.claude.json`, `.claude-custom-oauth.json`; one
 * that is not first-party or cannot be read fails closed), and the settings'
 * `env`. `<config>` is the CLI's own `CLAUDE_CONFIG_DIR` (exact case on POSIX,
 * any case on Windows; spellings that disagree fail closed). Other names
 * match case-insensitively (Windows semantics): a broader match only ever
 * fails closed.
 *
 * When the token IS injected the route is also pinned: the flag-settings
 * layer (the SDK `settings` option, the highest user-controlled tier) sets
 * `ANTHROPIC_BASE_URL` to the first-party origin and blanks the other
 * routing variables, and the child environment drops them, so a source the
 * gate missed still cannot send the token elsewhere
 * (scripts/probes/claude-auth-pin-probe.mjs checks this offline).
 *
 * An active channel profile pins its connection the same way. The CLI
 * applies a settings file's `env` over the environment it inherited, so a
 * channel that carries the credential names all three credential keys in the
 * flag layer: its own token as `ANTHROPIC_AUTH_TOKEN` and an empty string for
 * the others (an empty flag-tier value suppresses what user settings still
 * hold), plus the routing blanks; the child environment loses the
 * conflicting spellings. A custom endpoint with no credential is refused
 * before the spawn (no anonymous relay request, no ambient identity riding
 * the channel endpoint), and so is an `apiKeyHelper` in readable settings.
 *
 * The managed (policy) tier outranks the flag tier and the SDK's
 * `managedSettings` cannot carry `env`, so the pin does not cover it: the
 * gate reads the on-disk policy tier when the session opens and fails closed
 * on a non-first-party route there. Managed settings that change the route
 * while a session runs are only seen at the next spawn.
 *
 * The host supplies the dsh-auth credential through `ClaudeCredentialSource`
 * (the backend never reads the credential file or runs an OAuth flow
 * itself). Token material never reaches a log, notice, trace or event: this
 * module only puts it into the child environment (and the flag settings) it
 * returns.
 */
import type { OAuthCredentialSource } from '../../agent/backend.js';
/** The dsh-auth provider id whose login this backend uses. */
export declare const CLAUDE_OAUTH_PROVIDER = "anthropic";
/** Where the session's credential comes from. */
export type ClaudeAuthSource = 'dsh-auth' | 'api-key' | 'auth-token' | 'oauth-env' | 'cloud' | 'claude-login';
/**
 * Where the CLI sends its API traffic, as far as this module can tell. The
 * dsh-auth subscription token is a claude.ai credential: it is only ever
 * injected for the first-party Anthropic API. Every other route — a custom
 * `ANTHROPIC_BASE_URL` (an LLM gateway, a third-party Anthropic-compatible
 * API), a Unix socket, a cloud provider, a Cloud gateway sign-in, an
 * `apiKeyHelper`, or settings that cannot be read — gets the environment
 * untouched (fail closed: a token sent to the wrong host is a leak).
 */
export type ClaudeRoute = {
    readonly kind: 'first-party';
} | {
    readonly kind: 'cloud';
    readonly provider: string;
} | {
    readonly kind: 'custom-endpoint';
    readonly host: string;
}
/** `CLAUDE_CODE_CUSTOM_OAUTH_URL` (a custom OAuth deployment). */
 | {
    readonly kind: 'custom-oauth';
} | {
    readonly kind: 'unix-socket';
} | {
    readonly kind: 'gateway';
} | {
    readonly kind: 'api-key-helper';
} | {
    readonly kind: 'settings-unreadable';
};
/** What the spawn uses: the source and the full child environment. */
export interface ClaudeAuthPlan {
    readonly source: ClaudeAuthSource;
    /** The cloud provider when `source === 'cloud'` (lower case, as named by
     *  its `CLAUDE_CODE_USE_<PROVIDER>` flag). */
    readonly cloud?: string;
    /** The route the CLI runs on; absent = first-party (or not determined). */
    readonly route?: ClaudeRoute;
    /** dsh-auth: when the injected token expires (epoch ms). */
    readonly expiresAt?: number;
    readonly env: Record<string, string>;
    /**
     * The flag-settings layer (the SDK `settings` option, passed as a private
     * file: flag-settings.ts): the first-party route pin of an injected
     * dsh-auth token, or an active channel's connection; absent otherwise.
     */
    readonly settings?: {
        readonly env: Readonly<Record<string, string>>;
    };
}
/**
 * The active channel profile's connection (channels.ts), resolved for one
 * spawn: the endpoint, the token (already read from the credential store)
 * and the channel-private env. The spawn env carries it and the flag layer
 * restates it, so a settings-file env (cc-switch's `ANTHROPIC_BASE_URL`, an
 * old token) cannot override it. A profile with neither endpoint nor token
 * (a model mapping with private env) pins no credential.
 */
export interface ClaudeChannelConnectionInput {
    readonly baseUrl?: string;
    readonly token?: string;
    readonly env?: Readonly<Record<string, string>>;
}
/** The settings slice the route depends on (`resolveSettings().effective`). */
export interface ClaudeRouteSettings {
    readonly env?: Readonly<Record<string, unknown>>;
    readonly apiKeyHelper?: unknown;
    readonly forceLoginMethod?: unknown;
    readonly forceLoginGatewayUrl?: unknown;
    /** A managed policy subprocess that may inject settings (and `env`) the
     *  resolver cannot see: the route is then unknown. */
    readonly policyHelper?: unknown;
}
/**
 * The global config files' `env` (see {@link claudeGlobalConfigPaths}): one
 * `env` per existing file (or a single one); none → undefined / `[]`; any file
 * that exists but cannot be read or parsed, or a config directory the CLI's
 * choice of cannot be established → `'unreadable'` (the route is then
 * unknown: fail closed).
 */
export type ClaudeGlobalConfigReader = () => Readonly<Record<string, unknown>> | readonly Readonly<Record<string, unknown>>[] | 'unreadable' | undefined;
/** Reads the effective user/project/local settings (the CLI applies their
 *  `env`); a rejection means the route cannot be determined. */
export type ClaudeSettingsReader = () => Promise<ClaudeRouteSettings | undefined>;
/**
 * The provider a truthy `CLAUDE_CODE_USE_<X>` routing flag selects, if any
 * (BEDROCK, VERTEX, FOUNDRY, ANTHROPIC_AWS, ANTHROPIC_GOOGLE_CLOUD, MANTLE,
 * GATEWAY, and any future one: the prefix is matched generically).
 */
export declare function cloudProviderOf(env: Readonly<Record<string, unknown>>): string | undefined;
/** The origin host of a configured URL (never its path, query or userinfo). */
export declare function originHost(value: string): string;
/**
 * The route one environment selects. `sources` are checked one by one (the
 * process environment, the global config `env`, the settings `env`): a
 * non-first-party value in any wins, whichever the CLI would let override
 * the others. Names match case-insensitively (see {@link valuesOf}).
 */
export declare function claudeRouteOf(sources: readonly Readonly<Record<string, unknown>>[], settings: ClaudeRouteSettings): ClaudeRoute;
/**
 * The CLI's config directory variable as the CLI itself reads it: the exact
 * name `CLAUDE_CONFIG_DIR` on POSIX (environment names are case-sensitive
 * there), any spelling on Windows. `'conflict'` when another spelling names a
 * different directory than the one the CLI uses (the gate cannot know which
 * files the CLI reads: fail closed).
 */
export declare function claudeConfigDirOf(env: Readonly<Record<string, unknown>>, platform?: NodeJS.Platform): string | undefined | 'conflict';
/**
 * Every global config file the CLI may read its `env` from: `.config.json`
 * in the config directory (it wins when it exists), and `.claude.json` /
 * `.claude-custom-oauth.json` in `CLAUDE_CONFIG_DIR`, else the home
 * directory. The gate reads them all (any one may be the file in effect).
 */
export declare function claudeGlobalConfigPaths(env: Readonly<Record<string, unknown>>, platform?: NodeJS.Platform): string[] | 'conflict';
/** Read every global config file's `env` from disk (see {@link ClaudeGlobalConfigReader}). */
export declare function fileGlobalConfigReader(env: Readonly<Record<string, unknown>>, platform?: NodeJS.Platform): ClaudeGlobalConfigReader;
/**
 * The credential plan for one spawn. The dsh-auth login is injected only
 * when the effective route is the first-party Anthropic API (see
 * {@link ClaudeRoute}); any other route keeps the environment exactly as it
 * is. Then the environment's own credentials, then the local login. A
 * failing dsh-auth refresh propagates: starting on a token known to be dead
 * would only fail later with a worse message.
 */
export declare function resolveClaudeAuth(base: Record<string, string>, credentials: OAuthCredentialSource | undefined, options?: {
    /** The effective Claude settings; absent = the route is unknown, and no
     *  token is injected (fail closed). */
    readonly settings?: ClaudeSettingsReader;
    /** The global config's `env` (default: read from disk for `base`). */
    readonly globalConfig?: ClaudeGlobalConfigReader;
    /** The access token the CLI just refused (a reconnect): refresh unless
     *  dsh-auth already holds a different one. */
    readonly rejected?: string;
    /** The active channel profile's connection. When it shapes the spawn,
     *  the dsh-auth login is never injected alongside it, the environment's
     *  conflicting spellings are replaced and the flag layer restates the
     *  connection. */
    readonly channel?: ClaudeChannelConnectionInput;
}): Promise<ClaudeAuthPlan>;
/**
 * A channel connection the session must not run on: thrown to refuse the
 * start (or the reconnect). The message is the user-facing sentence (what
 * conflicts, where to fix it), never a credential value; callers do not
 * fall back to ambient credentials or an anonymous request.
 */
export declare class ClaudeChannelConflictError extends Error {
    constructor(message: string);
}
/**
 * Whether an active channel names a non-first-party endpoint without any
 * credential of its own (no token, no credential key in its `env`). Such a
 * spawn is refused: the relay request would go out anonymous at best, at
 * worst carrying a local login or helper identity the user never chose for
 * that host. A profile that really wants a tokenless gateway says so with a
 * credential key in its `env`.
 */
export declare function channelMissingCredential(channel: ClaudeChannelConnectionInput): boolean;
/**
 * A credential refresh failure as the user sees it: a fixed sentence with at
 * most the HTTP status (an OAuth endpoint's error body can echo request
 * material, so the error's own text is never logged — see
 * {@link refreshFailureDebugDetail}).
 */
export declare function refreshFailureStatus(error: unknown): string | undefined;
/**
 * The debug-log detail of a failed credential refresh: a fixed failure
 * category plus at most the HTTP status ({@link refreshFailureStatus}).
 * The error's own text — a real refresh rejection carries the OAuth
 * endpoint's response body, which can echo request material — never
 * reaches a log, notice, trace or event (the module contract above).
 */
export declare function refreshFailureDebugDetail(error: unknown): string;
/** Whether one SDK message says the credential was refused. */
export declare function isAuthFailure(message: unknown): boolean;
/**
 * Whether a credential is available without spawning the CLI (`detect()`):
 * a stored dsh-auth login, an Anthropic or cloud credential in the
 * environment, or the CLI's own credentials file. On macOS the CLI keeps its
 * login in the keychain, which cannot be read here: `unknown`, not `missing`.
 */
export declare function detectClaudeAuth(env: Readonly<Record<string, string | undefined>>, credentials: OAuthCredentialSource | undefined, platform?: NodeJS.Platform): Promise<'ok' | 'missing' | 'unknown'>;
//# sourceMappingURL=auth.d.ts.map