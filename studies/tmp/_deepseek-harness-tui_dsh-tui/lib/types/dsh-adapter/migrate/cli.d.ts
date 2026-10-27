/** Exit code for "nothing to do / unknown agent". */
export declare const MIGRATE_CLI_USAGE_EXIT = 2;
/**
 * Run one migration CLI invocation.
 * @param argv - Arguments after the `migrate` word.
 * @returns Process exit code.
 */
export declare function cliMigrate(argv: readonly string[]): Promise<number>;
//# sourceMappingURL=cli.d.ts.map