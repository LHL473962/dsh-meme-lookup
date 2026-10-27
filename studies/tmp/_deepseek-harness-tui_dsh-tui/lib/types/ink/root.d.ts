import type { ReactNode } from 'react';
import type { FrameEvent } from './frame.js';
import Ink from './ink.js';
import { type ShutdownInput } from './shutdown-input.js';
/** Options for mounting an Ink app. */
export type RenderOptions = {
    /**
     * Output stream where app will be rendered.
     *
     * @default process.stdout
     */
    stdout?: NodeJS.WriteStream;
    /**
     * Input stream where app will listen for input.
     *
     * @default process.stdin
     */
    stdin?: NodeJS.ReadStream;
    /** Bounded synchronous device drain for a custom stdin; called only while owned. */
    drainStdin?: () => void;
    /**
     * Error stream.
     * @default process.stderr
     */
    stderr?: NodeJS.WriteStream;
    /**
     * Configure whether Ink should listen to Ctrl+C keyboard input and exit the app. This is needed in case `process.stdin` is in raw mode, because then Ctrl+C is ignored by default and process is expected to handle it manually.
     *
     * @default true
     */
    exitOnCtrlC?: boolean;
    /**
     * Patch console methods to ensure console output doesn't mix with Ink output.
     *
     * @default true
     */
    patchConsole?: boolean;
    /** Allow image probing and rendering. Fixed for this root's lifetime; defaults to true. */
    terminalImages?: boolean;
    /**
     * Called after each frame render with timing and flicker information.
     */
    onFrame?: (event: FrameEvent) => void;
};
/**
 * The handle returned by renderSync for an actively rendering Ink app.
 */
export type Instance = {
    /**
     * Replace previous root node with a new one or update props of the current root node.
     */
    rerender: Ink['render'];
    /**
     * Manually unmount the whole Ink app.
     */
    unmount: Ink['unmount'];
    /**
     * Returns a promise, which resolves when app is unmounted.
     */
    waitUntilExit: Ink['waitUntilExit'];
    /**
     * Detach the Ink runtime for process-level shutdown: latches isUnmounted
     * (gating every mouse/alt-screen re-assert), cancels pending renders,
     * releases TTY handlers and stdin raw mode, disposes the querier, and
     * unmounts React without closing the alternate screen. Await the result
     * before releasing UI capabilities; exits during a React commit defer
     * effect cleanup until that commit yields.
     * Exposed on the handle so shutdown code can latch the runtime even when
     * the global instances map lookup misses (stdout identity drift, issue
     * #522) — without it, the cleanup-vs-self-heal window re-enables mouse
     * tracking after DISABLE_MOUSE_TRACKING has already been written.
     */
    detachForShutdown: Ink['detachForShutdown'];
    /**
     * Fully detach stdin before handing the terminal to a child process that
     * inherits it (the /update and /restart handoffs). See Ink's own method
     * for the listener/pump semantics.
     */
    detachStdinForHandoff: Ink['detachStdinForHandoff'];
    /** Drain only this renderer's still-owned input after cleanup. */
    drainStdin: Ink['drainStdin'];
    readonly shutdownInput: ShutdownInput;
    cleanup: () => void;
};
/**
 * A managed Ink root, similar to react-dom's createRoot API.
 * Separates instance creation from rendering so the same root
 * can be reused for multiple sequential screens.
 */
export type Root = {
    /** Retain this lease when wrapping the unmount method. */
    readonly shutdownInput: ShutdownInput;
    render: (node: ReactNode) => void;
    unmount: () => void;
    waitUntilExit: () => Promise<void>;
};
/**
 * Mount a component and render the output.
 * @param node - the React element to render.
 * @param options - the output stream or render options.
 * @returns an instance handle for the running app.
 */
export declare const renderSync: (node: ReactNode, options?: NodeJS.WriteStream | RenderOptions) => Instance;
/**
 * Asynchronous render entry point that preserves a microtask boundary
 * before the first synchronous render, letting async startup work settle.
 * @param node - the React element to render.
 * @param options - the output stream or render options.
 * @returns a promise resolving to the instance handle once mounted.
 */
declare const wrappedRender: (node: ReactNode, options?: NodeJS.WriteStream | RenderOptions) => Promise<Instance>;
export default wrappedRender;
/**
 * Create an Ink root without rendering anything yet.
 * Like react-dom's createRoot — call root.render() to mount a tree.
 * @param options - the render options; defaults match renderSync defaults.
 * @returns a promise resolving to the managed root.
 */
export declare function createRoot(options?: RenderOptions): Promise<Root>;
//# sourceMappingURL=root.d.ts.map