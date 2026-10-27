import React from 'react';
export type Clock = {
    subscribe: (onChange: () => void, keepAlive: boolean) => () => void;
    now: () => number;
    setTickInterval: (ms: number) => void;
    /**
     * Pause the clock for `ms` (circuit-breaker quench, see
     * update-overflow-guard). Animations freeze for the window; no data is
     * lost — consumers re-read fresh values on the next tick after resume.
     */
    suspend: (ms: number) => void;
};
export declare function createClock(tickIntervalMs: number): Clock;
export declare const ClockContext: React.Context<Clock | null>;
/** Stable clock ownership; focus only changes its scheduling interval. */
export declare function ClockProvider({ children }: React.PropsWithChildren): React.JSX.Element;
//# sourceMappingURL=ClockContext.d.ts.map