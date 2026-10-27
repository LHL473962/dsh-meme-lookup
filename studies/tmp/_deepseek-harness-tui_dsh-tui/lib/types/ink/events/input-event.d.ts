import { type ParsedKey } from '../parse-keypress.js';
import { Event } from './event.js';
/**
 * Boolean flags describing which named keys (arrows, modifiers, home/end,
 * etc.) a parsed keypress reports as pressed.
 */
export type Key = {
    upArrow: boolean;
    downArrow: boolean;
    leftArrow: boolean;
    rightArrow: boolean;
    pageDown: boolean;
    pageUp: boolean;
    wheelUp: boolean;
    wheelDown: boolean;
    wheelLeft: boolean;
    wheelRight: boolean;
    home: boolean;
    end: boolean;
    return: boolean;
    escape: boolean;
    ctrl: boolean;
    shift: boolean;
    fn: boolean;
    tab: boolean;
    backspace: boolean;
    delete: boolean;
    meta: boolean;
    super: boolean;
    /**
     * Pointer column (0-indexed) when the key is a wheel event — the SGR/X10
     * sequence carries the position. Undefined for non-wheel keys.
     */
    mouseCol?: number;
    /** Pointer row (0-indexed) when the key is a wheel event. See mouseCol. */
    mouseRow?: number;
    /**
     * True when this input arrived as a bracketed paste (terminal paste —
     * Ctrl+Shift+V / right-click / a terminal that intercepts Ctrl+V) rather
     * than typed characters. Mirrors `InputEvent.isPasted` so modal handlers
     * can treat a paste chunk as text without reaching for the third callback
     * argument: pasted content — even a chunk that is all line breaks — is
     * never an Enter/submit press. Optional so hand-built key literals (tests,
     * synthetic dispatches) keep compiling; the live pipeline always sets it.
     */
    isPasted?: boolean;
};
/**
 * Event fired for each input chunk received from stdin (a typed character or
 * a paste), carrying the parsed key flags and the text it produced.
 */
export declare class InputEvent extends Event {
    /**
     * The raw parsed keypress this event was built from.
     */
    readonly keypress: ParsedKey;
    /**
     * Named-key flags describing which keys the keypress reports as pressed.
     */
    readonly key: Key;
    /**
     * The text input produced by this keypress ('' for non-printing keys).
     */
    readonly input: string;
    /** True when this input arrived as a bracketed paste (terminal paste —
     *  Ctrl+Shift+V / right-click) rather than typed characters. Handlers use
     *  this to insert paste content verbatim instead of treating newlines as
     *  Enter/submit. */
    readonly isPasted: boolean;
    constructor(keypress: ParsedKey);
}
//# sourceMappingURL=input-event.d.ts.map