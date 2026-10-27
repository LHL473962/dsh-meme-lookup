import React from 'react';
/**
 * `/recap` panel (pi-recap semantics), in the picker/dialog visual
 * language: a permission-colored Pane with a title bar (会话回顾), a
 * scrollable summary body (error / summary / answering spinner), the
 * proposed session title row (apply via `a` or clicking the chip), and a
 * dim italic hint line (click to copy, same as `c`). Owns the keyboard
 * while open, mirroring BtwPanel.
 */
export declare function RecapPanel({ summary, title, error, streaming, titleApplied, onClose, onCopy, onApplyTitle, }: {
    /** The one-line recap summary (streamed raw, then replaced on settle). */
    summary: string;
    /** Proposed session title from the recap call, when the model offered one. */
    title?: string;
    /** Human-readable failure reason. */
    error?: string;
    /** True while the recap call is in flight. */
    streaming: boolean;
    /** True once the proposed title was applied via renameSession. */
    titleApplied: boolean;
    onClose: () => void;
    onCopy: () => void;
    onApplyTitle: () => void;
}): React.ReactNode;
//# sourceMappingURL=RecapPanel.d.ts.map