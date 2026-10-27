import React, { type PropsWithChildren, type Ref } from 'react';
import type { DOMElement } from '../../ink/dom.js';
import type { ClickEvent } from '../../ink/events/click-event.js';
import type { ContextMenuEvent } from '../../ink/events/context-menu-event.js';
import type { DragEvent } from '../../ink/events/drag-event.js';
import type { FocusEvent } from '../../ink/events/focus-event.js';
import type { KeyboardEvent } from '../../ink/events/keyboard-event.js';
import type { PointerEvent } from '../../ink/events/pointer-event.js';
import type { WheelEvent } from '../../ink/events/wheel-event.js';
import type { Color, Styles } from '../../ink/styles.js';
import { type Theme } from '../../theme.js';
type ThemedColorProps = {
    readonly borderColor?: keyof Theme | Color;
    readonly borderTopColor?: keyof Theme | Color;
    readonly borderBottomColor?: keyof Theme | Color;
    readonly borderLeftColor?: keyof Theme | Color;
    readonly borderRightColor?: keyof Theme | Color;
    readonly backgroundColor?: keyof Theme | Color;
    /** 条件表面色：仅当终端图像落在本 Box 后方时才涂底（见 ink Styles）。 */
    readonly occlusionColor?: keyof Theme | Color;
};
type BaseStylesWithoutColors = Omit<Styles, 'textWrap' | 'borderColor' | 'borderTopColor' | 'borderBottomColor' | 'borderLeftColor' | 'borderRightColor' | 'backgroundColor' | 'occlusionColor'>;
export type Props = BaseStylesWithoutColors & ThemedColorProps & {
    ref?: Ref<DOMElement>;
    tabIndex?: number;
    autoFocus?: boolean;
    onClick?: (event: ClickEvent) => void;
    onContextMenu?: (event: ContextMenuEvent) => void;
    /**
     * Drag protocol handlers, transparently forwarded to the inner Box.
     * Only inside `<AlternateScreen>`, left button, no modifier at press;
     * `dragstart` fires on FIRST movement (not press); a press+release
     * without movement still triggers `onClick`. See Box's JSDoc.
     */
    onDragStart?: (event: DragEvent) => void;
    /** Fired on each pointer motion after dragstart. See onDragStart. */
    onDragMove?: (event: DragEvent) => void;
    /** Fired on release after dragstart. See onDragStart. */
    onDragEnd?: (event: DragEvent) => void;
    onFocus?: (event: FocusEvent) => void;
    onFocusCapture?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
    onBlurCapture?: (event: FocusEvent) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    onKeyDownCapture?: (event: KeyboardEvent) => void;
    onMouseEnter?: (event: PointerEvent) => void;
    onMouseLeave?: (event: PointerEvent) => void;
    /**
     * Wheel events over this Box's rendered rect (position-routed; see the
     * ink Box's onWheel JSDoc). Transparently forwarded.
     */
    onWheel?: (event: WheelEvent) => void;
};
/**
 * Theme-aware Box component that resolves theme color keys to raw colors
 * in the dsh-TUI visual language.
 */
declare function ThemedBox({ borderColor, borderTopColor, borderBottomColor, borderLeftColor, borderRightColor, backgroundColor, occlusionColor, ...rest }: PropsWithChildren<Props>): React.ReactNode;
export default ThemedBox;
//# sourceMappingURL=ThemedBox.d.ts.map