/**
 * Extract the startup prompt from raw app argv, excluding session selectors
 * and Web startup flag values. `--trusted-host` consumes multiple authorities
 * up to the next flag; none of them are prompt text (issue #882). An app-level
 * `--` ends flag parsing; all following tokens are literal prompt text.
 */
export declare function initialPromptFromCmdlineArgs(args: readonly string[] | undefined): string;
/** `ctx.cmdlineArgs`: the app argv the host snapshotted, if it provides one. */
export declare function cmdlineArgsOf(ctx: object): readonly string[] | undefined;
//# sourceMappingURL=startup-args.d.ts.map