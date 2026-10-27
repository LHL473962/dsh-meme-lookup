/**
 * Upstream drivers for the TUI extension seams.
 *
 * Each driver is a per-capability adapter over a legacy host-only facade:
 * status, shortcuts, renderers, themes, toast, and command trees. All
 * register/subscribe probes use a unique temporary id, verify visibility,
 * dispose, then prove the same id is again available (no residue). Read-only
 * drivers only issue host-internal reads.
 */
import { randomUUID } from 'node:crypto';
import { lifecycleFromDetection } from '../kernel/lifecycle.js';
import { getHostStatusStore } from '../../dsh-adapter/status.js';
import { getHostShortcuts } from '../../dsh-adapter/shortcuts.js';
import { getHostRenderers } from '../../dsh-adapter/renderers.js';
import { getHostThemes } from '../../dsh-adapter/themes.js';
import { getHostToastStore } from '../../dsh-adapter/toast.js';
import { getHostCommandTrees } from '../../dsh-adapter/command-trees.js';
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
function degraded(capability, service, missing, evidence = []) {
    return [lifecycleFromDetection(capability, { state: 'degraded', missing: [...missing], evidence })];
}
function degradedFeature(capability, evidence, missing) {
    return lifecycleFromDetection(capability, { state: 'degraded', missing: [missing], evidence });
}
function liveFeature(capability, evidence) {
    return lifecycleFromDetection(capability, { state: 'supported', evidence });
}
// ── status ────────────────────────────────────────────────────────────────
export function detectStatusCapability(ctx) {
    const service = ctx?.get?.('tuiStatus');
    if (service === undefined)
        return { state: 'unsupported', reason: 'tuiStatus service is not mounted' };
    const evidence = [serviceEvidence('tuiStatus')];
    let store;
    try {
        store = getHostStatusStore(service);
    }
    catch {
        store = undefined;
    }
    if (store === undefined)
        return { state: 'degraded', missing: ['tuiStatus host store'], evidence };
    for (const method of ['set', 'getSnapshot', 'subscribe']) {
        if (typeof store[method] !== 'function') {
            return { state: 'degraded', missing: [`tuiStatus.${method}()`], evidence };
        }
    }
    return { state: 'supported', evidence };
}
async function verifyStatusLive(ctx) {
    const service = ctx?.get?.('tuiStatus');
    const store = service === undefined ? undefined : (() => {
        try {
            return getHostStatusStore(service);
        }
        catch {
            return undefined;
        }
    })();
    const baseEvidence = [serviceEvidence('tuiStatus')];
    if (store === undefined) {
        return [
            degradedFeature('host.status.set', baseEvidence, 'tuiStatus host store'),
            degradedFeature('host.status.snapshot', baseEvidence, 'tuiStatus host store'),
            degradedFeature('host.status.subscribe', baseEvidence, 'tuiStatus host store'),
        ];
    }
    const evidence = [serviceEvidence('tuiStatus')];
    const key = `dsh_tui_probe_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const token = Math.floor(Math.random() * 0x7fffffff);
    let setLive = false;
    try {
        store.set(key, 'ok', token);
        const snapshot = store.getSnapshot();
        if (!snapshot.some(entry => entry.key === key)) {
            throw new Error('temporary status was not visible');
        }
        evidence.push(probeEvidence(`tuiStatus.set+clear(${key})`, 'temporary status set and visible'));
        const cleared = store.clearIf(key, token);
        if (cleared !== true) {
            throw new Error('temporary status clearIf returned false');
        }
        const after = store.getSnapshot();
        if (after.some(entry => entry.key === key)) {
            throw new Error('temporary status left residue after clear');
        }
        evidence.push(probeEvidence('tuiStatus.clear()', 'temporary status removed and no residue remains'));
        setLive = true;
    }
    catch (error) {
        try {
            store.clearIf(key, token);
        }
        catch {
            // Best-effort cleanup.
        }
        evidence.push(probeEvidence('tuiStatus.reversible-live-probe', errorText(error)));
    }
    const out = [];
    out.push(setLive
        ? liveFeature('host.status.set', evidence)
        : degradedFeature('host.status.set', evidence, 'tuiStatus.reversible-live-probe'));
    out.push(setLive
        ? liveFeature('host.status.snapshot', [
            serviceEvidence('tuiStatus'),
            probeEvidence('tuiStatus.snapshot()', 'temporary status visible and removed in snapshot'),
        ])
        : degradedFeature('host.status.snapshot', [serviceEvidence('tuiStatus')], 'tuiStatus.snapshot() live-probe'));
    out.push(degradedFeature('host.status.subscribe', [serviceEvidence('tuiStatus')], 'host.status.subscribe.live-probe'));
    return out;
}
function createStatusPort(store) {
    let tokenSeq = 1;
    return Object.freeze({
        set(key, text) {
            const token = tokenSeq++;
            store.set(key, text === undefined ? undefined : String(text), token);
            return () => {
                store.clearIf(key, token);
            };
        },
        snapshot: () => store.getSnapshot(),
        subscribe: listener => store.subscribe(listener),
    });
}
// ── shortcuts ─────────────────────────────────────────────────────────────
export function detectShortcutsCapability(ctx) {
    const service = ctx?.get?.('tuiShortcuts');
    if (service === undefined)
        return { state: 'unsupported', reason: 'tuiShortcuts service is not mounted' };
    const evidence = [serviceEvidence('tuiShortcuts')];
    let host;
    try {
        host = getHostShortcuts(service);
    }
    catch {
        host = undefined;
    }
    if (host === undefined)
        return { state: 'degraded', missing: ['tuiShortcuts host facade'], evidence };
    for (const method of ['register', 'list', 'dispatch']) {
        if (typeof host[method] !== 'function') {
            return { state: 'degraded', missing: [`tuiShortcuts.${method}()`], evidence };
        }
    }
    return { state: 'supported', evidence };
}
async function verifyShortcutsLive(ctx) {
    const service = ctx?.get?.('tuiShortcuts');
    const host = service === undefined ? undefined : (() => {
        try {
            return getHostShortcuts(service);
        }
        catch {
            return undefined;
        }
    })();
    const baseEvidence = [serviceEvidence('tuiShortcuts')];
    if (host === undefined) {
        return [
            degradedFeature('host.shortcuts.register', baseEvidence, 'tuiShortcuts host facade'),
            degradedFeature('host.shortcuts.list', baseEvidence, 'tuiShortcuts host facade'),
            degradedFeature('host.shortcuts.dispatch', baseEvidence, 'tuiShortcuts host facade'),
        ];
    }
    const evidence = [serviceEvidence('tuiShortcuts')];
    const shortcutKeys = ['9', '0', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'b', 'n', 'm'];
    const combo = `ctrl+alt+shift+${shortcutKeys[Math.floor(Math.random() * shortcutKeys.length)]}`;
    const options = { description: 'dsh-tui reversible shortcut probe', handler: () => undefined };
    let activeCombo = combo;
    let dispose;
    let observed = false;
    let registerLive = false;
    try {
        dispose = host.register(combo, options);
        const listed = host.list();
        observed = Array.isArray(listed) && listed.some(entry => entry.combo === combo);
        if (!observed) {
            for (const candidate of shortcutKeys) {
                const candidateCombo = `ctrl+alt+shift+${candidate}`;
                dispose?.();
                dispose = undefined;
                dispose = host.register(candidateCombo, options);
                const candidateList = host.list();
                if (Array.isArray(candidateList) && candidateList.some(entry => entry.combo === candidateCombo)) {
                    activeCombo = candidateCombo;
                    observed = true;
                    break;
                }
            }
            if (!observed)
                throw new Error('temporary shortcut was not visible');
        }
        evidence.push(probeEvidence(`tuiShortcuts.register+list(${activeCombo})`, 'temporary shortcut registered and listed'));
        dispose();
        dispose = undefined;
        const second = host.register(activeCombo, options);
        second();
        evidence.push(probeEvidence(`tuiShortcuts.dispose(${activeCombo})`, 'temporary shortcut removed; same combo re-register succeeded'));
        registerLive = true;
    }
    catch (error) {
        try {
            dispose?.();
        }
        catch {
            // ignore
        }
        evidence.push(probeEvidence('tuiShortcuts.reversible-live-probe', errorText(error)));
    }
    const out = [];
    out.push(registerLive
        ? liveFeature('host.shortcuts.register', evidence)
        : degradedFeature('host.shortcuts.register', evidence, 'tuiShortcuts.reversible-live-probe'));
    out.push(registerLive
        ? liveFeature('host.shortcuts.list', [
            serviceEvidence('tuiShortcuts'),
            methodEvidence('tuiShortcuts', 'list'),
            probeEvidence('tuiShortcuts.list()', 'temporary shortcut visible through list()'),
        ])
        : degradedFeature('host.shortcuts.list', [serviceEvidence('tuiShortcuts'), methodEvidence('tuiShortcuts', 'list')], 'tuiShortcuts.list() live-probe'));
    out.push(degradedFeature('host.shortcuts.dispatch', [serviceEvidence('tuiShortcuts'), methodEvidence('tuiShortcuts', 'dispatch')], 'host.shortcuts.dispatch.live-probe'));
    return out;
}
function createShortcutsPort(host) {
    return Object.freeze({
        register: (combo, options) => host.register(combo, options),
        list: () => host.list(),
        dispatch: (input, key) => host.dispatch(input, key),
    });
}
// ── renderers ─────────────────────────────────────────────────────────────
export function detectRenderersCapability(ctx) {
    const service = ctx?.get?.('tuiRenderers');
    if (service === undefined)
        return { state: 'unsupported', reason: 'tuiRenderers service is not mounted' };
    const evidence = [serviceEvidence('tuiRenderers')];
    let host;
    try {
        host = getHostRenderers(service);
    }
    catch {
        host = undefined;
    }
    if (host === undefined)
        return { state: 'degraded', missing: ['tuiRenderers host facade'], evidence };
    for (const method of ['register', 'render']) {
        if (typeof host[method] !== 'function') {
            return { state: 'degraded', missing: [`tuiRenderers.${method}()`], evidence };
        }
    }
    return { state: 'supported', evidence };
}
async function verifyRenderersLive(ctx) {
    const service = ctx?.get?.('tuiRenderers');
    const host = service === undefined ? undefined : (() => {
        try {
            return getHostRenderers(service);
        }
        catch {
            return undefined;
        }
    })();
    const baseEvidence = [serviceEvidence('tuiRenderers')];
    if (host === undefined) {
        return [
            degradedFeature('host.renderers.register', baseEvidence, 'tuiRenderers host facade'),
            degradedFeature('host.renderers.render', baseEvidence, 'tuiRenderers host facade'),
        ];
    }
    const evidence = [serviceEvidence('tuiRenderers')];
    const type = `dsh-tui/probe-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    let dispose;
    let registerLive = false;
    try {
        dispose = host.register(type, payload => ({ lines: ['probe-ok', typeof payload] }));
        const result = host.render(type, 'x');
        if (result === undefined || !Array.isArray(result.lines)) {
            throw new Error('temporary renderer did not produce output');
        }
        evidence.push(probeEvidence(`tuiRenderers.register+render(${type})`, 'temporary renderer registered and rendered'));
        dispose();
        dispose = undefined;
        if (host.render(type, 'x') !== undefined) {
            throw new Error('temporary renderer left residue after dispose');
        }
        evidence.push(probeEvidence(`tuiRenderers.dispose(${type})`, 'temporary renderer removed; render(disposed) returned undefined'));
        registerLive = true;
    }
    catch (error) {
        try {
            dispose?.();
        }
        catch {
            // ignore
        }
        evidence.push(probeEvidence('tuiRenderers.reversible-live-probe', errorText(error)));
    }
    const out = [];
    out.push(registerLive
        ? liveFeature('host.renderers.register', evidence)
        : degradedFeature('host.renderers.register', evidence, 'tuiRenderers.reversible-live-probe'));
    out.push(registerLive
        ? liveFeature('host.renderers.render', [
            serviceEvidence('tuiRenderers'),
            methodEvidence('tuiRenderers', 'render'),
            probeEvidence('tuiRenderers.render()', 'temporary renderer produced output and disposed cleanly'),
        ])
        : degradedFeature('host.renderers.render', [serviceEvidence('tuiRenderers'), methodEvidence('tuiRenderers', 'render')], 'tuiRenderers.render() live-probe'));
    return out;
}
function createRenderersPort(host) {
    return Object.freeze({
        register: (type, renderer) => host.register(type, renderer),
        render: (type, payload) => host.render(type, payload),
    });
}
// ── themes ────────────────────────────────────────────────────────────────
export function detectThemesCapability(ctx) {
    const service = ctx?.get?.('tuiThemes');
    if (service === undefined)
        return { state: 'unsupported', reason: 'tuiThemes service is not mounted' };
    const evidence = [serviceEvidence('tuiThemes')];
    let host;
    try {
        host = getHostThemes(service);
    }
    catch {
        host = undefined;
    }
    if (host === undefined)
        return { state: 'degraded', missing: ['tuiThemes host facade'], evidence };
    for (const method of ['register', 'getSnapshot', 'resolve']) {
        if (typeof host[method] !== 'function') {
            return { state: 'degraded', missing: [`tuiThemes.${method}()`], evidence };
        }
    }
    return { state: 'supported', evidence };
}
async function verifyThemesLive(ctx) {
    const service = ctx?.get?.('tuiThemes');
    const host = service === undefined ? undefined : (() => {
        try {
            return getHostThemes(service);
        }
        catch {
            return undefined;
        }
    })();
    const baseEvidence = [serviceEvidence('tuiThemes')];
    if (host === undefined) {
        return [
            degradedFeature('host.themes.register', baseEvidence, 'tuiThemes host facade'),
            degradedFeature('host.themes.snapshot', baseEvidence, 'tuiThemes host facade'),
            degradedFeature('host.themes.resolver', baseEvidence, 'tuiThemes host facade'),
            degradedFeature('host.themes.subscribe', baseEvidence, 'tuiThemes host facade'),
        ];
    }
    const evidence = [serviceEvidence('tuiThemes')];
    const name = `dshtuiprobe${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    let dispose;
    let registerLive = false;
    try {
        dispose = host.register({ name, displayName: 'dsh-tui probe', base: 'dark', colors: {} });
        const snapshot = host.getSnapshot();
        if (!snapshot.some(entry => entry.name === name)) {
            throw new Error('temporary theme was not visible');
        }
        if (host.resolve(name) === undefined) {
            throw new Error('temporary theme did not resolve');
        }
        evidence.push(probeEvidence(`tuiThemes.register+resolve(${name})`, 'temporary theme registered and resolved'));
        dispose();
        dispose = undefined;
        if (host.resolve(name) !== undefined) {
            throw new Error('temporary theme left residue after dispose');
        }
        evidence.push(probeEvidence(`tuiThemes.dispose(${name})`, 'temporary theme removed; resolve(disposed) returned undefined'));
        registerLive = true;
    }
    catch (error) {
        try {
            dispose?.();
        }
        catch {
            // ignore
        }
        evidence.push(probeEvidence('tuiThemes.reversible-live-probe', errorText(error)));
    }
    const out = [];
    out.push(registerLive
        ? liveFeature('host.themes.register', evidence)
        : degradedFeature('host.themes.register', evidence, 'tuiThemes.reversible-live-probe'));
    out.push(registerLive
        ? liveFeature('host.themes.snapshot', [
            serviceEvidence('tuiThemes'),
            methodEvidence('tuiThemes', 'getSnapshot'),
            probeEvidence('tuiThemes.snapshot()', 'temporary theme visible in snapshot'),
        ])
        : degradedFeature('host.themes.snapshot', [serviceEvidence('tuiThemes')], 'tuiThemes.snapshot() live-probe'));
    out.push(registerLive
        ? liveFeature('host.themes.resolver', [
            serviceEvidence('tuiThemes'),
            methodEvidence('tuiThemes', 'resolve'),
            probeEvidence('tuiThemes.resolve()', 'temporary theme resolved and removed cleanly'),
        ])
        : degradedFeature('host.themes.resolver', [serviceEvidence('tuiThemes'), methodEvidence('tuiThemes', 'resolve')], 'tuiThemes.resolve() live-probe'));
    out.push(degradedFeature('host.themes.subscribe', [serviceEvidence('tuiThemes')], 'host.themes.subscribe.live-probe'));
    return out;
}
function createThemesPort(host) {
    return Object.freeze({
        register: descriptor => host.register(descriptor),
        snapshot: () => host.getSnapshot(),
        resolve: name => host.resolve(name),
        subscribe: listener => host.subscribe(listener),
    });
}
// ── toast ─────────────────────────────────────────────────────────────────
export function detectToastCapability(ctx) {
    const service = ctx?.get?.('tuiToast');
    if (service === undefined)
        return { state: 'unsupported', reason: 'tuiToast service is not mounted' };
    const evidence = [serviceEvidence('tuiToast')];
    let store;
    try {
        store = getHostToastStore(service);
    }
    catch {
        store = undefined;
    }
    if (store === undefined)
        return { state: 'degraded', missing: ['tuiToast host store'], evidence };
    if (typeof store.addProbeSink !== 'function' || typeof store.deliverProbe !== 'function') {
        return { state: 'degraded', missing: ['tuiToast store probe methods'], evidence };
    }
    return { state: 'supported', evidence };
}
async function verifyToastLive(ctx) {
    const service = ctx?.get?.('tuiToast');
    const store = service === undefined ? undefined : (() => {
        try {
            return getHostToastStore(service);
        }
        catch {
            return undefined;
        }
    })();
    const baseEvidence = [serviceEvidence('tuiToast')];
    if (store === undefined) {
        return [degradedFeature('host.toast.show', baseEvidence, 'tuiToast host store')];
    }
    const evidence = [
        serviceEvidence('tuiToast'),
        methodEvidence('tuiToast', 'deliver'),
    ];
    // `deliverProbe()` proves only that a probe-only channel works; it does NOT
    // prove the real production `deliver()` path (channel.notify / UI sink) is
    // wired and non-disruptively reachable. Without a non-disruptive real
    // production-delivery probe, `host.toast.show` must remain degraded.
    evidence.push(probeEvidence('tuiToast.hasSink()', typeof store.hasSink === 'function' && store.hasSink()
        ? 'production toast sink is present, but real delivery path is not verified by a non-disruptive probe'
        : 'production toast sink is absent'));
    return [degradedFeature('host.toast.show', evidence, 'host.toast.show.real-production-delivery-not-verified')];
}
function createToastPort(store) {
    return Object.freeze({
        show: delivery => store.deliver(delivery),
    });
}
// ── command trees ─────────────────────────────────────────────────────────
export function detectCommandTreesCapability(ctx) {
    const service = ctx?.get?.('tuiCommandTrees');
    if (service === undefined)
        return { state: 'unsupported', reason: 'tuiCommandTrees service is not mounted' };
    const evidence = [serviceEvidence('tuiCommandTrees')];
    let host;
    try {
        host = getHostCommandTrees(service);
    }
    catch {
        host = undefined;
    }
    if (host === undefined)
        return { state: 'degraded', missing: ['tuiCommandTrees host facade'], evidence };
    for (const method of ['register', 'children', 'descriptions']) {
        if (typeof host[method] !== 'function') {
            return { state: 'degraded', missing: [`tuiCommandTrees.${method}()`], evidence };
        }
    }
    return { state: 'supported', evidence };
}
async function verifyCommandTreesLive(ctx) {
    const service = ctx?.get?.('tuiCommandTrees');
    const host = service === undefined ? undefined : (() => {
        try {
            return getHostCommandTrees(service);
        }
        catch {
            return undefined;
        }
    })();
    const baseEvidence = [serviceEvidence('tuiCommandTrees')];
    if (host === undefined) {
        return [
            degradedFeature('host.command-trees.register', baseEvidence, 'tuiCommandTrees host facade'),
            degradedFeature('host.command-trees.children', baseEvidence, 'tuiCommandTrees host facade'),
            degradedFeature('host.command-trees.descriptions', baseEvidence, 'tuiCommandTrees host facade'),
        ];
    }
    const evidence = [serviceEvidence('tuiCommandTrees')];
    const root = `dshtuiprobe${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    let dispose;
    let registerLive = false;
    try {
        dispose = host.register({ root, children: () => [{ value: 'child' }] });
        const children = host.children([root]);
        if (!Array.isArray(children) || children.length === 0) {
            throw new Error('temporary command tree did not resolve children');
        }
        evidence.push(probeEvidence(`tuiCommandTrees.register+children(${root})`, 'temporary command tree registered and resolved'));
        dispose();
        dispose = undefined;
        if (host.children([root]).length !== 0) {
            throw new Error('temporary command tree left residue after dispose');
        }
        evidence.push(probeEvidence(`tuiCommandTrees.dispose(${root})`, 'temporary command tree removed; children(disposed) returned empty'));
        registerLive = true;
    }
    catch (error) {
        try {
            dispose?.();
        }
        catch {
            // ignore
        }
        evidence.push(probeEvidence('tuiCommandTrees.reversible-live-probe', errorText(error)));
    }
    const out = [];
    out.push(registerLive
        ? liveFeature('host.command-trees.register', evidence)
        : degradedFeature('host.command-trees.register', evidence, 'tuiCommandTrees.reversible-live-probe'));
    out.push(registerLive
        ? liveFeature('host.command-trees.children', [
            serviceEvidence('tuiCommandTrees'),
            methodEvidence('tuiCommandTrees', 'children'),
            probeEvidence('tuiCommandTrees.children()', 'temporary command tree resolved children and cleaned up'),
        ])
        : degradedFeature('host.command-trees.children', [serviceEvidence('tuiCommandTrees'), methodEvidence('tuiCommandTrees', 'children')], 'tuiCommandTrees.children() live-probe'));
    out.push(degradedFeature('host.command-trees.descriptions', [serviceEvidence('tuiCommandTrees'), methodEvidence('tuiCommandTrees', 'descriptions')], 'host.command-trees.descriptions.live-probe'));
    return out;
}
function createCommandTreesPort(host) {
    return Object.freeze({
        register: provider => host.register(provider),
        children: path => host.children(path),
        descriptions: root => host.descriptions(root),
    });
}
// ── driver objects ────────────────────────────────────────────────────────
export const statusDriver = {
    id: 'dsh-tui-status',
    upstreamFamily: 'dsh-tui',
    capability: 'host.status',
    mountEffectClass: 'mutate',
    detect: detectStatusCapability,
    verifyLive: verifyStatusLive,
    async mount(context) {
        const service = context?.get?.('tuiStatus');
        const store = service === undefined ? undefined : (() => {
            try {
                return getHostStatusStore(service);
            }
            catch {
                return undefined;
            }
        })();
        const ports = store === undefined ? undefined : { status: createStatusPort(store) };
        return { disposer: () => undefined, ...(ports === undefined ? {} : { ports }) };
    },
};
export const shortcutsDriver = {
    id: 'dsh-tui-shortcuts',
    upstreamFamily: 'dsh-tui',
    capability: 'host.shortcuts',
    mountEffectClass: 'register',
    detect: detectShortcutsCapability,
    verifyLive: verifyShortcutsLive,
    async mount(context) {
        const service = context?.get?.('tuiShortcuts');
        const host = service === undefined ? undefined : (() => {
            try {
                return getHostShortcuts(service);
            }
            catch {
                return undefined;
            }
        })();
        const ports = host === undefined ? undefined : { shortcuts: createShortcutsPort(host) };
        return { disposer: () => undefined, ...(ports === undefined ? {} : { ports }) };
    },
};
export const renderersDriver = {
    id: 'dsh-tui-renderers',
    upstreamFamily: 'dsh-tui',
    capability: 'host.renderers',
    mountEffectClass: 'register',
    detect: detectRenderersCapability,
    verifyLive: verifyRenderersLive,
    async mount(context) {
        const service = context?.get?.('tuiRenderers');
        const host = service === undefined ? undefined : (() => {
            try {
                return getHostRenderers(service);
            }
            catch {
                return undefined;
            }
        })();
        const ports = host === undefined ? undefined : { renderers: createRenderersPort(host) };
        return { disposer: () => undefined, ...(ports === undefined ? {} : { ports }) };
    },
};
export const themesDriver = {
    id: 'dsh-tui-themes',
    upstreamFamily: 'dsh-tui',
    capability: 'host.themes',
    mountEffectClass: 'register',
    detect: detectThemesCapability,
    verifyLive: verifyThemesLive,
    async mount(context) {
        const service = context?.get?.('tuiThemes');
        const host = service === undefined ? undefined : (() => {
            try {
                return getHostThemes(service);
            }
            catch {
                return undefined;
            }
        })();
        const ports = host === undefined ? undefined : { themes: createThemesPort(host) };
        return { disposer: () => undefined, ...(ports === undefined ? {} : { ports }) };
    },
};
export const toastDriver = {
    id: 'dsh-tui-toast',
    upstreamFamily: 'dsh-tui',
    capability: 'host.toast',
    mountEffectClass: 'mutate',
    detect: detectToastCapability,
    verifyLive: verifyToastLive,
    async mount(context) {
        const service = context?.get?.('tuiToast');
        const store = service === undefined ? undefined : (() => {
            try {
                return getHostToastStore(service);
            }
            catch {
                return undefined;
            }
        })();
        const ports = store === undefined ? undefined : { toast: createToastPort(store) };
        return { disposer: () => undefined, ...(ports === undefined ? {} : { ports }) };
    },
};
export const commandTreesDriver = {
    id: 'dsh-tui-command-trees',
    upstreamFamily: 'dsh-tui',
    capability: 'host.command-trees',
    mountEffectClass: 'register',
    detect: detectCommandTreesCapability,
    verifyLive: verifyCommandTreesLive,
    async mount(context) {
        const service = context?.get?.('tuiCommandTrees');
        const host = service === undefined ? undefined : (() => {
            try {
                return getHostCommandTrees(service);
            }
            catch {
                return undefined;
            }
        })();
        const ports = host === undefined ? undefined : { commandTrees: createCommandTreesPort(host) };
        return { disposer: () => undefined, ...(ports === undefined ? {} : { ports }) };
    },
};
