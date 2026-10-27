import type { AdapterRuntimeOptions } from '../../../adapter/kernel/runtime.js';
import { readGrantStore } from '../../../adapter/standard/grants.js';
import { getHostCommandTrees } from '../../command-trees.js';
import { getHostRenderers } from '../../renderers.js';
import { getHostSceneRuntime } from '../../scenes.js';
import { getHostSettingsSections } from '../../settings-sections.js';
import { getHostThemes } from '../../themes.js';
import { createLocalWorkspaceRuntime, getHostWorkspaceRuntime } from '../../workspaces.js';
import type { ChannelHost, ServiceLookup } from '../channel-host.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelState } from '../types.js';
/**
 * The host services a channel composition reads, looked up per read: the
 * profile's `tui*` rows can compose after the mount.
 */
export interface CoreHost {
    readonly adapterRuntime: AdapterRuntimeOptions;
    readonly themeHost: ReturnType<typeof getHostThemes>;
    /** Workspace registry runtime; the local-only runtime without the row. */
    readonly workspaceService: NonNullable<ReturnType<typeof getHostWorkspaceRuntime>> | ReturnType<typeof createLocalWorkspaceRuntime>;
    readonly commandTrees: ReturnType<typeof getHostCommandTrees>;
    readonly sceneRuntime: ReturnType<typeof getHostSceneRuntime>;
    readonly settingsSectionsRuntime: ReturnType<typeof getHostSettingsSections>;
    readonly rendererRuntime: ReturnType<typeof getHostRenderers>;
    /** The live grant store: the host-owned one when the plugin-host row is
     *  mounted, else this channel's private fallback (re-read per operation). */
    currentGrantStore(): ReturnType<typeof readGrantStore>;
}
/**
 * Resolve the host seams and install the decision gate. The topology marker
 * is effectful state, so it is owned at acquisition: a later construction
 * failure rolls it back.
 */
export declare function resolveCoreHost(ctx: ChannelHost, owner: Pick<ChannelOwner, 'own'>): CoreHost;
/**
 * Re-render on settings-section and plugin-scene changes (owner-scoped),
 * re-binding when the host reports a service change.
 */
export declare function startHostSubscriptions(host: Pick<CoreHost, 'settingsSectionsRuntime' | 'sceneRuntime'>, owner: Pick<ChannelOwner, 'own' | 'current'>, state: Pick<ChannelState, 'pluginScene' | 'emit'>, services?: Pick<ChannelHost, 'watchServices'>): void;
/**
 * Statusline breadcrumb: the current git branch of the session cwd
 * (best-effort, through the host `shell` service). Re-run when an adoption
 * lands on a different cwd (/resume, /workspace, issue #96) so the
 * breadcrumb never shows the previous workspace's branch.
 *
 * Adoption is not the only way the branch changes: a checkout in another
 * terminal has to be seen through the workspace's own `.git/HEAD`, whose text
 * is re-probed when it changes. Polling rather than `fs.watch` follows the
 * grant store (a watcher can outlive a replaced inode, and `gitdir:`
 * indirection, network mounts and watch limits each need their own fallback);
 * the text is the signature, not the mtime, because timestamp granularity
 * differs per filesystem while HEAD is well under 100 bytes.
 *
 * Where the host shell runs elsewhere (remote or sandboxed workspace), this
 * process's `.git` is not the workspace's: with no HEAD to anchor on the poll
 * stays quiet instead of clearing a value it cannot verify.
 */
export declare function createGitBranchRefresher(ctx: ServiceLookup, deps: {
    owner: Pick<ChannelOwner, 'current' | 'own'>;
    state: Pick<ChannelState, 'cwd' | 'workingDirectory' | 'gitBranch' | 'emit'>;
    /** Record the resolved branch against the bound session (the session
     *  browser's branch column); absent = nothing records it. */
    noteBranch?(branch: string): void;
}): () => void;
//# sourceMappingURL=host.d.ts.map