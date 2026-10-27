/**
 * Persisted list-view preferences (pure, browser half).
 *
 * The skills tab's facets and its per-group collapse state must outlive a
 * panel remount and a page refresh, so they live in localStorage rather than
 * in component state — the layout unmounts a keyed page as soon as another
 * panel takes the center column. Storage is treated as untrusted input (it can
 * be corrupt, written by an older version, or hold something else entirely):
 * anything unrecognized degrades to the defaults instead of breaking the tab,
 * and a browser that refuses storage keeps working without persistence.
 *
 * The collapse state stores only what the user decided per group. A group with
 * no recorded decision falls back to `defaultExpanded`, so a source group this
 * build did not know about still opens or closes by its own kind instead of
 * inheriting a stale decision.
 */
import type { SkillMark, SkillStatus } from './skill-filter.ts';
/** The localStorage key holding the whole preference document. */
export declare const LIST_VIEW_STORAGE_KEY = "dsh-skill-explorer:list-view:v1";
/**
 * Source groups opened on first use. These are the roots the user is actively
 * working with (project and user skills); the global and machine-level
 * sources — system bundled, custom directories, runtime registrations — start
 * collapsed so a wide catalog does not paint every row at once.
 */
export declare const DEFAULT_EXPANDED_LEVELS: readonly string[];
/** Per-group collapse decisions: true while a group is collapsed. */
export type CollapseState = Readonly<Record<string, boolean>>;
/** The persisted list-view preferences. */
export interface ListViewPrefs {
    /** Source group keys the user narrowed to; empty means every group. */
    levels: string[];
    /** Enabled/disabled facet. */
    status: SkillStatus;
    /** Marks the user narrowed to; empty means every row. */
    marks: SkillMark[];
    /** Per-group collapse decisions, keyed by source group key. */
    collapsed: CollapseState;
}
/** The storage surface this module needs (localStorage satisfies it). */
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
/** The preferences a browser with no stored document uses. */
export declare function defaultListPrefs(): ListViewPrefs;
/**
 * Read the stored preferences, falling back to the defaults for a missing,
 * unreadable, oversized or malformed document. Every field is validated on its
 * own, so one bad field never discards the rest of the user's view.
 * @param storage - storage to read, or undefined when none is available.
 * @returns the preferences the tab should start from.
 */
export declare function loadListPrefs(storage: StorageLike | undefined): ListViewPrefs;
/**
 * Persist the preferences. A browser that refuses storage (private mode, a
 * sandboxed frame, a full quota) is not an error: the view still works for
 * this page load, it just does not survive a refresh.
 * @param storage - storage to write, or undefined when none is available.
 * @param prefs - the preferences to store.
 * @returns whether the document was persisted.
 */
export declare function saveListPrefs(storage: StorageLike | undefined, prefs: ListViewPrefs): boolean;
/**
 * Whether a source group is open, given the user's recorded decisions.
 * @param key - the group's source key.
 * @param collapsed - recorded per-group decisions.
 * @returns whether the group's rows are visible.
 */
export declare function isGroupExpanded(key: string, collapsed: CollapseState): boolean;
/**
 * Flip one group's collapse decision, recording it explicitly so the choice
 * survives a remount and later default changes cannot silently reopen it.
 * @param key - the group's source key.
 * @param collapsed - current recorded decisions.
 * @returns a new decision map with this group flipped.
 */
export declare function toggleGroupCollapsed(key: string, collapsed: CollapseState): CollapseState;
