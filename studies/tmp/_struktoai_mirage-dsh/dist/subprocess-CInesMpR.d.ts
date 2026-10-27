import { Context } from '@deepseek-ai/cordis';
import { SubprocessRuntime, SubprocessSpawnSpec, SubprocessHandle, SubprocessTerminalEnvironment, SubprocessTerminalSpawnSpec, SubprocessTerminalHandle } from '@deepseek-ai/dsh-subprocess';
import './service-vCjLPYMI.js';

interface MirageSubprocessConfig {
    /** Existing workspace session; omitted selects the default session. */
    sessionId?: string;
}
/** One workspace execution world. No host PATH, native descendants, or PTY claims. */
declare class MirageSubprocess extends SubprocessRuntime {
    private readonly config;
    static readonly inject: string[];
    private readonly handles;
    private closed;
    constructor(ctx: Context, config?: MirageSubprocessConfig);
    resolveExecutable(command: string, env?: Readonly<Record<string, string>>, signal?: AbortSignal): Promise<string>;
    spawn(spec: SubprocessSpawnSpec): SubprocessHandle;
    terminalEnvironment(signal?: AbortSignal): Promise<SubprocessTerminalEnvironment>;
    spawnTerminal(_spec: SubprocessTerminalSpawnSpec): Promise<SubprocessTerminalHandle>;
    private checkWorld;
}

export { MirageSubprocess as M, type MirageSubprocessConfig as a };
