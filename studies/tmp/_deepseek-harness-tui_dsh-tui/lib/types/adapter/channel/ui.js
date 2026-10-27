/** In-process renderer capability, deliberately separate from JSON snapshots.
 * Every returned executable handle captures the same channel lifetime. No
 * handle can resolve a later registration or bypass policy through a factory.
 */
import { assertShadowPolicy } from '../kernel/runtime.js';
import { completeCommands } from '../../commands.js';
import { createChannelReadView } from './read-view.js';
import { CHANNEL_UI_EFFECTS, CHANNEL_UI_PROPERTIES } from './ui-policy.js';
function throwCleanupFailures(failures, message) {
    if (failures.length === 1)
        throw failures[0];
    if (failures.length > 1)
        throw new AggregateError(failures, message);
}
/** What every read of an ended Channel UI lifetime throws. */
export const CHANNEL_UI_LIFETIME_ENDED = 'dsh-tui: Channel UI lifetime has ended';
export function createChannelUiLease(isCurrent) {
    let active = true;
    const disposers = new Set();
    return {
        assertActive() {
            if (!active || !isCurrent())
                throw new Error(CHANNEL_UI_LIFETIME_ENDED);
        },
        own(dispose) {
            let released = false;
            const release = () => {
                if (released)
                    return;
                released = true;
                disposers.delete(release);
                dispose();
            };
            if (!active || !isCurrent())
                release();
            else
                disposers.add(release);
            return release;
        },
        dispose() {
            if (!active)
                return;
            active = false;
            const failures = [];
            for (const dispose of [...disposers]) {
                try {
                    dispose();
                }
                catch (error) {
                    failures.push(error);
                }
            }
            throwCleanupFailures(failures, 'dsh-tui: Channel UI cleanup failed');
        },
    };
}
/** The same factory is used by the kernel and bare production composition. */
export function createChannelUi(channel, mode, lease) {
    const check = (effect) => {
        lease.assertActive();
        assertShadowPolicy(effect, mode);
    };
    const read = createChannelReadView(mutation => check(mutation ? 'mutate' : 'read-only'));
    const project = (value) => read(value, channel.version);
    const query = (value) => createChannelReadView(mutation => check(mutation ? 'mutate' : 'read-only'))(value, 0);
    const settle = (value) => {
        if (value instanceof Promise)
            return value.then(result => { check('read-only'); return query(result); });
        return query(value);
    };
    function methods(target, effects) {
        const result = {};
        for (const key of Object.keys(effects)) {
            const fn = target[key];
            if (typeof fn !== 'function')
                throw new Error(`dsh-tui: missing Channel handle method ${key}`);
            result[key] = (...args) => {
                check(effects[key]);
                return settle(Reflect.apply(fn, target, args));
            };
        }
        return Object.freeze(result);
    }
    const view = {};
    for (const key of CHANNEL_UI_PROPERTIES) {
        Object.defineProperty(view, key, {
            enumerable: true,
            get() {
                check('read-only');
                if (key === 'subagentControl') {
                    const control = channel.subagentControl;
                    const projected = methods(control, { interrupt: 'mutate' });
                    const history = control.history;
                    // The transcript read is an optional capability (Claude only): the
                    // method's absence is the signal the detail scene reads.
                    if (history === undefined)
                        return projected;
                    return Object.freeze({ ...projected, history: (id, window) => { check('read-only'); return history.call(control, id, window); } });
                }
                if (key === 'jobControl') {
                    const control = channel.jobControl;
                    if (control === undefined)
                        return undefined;
                    const projected = methods(control, { kill: 'mutate' });
                    const watch = control.watchOutput;
                    if (watch === undefined)
                        return projected;
                    // A renderer observation of an on-screen card (like `subscribe`):
                    // the lease owns the unwatch, so a card unmounting after the
                    // channel's release is a no-op.
                    return Object.freeze({ ...projected, watchOutput: (id) => { check('read-only'); return lease.own(watch.call(control, id)); } });
                }
                if (key === 'autoRecapOnOpen' && (mode === 'passive-shadow' || mode === 'replay-shadow'))
                    return false;
                if (key === 'pluginScene') {
                    const scene = channel.pluginScene;
                    return scene === undefined ? undefined : project({ id: scene.id, title: scene.title });
                }
                return project(channel[key]);
            },
        });
    }
    for (const key of Object.keys(CHANNEL_UI_EFFECTS)) {
        view[key] = (...args) => {
            // Shadow probes may read the already-observed catalog/tier table, but
            // must not warm service caches or emit query-error notifications.
            if (mode === 'passive-shadow' || mode === 'replay-shadow') {
                if (key === 'commandCompletions') {
                    check('read-only');
                    return completeCommands(String(args[0] ?? ''), channel.commandList);
                }
                if (key === 'listEfforts') {
                    check('read-only');
                    const route = args[0];
                    const live = route === undefined || (route.provider === channel.provider && route.model === channel.model);
                    return Promise.resolve({ efforts: (live ? channel.effortLevels ?? [] : []).map(id => ({ id, name: id })), defaultEffort: undefined });
                }
            }
            // A renderer observes the already-owned Channel emitter, never mounts
            // upstream service listeners. Keep this local observation distinct from
            // Host Port subscribe capabilities, whose shadow policy is unchanged.
            const observation = key === 'subscribe' || key === 'subscribeAgentView' || key === 'subscribeSettingsSections';
            check(observation ? 'read-only' : CHANNEL_UI_EFFECTS[key]);
            const result = Reflect.apply(channel[key], channel, args);
            if (key === 'notify') {
                const timeout = args[1]?.timeoutMs ?? 4000;
                let timer;
                const release = lease.own(() => { if (timer !== undefined)
                    clearTimeout(timer); result(); });
                if (timeout > 0)
                    timer = setTimeout(release, timeout);
                return release;
            }
            if (observation)
                return lease.own(result);
            if (key === 'backendChannels' && result !== undefined) {
                return methods(result, {
                    snapshot: 'read-only', peekImport: 'read-only', activate: 'mutate', importFromSettings: 'mutate', save: 'mutate', remove: 'mutate',
                });
            }
            if (key === 'backendAuth' && result !== undefined) {
                const host = result;
                const login = methods({ login: present => host.login((oauth, provider) => settle(present(query(oauth), provider))) }, { login: 'mutate' });
                if (host.logout === undefined)
                    return login;
                return Object.freeze({ ...login, ...methods({ logout: () => host.logout() }, { logout: 'mutate' }) });
            }
            if (key === 'backendModes' && result !== undefined) {
                return methods(result, { snapshot: 'read-only', set: 'mutate' });
            }
            if (key === 'backendMcp' && result !== undefined) {
                return methods(result, { reconnect: 'mutate', toggle: 'mutate' });
            }
            if (key === 'backendGoals' && result !== undefined) {
                return methods(result, { set: 'mutate', pause: 'mutate', resume: 'mutate', clear: 'mutate' });
            }
            if (key === 'settingsHost' && result !== undefined) {
                return methods(result, {
                    listNamespaces: 'read-only', credentialConfigured: 'read-only', write: 'mutate', writeCredential: 'mutate',
                });
            }
            if (key === 'providerSetup' && result !== undefined) {
                const host = result;
                const { oauth, ...base } = host;
                return Object.freeze({
                    ...methods(base, {
                        listCatalogProviders: 'read-only', listConfiguredProviders: 'read-only', listRefUsers: 'read-only',
                        routeExists: 'read-only', envShadows: 'read-only', envValue: 'mutate', readCredential: 'mutate',
                        discoverModels: 'mutate', writeCredential: 'mutate', removeCredential: 'mutate',
                        writeProfile: 'mutate', mutateProfile: 'mutate', removeProfile: 'mutate',
                    }),
                    ...(oauth === undefined ? {} : { oauth: methods(oauth, { providers: 'read-only', login: 'mutate', logout: 'mutate' }) }),
                });
            }
            // The session event log is an append-only, JSON-safe read whose snapshot
            // array is replaced by the session on every append. Running it through
            // the detached read projection cost O(events) per call, and Chat folds
            // the trajectory from it on EVERY render: a long session (hundreds of
            // thousands of chunks) paid hundreds of milliseconds per frame while
            // streaming or scrolling — measured 322us @2k events, 2.7ms @20k,
            // 65ms @200k. The snapshot array is already frozen by the session, so
            // hand it back as-is; the lease/shadow `check()` above still gates the
            // call itself (same contract as before the Channel UI split).
            if (key === 'traceEvents' || key === 'trajectoryLaneEvents')
                return result;
            if (key === 'agentViewRows' || key === 'settingsSections')
                return project(result);
            return settle(result);
        };
    }
    return Object.freeze(view);
}
