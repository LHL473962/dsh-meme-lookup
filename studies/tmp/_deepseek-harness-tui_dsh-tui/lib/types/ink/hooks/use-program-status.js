import { useContext, useEffect, useRef } from 'react';
import { TerminalWriteContext } from '../useTerminalNotification.js';
import { programStatus, } from '../termio/osc7501.js';
/** Stable program id the terminal groups/filters records by. */
export const PROGRAM_STATUS_APP = 'dsh-tui';
/**
 * Report this TUI's lifecycle to the terminal via OSC 7501 (Program Status
 * Protocol), so terminals and agentic inboxes know when dsh-tui is working,
 * waiting on the user, or finished.
 *
 * Precedence mirrors the UI: a parked prompt is `blocked`, a running turn is
 * `working`, a turn that just ended is `done`/`error`, and otherwise `idle`.
 * Reports are deduplicated within the same live turn, so re-renders do not
 * spam the terminal or hide another turn with the same outcome.
 *
 * Two deliberate omissions, both from the spec and confirmed by the shipped
 * implementations (Gradle, Tuist, opentui, Reasonix):
 *
 * - No capability detection: unknown OSCs are ignored by well-behaved
 *   terminals, so reports are sent blind.
 * - No clear on exit: the terminal already drops `working`/`blocked` at
 *   process exit or the next shell prompt, while `done`/`error` must survive
 *   for the user to find. Clearing would erase exactly that.
 *
 * @param input - the channel plus the ask/opt-out the channel cannot know.
 */
export function useProgramStatus(input) {
    const writeRaw = useContext(TerminalWriteContext);
    // An unchanged render writes nothing; a new live end still gets a report.
    const lastReportRef = useRef(undefined);
    // Whether a turn was observed running since the current session was adopted,
    // tagged with the session it belongs to. A projected outcome is PERSISTED
    // state: a resumed session can still carry its previous turn's outcome, and
    // reporting that as a fresh `done` would claim work the user has not seen.
    // Terminal states therefore need evidence of a live turn. The tag matters
    // because switching sessions in one process does
    // not remount this tree, and the switch replays the target session's own
    // history — re-populating the outcome from its last turn.end. A latch left
    // over from the previous session would report that as a brand-new `done`.
    const latchRef = useRef({
        sessionId: input.channel.sessionId,
        generation: input.channel.agentBindingGeneration,
        sawWorking: false,
    });
    const { channel, blocked, enabled } = input;
    const { status, working, turnOutcome, liveTurnEnds, agentBindingGeneration, sessionTitle, sessionId } = channel;
    useEffect(() => {
        if (!enabled || !writeRaw)
            return;
        // Adopting a different session starts a fresh latch; the projected
        // outcome now describes that session's past, not work observed in this one.
        if (latchRef.current.sessionId !== sessionId || latchRef.current.generation !== agentBindingGeneration) {
            latchRef.current = { sessionId, generation: agentBindingGeneration, sawWorking: false };
            lastReportRef.current = undefined;
        }
        // A synchronous start/end batch or a resumed running turn may finish
        // before `working=true` renders; live ends still differ from history.
        if (working || liveTurnEnds > 0)
            latchRef.current.sawWorking = true;
        const derive = () => {
            if (blocked !== null)
                return { state: 'blocked', kind: blocked.kind, msg: blocked.message };
            // Current backend activity does not authorize a historical outcome.
            if (working || status === 'running')
                return { state: 'working' };
            if (!latchRef.current.sawWorking)
                return { state: 'idle' };
            switch (turnOutcome) {
                case 'error':
                    return { state: 'error' };
                case 'interrupted':
                    // The user cancelled: back at rest, per the spec's "report idle
                    // when the user interrupts".
                    return { state: 'idle' };
                case 'completed':
                    return { state: 'done' };
                default:
                    return { state: 'idle' };
            }
        };
        const { state, kind, msg } = derive();
        const sequence = programStatus({
            state,
            app: PROGRAM_STATUS_APP,
            // Every report replaces its record, so app/title ride along each time.
            title: sessionTitle,
            ...(kind === undefined ? {} : { kind }),
            ...(msg === undefined ? {} : { msg }),
        });
        const lastReport = lastReportRef.current;
        if (sequence === '' || (sequence === lastReport?.sequence && liveTurnEnds === lastReport?.liveTurnEnds))
            return;
        lastReportRef.current = { sequence, liveTurnEnds };
        writeRaw(sequence);
    }, [enabled, status, working, turnOutcome, liveTurnEnds, agentBindingGeneration, blocked, sessionTitle, writeRaw, sessionId]);
}
