import { Context } from '@deepseek-ai/cordis';
import { SpillStore, SaveTextSpill, SpillRef } from '@deepseek-ai/dsh-spill';

/** Configuration for the mirage spill store. */
interface MirageSpillConfig {
    /**
     * Workspace directory the artifacts are written under, one
     * subdirectory per session. Absolute, and normalized before use; must
     * fall inside a mount this world can write, and the default sits on
     * the `/tmp` ram mount the bundle patch provides.
     */
    dir?: string;
}
/**
 * Mirage-backed implementation of `ctx.spillStore`.
 *
 * The spill policy replaces an oversized tool result with a preview and
 * a locator, telling the model to read or grep it for the rest. That
 * only works if the locator names a file the model can reach, and in a
 * mirage world the model reaches the workspace, not the host: a spill
 * written to the harness's own disk hands it a path its next `grep`
 * cannot open, which reads as output the harness lost. So the artifact
 * is written through the same dispatcher every other effect in this world
 * passes, and the locator is an ordinary workspace path.
 *
 * The seam asks for a private location. mirage has no permission bits
 * to offer: the workspace is the boundary, and a deployment that needs
 * the artifacts out of the agent's reach puts `dir` on a mount the
 * session has no grant for.
 */
declare class MirageSpillStore extends SpillStore {
    static readonly inject: string[];
    private readonly dir;
    constructor(ctx: Context, config?: MirageSpillConfig);
    saveText(input: SaveTextSpill): Promise<SpillRef>;
}

export { type MirageSpillConfig as M, MirageSpillStore as a };
