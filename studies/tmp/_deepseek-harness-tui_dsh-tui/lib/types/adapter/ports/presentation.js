/**
 * Internal Host Port for host presentation interactions.
 *
 * This is a TUI-internal narrow interface for asking/approving/showing
 * dialogs. It is intentionally not a protocol definition: no apiVersion,
 * no negotiation, no permission or manifest semantics, and no caller-
 * supplied owner identity. The runtime derives ownership from the active
 * Cordis activation before any such interaction is mediated.
 */
export {};
