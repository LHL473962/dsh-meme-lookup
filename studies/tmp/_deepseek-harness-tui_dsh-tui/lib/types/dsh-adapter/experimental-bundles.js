import { TEAM_BUNDLE } from './team-roster.js';
/** The bundle that mounts the `auto` permission preset. */
export const AUTO_REVIEW_BUNDLE = '@deepseek-ai/dsh-experimental-auto-review';
/** The bundle that mounts the five read-only session-search tools. */
export const SESSION_SEARCH_BUNDLE = '@deepseek-ai/dsh-experimental-session-search';
/** The features `/plugin list` advertises, in product order. */
export const TUI_EXPERIMENTAL_BUNDLES = [
    { name: TEAM_BUNDLE, hint: 'plugins-experimental-team-hint' },
    { name: AUTO_REVIEW_BUNDLE, hint: 'plugins-experimental-auto-review-hint' },
    { name: SESSION_SEARCH_BUNDLE, hint: 'plugins-experimental-session-search-hint' },
];
