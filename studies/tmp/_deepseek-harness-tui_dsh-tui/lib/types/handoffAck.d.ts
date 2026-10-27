/** fd number of the ACK pipe (stdio[3] of the spawn). */
export declare const HANDOFF_ACK_FD_ENV = "DSH_TUI_HANDOFF_ACK_FD";
/** 'alt' when the previous process left the terminal in the alternate screen. */
export declare const HANDOFF_SCREEN_ENV = "DSH_TUI_HANDOFF_SCREEN";
/** Attempt id, echoed in every ACK line and in restart.log. */
export declare const HANDOFF_ATTEMPT_ENV = "DSH_TUI_HANDOFF_ATTEMPT";
/** ACK line format: `dsh-tui-handoff <kind> <attemptId>`. */
export declare const ACK_PREFIX = "dsh-tui-handoff";
export type HandoffAckKind = 'adopted' | 'ready';
export type HandoffAckState = {
    attemptId: string;
    fd: number;
    /**
     * 'armed': env received, screen not mounted yet. 'adopted': AlternateScreen
     * mounted; until ready this process must not write 1049l. 'ready': first
     * frame flushed and acknowledged; this process now owns the screen.
     */
    adoption: 'armed' | 'adopted' | 'ready';
    /** The pipe stopped accepting writes (the old process is gone): stop sending. */
    dead: boolean;
};
/** Read (and remove) the handoff env early in boot; undefined when this is not a handoff. */
export declare function beginHandoffAck(env?: NodeJS.ProcessEnv): HandoffAckState | undefined;
/** Whether this boot is a handoff replacement (read by AlternateScreen). */
export declare function handoffAckArmed(): boolean;
/** The handoff attempt id, for restart.log; undefined outside a handoff. */
export declare function handoffAttemptId(): string | undefined;
/**
 * Called by AlternateScreen once it has mounted on the inherited screen.
 * Until ready, this process's exit cleanup leaves 1049l to the old process.
 */
export declare function noteScreenAdopted(): void;
/** The first frame after adoption has been flushed: send ready and take over the screen. */
export declare function markScreenReady(): void;
/**
 * Whether this process should write 1049l when it leaves the alternate
 * screen. Always true outside a handoff. During one it is false until ready,
 * because the old process closes the screen if this one dies first. A dead
 * pipe also makes it true: closing twice is better than leaving the terminal
 * in the alternate screen.
 */
export declare function ownsAltScreenExit(): boolean;
/**
 * Wrap stdout.write until the first write after adoption, and send ready
 * from that write's flush callback. The wrapper removes itself before
 * forwarding, so later writes go straight through. Does nothing outside a
 * handoff.
 */
export declare function armFirstFrameAck(stdout: NodeJS.WriteStream): void;
/** Parse one ACK pipe line (old process side); null for anything else. */
export declare function parseHandoffAckLine(line: string): {
    kind: HandoffAckKind;
    attemptId: string;
} | null;
/** Test hook: install a state directly. */
export declare function __setHandoffAckStateForTest(next: HandoffAckState | undefined): void;
//# sourceMappingURL=handoffAck.d.ts.map