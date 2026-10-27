import type { ProviderSetupHost, OAuthSetupHost } from '../adapter/ports/channel-settings.js';
export type { ProviderSetupHost, CatalogProviderCandidate, ConfiguredProvider, ProfilePathOp, OAuthSetupHost, OAuthProviderStatus, OAuthLoginResult } from '../adapter/ports/channel-settings.js';
import { type AskUserQuestionAnswer, type AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions';
import type { LlmDiscoveredModel } from '../adapter/ports/channel-view.js';
/** Route id rule shared with the dsh configuration surface (web Models page). */
export declare const PROVIDER_ROUTE_ID: RegExp;
/** Wire protocols dsh-llm-pi-ai can serve on a manually declared route. */
export declare const PROVIDER_PROTOCOLS: readonly ["openai-completions", "openai-responses", "anthropic-messages"];
/**
 * Derive the credential ref for a route, matching the official web UI
 * convention so TUI- and web-added providers resolve the same key.
 */
export declare function deriveKeyRef(route: string): string;
export interface ProviderWizardDeps {
    readonly host: ProviderSetupHost;
    readonly ask: (request: AskUserQuestionRequest, options?: {
        redact?: boolean;
    }) => Promise<AskUserQuestionAnswer>;
    readonly notify: (text: string, options?: {
        color?: 'error' | 'warning' | 'success';
        timeoutMs?: number;
    }) => void;
    readonly pushLocal: (title: string, lines: readonly string[]) => void;
    /** Live turn state; the model-switch question is skipped while working. */
    readonly working: () => boolean;
    readonly switchModel: (provider: string, model: string) => Promise<boolean>;
}
export type ProviderWizardOutcome = 'added' | 'updated' | 'deleted' | 'signed-out' | 'cancelled' | 'failed';
/**
 * Run the provider wizard. Opens with an action choice (add / edit); the
 * add path runs the guided config flow, and edit picks a configured route
 * then opens a menu of targeted edits (API key, base URL, wire protocol,
 * model list, delete this provider) with the route locked. Each menu item
 * applies immediately and exits — no confirmation between picking an edit
 * and writing it — and patches only the picked field, leaving every other
 * stored setting (including fields the wizard does not model) in place.
 * For built-in (catalog) routes the menu is limited to API
 * key, model list, and delete; base URL and wire protocol are only
 * meaningful for custom endpoints. Resolves 'cancelled' when the user
 * dismisses any question (Esc) — nothing has been written at that point.
 */
export declare function runProviderWizard(deps: ProviderWizardDeps): Promise<ProviderWizardOutcome>;
/**
 * The sign-in flow of a backend session's `/login`: the `/provider` OAuth
 * branch preselected on one provider (sign in, or re-login / sign out when
 * already signed in). Same panels, same plugin flow.
 */
export declare function runOAuthLogin(deps: Pick<ProviderWizardDeps, 'ask' | 'notify' | 'pushLocal'>, oauth: OAuthSetupHost, provider: string): Promise<ProviderWizardOutcome>;
/** How the live endpoint probe of one discovery pass went. */
export type RouteDiscoveryLive = 'fetched' | 'failed' | 'unavailable';
export type RouteDiscoveryCatalog = 'fetched' | 'failed' | 'unavailable';
export type RouteDiscoveryReason = 'no-base-url' | 'unsupported-catalog' | 'custom-headers';
/** One route-model discovery pass, ready for the selection panel. */
export interface RouteDiscovery {
    /** Merged rows: installed-catalog rows first (rich metadata), then
     *  endpoint-only ids in the order the endpoint advertised them. */
    readonly rows: readonly LlmDiscoveredModel[];
    /** Ids covered by the installed catalog (their rows carry catalog truth). */
    readonly catalogIds: ReadonlySet<string>;
    /** Whether the installed catalog lookup was authoritative. */
    readonly catalog: RouteDiscoveryCatalog;
    readonly live: RouteDiscoveryLive;
    readonly reason?: RouteDiscoveryReason;
}
//# sourceMappingURL=providerWizard.d.ts.map