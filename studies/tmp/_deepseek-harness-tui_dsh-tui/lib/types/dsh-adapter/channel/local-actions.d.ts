import type { foldBack as FoldBack } from './transcript.js';
import type { ChannelState, ToolViewPresenter } from './types.js';
export { setActivityFrames } from './core/local-actions.js';
/**
 * The DSH halves of the local actions (the backend-neutral ones live in
 * core/local-actions.ts): restoring folded rows from the DSH session log,
 * and the live subagent roster query.
 */
export declare function createLocalActions(deps: {
    ctx: {
        get(name: string): unknown;
    };
    owner: {
        current(): boolean;
    };
    binding: {
        capture(): unknown;
        isCurrent(capture: unknown): boolean;
        readonly agent: {
            session: unknown;
        };
    };
    state: ChannelState;
    presenters: ToolViewPresenter;
    foldBack: typeof FoldBack;
}): {
    /** The history slicer behind "load earlier": restores folded rows from
     *  the durable DSH log (the core emits when anything came back). */
    loadOlder(): number;
    listSubagents(): Promise<string[]>;
};
//# sourceMappingURL=local-actions.d.ts.map