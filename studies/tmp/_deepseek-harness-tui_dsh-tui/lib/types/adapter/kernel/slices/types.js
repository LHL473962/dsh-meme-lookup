/**
 * Kernel slice: one vertical capability slice.
 *
 * A slice owns:
 * - an upstream driver (detection/live-verification/mount),
 * - the Host Port(s) the driver can mount,
 * - the Standard/effect capabilities it declares and governs.
 *
 * The Kernel uses this only for composition/diagnostics; it never performs
 * business translation itself.
 */
export {};
