/** The DSH home that owns the credential store, following the launcher's rule. */
export declare function dshHomeDir(): string;
/**
 * The credential documents a read may consult, most authoritative first: the
 * active home's store, then the default `~/.dsh` store.
 *
 * A `DSH_HOME` override moves the harness home, but the codex bridge and
 * `/doctor` are dsh-tui's own surfaces: a key the user stored at the location
 * both READMEs name (`~/.dsh/.credentials.yaml`) must keep working instead of
 * reporting "missing" for a key that is sitting right there.
 * @param home - DSH home override; defaults to {@link dshHomeDir}.
 * @returns Candidate file paths, most authoritative first.
 */
export declare function credentialStoreFiles(home?: string): readonly string[];
/**
 * Whether any credential store declares a reference by this name.
 *
 * Only the top-level `refs:` block is inspected — the bare name also appears in
 * grants and payloads, where a match would be a false positive.
 * @param name - Reference name to look for (for example `DEEPSEEK_API_KEY`).
 * @param home - DSH home override; defaults to {@link dshHomeDir}.
 * @returns True when a `refs` entry with that name exists in any store.
 */
export declare function credentialRefDeclared(name: string, home?: string): boolean;
//# sourceMappingURL=credentials.d.ts.map