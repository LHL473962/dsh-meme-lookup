/**
 * Upstream driver for the TUI DecisionEvents capability.
 *
 * The read-only dispatch-topology probe is real: it asks the host which
 * decision event names are actually dispatched in this composition. The
 * subscribe path is intentionally kept staged on the internal Host Port
 * because plugin-side subscriptions must go through the mediated
 * DecisionEvents API (which derives owner from the Cordis activation); the
 * driver never fabricates a live subscribe probe.
 */
import { lifecycleFromDetection } from '../kernel/lifecycle.js';
import { KERNEL_TUI_DECISION_EVENT_NAMES as TUI_DECISION_EVENT_NAMES } from '../kernel/contract-catalog.js';
const CAPABILITY = 'host.decisions';
function serviceEvidence(id) {
    return { kind: 'service', id };
}
function methodEvidence(service, method) {
    return { kind: 'method', id: `${service}:${method}` };
}
function probeEvidence(id, detail) {
    return { kind: 'probe', id, detail };
}
function errorText(error) {
    return error instanceof Error ? error.message : String(error);
}
function decisionHost(ctx) {
    return ctx?.get?.('tuiPluginHost');
}
export function detectDecisionsCapability(ctx) {
    const host = decisionHost(ctx);
    if (host === undefined) {
        return { state: 'unsupported', reason: 'tuiPluginHost service is not mounted' };
    }
    const evidence = [serviceEvidence('tuiPluginHost')];
    if (typeof host.probeDecisionEvents === 'function') {
        evidence.push(methodEvidence('tuiPluginHost', 'probeDecisionEvents'));
    }
    else {
        return { state: 'degraded', missing: ['tuiPluginHost.probeDecisionEvents()'], evidence };
    }
    if (typeof host.subscribeDecision === 'function') {
        evidence.push(methodEvidence('tuiPluginHost', 'subscribeDecision'));
    }
    else {
        return {
            state: 'degraded',
            missing: ['tuiPluginHost.subscribeDecision()'],
            evidence,
        };
    }
    try {
        const available = host.probeDecisionEvents();
        if (!Array.isArray(available))
            throw new Error('probeDecisionEvents() did not return an array');
        if (available.length === 0) {
            return {
                state: 'degraded',
                missing: ['decision-dispatch-topology'],
                evidence: [
                    ...evidence,
                    probeEvidence('tuiPluginHost.probeDecisionEvents()', 'no decision dispatch topology is currently mounted'),
                ],
            };
        }
        return {
            state: 'supported',
            evidence: [
                ...evidence,
                probeEvidence('tuiPluginHost.probeDecisionEvents()', `verified ${available.length}/${TUI_DECISION_EVENT_NAMES.length} decision events`),
            ],
        };
    }
    catch (error) {
        return {
            state: 'degraded',
            missing: ['tuiPluginHost.probeDecisionEvents()'],
            evidence: [...evidence, probeEvidence('tuiPluginHost.probeDecisionEvents()', errorText(error))],
        };
    }
}
async function verifyDecisionsLive(ctx) {
    const detection = detectDecisionsCapability(ctx);
    if (detection.state !== 'supported') {
        return TUI_DECISION_EVENT_NAMES.map(event => lifecycleFromDetection(`host.decisions.event:${event}`, {
            state: 'degraded',
            missing: ['decision-dispatch-topology'],
            evidence: [serviceEvidence('tuiPluginHost')],
        }));
    }
    const host = decisionHost(ctx);
    const available = host.probeDecisionEvents();
    return TUI_DECISION_EVENT_NAMES.map(event => {
        const verified = Array.isArray(available) && available.includes(event);
        const feature = `host.decisions.event:${event}`;
        return verified
            ? lifecycleFromDetection(feature, {
                state: 'supported',
                evidence: [
                    serviceEvidence('tuiPluginHost'),
                    probeEvidence(`decision:${event}`, `real dispatch topology verified for ${event}`),
                ],
            })
            : lifecycleFromDetection(feature, {
                state: 'degraded',
                missing: [`decision-event:${event}`],
                evidence: [serviceEvidence('tuiPluginHost')],
            });
    });
}
function createDecisionsPort(ctx) {
    const host = decisionHost(ctx);
    return Object.freeze({
        probe() {
            if (host === undefined)
                return [];
            try {
                return [...host.probeDecisionEvents()];
            }
            catch {
                return [];
            }
        },
        subscribe() {
            throw new Error('dsh-tui: host.decisions.subscribe is staged; plugin subscriptions must use the mediated DecisionEvents API');
        },
    });
}
export const decisionsDriver = {
    id: 'dsh-tui-decisions',
    upstreamFamily: 'dsh-tui',
    capability: 'host.decisions',
    mountEffectClass: 'read-only',
    detect: detectDecisionsCapability,
    verifyLive: verifyDecisionsLive,
    async mount(context) {
        return {
            disposer: () => undefined,
            ports: { decisions: createDecisionsPort(context) },
        };
    },
};
