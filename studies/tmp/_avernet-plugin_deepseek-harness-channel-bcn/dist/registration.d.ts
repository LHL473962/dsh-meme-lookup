import { type ProviderRegistration } from './protocol.js';
export interface ProviderTokenScope {
    providerId: string;
    owner: string;
}
/** Inspect routing hints only. BCS authenticates the signature and authorizes registration. */
export declare function registrationTokenScope(token: string): ProviderTokenScope | undefined;
export declare function validateRegistrationResponse(value: unknown, expected: {
    scope: ProviderTokenScope;
    providerBotRef: string;
}): ProviderRegistration;
//# sourceMappingURL=registration.d.ts.map