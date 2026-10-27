// Re-export shim: the Cordis-backed implementation lives behind the adapter
// boundary so UI consumers never import official @deepseek-ai/* packages.
export { name, WORKSPACE_PROVIDER_TIMEOUT_MS, TuiWorkspaceRuntime, createLocalWorkspaceRuntime, localWorkspaceUri, parseLocalWorkspaceReference, listRegistryWorkspaces, removeRegistryWorkspace, } from './dsh-adapter/workspaces.js';
export { default } from './dsh-adapter/workspaces.js';
