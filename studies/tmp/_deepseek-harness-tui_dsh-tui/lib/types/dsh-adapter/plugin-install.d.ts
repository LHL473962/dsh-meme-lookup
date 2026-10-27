/**
 * `/plugin install <spec>`: the write half of the plugin command (Stage C-4).
 *
 * The flow owns the whole conversation with the host service — what a spec
 * names, gate 1's pre-install notice, gate 3's trust routing, pnpm's progress,
 * cancellation, the build-script approval, the version-exemption escape and
 * the final report — and it produces the transcript lines for all of it.
 *
 * What it does not do is ask. Every point where a person decides comes back as
 * a {@link PluginInstallStep}; the UI renders it and answers by calling the
 * next method. That keeps key handling where every other overlay keeps it
 * (`Chat.tsx`) and the domain here, and it lets a regression drive the whole
 * flow through a fake service without a terminal.
 *
 * Three rules the service's own semantics force:
 *
 * - `installBundle` resolves only once the run is over and the profile was
 *   restored or changed, so the promise IS the result. The service deletes a
 *   request the moment it settles, which makes `waitForInstall` a recovery path
 *   for a caller that lost the promise — not a mailbox to collect from, and not
 *   something this flow needs (it never lets go).
 * - A failure arrives in-band: the service folds every error into
 *   `application: 'failed'` with `result.error`. Only a lock or disposal error
 *   rejects, so the flow contains both shapes.
 * - Everything asynchronous is fenced to the binding that asked. A `/new` or a
 *   resume mid-install must not write pnpm output into the new session's
 *   transcript; the run itself is a profile-level operation and keeps going.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ChangeResult, IncompatiblePlugin, InstallSpecKind, PluginInstallRequestId, Registry } from '@deepseek-ai/dsh-plugin-manager/types';
import { type PluginInstallNotice } from './plugin-declaration.js';
import { type FirstPartyFeedLoad, type FirstPartyVerdict } from './plugin-feed.js';
import { type PluginInstallEvents, type PluginManagerView } from './plugin-manager.js';
/** How many lines of pnpm's output the failure report keeps. */
export declare const INSTALL_LOG_TAIL = 6;
/** What a spec names, once the service has read it. */
export interface PluginArtifact {
    readonly name?: string | undefined;
    readonly version?: string | undefined;
    readonly kind: InstallSpecKind;
    readonly bundle: boolean | null;
    readonly registry: Registry;
    readonly host?: string | undefined;
}
/** What the profile's compatibility file currently exempts. */
export type VersionExemptions = ReturnType<PluginManagerView['listVersionExemptions']>;
/** Stable display shape across the host's peers → requirements rename. */
export type IncompatiblePackage = Pick<IncompatiblePlugin, 'name' | 'version' | 'runtimeVersion'> & {
    readonly peers: Readonly<Record<string, string>>;
};
/**
 * What `/plugin install` has to say next. `done` means the flow has reported
 * everything it is going to report: refused, finished, failed or cancelled.
 */
export type PluginInstallStep = {
    readonly kind: 'confirm';
    readonly artifact: PluginArtifact;
    /** Gate 3: whether the feed vouches for this exact artifact. */
    readonly trust: FirstPartyVerdict;
    /** Gate 1: what could be read about the package's declarations, before it lands. */
    readonly notice: PluginInstallNotice;
}
/** pnpm was blocked by build scripts this profile has not approved. */
 | {
    readonly kind: 'build-blocked';
    readonly builds: readonly string[];
}
/** The running host refuses this exact version; the exemption is the escape. */
 | {
    readonly kind: 'incompatible';
    readonly packages: readonly IncompatiblePackage[];
    readonly exemptions: VersionExemptions;
} | {
    readonly kind: 'done';
};
/** What the caller of a flow supplies that only the UI knows. */
export interface PluginInstallSink {
    /** The session the flow's output belongs to; see `binding` below. */
    readonly binding: () => number;
    /** Whether a turn is running; see `busy` on the flow's options. */
    readonly busy: () => boolean;
    /** Where the flow's transcript lines go (already sanitized and capped). */
    readonly onLines: (lines: readonly string[]) => void;
}
export interface PluginInstallFlowOptions {
    readonly manager: PluginManagerView;
    readonly spec: string;
    /** The feed the trust verdict reads (loaded once by the caller). */
    readonly feed: FirstPartyFeedLoad;
    /** Gate 1's evidence for one target; `declarationNoticeFor` in the wiring. */
    readonly noticeOf: (target: {
        readonly name?: string | undefined;
        readonly directory?: string | undefined;
    }) => PluginInstallNotice;
    /** Resolve a path spec to a directory, when the caller knows the profile root. */
    readonly specDirectory?: ((spec: string) => string | undefined) | undefined;
    /** The binding generation that asked; every asynchronous write is fenced to it. */
    readonly binding: () => number;
    /**
     * Whether a turn is running. Installing changes the profile, and the change
     * applies or reloads plugins under whatever is running, so the flow refuses
     * while this is true — before the inspection, and again before the write.
     */
    readonly busy: () => boolean;
    /** Where the flow's transcript lines go (already sanitized and capped). */
    readonly onLines: (lines: readonly string[]) => void;
    /** The manager's install events, when the caller has a context to subscribe on. */
    readonly events?: PluginInstallEvents | undefined;
    /** This package's running version — the other side of the drift check. */
    readonly ownVersion?: string | undefined;
    /** The profile an installation belongs to, for the manual commands. */
    readonly profileName?: string | undefined;
    /** The registry asked first. */
    readonly registry?: Registry | undefined;
    /** Injectable for a regression; a fresh process-unique id otherwise. */
    readonly requestId?: PluginInstallRequestId | undefined;
}
export interface PluginInstallFlow {
    readonly requestId: PluginInstallRequestId;
    /** Read the spec, judge it, and either ask (gate 1 / gate 3) or install straight away. */
    begin(): Promise<PluginInstallStep>;
    /** Answer a `confirm` step: proceed. */
    confirm(): Promise<PluginInstallStep>;
    /** Answer a `build-blocked` step: allow these scripts and retry. */
    approve(builds: readonly string[]): Promise<PluginInstallStep>;
    /** Answer an `incompatible` step: exempt these exact versions and retry. */
    acceptRisk(): Promise<PluginInstallStep>;
    /** Stop pending work and await profile writes already started; repeated calls share the wait. */
    cancel(): Promise<PluginInstallStep>;
    /** Release the event subscriptions. */
    dispose(): void;
}
/**
 * The reason line for a result that failed, from the most specific field it
 * carries. Exported because the lifecycle flow (`./plugin-manage.ts`) writes
 * through the same `change()` funnel and reports the same shapes — and because
 * the credential reasoning below is exactly the kind of rule that must not exist
 * in two copies: a removal runs pnpm too.
 */
export declare function failureReasonOf(result: ChangeResult): string;
export declare function createPluginInstallFlow(options: PluginInstallFlowOptions): PluginInstallFlow;
/**
 * The `/plugin install` entry the screen calls: `/plugin`'s argument text in, a
 * flow out — or `undefined` for anything that is not an install form, and for a
 * launch with no profile plugin service to install through (the screen then
 * runs the read-only report, which is where the CLI route is printed).
 *
 * This is the one place that knows how the flow is wired to the running
 * composition: the host service and its events, the packaged feed, gate 1's
 * declaration reader, and the profile-relative resolution of a `install <path>`
 * spec. It lives beside the flow rather than in the entry so a regression can
 * drive the real wiring with a fixture context — the parts that only exist here
 * (the feed load, the declaration read, the `file:` base URL) are exactly the
 * ones a fixture-only battery would otherwise never touch.
 */
export declare function createPluginInstallEntry(ctx: Context, options?: {
    readonly profileName?: string | undefined;
    readonly ownVersion?: string | undefined;
}): (args: string, sink: PluginInstallSink) => PluginInstallFlow | undefined;
//# sourceMappingURL=plugin-install.d.ts.map