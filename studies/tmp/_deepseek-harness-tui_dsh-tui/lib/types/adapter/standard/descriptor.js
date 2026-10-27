/** Build the current dsh-TUI Host Descriptor from live Kernel lifecycle evidence. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasProbeEvidence, hasVerificationEvidence } from '../kernel/lifecycle.js';
import { digestFile, loadSpecData, verifyContractProfiles } from './registry.js';
import { HOST_SUPPORTED_CONTRACTS } from '../spec/protocol-constants.js';
import { createContractIndex, validateHost } from './validate.js';
import { check } from './schema-check.js';
export { HOST_SUPPORTED_CONTRACTS };
/** The facet version is part of the host identity, not a protocol definition.
 * Keep a conservative fallback so a descriptor remains schema-valid when the
 * optional vendored registry is unavailable; the contract list is still
 * empty in that degraded state. */
export const HOST_FACET_API_VERSIONS = Object.freeze(['v1alpha1']);
function freezeDeep(value, seen = new WeakSet()) {
    if (value === null || typeof value !== 'object' || seen.has(value))
        return value;
    seen.add(value);
    for (const child of Object.values(value))
        freezeDeep(child, seen);
    return Object.freeze(value);
}
export function readOwnPackageVersion() {
    const candidates = [];
    try {
        candidates.push(fileURLToPath(import.meta.resolve('@deepseek-harness-tui/dsh-tui/package.json')));
    }
    catch {
        // Fall through to the source/package walk-up path.
    }
    let dir = dirname(fileURLToPath(import.meta.url));
    for (let index = 0; index < 8; index++) {
        candidates.push(join(dir, 'package.json'));
        const parent = dirname(dir);
        if (parent === dir)
            break;
        dir = parent;
    }
    for (const candidate of candidates) {
        try {
            const manifest = JSON.parse(readFileSync(candidate, 'utf8'));
            if (manifest.name === '@deepseek-harness-tui/dsh-tui'
                && typeof manifest.version === 'string'
                && manifest.version !== '')
                return manifest.version;
        }
        catch {
            // Keep looking.
        }
    }
    return '0.0.0';
}
function coordinateFromCapability(capability) {
    const index = capability.indexOf('#');
    if (index <= 0 || index === capability.length - 1)
        return undefined;
    return {
        apiVersion: capability.slice(0, index),
        kind: capability.slice(index + 1),
    };
}
function coordinateOf(lifecycle) {
    return lifecycle.coordinate ?? coordinateFromCapability(lifecycle.capability);
}
function supportSpec(coordinate, lifecycle, legacyFeatures) {
    if (coordinate.apiVersion === 'tui.dsh/v1alpha1' && coordinate.kind === 'DecisionEvents') {
        // Never fall back to the full event vocabulary. New mode only advertises
        // liveFeatures verified by the driver probe; legacy mode only advertises
        // features passed from the read-only legacy topology probe.
        const features = legacyFeatures ?? [...(lifecycle?.liveFeatures ?? [])];
        return { features: [...new Set(features)].sort() };
    }
    return undefined;
}
/**
 * Whether a lifecycle's probe evidence is sufficient to publish the whole
 * capability contract.
 *
 * The protocol definitions for Command / LocalStorage / MessageObserver do not
 * support feature-granular support specs, so a probe must prove the real
 * operational capability (not merely a catalog/list or mounted-runtime
 * diagnostic). DecisionEvents is feature-granular and is handled separately.
 */
function hasPublishableCapabilityProbe(lifecycle, coordinate) {
    const detection = lifecycle.detection;
    if (detection.state !== 'supported' && detection.state !== 'degraded')
        return false;
    const evidence = detection.evidence ?? [];
    if (coordinate.kind === 'Command') {
        return evidence.some(item => item.kind === 'probe' && /(?:execute|invoke)/u.test(item.id));
    }
    if (coordinate.kind === 'LocalStorage' || coordinate.kind === 'MessageObserver') {
        return evidence.some(item => item.kind === 'probe' && !item.id.includes('probeDiagnostic'));
    }
    return true;
}
/**
 * DecisionEvents publication additionally requires the actual mediated
 * subscription method to exist. A real channel/probe with a missing
 * `subscribeDecision()` is still a degraded/non-publishable capability.
 */
function hasDecisionSubscriptionMethod(lifecycle) {
    const detection = lifecycle.detection;
    if (detection.state !== 'supported' && detection.state !== 'degraded')
        return false;
    return (detection.evidence ?? []).some(item => item.kind === 'method' && item.id.includes('subscribeDecision'));
}
function hasDecisionCriticalMissing(lifecycle) {
    const detection = lifecycle.detection;
    if (detection.state !== 'degraded')
        return false;
    return detection.missing.some(item => item.includes('subscribeDecision'));
}
function hasPublishableDecisionFeatureEvidence(lifecycle) {
    return hasProbeEvidence(lifecycle)
        && !hasDecisionCriticalMissing(lifecycle)
        && hasDecisionSubscriptionMethod(lifecycle)
        && (lifecycle.liveFeatures?.length ?? 0) > 0;
}
/**
 * Select the publishable contract set from live lifecycle evidence.
 *
 * `degraded` remains a diagnostic fact here: it is never promoted to a whole
 * supported contract. If a protocol supports feature granularity, the caller
 * must split the degraded capability into feature-level live lifecycles (or
 * pass `liveFeatures` on a live lifecycle) before this builder can publish it.
 */
function publishableLifecycles(lifecycles, warnings, dropped) {
    const published = [];
    for (const lifecycle of lifecycles) {
        const coordinate = coordinateOf(lifecycle);
        if (coordinate === undefined) {
            dropped.push(lifecycle.capability);
            warnings.push(`${lifecycle.capability}: lifecycle has no contract coordinate; cannot publish`);
            continue;
        }
        const key = `${coordinate.apiVersion}#${coordinate.kind}`;
        if (lifecycle.state === 'live') {
            if (!hasVerificationEvidence(lifecycle) || !hasPublishableCapabilityProbe(lifecycle, coordinate)) {
                dropped.push(key);
                warnings.push(`${key}: live lifecycle lacks a publishable real capability probe; not published`);
                continue;
            }
            if (coordinate.apiVersion === 'tui.dsh/v1alpha1' && coordinate.kind === 'DecisionEvents') {
                if (lifecycle.liveFeatures === undefined || lifecycle.liveFeatures.length === 0) {
                    dropped.push(key);
                    warnings.push(`${key}: live DecisionEvents has no verified feature-level evidence; not published`);
                    continue;
                }
                if (!hasPublishableDecisionFeatureEvidence(lifecycle)) {
                    dropped.push(key);
                    warnings.push(`${key}: live DecisionEvents lacks a real probe and/or the mediated subscribeDecision method; not published`);
                    continue;
                }
            }
            published.push({ lifecycle, coordinate });
        }
        else if (lifecycle.state === 'degraded') {
            if (lifecycle.liveFeatures !== undefined && lifecycle.liveFeatures.length > 0
                && coordinate.apiVersion === 'tui.dsh/v1alpha1'
                && coordinate.kind === 'DecisionEvents'
                && hasPublishableDecisionFeatureEvidence(lifecycle)) {
                // Feature-granular publication: only the decomposed live features are
                // advertised, never the whole degraded capability. Probe evidence is
                // mandatory even for feature splits — no probe, no publication — and
                // the mediated subscribeDecision method must also exist.
                published.push({ lifecycle, coordinate });
                warnings.push(`${key}: degraded capability split into live feature-level evidence (${lifecycle.liveFeatures.join(', ')})`);
            }
            else if (lifecycle.liveFeatures !== undefined && lifecycle.liveFeatures.length > 0
                && coordinate.apiVersion === 'tui.dsh/v1alpha1'
                && coordinate.kind === 'DecisionEvents') {
                dropped.push(key);
                warnings.push(`${key}: degraded DecisionEvents has feature evidence without a real probe/mediated subscribeDecision method; not published`);
            }
            else {
                dropped.push(key);
                warnings.push(`${key}: degraded capability was not split into publishable live features; not published`);
            }
        }
        else {
            dropped.push(key);
            warnings.push(`${key}: capability is ${lifecycle.state}, not live; not published`);
        }
    }
    return published;
}
/**
 * Build Host Descriptor only from live lifecycle evidence. This is the
 * canonical production entry point; it never accepts a bare supported array as
 * final fact.
 */
export function buildHostDescriptorFromLifecycles(lifecycles, options = { generationId: 'unknown' }) {
    return buildHostDescriptor({ ...options, lifecycles });
}
/**
 * Build the explicit legacy-mode Host Descriptor.
 *
 * P6 keeps this as a first-class mode, not a compatibility shim: it preserves
 * the old default (`legacy` adapter mode) publication semantics. Command /
 * LocalStorage / MessageObserver are declared when their legacy service rows
 * are mounted, without running the new Kernel or any reversible live probe.
 * It is deliberately distinct from the live-only
 * `buildHostDescriptorFromLifecycles` path and returns warnings identifying it
 * as a legacy declaration.
 */
export function buildLegacyHostDescriptor(options) {
    return buildHostDescriptor({
        hostId: options.hostId,
        hostVersion: options.hostVersion,
        generationId: options.generationId,
        headless: options.headless,
        specDir: options.specDir,
        legacy: true,
        legacySupported: options.supported,
        legacyDecisionFeatures: options.decisionFeatures,
    });
}
export function buildHostDescriptor(options) {
    const warnings = [];
    const dropped = [];
    const contracts = [];
    const data = loadSpecData(options.specDir);
    // `loadSpecData` rejects malformed/empty facet declarations. Preserve the
    // pinned values exactly when data is valid; use the schema-valid fallback
    // only for the completely unavailable/degraded path.
    const facetApiVersions = data === undefined
        ? [...HOST_FACET_API_VERSIONS]
        : [...data.registry.facetApiVersions];
    const profileFailures = data === undefined ? [] : verifyContractProfiles(data);
    const legacyMode = options.legacy === true && options.legacySupported !== undefined;
    // Live lifecycle evidence is the only caller-facing publication source.
    // The old no-lifecycles fallback (advertising HOST_SUPPORTED_CONTRACTS) has
    // been removed: without live lifecycle evidence this host must not claim any
    // negotiated support. Callers that only want static diagnostics get an empty
    // contract surface plus an explicit non-live/host-unavailable warning.
    if (options.lifecycles === undefined && !legacyMode) {
        warnings.push('no live lifecycle evidence supplied; host descriptor advertises no contracts (host unavailable / non-live)');
    }
    if (legacyMode) {
        warnings.push('legacy compatibility descriptor: contracts declared from the mounted legacy service topology without live probe evidence');
    }
    // Admission is a live/feature-split evidence path only. Degraded/staged
    // capabilities are never admitted solely because a service row is mounted.
    //
    // The explicit exception is the legacy compatibility path used by the
    // default `legacy` adapter mode. It is a separate, non-live declaration of
    // the old mounted-service topology (kept alive for zero-behavior-change
    // migration), not a fake live claim and never mixed into new-mode live
    // descriptors.
    const selected = legacyMode
        ? options.legacySupported.map(coordinate => ({ coordinate, lifecycle: undefined }))
        : options.lifecycles === undefined
            ? []
            : publishableLifecycles(options.lifecycles, warnings, dropped);
    if (data === undefined) {
        warnings.push('admission profile unavailable (tui-profile/); advertising an empty protocol surface');
    }
    else {
        const index = createContractIndex(data.registry, data.permissions);
        for (const item of selected) {
            const coordinate = item.coordinate;
            const key = `${coordinate.apiVersion}#${coordinate.kind}`;
            const entry = index.lookupContract(coordinate);
            const definition = index.protocols.resolve(coordinate);
            if (entry === undefined || definition === undefined) {
                dropped.push(key);
                warnings.push(`${key}: live implementation has no pinned ProtocolCatalog definition`);
                continue;
            }
            if ('profile' in entry) {
                if (profileFailures.length > 0) {
                    dropped.push(key);
                    warnings.push(`${key}: TUI contract profile self-check failed (${profileFailures.join(' | ')})`);
                    continue;
                }
                let actual;
                try {
                    actual = digestFile(data.dir, entry.profile);
                }
                catch {
                    dropped.push(key);
                    warnings.push(`${key}: TUI profile is unreadable (${entry.profile})`);
                    continue;
                }
                if (actual !== entry.profileHash) {
                    dropped.push(key);
                    warnings.push(`${key}: TUI profile hash drifted (expected ${entry.profileHash}, actual ${actual})`);
                    continue;
                }
            }
            const lifecycle = item.lifecycle;
            // Legacy declarations use the same definition/registry resolution but
            // do not invent a live support spec.
            const spec = legacyMode
                ? supportSpec(coordinate, undefined, options.legacyDecisionFeatures)
                : supportSpec(coordinate, lifecycle);
            try {
                definition.validateSupport(spec);
            }
            catch (error) {
                dropped.push(key);
                warnings.push(`${key}: support spec rejected by its definition (${error instanceof Error ? error.message : String(error)})`);
                continue;
            }
            contracts.push({
                ...coordinate,
                ...(spec === undefined ? {} : { spec }),
                definition: 'package' in entry
                    ? { source: 'dsh-std', package: entry.package }
                    : { source: 'tui-profile', profileHash: entry.profileHash },
                permissions: [...entry.permissions],
            });
        }
    }
    const descriptor = {
        $schema: 'urn:dsh-tui:host-descriptor:0.15',
        hostId: options.hostId ?? 'dsh-tui',
        hostVersion: options.hostVersion ?? readOwnPackageVersion(),
        facetApiVersions: [...facetApiVersions],
        contracts,
        runtime: {
            location: 'local',
            generationId: options.generationId,
            headless: options.headless ?? false,
        },
        trustLevel: 'trusted-in-process',
        platform: { os: process.platform, arch: process.arch, node: process.version },
    };
    if (data !== undefined) {
        try {
            validateHost(createContractIndex(data.registry, data.permissions), descriptor);
        }
        catch (error) {
            warnings.push(`constructed descriptor failed semantic validation: ${error instanceof Error ? error.message : String(error)}`);
            descriptor.contracts.length = 0;
        }
        try {
            check(descriptor, data.schemas.host, data.schemas.host);
        }
        catch (error) {
            warnings.push(`constructed descriptor failed schema validation: ${error instanceof Error ? error.message : String(error)}`);
            descriptor.contracts.length = 0;
        }
    }
    // The descriptor is handed to untrusted admission/diagnostic callers.  A
    // cached mutable object would let one caller delete contracts or forge the
    // runtime generation for every later negotiation, so freeze the complete
    // graph and return immutable diagnostic arrays as well.
    return Object.freeze({
        descriptor: freezeDeep(descriptor),
        dropped: Object.freeze(dropped),
        warnings: Object.freeze(warnings),
    });
}
