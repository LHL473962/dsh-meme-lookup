import React from 'react';
import { type ActivityLineValue } from '../components/ActivityLine.js';
import type { TuiStatusFieldEntry } from '../dsh-adapter/status.js';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
/** 同上：partial channel 字面量可能早于 mainCost/subagentCost 字段（R4 兼容）。 */
/** A reported session cost: `$0.0123` for USD (sub-dollar keeps 4 places,
 *  a session often costs cents), `12.34 EUR` for any other currency. */
export declare function formatCostReport(report: {
    readonly currency: string;
    readonly amount: number;
}): string;
import type { WaveBand } from '../dsh-adapter/types.js';
export declare function StatusLine({ channel, selectionActive, helpOpen, backendMode, modelPicker, effortPicker, wake, activity: projectedActivity, pluginFields, }: {
    channel: Channel;
    selectionActive?: boolean;
    helpOpen?: boolean;
    /** Plugin footer fields (`tuiStatus.setField`), already normalized by the
     *  adapter. They join the existing left/right groups in three slots —
     *  `left-tail` (left group's end), `right-head` (right group's start), and
     *  `right-tail` (the row's right edge). Absent/empty renders exactly the
     *  footer this seam found: no extra Box, no gap, no flex change. */
    pluginFields?: readonly TuiStatusFieldEntry[];
    /** The backend's OWN permission mode (the typed `modes` capability):
     *  `id` is the backend mode id (default / acceptEdits / plan /
     *  bypassPermissions / dontAsk / auto …), `name` the label the backend
     *  gives it, `onOpen` opens the same /permission picker the command does.
     *  Present: the mode segment always shows — the base mode included, the
     *  user asked to SEE the current permission level — and both its colour
     *  and its text come from the backend, never from the DSH mode atoms.
     *  It also ignores the `statusBar.mode` field switch (see the gate
     *  below: a safety readout outranks a decoration preference); the minimal
     *  UI is the only thing it yields to. Absent (DSH, or a backend without
     *  modes): rendering stays byte-identical to the modeMarked rule below. */
    backendMode?: {
        readonly id: string;
        readonly name: string;
        readonly onOpen: () => void;
    };
    /** The model segment's click target: the same /model picker the command
     *  opens. Present only when the backend serves a model catalog
     *  (backendCapabilities.models — DSH and the Claude backend both do);
     *  absent = the segment renders exactly as before, and its hover detail
     *  keeps the pure route readout without the click affordance line. */
    modelPicker?: {
        readonly onOpen: () => void;
    };
    /** Same contract for the think-level segment and /effort: present only
     *  when the backend serves the effort capability. The hover id rides
     *  with it — the segment's whole detail line IS the affordance. */
    effortPicker?: {
        readonly onOpen: () => void;
    };
    /** Activity value published by the working-activity plugin for this session.
     *  Preferred over the channel's own copy when the composition provides it. */
    activity?: ActivityLineValue;
    /**
     * The session projected onto the status line's few columns, plus the
     * self-retiring key hint. The mounted MiniWake owns its animation clock.
     *
     * A strip that shows the session's shape keeps earning its space in a way a
     * static label cannot, and it carries the failure signal in position rather
     * than as a count in the corner. Absent in headless embeds, where nothing
     * folds the event log.
     */
    wake?: {
        band: WaveBand;
        hint?: string;
        /** Click target for the strip: opens the trajectory scene. */
        onOpen?: () => void;
        /** Chord revealed while the pointer rests on the strip. */
        hoverHint?: string;
    };
}): React.JSX.Element;
type UsageSnapshot = {
    input: number;
    cacheRead: number;
    cacheWrite: number;
    /** Sampling wall-clock (the producing message's event time). */
    at: number;
};
/** Return the prompt-cache hit rate, or nothing when usage is unavailable. */
export declare function formatCacheHitRate(usage: UsageSnapshot | undefined): string | undefined;
/**
 * The prompt footer's live IDE-selection badge (T-FIX-02), mirroring Claude
 * Code's `⧉ N lines selected`: English only (like every other footer field),
 * singular/plural aware, line count from the snapshot's 0-based inclusive
 * range. `undefined` (no IDE yet / cleared by an isEmpty notification)
 * renders no field at all — a manually launched session never shows a
 * placeholder. Exported for scripts/verify-ide-channel.tsx.
 */
export declare function formatSelectionBadge(selection: {
    startLine: number;
    endLine: number;
    isEmpty?: boolean;
} | undefined): string | undefined;
export {};
//# sourceMappingURL=StatusLine.d.ts.map