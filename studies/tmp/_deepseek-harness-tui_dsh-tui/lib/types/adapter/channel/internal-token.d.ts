/**
 * Internal capability token for the split Channel builder modules.
 *
 * The split `actions` / `plugins` / `transcript` builders are host-internal
 * and must be reached through the Kernel-driven Channel driver / HostFacade
 * shadow gate, not imported and invoked directly from arbitrary TUI code.
 * This token is intentionally not re-exported through `src/adapter/channel`
 * or `src/adapter/index`; only the upstream driver and the split modules
 * themselves import it.
 */
export declare const CHANNEL_SPLIT_TOKEN: unique symbol;
//# sourceMappingURL=internal-token.d.ts.map