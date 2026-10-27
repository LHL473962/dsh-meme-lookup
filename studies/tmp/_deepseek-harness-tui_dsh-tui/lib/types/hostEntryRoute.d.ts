import { type KernelBackendId } from './kernelPrefs.js';
export declare function hostProfile(env?: NodeJS.ProcessEnv): string;
/** The `backend` the profile patch's dsh-tui row pins, if any (the Config
 *  row a DSH composition would read). `'dynamic'`: a `!!js` expression only
 *  the profile's own Loader can evaluate; one that only forwards
 *  DSH_TUI_BACKEND is no pin. */
export declare function configuredBackend(profile: string, patchFile?: string): KernelBackendId | 'dynamic' | undefined;
/** Whether the entry hands this launch to `dsh --profile`: a dynamic Config
 *  row decides the kernel there, unless a kernel-switch handoff outranks it. */
export declare function delegatesToProfile(configured: KernelBackendId | 'dynamic' | undefined, env?: NodeJS.ProcessEnv): boolean;
/** The kernel this launch boots on, ranked as in the plugin (handoff → Config
 *  row → DSH_TUI_BACKEND → kernel.json → dsh). An id that is not installed
 *  falls back to dsh like a typo, so the entry never mounts an unloadable kernel. */
export declare function entryKernel(env?: NodeJS.ProcessEnv, input?: {
    readonly configured?: KernelBackendId | 'dynamic';
    readonly memoryFile?: string;
}): KernelBackendId;
//# sourceMappingURL=hostEntryRoute.d.ts.map