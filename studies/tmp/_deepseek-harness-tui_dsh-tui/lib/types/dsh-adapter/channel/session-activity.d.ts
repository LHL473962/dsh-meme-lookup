import type { CoreChannel } from './core/compose.js';
import type { ChannelLaunchOptions } from './state.js';
/**
 * Attach the per-binding wiring to a core whose sessions may serve the
 * `workingActivity` capability. Called inside `createChannel`'s
 * construction transaction, before the channel starts.
 */
export declare function attachSessionWorkingActivity(core: CoreChannel, options: Pick<ChannelLaunchOptions, 'publishActivity' | 'clearActivity'>): void;
//# sourceMappingURL=session-activity.d.ts.map