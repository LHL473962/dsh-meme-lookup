import { workspaceDriver } from '../../upstream/workspace-driver.js';
export const workspaceSlice = Object.freeze({
    id: 'workspace',
    capability: 'host.workspaces',
    driver: workspaceDriver,
    standardDeclarations: Object.freeze([
        'host.workspaces.list',
        'host.workspaces.resolve',
        'host.workspaces.describe',
        'host.workspaces.commandShell',
        'host.workspaces.rename',
        'host.workspaces.remove',
        'host.workspaces.commands',
        'host.workspaces.runCommand',
    ]),
});
