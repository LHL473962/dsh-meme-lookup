/**
 * Thin spec-plane surface for TUI-private protocol contributions.
 *
 * The private protocol definitions themselves are authored and owned by
 * tui-profile (`protocols/profile-definitions.js`). This module is the
 * single loading boundary: TUI source must import private protocol definitions
 * through this file, never directly through `#tui-profile/*` from
 * `adapter/standard` or UI code.
 */
export * from '#tui-profile/profile-definitions';
export { TUI_DECISION_EVENT_NAMES, TUI_EXTENSION_PERMISSION_NAMES, } from './protocol-constants.js';
export { BACKEND_CAPABILITY_NAMES } from './backend-capabilities.js';
export { BACKEND, BACKEND_CONFIRMATION_POLICIES, BACKEND_RESERVED_IDS, assertBackendHandler, backendExtensionDefinition, validateBackendSpec, } from '#tui-profile/tui-contributions';
export type { BackendHandler, BackendInstallRecipe, BackendSpec, } from '#tui-profile/tui-contributions';
export declare const TUI_EXTENSION_API_VERSION = "tui.dsh/v1alpha1";
/** Re-exported from tui-profile; kept as a named friendly alias. */
export declare const DECISION_EVENTS_COORDINATE: Readonly<import("@dsh-std/core").ApiReference & {
    apiVersion: "tui.dsh/v1alpha1";
    kind: "DecisionEvents";
}>;
//# sourceMappingURL=tui-contributions.d.ts.map