/**
 * Kernel lifecycle / publication barrier.
 *
 * The Kernel owns the support state machine. A capability may be declared or
 * staged, but only live capabilities may be published into a Host Descriptor /
 * negotiation surface. `degraded` is a diagnostic fact and must never be
 * published as whole-capability support.
 */
/** A degraded capability must be split before publication (hard rule). */
export function canPublishAsLive(lifecycle) {
    return lifecycle.state === 'live';
}
export function lifecycleFromDetection(capability, detection, coordinate) {
    switch (detection.state) {
        case 'supported':
            return { capability, coordinate, state: 'staged', detection };
        case 'unsupported':
            return { capability, coordinate, state: 'unsupported', detection };
        case 'degraded':
            return { capability, coordinate, state: 'degraded', detection };
    }
}
/** Promotion to live is only allowed after explicit verification. */
export function promoteToLive(lifecycle) {
    if (lifecycle.state !== 'staged') {
        throw new Error(`cannot promote ${lifecycle.capability} from ${lifecycle.state} to live`);
    }
    return { ...lifecycle, state: 'live' };
}
/** True only when the lifecycle's detection carries at least one probe
 * evidence item. Unlike `hasVerificationEvidence`, this also applies to
 * degraded lifecycles, which can carry feature-level live evidence after a
 * capability has been split. */
export function hasProbeEvidence(lifecycle) {
    if (lifecycle.detection.state !== 'supported' && lifecycle.detection.state !== 'degraded')
        return false;
    const evidence = lifecycle.detection.evidence ?? [];
    return evidence.some(item => item.kind === 'probe');
}
export function hasVerificationEvidence(lifecycle) {
    return lifecycle.detection.state === 'supported' && hasProbeEvidence(lifecycle);
}
/** Convenience for read-only slices: mark a supported detection as live only
 * after the caller has verified the live service/method actually exists.
 * A service-existence-only detection cannot cross the publication barrier. */
export function verifyAndPromote(lifecycle) {
    if (lifecycle.state === 'staged'
        && lifecycle.detection.state === 'supported'
        && hasVerificationEvidence(lifecycle)) {
        return promoteToLive(lifecycle);
    }
    return lifecycle;
}
