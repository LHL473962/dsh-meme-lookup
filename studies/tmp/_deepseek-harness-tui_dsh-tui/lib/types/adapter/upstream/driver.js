/**
 * Upstream driver contract.
 *
 * Upstream drivers are the only place allowed to import `@deepseek-ai/*`.
 * Each driver translates one DSH capability into a host Port; it does not
 * define protocols, manifest semantics, permission policy or Host Descriptor.
 */
export {};
