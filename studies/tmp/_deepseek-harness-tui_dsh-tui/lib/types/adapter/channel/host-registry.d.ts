/**
 * Host-internal Channel registry for the adapter Kernel.
 *
 * The live `Channel` is created by the TUI plugin row after the plugin-host
 * Kernel may already have been constructed/mounted. Rather than trying to
 * reorder service mounting, the TUI stores the live Channel under its
 * composition root in a WeakMap; the Channel driver resolves it lazily when
 * a Port method is actually called. This keeps the Kernel's composition
 * independent of the TUI render lifecycle.
 *
 * Every entry is normalized to the Cordis composition root before it is used
 * as a WeakMap key: a child/plugin context passed by a caller must never
 * create a registry entry that the Kernel (which queries through the root)
 * cannot resolve.
 */
export type TuiChannelRegistration = Readonly<{
    channel: unknown;
    token: symbol;
}>;
/** Register the live Channel for a composition root.
 * @returns A token-safe disposer. Registrations have identity independent of
 * their Channel object: A → B → A and repeated registration of the same
 * Channel cannot let an older disposer erase or revive the current entry.
 */
export declare function registerTuiChannel(ctx: unknown, channel: unknown): () => boolean;
/** Resolve the live Channel for a composition root. */
export declare function getRegisteredTuiChannel(ctx: unknown): unknown | undefined;
/** Return the current registration identity, not only its Channel object. */
export declare function getTuiChannelRegistration(ctx: unknown): TuiChannelRegistration | undefined;
/**
 * Subscribe to live-Channel registration for one composition root.
 *
 * The Kernel uses this to re-run a refresh/mount when the TUI plugin creates
 * and registers its Channel after the plugin-host row has already started.
 * Returns a disposer; listeners are keyed by normalized composition root.
 */
export declare function onTuiChannelRegistered(ctx: unknown, listener: (channel: unknown) => void): () => void;
/** Subscribe to registration identities for consumers that own capabilities. */
export declare function onTuiChannelRegistration(ctx: unknown, listener: (registration: TuiChannelRegistration | undefined) => void): () => void;
//# sourceMappingURL=host-registry.d.ts.map