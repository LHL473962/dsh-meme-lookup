/** The shipped feed, relative to the package root. */
export declare const FIRST_PARTY_FEED_FILE = "tui-profile/feed/first-party.json";
/** One curated entry: the exact artifact this project vouches for. */
export interface FirstPartyEntry {
    /**
     * The full package name, scope included. Matched verbatim. `feedVersion: 1`
     * carries scoped names only: an unscoped name has no publisher a file can
     * assert offline, so admitting one is a deliberate format decision (a new
     * feedVersion), not an entry somebody adds.
     */
    readonly name: string;
    /**
     * The expected publisher. Must equal the name's own scope — npm lets only
     * that scope's owners publish under it, which is the whole offline publisher
     * argument the feed can make. The gate holds the two fields together; the
     * verdict itself reads the name, because the name already carries the scope.
     */
    readonly scope: string;
    /** The exact version. Ranges are rejected by the gate, never resolved here. */
    readonly version: string;
}
export interface FirstPartyFeed {
    readonly feedVersion: 1;
    readonly entries: readonly FirstPartyEntry[];
}
/** Why an artifact is not on the feed. Every value is a fail-closed answer. */
export type FirstPartyReason = 
/** The feed file is missing or unreadable: nothing can be vouched for. */
'no-feed'
/** The spec named no package (a path, a git URL the upstream left unnamed). */
 | 'unidentified'
/** The feed carries entries, but not this name. */
 | 'not-listed'
/** The name is listed, but not at this exact version (or at no version). */
 | 'version-mismatch'
/**
 * The artifact is not a published one: a directory, tarball or git checkout
 * can call itself anything, and its manifest is the artifact vouching for
 * itself. The feed lists what we published, so it has nothing to say here.
 */
 | 'unverifiable-source';
export type FirstPartyVerdict = {
    readonly kind: 'first-party';
    readonly entry: FirstPartyEntry;
    /**
     * The provenance seam. Any future source of publisher identity starts
     * here: an answer that contradicts {@link entry} must demote this verdict
     * to the third-party branch (one vote to veto); it may never upgrade a
     * third-party verdict to this one.
     */
    readonly corroboration: 'unavailable';
} | {
    readonly kind: 'third-party';
    readonly reason: FirstPartyReason;
    /** What the loader said when the feed itself was the problem. */
    readonly detail?: string;
};
/** The feed as the loader found it: present and shaped, or not usable at all. */
export type FirstPartyFeedLoad = {
    readonly kind: 'ok';
    readonly path: string;
    readonly feed: FirstPartyFeed;
} | {
    readonly kind: 'unavailable';
    readonly reason: string;
};
/**
 * Where the feed lives, in both the `src/` (tsx) and the compiled npm layouts —
 * the same pair `packagedPresetRoot()` uses, for the same reason.
 */
export declare function firstPartyFeedCandidates(moduleUrl?: string): string[];
/**
 * Read the shipped feed. Tolerant about the world, strict about the file: an
 * absent, unreadable, unparsable or unrecognized feed answers `unavailable`
 * with a readable reason, and never throws — the caller decides what to say
 * and always falls back to "third-party".
 */
export declare function loadFirstPartyFeed(moduleUrl?: string): FirstPartyFeedLoad;
/**
 * Whether an artifact is the exact one the feed pins. Pure: the feed is an
 * argument, so a caller can answer the same question for a fixture, and the
 * gate can drive every branch without a filesystem.
 *
 * Only a registry artifact can be first-party. A directory or git checkout is
 * inspected from the manifest it ships, so treating its `name`/`version` as
 * evidence would let whoever wrote that directory claim any feed entry and skip
 * the trust confirmation — the one decision this verdict makes.
 */
export declare function firstPartyVerdict(load: FirstPartyFeedLoad, artifact: {
    readonly name?: string | undefined;
    readonly version?: string | undefined;
    readonly kind?: string | undefined;
}): FirstPartyVerdict;
//# sourceMappingURL=plugin-feed.d.ts.map