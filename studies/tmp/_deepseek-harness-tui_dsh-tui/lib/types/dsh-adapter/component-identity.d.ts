/** Verified Component identity bound to one Cordis activation owner. */
import type { Context } from '@deepseek-ai/cordis';
import type { ComponentManifest, PluginManifest } from '../adapter/standard/types.js';
export type ComponentIdentityErrorCode = 'COMPONENT_NOT_ADMITTED' | 'COMPONENT_ALREADY_ADMITTED';
export declare class ComponentIdentityError extends Error {
    readonly code: ComponentIdentityErrorCode;
    constructor(code: ComponentIdentityErrorCode, message: string);
}
export interface VerifiedComponentIdentity {
    readonly componentId: string;
    readonly version: string;
    readonly facet: 'host';
    readonly activationId: string;
    readonly manifest: PluginManifest;
    readonly projection: ComponentManifest;
}
/** Activation ids are host-issued opaque values. Keep them bounded and free
 * of control characters because the same value is written to the effect
 * ledger and used as a grant principal selector. */
export declare const ACTIVATION_ID_MAX_LENGTH = 128;
export declare function bindComponentIdentity(context: Context, manifest: PluginManifest, projection: ComponentManifest, activationId?: string): VerifiedComponentIdentity;
export declare function componentIdentityOf(context: Context): VerifiedComponentIdentity | undefined;
export declare function requireComponentIdentity(context: Context): VerifiedComponentIdentity;
export declare function declaresPermission(identity: VerifiedComponentIdentity, permission: string, actualScope: string): boolean;
export declare function declaresCommand(identity: VerifiedComponentIdentity, commandId: string): boolean;
export declare function declaresObserverScope(identity: VerifiedComponentIdentity, actualScope: string): boolean;
export declare function requiresDecisionEvents(identity: VerifiedComponentIdentity): boolean;
/** Whether admission negotiated the protocol that backs a mediated runtime
 * capability.  Permissions alone are not a capability grant: a plugin must
 * explicitly require the corresponding contract before the host can expose
 * its calls. */
export declare function requiresContract(identity: VerifiedComponentIdentity, apiVersion: string, kind: string): boolean;
//# sourceMappingURL=component-identity.d.ts.map