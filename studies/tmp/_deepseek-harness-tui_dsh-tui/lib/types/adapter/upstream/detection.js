/**
 * Structured upstream capability detection.
 *
 * This is the only shape a driver may return from detect(). It is deliberately
 * not a boolean: the kernel needs to know *why* a capability is unavailable or
 * only partially available so diagnostics and Host Descriptor publication stay
 * honest.
 */
export {};
