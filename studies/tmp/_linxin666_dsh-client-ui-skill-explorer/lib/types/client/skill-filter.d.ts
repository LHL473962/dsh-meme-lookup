/**
 * Skill center list filtering (pure, browser half): the search box, the
 * workspace picker and the source / status / mark facets are axes over the
 * same grouped payload, so the matching rules live here and stay
 * unit-testable without a DOM.
 */
import type { GroupPayload, SkillEntry } from './api.ts';
/** A row characteristic the list can narrow to. */
export type SkillMark = 'linked' | 'provider-file' | 'no-file';
/** Enabled/disabled facet; 'all' keeps both. */
export type SkillStatus = 'all' | 'enabled' | 'disabled';
/** The list tab's filter state. */
export interface SkillListFilter {
    /** Selected workspace root, or 'all' for no workspace restriction. */
    workspace: string;
    /** Raw search text; trimmed and lowercased before matching. */
    query: string;
    /** Source group keys to include; empty or absent includes every group. */
    levels?: readonly string[];
    /** Enabled/disabled facet; absent means both. */
    status?: SkillStatus;
    /** Marks to include (any of); empty or absent includes every row. */
    marks?: readonly SkillMark[];
}
/**
 * Match rank of one skill against a lowercased needle: 0 when the name hits,
 * 1 when only the description hits, undefined when neither does. An empty
 * needle matches everything at rank 0.
 */
export declare function matchRank(skill: SkillEntry, needle: string): 0 | 1 | undefined;
/**
 * The marks a row carries. "Provided by plugin" and "No local file" are the
 * two halves of one classification (a file the panel cannot write versus no
 * file at all), so at most one of them ever applies; a symlinked skill is a
 * separate fact and can carry either.
 * @param skill - the row's entry.
 * @returns every mark that applies to the row.
 */
export declare function marksOf(skill: SkillEntry): SkillMark[];
/**
 * Apply every axis to a payload's groups: the source facet drops whole groups,
 * then the workspace, status, mark and query axes narrow each one (name hits
 * ranked before description hits, stable within a rank). Empty groups are
 * dropped so the caller renders only what has content.
 * @param groups - host payload groups in host order.
 * @param filter - workspace + query + optional source / status / mark facets.
 * @returns the visible groups; the input is never mutated.
 */
export declare function selectGroups(groups: readonly GroupPayload[], filter: SkillListFilter): GroupPayload[];
