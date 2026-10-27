/**
 * The wizard revision this build writes. Bump it when a step is ADDED (not
 * when copy changes): installs completed at an older revision become
 * eligible again, which is the point — a new domain is worth one more pass.
 */
export declare const ONBOARDING_VERSION = 1;
/** Persisted first-run state. */
export interface OnboardingPrefs {
    /** True once the wizard ran to completion on this installation. */
    completed: boolean;
    /** The wizard revision that was completed (0 when an older build did not stamp one). */
    version: number;
}
/** Not-done-yet, the answer for every unreadable file. */
export declare const ONBOARDING_UNSEEN: OnboardingPrefs;
/**
 * Parse a persisted onboarding record. Pure, so the shape rules are testable
 * without a filesystem: anything that is not an object with a literal
 * `completed: true` reads as unseen.
 *
 * @param text - Raw file contents.
 * @returns The normalized record.
 */
export declare function parseOnboardingPrefs(text: string): OnboardingPrefs;
/**
 * Read the persisted onboarding state.
 *
 * @param dir - Prefs directory (injectable for tests).
 * @returns The normalized record; unseen when the file is absent or unreadable.
 */
export declare function readOnboardingPrefs(dir?: string): OnboardingPrefs;
/**
 * Record that the wizard completed (best effort).
 *
 * @param version - The wizard revision being stamped.
 * @param dir - Prefs directory (injectable for tests).
 * @returns True when the record was durably written; false when the data
 *   directory is not writable. The caller stays silent either way — the
 *   preference is a convenience, not a promise.
 */
export declare function markOnboardingDone(version?: number, dir?: string): boolean;
/**
 * Whether this install should be offered the wizard on an ordinary launch.
 *
 * The single place the "should it fire" question is answered, so the host
 * boot decision and any future `/setup` entry point cannot drift apart.
 *
 * @param prefs - The record read at boot (or a fixture in a test).
 * @returns True when the wizard has never been completed at this revision.
 */
export declare function shouldOfferOnboarding(prefs?: OnboardingPrefs): boolean;
//# sourceMappingURL=onboardingPrefs.d.ts.map