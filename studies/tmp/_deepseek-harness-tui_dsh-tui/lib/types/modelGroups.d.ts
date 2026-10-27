/**
 * Pure derivation for the `/model` provider tabs, with a pinned
 * "recently used" pseudo-provider first. Kept free of React/channel/i18n state so
 * `scripts/verify-model-picker-groups.mjs` can drive it headless. Renderers
 * derive the localized recents label from its provider key.
 *
 * @module dsh-tui/modelGroups
 */
import type { LlmModelInfo, LlmProviderInfo } from './adapter/ports/channel-view.js';
/**
 * The pseudo provider key of the pinned "recently used" group. Provider
 * route ids cannot contain underscores (`PROVIDER_ROUTE_ID`), so this can
 * never collide with a real route.
 */
export declare const RECENTS_GROUP_PROVIDER = "__recents__";
/** Placeholder for pure group data; the UI labels recents by provider key. */
export declare const RECENTS_LABEL_PLACEHOLDER = "__recent__";
/** One recent-model reference (same shape as modelRecents' persisted ref). */
export interface ModelRef {
    readonly provider: string;
    readonly id: string;
}
/** One provider tab with its picker-facing identity. */
export interface ModelGroupRow {
    /** Harness route key (also the grouping key over `LlmModelInfo.provider`). */
    readonly provider: string;
    /** Display label — the registry's provider name, falling back to the route key. */
    readonly label: string;
    /** How many of the listed models belong to this provider. */
    readonly count: number;
}
/**
 * The recent refs that the current catalog still lists, most-recent-first —
 * the model list of the recents tab. Refs whose model vanished from the
 * catalog (provider removed, or an OAuth provider signed out and
 * credential-gated away) drop out here, so the group never offers a row the
 * picker could not switch to.
 */
export declare function recentCatalogModels(recents: readonly ModelRef[], models: readonly LlmModelInfo[]): readonly LlmModelInfo[];
/**
 * Group a flat model catalog into provider rows, first-appearance order
 * (the registry's own listing order), labels resolved through
 * `providerInfos` with a route-key fallback. Supplying recent refs pins an
 * extra pseudo-group at the top, including an empty tab.
 */
export declare function deriveModelGroups(models: readonly LlmModelInfo[], providerInfos: readonly LlmProviderInfo[], recents?: readonly ModelRef[]): readonly ModelGroupRow[];
/** Where `/model` should open. */
export interface ModelPickerLanding {
    /** Active provider tab; undefined only for an empty catalog without recents. */
    readonly group: string | undefined;
    /** Focus index within that tab's model list. */
    readonly index: number;
}
/**
 * Open on the first recent model when the recents tab is present. Otherwise
 * open the current provider and focus its current model, falling back to the
 * first provider/model when the current route is absent.
 */
export declare function modelPickerLanding(models: readonly LlmModelInfo[], currentProvider: string | undefined, currentModel: string | undefined, recents?: readonly ModelRef[]): ModelPickerLanding;
//# sourceMappingURL=modelGroups.d.ts.map