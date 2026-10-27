/** Codex-only slash commands. The host's merge drops a name that collides with
 *  a local command ("local names win"), so this module never has to know the
 *  host's command table. */
import type { AgentEvent, CommandInfo } from '../../../agent/events.js';
import type { AgentInput, SubmitPlacement } from '../../../agent/session.js';
import { type Rec } from '../narrow.js';
import { type UserInput } from '../protocol/index.js';
import type { CodexHub } from '../rpc/hub.js';
import type { ItemContext } from '../translate/items.js';
export declare function reviewTarget(args: string): Rec;
interface CommandDeps {
    readonly hub: CodexHub;
    readonly ctx: ItemContext;
    readonly cwd: string;
    threadId(): string;
    busy(): boolean;
    emit(events: readonly AgentEvent[]): void;
    lastDiff(): string | undefined;
    planSupported(): boolean;
    setPlan(): Promise<void>;
    /** Leave Plan for the permission preset that was active before it (the
     *  catalog's `off` token). */
    exitPlan(): Promise<void>;
    submit(input: AgentInput, placement: SubmitPlacement, wireInput?: readonly UserInput[]): Promise<{
        readonly accepted: boolean;
        readonly reason?: string;
    }>;
    beginReview(): () => void;
    noteReviewStarted(id: string): void;
}
export declare function createCodexCommands(deps: CommandDeps): {
    capability: {
        list: () => Promise<readonly CommandInfo[]>;
    };
    changed: () => void;
    submit(input: AgentInput, placement: SubmitPlacement): Promise<{
        readonly accepted: boolean;
        readonly reason?: string;
    } | undefined>;
    note(method: string): void;
};
export {};
//# sourceMappingURL=commands.d.ts.map