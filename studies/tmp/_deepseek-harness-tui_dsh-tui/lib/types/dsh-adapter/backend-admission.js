/** Unknown capability or permission names, in the same list, distinguishable at
 *  a glance from protocol coordinates (which are `apiVersion#kind`). */
const capabilityItem = (name) => `capability:${name}`;
const permissionItem = (name) => `permission:${name}`;
export function backendAdmission(spec, host) {
    // A reserved id never reaches here in the in-tree path (registerBackend refuses
    // it before projecting), but this is the reusable gate for a bundle, so it
    // refuses it itself rather than trusting the caller to have done it. The other
    // two member refusals — a host label key and a `nativeKey` declaration — are
    // shape violations: `validateBackendSpec()` rejects both as unknown fields
    // (`exactRecord`), so they cannot arrive as a `BackendSpec` at all and never
    // need a reason code of their own.
    if (host.reservedIds.has(spec.id)) {
        return { decision: 'rejected', reasonCode: 'BACKEND_ID_RESERVED' };
    }
    const unknownCapabilities = spec.capabilities.filter(name => !host.capabilityNames.has(name));
    const unknownGrants = spec.grants.filter(name => !host.permissionNames.has(name));
    const denied = spec.grants.filter(name => host.permissionNames.has(name) && !host.granted.has(name));
    // A permission the host cannot name is a fact the host must not act on: it is
    // recorded as a pending item and the entry degrades, exactly like an unknown
    // capability (D-3). Silently treating it as usable would claim a grant nobody
    // can revoke; refusing would invent a permission vocabulary.
    const missingOptional = [...unknownCapabilities.map(capabilityItem), ...unknownGrants.map(permissionItem)];
    if (denied.length > 0) {
        return {
            decision: 'waiting_authorization',
            reasonCode: 'PERMISSION_NOT_GRANTED',
            deniedPermissions: [...denied],
        };
    }
    if (missingOptional.length > 0)
        return { decision: 'compatible_degraded', missingOptional };
    return { decision: 'compatible' };
}
