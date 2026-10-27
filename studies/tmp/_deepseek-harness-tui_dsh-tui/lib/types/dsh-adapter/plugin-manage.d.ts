import type { Context } from '@deepseek-ai/cordis';
import type { PluginEntryId } from '@deepseek-ai/dsh-plugin-manager/types';
import { type PluginGuardAction } from './plugin-guard.js';
import { type PluginManagerView } from './plugin-manager.js';
/** The three lifecycle actions. */
export type PluginManageAction = PluginGuardAction;
/**
 * One target, once it is known. What it carries is what a report or a
 * confirmation pane needs; what gate 2 reads (`removable`, `readOnlyReason`) is
 * read from the snapshot where the decision is made rather than copied in, so
 * the two cannot disagree about one record.
 */
export type PluginManageTarget = {
    readonly action: PluginManageAction;
    readonly kind: 'bundle';
    readonly name: string;
    /** The installed version, when the profile knows one. */
    readonly version?: string | undefined;
    /** The rows the bundle's patch inserts, and the rows it overrides. */
    readonly rows: number;
    readonly overrides: number;
} | {
    readonly action: PluginManageAction;
    readonly kind: 'row';
    readonly entryId: PluginEntryId;
    readonly moduleName: string;
    /** The patch row this entry is addressable as, when it is. */
    readonly patchId?: string | undefined;
    /** Whether the entry is running now, before the action. */
    readonly enabled: boolean;
};
/**
 * Teammates the team-off question names: known to be running or
 * provisioning (`active`), and those whose run a teammate session cannot see
 * (`unseen`).
 */
export interface TeamActiveMembers {
    readonly active: number;
    readonly unseen: number;
}
/**
 * What the action asks a person, when it asks. Which question it is decides the
 * wording and the risk it names; all three end in the same write.
 */
export type PluginManageQuestion = 
/** `remove` of a bundle: destructive, and the profile's own files change. */
{
    readonly kind: 'remove';
}
/** `enable`: the host does not attest the installed code's source. */
 | {
    readonly kind: 'trust';
}
/**
 * `disable` of a row the host layer owns: the entry belongs to `dsh-base`, so
 * switching it off unloads services this application injects.
 */
 | {
    readonly kind: 'host-row';
}
/**
 * `disable` of the Agent Teams bundle while teammates run, are being
 * created, or may be running unseen (`unseen`, from a teammate session):
 * the team service stops them as it unloads, so the person decides with
 * that in view.
 */
 | {
    readonly kind: 'team-active';
    readonly members: number;
    readonly unseen: number;
};
/**
 * What `/plugin remove|enable|disable` has to say next. `done` means the flow
 * has reported everything it is going to report: refused, finished or failed.
 */
export type PluginManageStep = {
    readonly kind: 'confirm';
    readonly target: PluginManageTarget;
    readonly question: PluginManageQuestion;
} | {
    readonly kind: 'done';
};
/** What the caller of a flow supplies that only the UI knows. */
export interface PluginManageSink {
    /** The session the flow's output belongs to; see `binding` below. */
    readonly binding: () => number;
    /** Whether a turn is running; see `busy` on the flow's options. */
    readonly busy: () => boolean;
    /** Where the flow's transcript lines go (already sanitized and capped). */
    readonly onLines: (lines: readonly string[]) => void;
    /** See `teamActiveMembers` on the flow's options. */
    readonly teamActiveMembers?: (() => TeamActiveMembers) | undefined;
}
/**
 * What one removal left behind, asked **after** the write succeeded.
 * `undefined` means "not judged": the wiring had no declaration to read the
 * bundle's own identities from, and that is reported rather than passed off as
 * "nothing left". An empty array means "judged, and it left nothing", which is
 * not worth a line.
 */
export type PluginResidueWatch = () => readonly string[] | undefined;
export interface PluginManageFlowOptions {
    readonly manager: PluginManagerView;
    readonly action: PluginManageAction;
    /** The argument text after the subcommand: a bundle name or a row identity. */
    readonly target: string;
    /** The binding generation that asked; every asynchronous write is fenced to it. */
    readonly binding: () => number;
    /**
     * Whether a turn is running. These actions rewrite the profile and apply or
     * reload plugin layers under whatever is running, so the flow refuses while
     * this is true — before the resolution, and again before the write.
     */
    readonly busy: () => boolean;
    /** Where the flow's transcript lines go (already sanitized and capped). */
    readonly onLines: (lines: readonly string[]) => void;
    /** The profile an action belongs to, for the manual commands. */
    readonly profileName?: string | undefined;
    /**
     * The footprint one removal would leave behind. The wiring reads the bundle's
     * package-root declaration while it is still installed and closes over it,
     * which is why the whole watch is handed over before the write and only
     * consulted after it.
     */
    readonly residueOf?: ((name: string) => PluginResidueWatch | undefined) | undefined;
    /**
     * Teammates of the bound session that are running or provisioning, and
     * those that may be running. Read when `disable` resolves to the Agent
     * Teams bundle; absent reads as none.
     */
    readonly teamActiveMembers?: (() => TeamActiveMembers) | undefined;
}
export interface PluginManageFlow {
    /** Resolve the target, run gate 2, and either ask or write straight away. */
    begin(): Promise<PluginManageStep>;
    /** Answer a `confirm` step: proceed with the write. */
    confirm(): Promise<PluginManageStep>;
    /**
     * Release anything the flow holds. Nothing today, and deliberately not a stop
     * button: these three actions have no cancellation, and a write already handed
     * to the service settles on its own (the install flow's `dispose` is the same
     * shape, plus the subscriptions it really does hold).
     */
    dispose(): void;
}
export declare function createPluginManageFlow(options: PluginManageFlowOptions): PluginManageFlow;
/**
 * The `/plugin remove|enable|disable` entry the screen calls: `/plugin`'s
 * argument text in, a flow out — or `undefined` for anything that is not one of
 * the three forms, and for a launch with no profile plugin service to act
 * through (the screen then runs the read-only report, which is where the CLI
 * route is printed).
 *
 * This is the one place that knows how a removal is wired to the running
 * composition, and the only place that touches the person's own data. The
 * residue watch is built here, **while the bundle is still installed**: the
 * declaration that names its data directory and its plugin identity is a file
 * inside the package, so it is unreadable once the bundle has left.
 */
export declare function createPluginManageEntry(ctx: Context, options?: {
    readonly profileName?: string | undefined;
}): (args: string, sink: PluginManageSink) => PluginManageFlow | undefined;
/**
 * Watch one bundle's own data across its removal: the piece the flow cannot do
 * itself, because the declaration that names the identities lives *inside* the
 * package and is unreadable once the bundle has left the profile.
 *
 * The declaration says who the plugin is: its `id` is the identity the grants
 * file, the effect ledger and the storage namespaces record, and each
 * `x-dsh-tui` Backend contribution's `spec.id` names the `<dataDir>/backends/<id>`
 * directory that backend writes to (`src/utils/paths.ts`). Read now, checked
 * later.
 *
 * `undefined` when there is nothing to read: a bundle that ships no declaration
 * is not evidence of a clean removal, only of an unanswerable question.
 */
export declare function residueWatchOf(ctx: Context, name: string, dataRoot?: string): PluginResidueWatch | undefined;
//# sourceMappingURL=plugin-manage.d.ts.map