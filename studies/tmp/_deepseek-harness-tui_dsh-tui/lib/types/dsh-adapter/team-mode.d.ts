/**
 * Agent Teams status at run time (issue #1241, see
 * docs/agent-teams-design.md「开关机制」).
 *
 * Switching is the upstream team bundle itself: `/plugin enable|disable`
 * selects or drops its layer through the host plugin manager, which persists
 * to the profile and, with `hmr` mounted, applies at once. `/team` is the
 * read-only side: it reports the bundle, the service and this session's
 * teammates, and is exposed only while the `agentTeams` service is mounted —
 * the same availability the desktop UI gives the feature. A typed `/team`
 * before that still answers with the enable route instead of reaching the
 * model.
 *
 * What stays here besides the command is the one decision that cannot live in
 * a preset — which legacy delegation tools a request carries.
 *
 * @module
 */
import type { Context } from '@deepseek-ai/cordis';
import type { PromptAssembly } from '@deepseek-ai/dsh-system-prompt';
import type { LocalCommand } from '../commands.js';
import type { TeamActiveMembers } from './plugin-manage.js';
/**
 * Whether the team service is mounted. This is the one signal `/team` appears
 * on: the desktop UI shows the same feature only while its service is there.
 * @param ctx - Host context of the composition root.
 */
export declare function teamServiceActive(ctx: Context): boolean;
/**
 * Hide `/team` from Help and `/` completion while the service is not mounted.
 * The typed form stays a local command (`isLocalCommandName` still knows the
 * name), so it can answer with the enable route instead of becoming text sent
 * to the model.
 * @param commands - The current command catalog.
 * @param visible - Whether the team service is mounted.
 * @returns The catalog with `/team` removed when it is not.
 */
export declare function withTeamCommandVisibility(commands: readonly LocalCommand[], visible: boolean): readonly LocalCommand[];
/**
 * Keep one delegation tool set per request. Presets keep their legacy rows,
 * so whether the team replaces them is decided where the tools are known: an
 * assembly carrying `spawn_teammate` drops `subagent` / `subagent_fork`. This
 * follows a bundle toggled at run time into the sessions already joined (a
 * preset revision cannot), and a team service that never activated leaves the
 * legacy tools in place. The agent loop diffs these final tools against the
 * logged request header, so the model is told about each swap.
 * @param assembly - Fully assembled prompt inputs for one model request.
 * @returns The original assembly, or a copy without the replaced tools.
 */
export declare function filterTeamReplacedTools(assembly: PromptAssembly): PromptAssembly;
/** What `/team` was asked. */
export type TeamCommand = {
    readonly kind: 'status';
}
/** `on` / `off`: the switch moved to `/plugin enable|disable`. */
 | {
    readonly kind: 'switch';
} | {
    readonly kind: 'unknown';
    readonly sub: string;
};
export declare function parseTeamArgs(args: string): TeamCommand;
/** What the screen supplies: the bound session's live team counts. */
export interface TeamCommandSink {
    /** Teammates of the bound session, how many are running or provisioning, and how many may be running. */
    readonly members: () => {
        readonly total: number;
    } & TeamActiveMembers;
}
/** The entry the screen calls: argument text in, report lines out. */
export type TeamCommandEntry = (args: string, sink: TeamCommandSink) => Promise<readonly string[]>;
/**
 * Wire `/team` to the running composition. The command only reports; the
 * bundle switch is `/plugin enable|disable`, which shares the lifecycle flow
 * and its confirmations.
 * @param ctx - Host context of the composition root.
 * @param options - The profile a CLI route names.
 * @returns the command entry the screen calls.
 */
export declare function createTeamCommandEntry(ctx: Context, options?: {
    readonly profileName?: string | undefined;
}): TeamCommandEntry;
//# sourceMappingURL=team-mode.d.ts.map