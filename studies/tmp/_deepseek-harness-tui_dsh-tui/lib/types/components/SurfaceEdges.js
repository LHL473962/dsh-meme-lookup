import React from 'react';
export const NO_BLEED = Object.freeze({ left: 0, right: 0 });
export const SurfaceEdgesContext = React.createContext(NO_BLEED);
/** Bleed allowance of the nearest surface (columns, per side). */
export function useSurfaceEdges() {
    return React.useContext(SurfaceEdgesContext);
}
