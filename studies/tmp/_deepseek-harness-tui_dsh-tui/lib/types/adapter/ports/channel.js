/**
 * Internal Host Ports for the TUI live Channel.
 *
 * The Channel is the host-internal, stateful terminal projection of one DSH
 * Agent/Session/Workspace. These ports intentionally split that projection
 * into five small internal surfaces:
 *   - projection: the serializable renderer projection (rows/status/tokens);
 *   - actions:    user-driven Channel mutations (submit/cancel/rewind/…);
 *   - state:      the live state snapshot;
 *   - plugins:    plugin-facing seams (external commands, scenes, settings);
 *   - transcript: durable transcript/event access.
 *
 * Boundary rules:
 * - These are TUI host-internal interfaces, not dsh-std/tui-profile
 *   protocol definitions. No apiVersion/kind/negotiation/permission/manifest
 *   semantics appear here.
 * - No caller-supplied owner/principal/activation identity is accepted;
 *   ownership is derived by the Kernel from the Cordis activation.
 * - Secret values and live function handles are never part of a state or
 *   projection snapshot.
 */
export {};
