/**
 * dsh-TUI private protocol registration on the shared dsh-std catalog.
 *
 * Private protocol definitions are NOT authored here. The canonical
 * tui-profile definitions are loaded through `src/adapter/spec/`; this
 * module only registers public dsh-std protocols and delegates the private
 * TUI profile definitions to the spec boundary.
 */
import { ProtocolCatalog } from '@dsh-std/core';
import { ManifestDefinitionCatalog } from '@dsh-std/manifest';
export { TUI_EXTENSION_API_VERSION, DECISION_EVENTS_COORDINATE, DECISION_EVENTS, TUI_DECISION_EVENT_NAMES, TUI_EXTENSION_PERMISSION_NAMES, decisionEventsDefinition, profileDefinitions, registerProfileProtocols, tuiChannelDefinition, TUI_CHANNEL, TUI_CHANNEL_FEATURES, TUI_CHANNEL_WIRE_REVISION, } from '../spec/tui-contributions.js';
export interface AdmissionCatalog {
    protocols: ProtocolCatalog;
    manifests: ManifestDefinitionCatalog;
}
/** Process-level canonical ProtocolCatalog / admission core. Every production
 * admission, descriptor and negotiation path must share this instance. */
export declare function getAdmissionCatalog(): AdmissionCatalog;
/** Backward-compatible factory retained as a long-term compatibility face
 * for existing callers. It now returns the same process-level canonical
 * catalog rather than allocating a new one, so no second admission core can
 * appear in production. OWNER: dsh-tui adapter. UNTIL: no scheduled removal.
 */
export declare function createAdmissionCatalog(): AdmissionCatalog;
//# sourceMappingURL=tui-extension.d.ts.map