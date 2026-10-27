/** Pinned upstream title → the header stem this app shows instead. */
const REFINED = new Map([
    ['session_search', { pinned: 'Search prior sessions', stem: 'Sessions' }],
    ['session_event_search', { pinned: 'Search session events', stem: 'Events' }],
]);
/**
 * Refine a session-search call card's title with the query it was given.
 *
 * @param name - Tool name.
 * @param view - The upstream presentation view for this call, if any.
 * @param rawArgs - The call's JSON arguments, as persisted.
 * @returns The upstream view untouched unless the tool, the pinned title and
 *          a non-empty string `query` all line up; else a retitled copy.
 */
export function refineSessionSearchTitle(name, view, rawArgs) {
    if (view === undefined || view.card !== 'generic')
        return view;
    const refined = REFINED.get(name);
    if (refined === undefined || view.title !== refined.pinned)
        return view;
    let args;
    try {
        args = JSON.parse(rawArgs);
    }
    catch {
        return view;
    }
    const query = args?.query;
    if (typeof query !== 'string')
        return view;
    const trimmed = query.trim();
    if (trimmed === '')
        return view;
    // The generic card header is one line (`HeaderTitle`'s non-terminal branch),
    // and the query is free model text: JSON-encoding keeps newlines, quotes and
    // control bytes printable inside the `Name("query")` shape instead of
    // splitting the row or writing raw escape sequences to the terminal.
    return { ...view, title: `${refined.stem}(${JSON.stringify(trimmed)})` };
}
