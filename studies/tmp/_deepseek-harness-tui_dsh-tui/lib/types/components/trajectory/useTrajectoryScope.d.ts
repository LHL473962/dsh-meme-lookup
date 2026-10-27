/**
 * The scope state + scoped data plane shared by the trajectory scene and
 * the side panel.
 *
 * The hook owns three things the two surfaces would otherwise drift on:
 *
 * - the lane roster, read tolerantly (trajectoryLanes is an optional
 *   capability — a source without lane attribution offers no filter);
 * - the scoped node list + event snapshot every downstream region
 *   (query, wave, ledger, inspector, hotspot) renders from — ONE
 *   substitution point, so a scoped view can never show the session's
 *   wave over the lane's ledger;
 * - the lane fold itself, kept incremental per scope exactly the way Chat
 *   keeps the main one: extended during render against the lane snapshot's
 *   prefix identity, refolded from scratch when the scope switches.
 */
import { type RawTrajEvent, type TrajBuild, type TrajectoryLane } from '../../dsh-adapter/trajectory/index.js';
import type { TrajNode } from '../../dsh-adapter/types.js';
import type { ChannelUi } from '../../adapter/channel/ui-policy.js';
import { type TrajScope } from './scope.js';
/** One scoped data plane: the rows to render and the log to inspect from. */
export interface ScopedTrajectory {
    readonly nodes: readonly TrajNode[];
    readonly events: readonly RawTrajEvent[];
    /**
     * The scoped build the aggregators read. For lane scopes this is the
     * lane's own incremental build; for parent-turn a derived view over the
     * main build (its nodes filtered, its timing slots shared); for session
     * the main build itself, untouched.
     */
    readonly build: TrajBuild;
}
export declare function useTrajectoryScope(channel: ChannelUi | undefined, build: TrajBuild): {
    readonly scope: TrajScope;
    readonly lanes: readonly TrajectoryLane[];
    readonly scoped: ScopedTrajectory;
    /** The drill key / chip click: drill from a focused row, or cycle. */
    drill(node: TrajNode | undefined): void;
    /** Esc's first layer: true when a non-session scope consumed the press. */
    popScope(): boolean;
};
//# sourceMappingURL=useTrajectoryScope.d.ts.map