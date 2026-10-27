import { createCommandCompletions } from '../command-completions.js';
import { createFileActions } from '../file-actions.js';
import { createLocalFs } from '../local-fs.js';
import { mentionFs } from '../mentions.js';
import { sessionWorkingDirectory } from '../../../channel/working-directory.js';
/** No argument catalogs: the tree offers its static nodes only. */
export const NO_COMPLETION_CATALOG = {
    workspaceCommands: () => [],
    model: {
        warmModelNodes: () => undefined,
        modelNodes: () => [],
        warmPresetOptions: () => undefined,
        presetOptions: () => [],
        warmEffortLevels: () => undefined,
    },
};
export function createCoreFiles(ctx, deps) {
    // The session's working directory is the local disk when the host mounts
    // no fs service and the backend runs here (mentions and `@` completion).
    const localFs = createLocalFs();
    const fallbackFs = () => deps.localFallback() ? localFs : undefined;
    const fs = () => mentionFs(ctx) ?? fallbackFs();
    const fileActions = createFileActions({
        owner: deps.owner,
        capture: () => deps.binding.capture(),
        current: capture => deps.binding.isCurrent(capture),
        cwd: () => sessionWorkingDirectory(deps.state()),
        fs,
    });
    return {
        fallbackFs,
        listFileCandidates: fileActions.listFileCandidates,
        listFiles: fileActions.listFiles,
        /** The slash completion over the composition's argument catalogs. */
        commandCompletions(catalog) {
            return createCommandCompletions({
                state: deps.state,
                themeHost: deps.host.themeHost,
                commandTrees: deps.host.commandTrees,
                workspaceCommands: catalog.workspaceCommands,
                ...(deps.mcpServers === undefined ? {} : { mcpServers: deps.mcpServers }),
                model: catalog.model,
                ...(catalog.plugin === undefined ? {} : { plugin: catalog.plugin }),
            });
        },
    };
}
