/**
 * Card headers for the experimental session-search tools.
 *
 * `@deepseek-ai/dsh-tool-session-query@0.2.1-rc.2` gives both search calls a
 * static sentence — "Search prior sessions" / "Search session events" — while
 * a titled generic card renders that sentence and nothing else (the tool name
 * and the arguments stay off the header). Two different calls therefore read
 * alike, and the word "search" repeats the result body's own first line
 * ("Session search results (3):").
 *
 * This adapter is the layer allowed to decide presentation (`agent/
 * presentation.ts`: "a backend translator decides which shape a call gets"),
 * so it gives those two calls a bash-style header instead: the object first,
 * the concrete query in parentheses.
 *
 * The rewrite is self-expiring: it fires only while the upstream title is
 * still the pinned 0.2.1-rc.2 string. A wording change upstream (or a future
 * result presenter) wins silently instead of fighting a second source of
 * truth; delete the entry once upstream ships the new wording.
 *
 * @module
 */
import type { ToolCallView } from './channel/types.js';
/**
 * Refine a session-search call card's title with the query it was given.
 *
 * @param name - Tool name.
 * @param view - The upstream presentation view for this call, if any.
 * @param rawArgs - The call's JSON arguments, as persisted.
 * @returns The upstream view untouched unless the tool, the pinned title and
 *          a non-empty string `query` all line up; else a retitled copy.
 */
export declare function refineSessionSearchTitle(name: string, view: ToolCallView | undefined, rawArgs: string): ToolCallView | undefined;
//# sourceMappingURL=session-tools.d.ts.map