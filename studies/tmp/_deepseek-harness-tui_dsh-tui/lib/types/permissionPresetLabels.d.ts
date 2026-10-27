/**
 * Display text for permission preset roster entries. The three stock presets
 * and DSH's experimental `auto` preset are localized here; the registry hands
 * `auto` out under its bare reserved name with no description, so the TUI
 * owns its label the same way it owns the stock ones. Every other preset keeps
 * the registry's own name/description. Backend-neutral: i18n only.
 */
import { type I18nKey } from './i18n.js';
/** DSH's reserved, session-only experimental preset (dsh-experimental-auto-review). */
export declare const PERMISSION_PRESET_AUTO = "auto";
interface PresetOptionLike {
    readonly value: string;
    readonly name: string;
    readonly description?: string;
}
/** The i18n keys for one option, or undefined when the registry's text stands.
 *  `auto` is localized only while the registry still names it bare. */
export declare function permissionPresetKeys(option: PresetOptionLike): {
    label: I18nKey;
    description: I18nKey;
} | undefined;
export declare function permissionPresetLabel(option: PresetOptionLike): string;
export declare function permissionPresetDescription(option: PresetOptionLike): string;
export {};
//# sourceMappingURL=permissionPresetLabels.d.ts.map