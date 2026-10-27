/**
 * Upstream driver for the TUI scenes capability.
 *
 * Scenes are a register-class capability. The driver performs a real
 * reversible probe through the host-only scenes facade: register a uniquely
 * named temporary scene, list it, dispose it, then prove the same name can
 * be registered again (no residue). It never opens the scene during the
 * probe, so no visible UI mutation is caused.
 *
 * Publication is feature-level: register/list are live only after the
 * reversible no-residue probe; open/close/active/subscribe are not safely
 * auto-verifiable in P3 and stay degraded.
 */
import { randomUUID } from 'node:crypto';
import { lifecycleFromDetection } from '../kernel/lifecycle.js';
import { getHostSceneRuntime } from '../../dsh-adapter/scenes.js';
const CAPABILITY = 'host.scenes';
const SCENE_FEATURES = Object.freeze([
    'host.scenes.register',
    'host.scenes.list',
    'host.scenes.open',
    'host.scenes.close',
    'host.scenes.active',
    'host.scenes.subscribe',
]);
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
function sceneHost(ctx) {
    const service = ctx?.get?.('tuiScenes');
    if (service === undefined)
        return undefined;
    try {
        return getHostSceneRuntime(service);
    }
    catch {
        return undefined;
    }
}
function degradedFeature(capability, evidence, missing) {
    return lifecycleFromDetection(capability, {
        state: 'degraded',
        missing: [missing],
        evidence,
    });
}
function liveFeature(capability, evidence) {
    return lifecycleFromDetection(capability, {
        state: 'supported',
        evidence,
    });
}
export function detectScenesCapability(ctx) {
    const service = ctx?.get?.('tuiScenes');
    if (service === undefined) {
        return { state: 'unsupported', reason: 'tuiScenes service is not mounted' };
    }
    const evidence = [serviceEvidence('tuiScenes')];
    const host = sceneHost(ctx);
    if (host === undefined) {
        return { state: 'degraded', missing: ['tuiScenes host facade'], evidence };
    }
    const methods = ['register', 'list', 'open', 'close', 'subscribe'];
    for (const method of methods) {
        if (typeof host[method] === 'function') {
            evidence.push(methodEvidence('tuiScenes', method));
        }
        else {
            return { state: 'degraded', missing: [`tuiScenes.${method}()`], evidence };
        }
    }
    return { state: 'supported', evidence };
}
async function verifyScenesLive(ctx) {
    const host = sceneHost(ctx);
    const baseEvidence = [serviceEvidence('tuiScenes')];
    if (host === undefined) {
        return SCENE_FEATURES.map(feature => degradedFeature(feature, baseEvidence, `${feature}.live-probe`));
    }
    const evidence = [serviceEvidence('tuiScenes')];
    const missing = [];
    const id = `dsh_tui_probe_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const descriptor = {
        id,
        title: 'dsh-tui reversible scene probe',
        component: () => undefined,
    };
    let dispose;
    let registerLive = false;
    try {
        dispose = host.register(descriptor);
        const listed = host.list();
        if (!Array.isArray(listed) || !listed.some(scene => scene.id === id)) {
            missing.push('tuiScenes.register/list()');
            throw new Error('temporary scene was not visible through list()');
        }
        evidence.push(probeEvidence(`tuiScenes.register+dispose(${id})`, 'temporary scene registered and listed'));
        dispose();
        dispose = undefined;
        // No-residue proof: the same id must be registrable again.
        const second = host.register(descriptor);
        second();
        evidence.push(probeEvidence(`tuiScenes.dispose(${id})`, 'temporary scene removed; same id re-register succeeded'));
        registerLive = true;
    }
    catch (error) {
        missing.push('tuiScenes.reversible-live-probe');
        evidence.push(probeEvidence('tuiScenes.reversible-live-probe', errorText(error)));
    }
    finally {
        try {
            dispose?.();
        }
        catch {
            // Best-effort cleanup.
        }
    }
    const out = [];
    out.push(registerLive
        ? liveFeature('host.scenes.register', evidence)
        : degradedFeature('host.scenes.register', evidence, 'tuiScenes.reversible-live-probe'));
    if (registerLive) {
        out.push(liveFeature('host.scenes.list', [
            serviceEvidence('tuiScenes'),
            methodEvidence('tuiScenes', 'list'),
            probeEvidence('tuiScenes.list()', 'temporary scene visible through list()'),
        ]));
    }
    else {
        out.push(degradedFeature('host.scenes.list', [serviceEvidence('tuiScenes'), methodEvidence('tuiScenes', 'list')], 'tuiScenes.list() live-probe'));
    }
    for (const feature of ['host.scenes.open', 'host.scenes.close', 'host.scenes.active', 'host.scenes.subscribe']) {
        out.push(degradedFeature(feature, [serviceEvidence('tuiScenes')], `${feature}.live-probe`));
    }
    return out;
}
function createScenesPort(host) {
    return Object.freeze({
        register: descriptor => host.register(descriptor),
        list: () => host.list(),
        open: id => host.open(id),
        close: () => host.close(),
        get active() {
            return host.active;
        },
        subscribe: listener => host.subscribe(listener),
    });
}
export const scenesDriver = {
    id: 'dsh-tui-scenes',
    upstreamFamily: 'dsh-tui',
    capability: 'host.scenes',
    mountEffectClass: 'register',
    detect: detectScenesCapability,
    verifyLive: verifyScenesLive,
    async mount(context) {
        const host = sceneHost(context);
        const ports = host === undefined ? undefined : { scenes: createScenesPort(host) };
        return { disposer: () => undefined, ...(ports === undefined ? {} : { ports }) };
    },
};
