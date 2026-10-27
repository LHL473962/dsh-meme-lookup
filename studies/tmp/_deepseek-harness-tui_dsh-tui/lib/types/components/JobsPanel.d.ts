import React from 'react';
import { type BackgroundJobState } from '../dsh-adapter/jobs.js';
/**
 * Pure width→column allocation for the roster row (kept side-effect free so
 * regressions can assert the table directly). There is no pid column in this
 * roster. In the side panel, the command gets a wrapped row under the id and
 * status header; full-screen keeps the flexible inline label column.
 */
export interface JobsRowColumns {
    readonly showProgress: boolean;
    readonly showDuration: boolean;
    readonly showStatus: boolean;
    readonly idWidth: number;
    readonly statusWidth: number;
    /** Full-screen keeps the label in the header; panel rows place it below. */
    readonly labelWrap: boolean;
}
export declare function resolveJobsRowColumns(width: number): JobsRowColumns;
export interface JobsPanelProps {
    jobs: readonly BackgroundJobState[];
    /** Focus this job on open (a transcript card click opens the panel AT its
     *  job); absent or unknown ids fall back to the roster head. */
    initialFocusId?: string;
    /** Panel-variant focus lane: same intent as initialFocusId but re-fireable
     *  (nonce bumps on every request, so clicking the same card twice refocuses).
     *  Ignored by the default (full-screen) variant. */
    focusRequest?: {
        readonly id: string | null;
        readonly nonce: number;
    } | null;
    onClose?: () => void;
    /** Kill the focused live job (`job_kill` with the session's authority). */
    onKill: (id: string) => void;
    /** Keep the focused job's output tail fresh while the panel shows it
     *  (a backend whose output is read on demand); returns the unwatch. */
    onWatchOutput?: (id: string) => () => void;
    /** Attach the focused job to the next submitted message. Panel mode only. */
    onSendToChat?: (job: BackgroundJobState) => void;
    /** 'panel' mounts inside the side-panel host (no outer padding, host-owned
     *  chrome, keyboard via usePanelInput). Default keeps the full-screen
     *  behavior byte-for-byte. */
    variant?: 'default' | 'panel';
    /** Panel variant: the host reports focus/visibility; inactive panels keep
     *  their state but receive no keys and pause the clock. */
    focused?: boolean;
    visible?: boolean;
}
/**
 * `/jobs` overlay panel — every background job of the current session with
 * live status, elapsed/total duration and terminal detail (exit code).
 * Keyboard: ↑/↓ move, k kills the focused live job, Esc closes; the focused
 * row expands a detail block (full label, start/finish times, mirrored
 * output tail). The panel is the deep view behind the transcript job cards.
 */
export declare function JobsPanel({ jobs, onClose, onKill, onSendToChat, initialFocusId, focusRequest, variant, focused, visible, onWatchOutput }: JobsPanelProps): React.ReactNode;
//# sourceMappingURL=JobsPanel.d.ts.map