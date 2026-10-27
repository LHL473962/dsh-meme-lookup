/**
 * Trajectory scope — the cross-agent drilldown selector (current agent /
 * delegating turn / all descendants).
 *
 * The scope is a pure value describing WHICH lane's rows the trajectory
 * surfaces render. `session` is the default and the pre-scope behavior;
 * the other three kinds are all anchored on one drilldown target agent:
 *
 *  - `agent`        that agent's own lane log (its tools, its messages);
 *  - `parent-turn`  the MAIN lane's rows of the delegating turn — the
 *                   context the spawn happened in;
 *  - `descendants`  the agent's whole subtree merged in emission order.
 *
 * Pure logic only (no React, no i18n): the surfaces build their chip text
 * from {@link scopeChipParts} and drive the cycle through {@link drillScopeFrom}
 * / {@link nextScope}.
 */
import type { TrajectoryLane } from '../../dsh-adapter/trajectory/index.js';
import type { TrajNode } from '../../dsh-adapter/types.js';
/** Which lane's rows the trajectory surfaces render. */
export type TrajScope = {
    readonly kind: 'session';
} | {
    readonly kind: 'agent';
    readonly agentId: string;
    readonly label: string;
} | {
    readonly kind: 'parent-turn';
    readonly agentId: string;
    readonly label: string;
    readonly turn: number;
} | {
    readonly kind: 'descendants';
    readonly agentId: string;
    readonly label: string;
};
/** The lane's display label: its description, else model, else id head. */
export declare function laneLabelOf(lane: TrajectoryLane): string;
/**
 * The lane a ledger row can drill into: a `subagent` descriptor row names
 * its agent directly (the neutral source stamps `agentId`); the
 * DELEGATING tool row anchors one through its `callId`.
 */
export declare function laneOfNode(node: TrajNode | undefined, lanes: readonly TrajectoryLane[]): TrajectoryLane | undefined;
/**
 * The MAIN-lane turn a lane's delegating call landed in — the 父回合 a
 * drilldown can jump back to. `undefined` when the anchor call never
 * folded into the main ledger (or the lane registered without a call).
 */
export declare function parentTurnOf(lane: TrajectoryLane, mainNodes: readonly TrajNode[]): number | undefined;
/** Drill INTO the lane a focused row names; `undefined` = not drillable. */
export declare function drillScopeFrom(node: TrajNode | undefined, lanes: readonly TrajectoryLane[]): TrajScope | undefined;
/**
 * The drill key's cycle: 当前 Agent → 父回合 → 全部后代 → 会话. The parent
 * turn is skipped when it cannot be resolved; a scope whose lane vanished
 * (a reset) falls straight back to the session.
 */
export declare function nextScope(scope: TrajScope, lanes: readonly TrajectoryLane[], mainNodes: readonly TrajNode[]): TrajScope;
/** The scope chip's i18n key and interpolation params (`undefined` = hide). */
export declare function scopeChipParts(scope: TrajScope): {
    readonly key: 'trajectory-view-agent' | 'trajectory-view-parent' | 'trajectory-view-descendants';
    readonly params: Readonly<Record<string, string | number>>;
} | undefined;
//# sourceMappingURL=scope.d.ts.map