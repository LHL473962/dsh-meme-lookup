/**
 * TUI Host Ports: pure internal capability interfaces.
 *
 * Boundary rules for this directory:
 * - No imports from `@deepseek-ai/*`.
 * - No imports from `@dsh-std/*` or `tui-profile` private protocol
 *   definitions.
 * - No protocol version / negotiation / manifest / permission semantics.
 * - No caller-supplied OwnerRef / activationId / principal on capability
 *   methods; ownership is derived by the Kernel from Cordis activation.
 * - Sensitive operations (admission, permission evaluation, ledger writes)
 *   live in Kernel/Standard internal services, not in Host Ports.
 */
export {};
