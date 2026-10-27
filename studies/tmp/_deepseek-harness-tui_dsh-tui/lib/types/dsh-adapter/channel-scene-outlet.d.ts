import React from 'react';
import type { ChannelUi } from '../adapter/ports/channel-ui.js';
import type { TuiSceneDescriptor } from './scenes.js';
/** Renderer-only outlet. Component identity stays in the existing scene registry. */
export declare function createChannelSceneOutlet(current: () => TuiSceneDescriptor | undefined): (id: string, channel: ChannelUi) => React.ReactNode;
//# sourceMappingURL=channel-scene-outlet.d.ts.map