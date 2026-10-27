/**
 * One-time local migrations (`~/.dsh-tui/migrations.json`), keyed by stable
 * migration id → ISO timestamp. Named keys (not a bare flag) so later
 * migrations can append entries without a format change. Best-effort like
 * every prefs file: a missing/corrupt file reads as "nothing applied yet",
 * and a failed write simply leaves the migration to retry on a later boot.
 */
/**
 * The fullscreen factory-default flip (schema + `cordis.patch.yml`, 0.9.x):
 * a `fullscreen: false` pinned in the settings user layer BEFORE the flip
 * keeps overriding the new default on every boot. The first boot past this
 * migration clears that stale explicit choice once — see
 * {@link planFullscreenFactoryMigration} for the decision table.
 */
export declare const FULLSCREEN_FACTORY_MIGRATION = "fullscreen-factory-default";
/**
 * Read the applied-migration map.
 * @param dir - Prefs directory (injectable for tests).
 * @returns Parsed migration map; empty on any read/parse failure.
 */
export declare function readAppliedMigrations(dir?: string): Readonly<Record<string, unknown>>;
/**
 * Record a migration as applied (merge write — other keys are never dropped).
 * @param id - Migration id.
 * @param dir - Prefs directory (injectable for tests).
 * @returns True when the file was written, false on failure.
 */
export declare function markMigrationApplied(id: string, dir?: string): boolean;
/** What this boot should do about the fullscreen factory-default flip. */
export type FullscreenFactoryPlan = 'unset' | 'mark' | 'done';
/**
 * Decide the migration step from the settings scope's RESOLVED fullscreen
 * value. The dsh-tui namespace declares no schema default and no `base`
 * layer for `fullscreen`, so a resolved `false` can only come from the user
 * layer — the pre-flip explicit choice this migration exists to clear:
 *  - `done`  — marker present: never touch the user layer again, so a
 *     `false` written AFTER the migration (a deliberate /settings choice)
 *     always stands;
 *  - `unset` — stale pre-flip explicit `false`: the caller clears it via a
 *     settings `unset` op and boots fullscreen regardless — the doc write
 *     is async and must not race the synchronous boot decision, so the
 *     caller shadows the stale value out of its first settings apply;
 *  - `mark`  — nothing to clear (unset or already `true`): record the
 *     marker now so a `false` set later is never mistaken for a stale one.
 */
export declare function planFullscreenFactoryMigration(resolvedFullscreen: unknown, migrations: Readonly<Record<string, unknown>>): FullscreenFactoryPlan;
/**
 * Persist the plan's side effects. For `unset` the marker lands only after
 * the doc write succeeds — a failed write stays unmarked and the next boot
 * retries (that boot already ran fullscreen off the shadowed value).
 * Never rejects.
 * @param plan - Decision from {@link planFullscreenFactoryMigration}.
 * @param options - `unset` thunk issuing the settings write; `dir` injects
 *   the prefs directory for tests.
 */
export declare function commitFullscreenFactoryMigration(plan: FullscreenFactoryPlan, options: {
    unset: () => Promise<void>;
    dir?: string;
}): Promise<void>;
//# sourceMappingURL=migrationPrefs.d.ts.map