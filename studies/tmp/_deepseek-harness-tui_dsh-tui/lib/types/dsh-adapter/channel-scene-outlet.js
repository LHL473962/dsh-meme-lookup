import React from 'react';
import * as ui from '../ui.js';
/** Renderer-only outlet. Component identity stays in the existing scene registry. */
export function createChannelSceneOutlet(current) {
    return (id, channel) => {
        const scene = current();
        if (scene?.id !== id)
            throw new Error(`Scene unavailable: ${id}`);
        return React.createElement(scene.component, {
            React, ui, channel, close: () => channel.closePluginScene(),
        });
    };
}
