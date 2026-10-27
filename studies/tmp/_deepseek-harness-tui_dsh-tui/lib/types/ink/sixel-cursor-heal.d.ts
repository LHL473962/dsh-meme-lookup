import { type TerminalQuerier } from './terminal-querier.js';
/** One ordered pre-park probe, with bounded recovery and lifecycle cancellation. */
export declare class SixelCursorHeal {
    private readonly recover;
    private readonly log;
    private readonly now;
    private pending;
    private recoveredAt;
    private quietUntil;
    private disposed;
    constructor(recover: () => void, log: (message: string) => void, now?: () => number);
    /** Returns bytes to append immediately after the last sixel payload, before CUP. */
    prepare(querier: TerminalQuerier, expected: {
        row: number;
        col: number;
    }): string;
    /** Resize/handoff invalidates geometry and quarantines already travelling replies. */
    reset(): void;
    dispose(): void;
}
//# sourceMappingURL=sixel-cursor-heal.d.ts.map