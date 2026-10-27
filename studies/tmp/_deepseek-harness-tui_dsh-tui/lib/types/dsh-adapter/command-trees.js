/** Provider-neutral subcommand completion registry for terminal front doors. */
import { Service } from '@deepseek-ai/cordis';
import { activationFiber, bindCallerEffect, compositionRoot, concreteService, requirePluginCaller } from './host-access.js';
import { adapterRuntimeFor } from '../adapter/kernel/runtime-context.js';
import { assertCapabilityShadowPolicy, } from '../adapter/kernel/runtime.js';
export const name = 'dsh-tui-command-trees';
/** Small host-only registry; command execution remains owned by dsh-commands. */
export class TuiCommandTreeRuntime extends Service {
    constructor(ctx) {
        super(ctx, 'tuiCommandTrees');
        compositionRoot(ctx);
        const runtime = this;
        const state = { providers: new Map(), owners: new Map(), host: undefined, runtime: adapterRuntimeFor(ctx) };
        state.host = Object.freeze({
            register: (provider) => {
                const state = commandTreeStateFor(runtime);
                const root = provider.root.trim().toLowerCase();
                if (!/^[a-z][a-z0-9_-]*$/u.test(root) || state.providers.has(root))
                    return () => { };
                const normalized = { ...provider, root };
                state.providers.set(root, normalized);
                return () => {
                    if (state.providers.get(root) !== normalized)
                        return;
                    state.providers.delete(root);
                    state.owners.delete(root);
                };
            },
            children: path => childrenFor(runtime, path),
            descriptions: root => descriptionsFor(runtime, root),
        });
        commandTreeStates.set(this, state);
    }
    register(provider) {
        assertCapabilityShadowPolicy('host.command-trees.register', commandTreeStateFor(this).runtime.mode, commandTreeStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiCommandTrees.register', this);
        const state = commandTreeStateFor(this);
        const owner = activationFiber(caller);
        if (owner === undefined)
            throw new Error('dsh-tui: tuiCommandTrees.register requires a live activation');
        const root = provider.root.trim().toLowerCase();
        if (!/^[a-z][a-z0-9_-]*$/u.test(root))
            throw new TypeError(`invalid TUI command-tree root: ${provider.root}`);
        if (state.providers.has(root))
            throw new Error(`TUI command-tree root "${root}" is already registered`);
        const normalized = { ...provider, root };
        state.providers.set(root, normalized);
        state.owners.set(root, owner);
        const dispose = () => {
            if (state.providers.get(root) !== normalized)
                return;
            state.providers.delete(root);
            state.owners.delete(root);
        };
        bindCallerEffect(caller, dispose);
        return dispose;
    }
    children(canonicalPath) {
        assertCapabilityShadowPolicy('host.command-trees.children', commandTreeStateFor(this).runtime.mode, commandTreeStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiCommandTrees.children', this);
        const owner = activationFiber(caller);
        return childrenFor(this, canonicalPath, owner);
    }
    descriptions(root) {
        assertCapabilityShadowPolicy('host.command-trees.descriptions', commandTreeStateFor(this).runtime.mode, commandTreeStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiCommandTrees.descriptions', this);
        const owner = activationFiber(caller);
        return descriptionsFor(this, root, owner);
    }
}
const commandTreeStates = new WeakMap();
function commandTreeStateFor(runtime) {
    const state = commandTreeStates.get(concreteService(runtime));
    if (state === undefined)
        throw new Error('tuiCommandTrees host state is unavailable');
    return state;
}
function childrenFor(runtime, canonicalPath, owner) {
    const state = commandTreeStateFor(runtime);
    const root = canonicalPath[0]?.toLowerCase();
    if (root === undefined || (owner !== undefined && state.owners.get(root) !== owner))
        return [];
    const provider = state.providers.get(root);
    if (provider === undefined)
        return [];
    try {
        return provider.children(canonicalPath);
    }
    catch {
        // Completion is optional UI metadata and must never block execution.
        return [];
    }
}
function descriptionsFor(runtime, root, owner) {
    const state = commandTreeStateFor(runtime);
    const normalized = root.trim().toLowerCase();
    if (owner !== undefined && state.owners.get(normalized) !== owner)
        return undefined;
    return state.providers.get(normalized)?.descriptions;
}
export function getHostCommandTrees(runtime) {
    if (runtime === undefined)
        return undefined;
    try {
        return commandTreeStateFor(runtime).host;
    }
    catch {
        return undefined;
    }
}
export default TuiCommandTreeRuntime;
