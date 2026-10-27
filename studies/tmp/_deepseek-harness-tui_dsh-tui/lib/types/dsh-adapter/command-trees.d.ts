/** Provider-neutral subcommand completion registry for terminal front doors. */
import { Context, Service } from '@deepseek-ai/cordis';
import type { CommandCompletionNode, LocalizedDescriptions } from '../commands.js';
export interface TuiCommandTreeProvider {
    /** Root command name without `/`. Must match the command registry entry. */
    root: string;
    /** Optional provider-owned translations for the root command row. */
    descriptions?: LocalizedDescriptions;
    /** Children for the full canonical path, including `root` at index zero. */
    children(canonicalPath: readonly string[]): readonly CommandCompletionNode[];
}
/** Host-only completion access. Plugins see only their own provider through
 * the traceable service; the channel uses this facade to merge all providers. */
export interface TuiCommandTreeHost {
    register(provider: TuiCommandTreeProvider): () => void;
    children(canonicalPath: readonly string[]): readonly CommandCompletionNode[];
    descriptions(root: string): LocalizedDescriptions | undefined;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiCommandTrees: TuiCommandTreeRuntime;
    }
}
export declare const name = "dsh-tui-command-trees";
/** Small host-only registry; command execution remains owned by dsh-commands. */
export declare class TuiCommandTreeRuntime extends Service {
    constructor(ctx: Context);
    register(provider: TuiCommandTreeProvider): () => void;
    children(canonicalPath: readonly string[]): readonly CommandCompletionNode[];
    descriptions(root: string): LocalizedDescriptions | undefined;
}
export declare function getHostCommandTrees(runtime: TuiCommandTreeRuntime | undefined): TuiCommandTreeHost | undefined;
export default TuiCommandTreeRuntime;
//# sourceMappingURL=command-trees.d.ts.map