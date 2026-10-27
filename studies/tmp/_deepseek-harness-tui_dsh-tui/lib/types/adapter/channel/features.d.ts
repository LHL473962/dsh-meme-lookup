/**
 * Shared Channel Host-Port effect-capability map and derived feature list.
 *
 * This is the single source that `HostFacade` shadow policy, the Channel
 * upstream driver and the Kernel channel slice all consume. Keeping it here
 * prevents the slice declaration / driver feature list from drifting from the
 * methods actually exposed by `HostChannelPort`.
 */
export declare const CHANNEL_PORT_METHOD_CAPABILITIES: Readonly<Record<string, Readonly<Record<string, string>>>>;
export declare const CHANNEL_FEATURES: readonly string[];
export declare const CHANNEL_STANDARD_DECLARATIONS: readonly string[];
//# sourceMappingURL=features.d.ts.map