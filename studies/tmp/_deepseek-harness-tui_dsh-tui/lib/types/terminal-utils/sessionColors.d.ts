/**
 * Session accent colors for `/color`: a small
 * named palette that overrides the prompt-input border (and its session
 * label chip) for ONE session, so side-by-side sessions can be told apart
 * at a glance. The name is persisted per session via a `session/color`
 * log event (channel.ts); these hex values are what the name resolves to
 * at render time.
 *
 * Values are mid-tone hues from the Radix accent family,
 * chosen to stay readable as a border/accent
 * on both light and dark terminals.
 */
/** Named session accent colors: name → hex. */
export declare const SESSION_COLORS: Readonly<Record<string, `#${string}`>>;
/** The accepted `/color <name>` names, in display order. */
export declare const SESSION_COLOR_NAMES: readonly string[];
/**
 * Whether `name` is a known session accent color (used by both the
 * command dispatch and the render-time resolution).
 */
export declare function isValidSessionColor(name: string): boolean;
/**
 * Resolve a session color name to its hex value, or undefined when the
 * name is unknown/empty (caller keeps the theme default).
 */
export declare function sessionColorHex(name: string): `#${string}` | undefined;
//# sourceMappingURL=sessionColors.d.ts.map