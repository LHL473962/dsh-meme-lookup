/**
 * Local-only transcript actions every session gets: `/clear`, local report
 * rows, `!cmd` / `!!cmd` through the session's workspace shell,
 * `/activity frames`, and the "load earlier" restore of folded rows. The
 * restore only works when the backend can slice its own durable history;
 * otherwise nothing is ever folded and the action restores 0 rows.
 */
import type { ServiceLookup } from '../channel-host.js';
import type { ChannelBinding } from '../binding.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelState } from '../types.js';
import type { CoreHost } from './host.js';
/** `/activity frames <name>`: validate, persist, re-render. */
export declare function setActivityFrames(state: Pick<ChannelState, 'activityFrames' | 'emit'>, notify: ChannelState['notify'], name: string): boolean;
export declare function createCoreLocalActions(ctx: ServiceLookup, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<ChannelBinding, 'capture' | 'isCurrent'>;
    state: ChannelState;
    rowIds: {
        value: number;
    };
    workspace: CoreHost['workspaceService'];
    resetProjection(): void;
    notify: ChannelState['notify'];
    unavailable(name: string): void;
    /** Extension projections whose rows `/clear` drops with the transcript. */
    dropRows(): void;
    /** Restore folded rows from the backend's durable history; absent = the
     *  backend cannot slice it (and nothing is folded). */
    loadOlder(): (() => number) | undefined;
    /** An input on its way to the session (`!!`): returns its end. */
    beginInput?(): () => void;
}): {
    loadOlder(): number;
    clear(): void;
    pushLocal(title: string, lines: readonly string[], options?: {
        readonly lineLimit?: number;
        readonly preserveWhitespace?: boolean;
    }): void;
    setActivityFrames: (name: string) => boolean;
    /**
     * `!cmd` / `!!cmd`: the workspace's own command shell when it has one
     * (a remote workspace runs the command there), else the host shell;
     * `!!` sends the output on as a followup of the session it ran for.
     */
    runLocalCommand(command: string, includeInContext: boolean): Promise<void>;
};
export type CoreLocalActions = ReturnType<typeof createCoreLocalActions>;
//# sourceMappingURL=local-actions.d.ts.map