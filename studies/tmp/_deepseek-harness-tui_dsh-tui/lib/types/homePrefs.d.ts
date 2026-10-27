interface HomePrefs {
    /** True once the workspace home has been shown as the landing screen. */
    seen?: boolean;
}
/** Read the persisted landing preference; an unreadable file reads as unset. */
export declare function readHomePrefs(): HomePrefs;
/**
 * Record that the workspace home has been shown.
 *
 * @returns True when the preference was durably written; false when the data
 *   directory is not writable (the caller stays silent — see the module note).
 */
export declare function markHomeSeen(): boolean;
export {};
//# sourceMappingURL=homePrefs.d.ts.map