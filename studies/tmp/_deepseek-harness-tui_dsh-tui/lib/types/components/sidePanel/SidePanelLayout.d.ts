/**
 * SidePanelLayout: owns the two-column row — chat surface left, divider,
 * side-panel surface right (design doc §4.1). useSidePanel owns the width
 * state; this component arranges boxes, re-provides contexts, and forwards
 * divider drags as chat-column widths in cells.
 *
 * What each column subtree gets (the PageMargin trick, one level down):
 * - TerminalSizeContext narrowed to the column width, so every existing
 *   component that reads useTerminalSize() (MessageList, PromptInput,
 *   tool cards, Markdown tables…) automatically lays out for the column;
 * - SurfaceEdgesContext re-provided per column: chat bleeds left into the
 *   page margin but stops at the divider, the panel bleeds right;
 * - a numeric-width box with overflow="hidden" (never "%": ink resolves
 *   percentages against the padding-inclusive parent).
 *
 * PageInsetContext is deliberately NOT overridden: the chat column's
 * origin is still the content-area origin, so screen-coordinate overlays
 * (tooltips) keep their math.
 *
 * STRUCTURAL STABILITY (2026-10-02 crash fix). The collapsed state used to
 * render bare `children`, which made split↔collapsed a tree-SHAPE change:
 * React unmounted the whole chat column and mounted a fresh one on every
 * Ctrl+B / editor-open / resize-across-the-threshold. That cost more than
 * a repaint — the deletion commit ran ScrollBox's useImperativeHandle
 * cleanup, whose ref is Chat's `setHandle` state setter, so the detached
 * ref scheduled a state update INSIDE a commit; combined with the
 * fullscreen editor publishing its node from an insertion effect (a store
 * notification that renders synchronously inside the same commit) the
 * nested-update counter ratcheted past React's limit and the process died
 * with Minified React error #185. Keeping the chat column at a stable tree
 * position turns every geometry change into a prop update, so nothing is
 * deleted, no ref detaches mid-commit, and chat-side state (scroll
 * position, draft, transcript measure cache) survives the toggle.
 *
 * While collapsed the wrappers are invisible by construction: the contexts
 * re-provide the PARENT's own values (referentially identical), the chat
 * box gets no width / no overflow / no click handler, and the outer row
 * does not clip — so the collapsed frame stays byte-identical to the
 * no-layout render (locked by verify-side-panel-layout).
 */
import React from 'react';
import type { SidePanelFocus } from './useSidePanel.js';
import type { SidePanelSplit } from './dimensions.js';
export interface SidePanelLayoutProps {
    readonly geometry: SidePanelSplit | null;
    readonly focus: SidePanelFocus;
    /** Right-column content (PanelBar + PanelHost + hint). */
    readonly side: React.ReactNode;
    readonly onActivateChat?: () => void;
    readonly onActivatePanel?: () => void;
    /** Resize the chat column in cells; the controller clamps both columns. */
    readonly onResize?: (chatColumns: number) => void;
    readonly children: React.ReactNode;
}
export declare function SidePanelLayout({ geometry, focus, side, onActivateChat, onActivatePanel, onResize, children, }: SidePanelLayoutProps): React.ReactNode;
//# sourceMappingURL=SidePanelLayout.d.ts.map