/**
 * The script inside a shell wrapper, unwrapped losslessly; undefined when
 * the command is not a recognised wrapper or its quoting is not one plain
 * word. Approval prompts show this (or the raw command): what they show is
 * exactly what will run.
 */
export declare function unwrapShell(command: string): string | undefined;
/** A card title's command: the unwrapped script, else (one parsed action)
 *  Codex's own reading of it, else the command as given. */
export declare function unwrapCommand(command: string, actions?: unknown): string;
/** A one-line title: the first line, `…` when more follow. */
export declare function commandTitle(command: string): string;
/** What a command does, from its parsed actions. */
export type CommandKind = {
    readonly kind: 'read';
    readonly paths: readonly string[];
} | {
    readonly kind: 'search';
    readonly query?: string;
    readonly path?: string;
} | {
    readonly kind: 'list';
    readonly path?: string;
} | {
    readonly kind: 'exec';
};
/** Classify by `commandActions`: only a uniform read/search/list command
 *  is not a terminal. */
export declare function classifyCommand(actions: unknown): CommandKind;
//# sourceMappingURL=commands.d.ts.map