import type { LocalCommand, LocalizedDescriptions, CommandCompletion } from './adapter/ports/channel-catalog.js';
export type { LocalCommand, LocalizedDescriptions, CommandCompletion } from './adapter/ports/channel-catalog.js';
/** One child in a slash-command tree contributed by a local feature/plugin. */
export interface CommandCompletionNode {
    name: string;
    aliases?: readonly string[];
    description: string;
    descriptions?: LocalizedDescriptions;
    tag?: string;
    /** Optional i18n key; plugin nodes normally rely on fallback text. */
    descriptionKey?: string;
    /**
     * Mark this row as a syntax EXAMPLE rather than a candidate: it spells out a
     * shape, not something this person typed. Tab therefore hands the draft back
     * untouched instead of writing the placeholder in, and Enter runs the draft as
     * typed — at the bare argument position that is the subcommand itself (its
     * usage line), and once a spec is typed it is that spec. `/plugin install `
     * shows the three shapes while neither Tab nor Enter can insert or install the
     * placeholder, and a real spec that merely starts like one is never swallowed.
     */
    example?: true;
}
export type CommandChildren = (canonicalPath: readonly string[]) => readonly CommandCompletionNode[];
/**
 * Whether a value can occupy one command-completion token. Keep this aligned
 * with the grammar accepted by {@link completeCommands}; callers that need an
 * empty prefix handle that case separately.
 */
export declare function isCommandCompletionToken(value: string): boolean;
/**
 * The built-in slash commands (name + description pairs). Plugin-registered
 * commands merge in at runtime; locals win on name collisions.
 */
export declare const LOCAL_COMMANDS: LocalCommand[];
/**
 * `/permission` as a modes-capable backend serves it. Deliberately NOT a
 * LOCAL_COMMANDS entry: DSH's own /permission comes from the permission-
 * presets registry row, and a local entry would shadow it in the merged
 * list (locals win collisions), flipping the external-command route the
 * DSH pipeline depends on. The backend capability snapshot appends this
 * shape instead (channel/capabilities.ts → session-controls), so a session
 * with the typed `modes` capability offers the same command surface
 * without touching DSH's.
 */
export declare const BACKEND_PERMISSION_COMMAND: LocalCommand;
/**
 * `/channel` as a channels-capable backend serves it (the Claude backend's
 * relay channel profiles, backends/claude/channels.ts). Like /permission,
 * deliberately NOT a LOCAL_COMMANDS entry: the command must appear only on a
 * backend that declares the typed `channels` capability — a DSH session
 * (every built-in) and other backends never list it, so typing `/channel`
 * there keeps today's not-a-command behavior. The capability snapshot
 * appends the name (channel/capabilities.ts) and session-controls rides it
 * here.
 */
export declare const BACKEND_CHANNEL_COMMAND: LocalCommand;
/**
 * `/goal` as a goals-capable backend serves it (the typed `goals`
 * capability; the channel core's `backendGoals` host). Like /permission,
 * deliberately NOT a LOCAL_COMMANDS entry: DSH's own /goal is the
 * `dsh-command-goal` registry row, and a local entry would shadow it. The
 * capability snapshot appends the name (channel/capabilities.ts) and
 * session-controls rides it here. On a backend without the capability the
 * typed command is refused as unavailable (`isUnavailableLocalCommand`).
 */
export declare const BACKEND_GOAL_COMMAND: LocalCommand;
/**
 * What a built-in command needs from the bound backend session: `any` works
 * on every backend (UI-only, or served by the channel's backend-neutral
 * core); a capability name needs that session capability; `dsh` needs the
 * DSH-only specialists. Commands not listed here default
 * to `dsh`, so a new built-in never silently appears on a backend that
 * cannot serve it.
 */
export type LocalCommandRequirement = 'any' | 'dsh' | 'models' | 'effort' | 'compact' | 'rewind' | 'fork' | 'resume' | 'subagents' | 'tasks' | 'mcp' | 'context' | 'login' | 'sideQuery' | 'rename' | 'color' | 'init';
/** The requirement of one built-in command name (unlisted → `dsh`). */
export declare function localCommandRequirement(name: string): LocalCommandRequirement;
/**
 * Names of the built-in commands a backend supports, in catalog order. A DSH
 * session supports every built-in (today's list, unchanged); any other
 * session supports the `any` commands plus those whose capability it has.
 */
export declare function supportedLocalCommandNames(backend: {
    readonly dsh: boolean;
    readonly has: (capability: Exclude<LocalCommandRequirement, 'any' | 'dsh'>) => boolean;
}): readonly string[];
/**
 * Whether a typed name is a built-in command the bound backend lacks. Such a
 * line must neither run nor reach the model: the caller shows
 * `cmd-unavailable-backend`. An absent snapshot (a partial embedder channel)
 * means everything is supported. `/goal` counts as one when the snapshot
 * says goals are not served (a backend without the `goals` capability; a
 * snapshot without the flag predates it and serves everything).
 */
export declare function isUnavailableLocalCommand(name: string, capabilities: {
    readonly commands: readonly string[];
    readonly goals?: boolean;
} | undefined): boolean;
/**
 * Hidden slash commands: intentionally not exposed in the `/` suggestion
 * menu or Help, but still recognized as local commands when typed. They are
 * kept out of `LOCAL_COMMANDS` so `filterCommands`/`completeCommands` never
 * surface them; dispatch recognizes them via {@link HIDDEN_COMMAND_NAMES}.
 */
export declare const HIDDEN_COMMANDS: readonly LocalCommand[];
/** Names of hidden commands, for fast dispatch/lookup. */
export declare const HIDDEN_COMMAND_NAMES: ReadonlySet<string>;
/**
 * Whether the input names a hidden command (same slash-optional trimming
 * rules as {@link isLocalCommandName}).
 */
export declare function isHiddenCommandName(input: string): boolean;
/** Whether a command name (no slash) may run before the channel is ready. */
export declare function isBootSafeCommand(name: string): boolean;
/**
 * Resolve a command's description in the active UI language. The en text in
 * `LOCAL_COMMANDS` (and the registry's own text for external commands) is
 * the fallback; zh translations live in the i18n dict under
 * `cmd-desc-<name>`. Resolved at call time — components call this during
 * render, so a `/lang` switch repaints descriptions immediately.
 * @param command - The command whose description to localize.
 */
export declare function localizedDescription(command: LocalCommand & {
    descriptionKey?: string;
}): string;
/**
 * Commands the channel REFUSES to run while a turn is streaming, mapped to the
 * i18n key of the refusal notice. This table is the single source of truth for
 * what a gate SAYS and for the `/` suggestion overlay that sinks the rows
 * affecting the running conversation — so the refusal text and the overlay
 * annotation can never drift. WHETHER a command is refused still lives in each
 * gate's own `state.working` / `channel.working` branch — the 11 bail-outs under
 * `src/dsh-adapter/` plus the UI-side gates that share the same refusals — so
 * a new gate means a new entry here: `scripts/verify-command-hold.ts` fails when
 * a `working` bail-out under `src/dsh-adapter/` notifies with a literal key of
 * its own, and when a new name joins this dictionary without a conscious edit
 * there. A `t(...)` call in a gate pins the key type, so removing an entry from
 * the dict fails the build.
 */
export declare const WORKING_GATE_NOTICES: {
    readonly new: "new-session-while-working";
    readonly compact: "compact-while-working";
    readonly fork: "fork-while-working";
    readonly model: "model-switch-while-working";
    readonly preset: "preset-agent-running";
    readonly workspace: "workspace-switch-working";
    readonly update: "update-working";
    readonly resume: "resume-while-working";
    readonly rewind: "rewind-while-working";
    readonly kernel: "kernel-switch-while-working";
    readonly dsh: "kernel-switch-while-working";
    readonly codex: "kernel-switch-while-working";
    readonly claude: "kernel-switch-while-working";
    readonly channel: "channel-switch-while-working";
};
/**
 * Commands that DO have a mid-turn refusal notice of their own, yet whose ROW
 * stays in the overlay's normal region: the command only OPENS a browser, and
 * the refusals belong to the separate, separately confirmed actions INSIDE it.
 *
 * `/resume` opens the session manager (`Chat.tsx` `setSupervisorOpen`); the
 * per-row switch is a separate action that PARKS the outgoing session and lets
 * its turn keep running (`session-resume.ts`), so neither the command nor the
 * switch interrupts the running turn — the same reason `/tree` is in the normal
 * region. Its key stays in {@link WORKING_GATE_NOTICES} because the core's own
 * session-switch transaction still refuses mid-turn on a backend that gets no
 * DSH extension (Claude, `core/session-switch.ts`), and `resumeFailureText`
 * reports that reason with it.
 */
export declare const GRAY_ZONE_EXEMPT_COMMANDS: readonly string[];
/**
 * Commands that MAY run while a turn is streaming but act ON the conversation
 * itself rather than on the running turn: `clear` empties the visible view (the
 * running turn keeps writing into it, `local-actions.ts`), and `exit` (with its
 * `quit`/`q` aliases) tears the process — and the running turn — down.
 *
 * `/restart` belongs here too, and its presence is load-bearing: it respawns
 * the process and resumes this session, which is the only way out of a turn
 * whose abort never converges (a tool that ignores its `AbortSignal` leaves
 * `working` true forever and every in-process gate stuck). Refusing it mid-turn
 * produced the worst dead end of the bug report — "can't interrupt, and
 * `/restart` says a turn is running". `Chat.tsx` answers it with a warning that
 * the running turn is interrupted, then restarts.
 *
 * `/rewind` used to live here, because it cancels only once a target is
 * CONFIRMED (`session-rewind.ts`) and replacing the conversation is its whole
 * purpose. It moved to {@link WORKING_GATE_NOTICES} when the session-switch
 * transaction grew its own mid-turn refusal: under DSH the extension still
 * cancels and re-arms, but the core's rewind path REFUSES, and one command
 * cannot be both. `/tree` deliberately stays out of both families: it only
 * opens the family-tree browser (`Chat.tsx` `setTreeOpen(true)`) and leaves the
 * running turn untouched — its per-node rewind/fork/adopt are separate,
 * separately confirmed actions (`session-tree-actions.ts`), and browsing the
 * tree is inspection, not impact (issue #1072 review: measured on a real turn —
 * `/tree` does not interrupt). `/resume` belongs to that same normal region for
 * the same reason, even though it does own a notice key for the core's refusal:
 * see {@link GRAY_ZONE_EXEMPT_COMMANDS}.
 */
export declare const WORKING_CONVERSATION_COMMANDS: readonly string[];
/**
 * How a command affects the RUNNING conversation:
 * - `gated` — refused by the channel while a turn runs (see
 *   {@link WORKING_GATE_NOTICES});
 * - `conversation` — allowed, but ends the current conversation (process exit);
 * - `inject` — steers a line into the current turn (skills).
 * `undefined` means the normal region: message-like commands, or commands that
 * leave the running conversation alone.
 */
export type WorkingHold = 'gated' | 'conversation' | 'inject';
/**
 * Classify a command by its impact on the running conversation.
 * @param name Bare command name or a completion path (`model deepseek-chat`);
 *   only the first token is classified, so every child of a gated command
 *   (`/model <id>`, `/workspace rename <t>`) inherits the parent's hold.
 * @param skill Whether the entry is a user-invocable skill.
 * @returns The hold, or `undefined` for the normal region.
 */
export declare function workingHoldOf(name: string, skill?: boolean): WorkingHold | undefined;
/**
 * Parse a slash-command line into its name and the verbatim input following
 * the name (separator whitespace included) — the same split the DSH command
 * registry uses, so `/plan off` dispatches `plan` with ` off`.
 *
 * @param line - Complete candidate command line.
 * @returns The parsed name and raw input, or `undefined` when the line is
 *   not a command.
 */
export declare function parseCommandName(line: string): {
    name: string;
    rawInput: string;
} | undefined;
/**
 * Whether the input names a local command. Local commands must never be sent
 * to the model when typed alone; trailing whitespace is legal.
 * @param input - Candidate command line (slash optional).
 * @param list - Command list to match against; defaults to LOCAL_COMMANDS.
 * @returns True when the trimmed input names a command in `list`.
 */
export declare function isLocalCommandName(input: string, list?: readonly LocalCommand[]): boolean;
/**
 * Filter commands by a `/…` input prefix.
 * The prefix is the whole input after the slash, so `/plan off` matches
 * nothing and the overlay stays closed — Enter still dispatches through
 * `parseCommandName`.
 * @param input - Slash-command input; the prefix is the whole text after the slash.
 * @param list - Command list to filter; defaults to LOCAL_COMMANDS.
 * @returns Commands whose name starts with the prefix, in list order.
 */
export declare function filterCommands(input: string, list?: readonly LocalCommand[]): LocalCommand[];
/**
 * Complete an arbitrary slash-command path. Root commands come from the
 * ordinary DSH/TUI catalog; each resolved token asks the caller for its
 * children, so PromptInput never needs feature- or plugin-specific cases.
 */
export declare function completeCommands(input: string, roots?: readonly LocalCommand[], children?: CommandChildren): CommandCompletion[];
//# sourceMappingURL=commands.d.ts.map