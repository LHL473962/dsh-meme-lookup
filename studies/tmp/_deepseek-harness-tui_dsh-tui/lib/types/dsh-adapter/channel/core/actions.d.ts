/**
 * The channel's single action install. Every `ChannelUi` action resolves
 * through these layers, later ones overriding earlier ones:
 *
 *   1. unavailable: `capability-unavailable-backend` plus the contract's
 *      failure value (`createUnavailableActionDelegates`);
 *   2. a typed session capability, looked up on the bound session at every
 *      call since a `/new` may land on a session with other capabilities. A
 *      rejecting capability is reported and returns the action's failure
 *      value instead of an unhandled rejection;
 *   3. the backend-neutral core actions (local rows, shell, files,
 *      completions, `/doctor`, `/export`, `/new`);
 *   4. the extension's delegates (the DSH extensions).
 *
 * The readiness cell installs the merged table once, after every layer
 * exists, so no construction-time placeholder is ever callable.
 */
import type { AgentSession } from '../../../agent/session.js';
import { type ChannelActionDelegates, type createChannelActionReadiness } from '../action-readiness.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelState } from '../types.js';
export declare function createCapabilityDelegates(deps: {
    owner: Pick<ChannelOwner, 'current'>;
    session(): AgentSession;
    state: () => Pick<ChannelState, 'provider' | 'model' | 'backendCapabilities' | 'emit'>;
    notify: ChannelState['notify'];
    unavailable(name: string): void;
    unavailableLines(name: string): string[];
    guarded<T>(name: string, fallback: T, run: () => Promise<T>): Promise<T>;
}): Partial<ChannelActionDelegates>;
/** Merge the layers and install them (`replace`: the adoption-window reinstall, core/compose.ts). */
export declare function installChannelActions(readiness: ReturnType<typeof createChannelActionReadiness>, layers: {
    unavailable(name: string): void;
    unavailableLines(name: string): string[];
    capability: Partial<ChannelActionDelegates>;
    core: Partial<ChannelActionDelegates>;
    extension: Partial<ChannelActionDelegates> | undefined;
}, replace?: boolean): void;
//# sourceMappingURL=actions.d.ts.map