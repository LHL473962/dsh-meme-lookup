import { PointerEvent, type PointerEventInit } from './pointer-event.js';
/**
 * Mouse click event. Fired on left-button release without drag, only when
 * mouse tracking is enabled (i.e. inside <AlternateScreen>).
 *
 * Bubbles from the deepest hit node up through parentNode. Call
 * stopImmediatePropagation() to prevent ancestors' onClick from firing.
 *
 * Extends PointerEvent: `shift`/`alt`/`ctrl` expose the modifiers the
 * terminal reported on the release, and `localCol`/`localRow` are recomputed
 * per handler so containers see coordinates relative to themselves.
 */
export declare class ClickEvent extends PointerEvent {
    /**
     * True if the clicked cell has no visible content (unwritten in the
     * screen buffer — both packed words are 0). Handlers can check this to
     * ignore clicks on blank space to the right of text, so accidental
     * clicks on empty terminal space don't toggle state.
     */
    readonly cellIsBlank: boolean;
    constructor(col: number, row: number, cellIsBlank: boolean, init?: PointerEventInit);
}
//# sourceMappingURL=click-event.d.ts.map