/**
 * Cross-agent conversation migration: shared types.
 *
 * An adapter turns one foreign agent's stored conversation into the neutral
 * {@link MigrationSession} shape; the sessionizer (see sessionize.ts) then
 * emits DSH session events. Adapters are read-only against their source and
 * defensive by default: a malformed line costs that line, never the scan.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/types
 */
export {};
