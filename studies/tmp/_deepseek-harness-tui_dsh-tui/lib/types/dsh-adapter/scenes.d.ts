/** Provider-neutral full-screen scene registry for terminal front doors. */
import type React from 'react';
import { Context, Service } from '@deepseek-ai/cordis';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
/**
 * Props every plugin scene receives. Both element creation and hooks must go
 * through the HOST's React, never the plugin's own copy:
 *
 * - Hooks: a component rendered by this TUI's reconciler but calling hooks
 *   imported from a second React copy (the plugin's own node_modules) dies
 *   with an invalid-hook-call on first render. Use the injected `React`.
 * - Elements: this app's reconciler (React 19) accepts only
 *   `Symbol.for('react.transitional.element')` elements. JSX compiled
 *   against a plugin-bundled older React emits `Symbol.for('react.element')`
 *   and throws on first render. Create elements with the injected `React`
 *   (`React.createElement`/`React.Fragment`), or compile JSX against the
 *   host runtime via tsconfig
 *   `"jsxImportSource": "@deepseek-harness-tui/dsh-tui"` (its `./jsx-runtime`
 *   subpath re-exports this app's own react/jsx-runtime). A plugin-owned
 *   React copy works ONLY if it is the same React 19 line — and its hooks
 *   remain off-limits regardless.
 */
export interface TuiSceneProps {
    /** The TUI's React instance — use THIS for every hook and element. */
    React: typeof React;
    /** The TUI's ui kit (Box/Text/useInput/useTerminalSize/…). */
    ui: typeof import('../ui.js');
    /** Live session channel: rows, status, trace events, notifications. */
    channel: Channel;
    /** Leave the scene and return to whatever screen was up before. */
    close(): void;
}
export interface TuiSceneDescriptor {
    /** Unique scene id (kebab-case); the plugin's own commands open it by id. */
    id: string;
    /** Optional human label for logs/debugging; the scene renders its own header. */
    title?: string;
    component: React.ComponentType<TuiSceneProps>;
}
/** Host-only scene controls used by the channel; omitted from the plugin export. */
export interface TuiSceneHost {
    readonly active: TuiSceneDescriptor | undefined;
    register(descriptor: TuiSceneDescriptor): () => void;
    list(): readonly TuiSceneDescriptor[];
    open(id: string): boolean;
    close(): void;
    subscribe(listener: () => void): () => void;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiScenes: TuiSceneRuntime;
    }
}
export declare const name = "dsh-tui-scenes";
/**
 * Small host-only registry; command execution remains owned by dsh-commands.
 *
 * A plugin registers a scene once (`ctx.tuiScenes.register(...)`, keep the
 * dispose) and opens it from anywhere host-side — typically its own
 * dsh-commands handler: `ctx.tuiScenes.open('my-scene')` plus a silent
 * `success` result, so the conversation stays untouched while the scene
 * takes the whole terminal the way the trajectory scene does.
 */
export declare class TuiSceneRuntime extends Service {
    constructor(ctx: Context);
    /**
     * Register a full-screen scene; returns the dispose function (caller
     * scopes it with `ctx.effect`). The optional trailing `identity` (the
     * plugin's own ctx) only feeds the effect ledger's pluginId — omitting it
     * records `undeclared` (C-060).
     */
    register(descriptor: TuiSceneDescriptor, identity?: Context): () => void;
    /**
     * Swap the conversation for the named scene. Returns false (and warns)
     * when no plugin registered that id — a mistyped id must fail visibly in
     * the log, not silently do nothing in the UI.
     */
    open(id: string): boolean;
    close(): void;
    /** The scene currently replacing the conversation, if any. */
    get active(): TuiSceneDescriptor | undefined;
    /** UI-side change feed: fired after every open/close/dispose transition. */
    subscribe(listener: () => void): () => void;
}
export declare function getHostSceneRuntime(runtime: TuiSceneRuntime | undefined): TuiSceneHost | undefined;
export default TuiSceneRuntime;
//# sourceMappingURL=scenes.d.ts.map