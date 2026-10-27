/**
 * Internal read-only Host Descriptor access Port.
 *
 * This is a narrow host-internal diagnostic capability. It deliberately does
 * NOT expose the tui-profile Host Descriptor protocol object, does NOT
 * carry apiVersion/kind/negotiation/permission semantics, and does NOT accept
 * caller-supplied owner/principal/activation data. The protocol-shaped
 * descriptor is built and owned by the Standard/Spec plane + Kernel lifecycle
 * and is never a Host Port surface.
 */
export {};
