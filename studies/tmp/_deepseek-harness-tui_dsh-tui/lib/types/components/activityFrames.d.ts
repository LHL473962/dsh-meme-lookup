/**
 * Working-activity indicator presets — thin re-export of the single source
 * of truth in the `dsh-working-activity` package (`src/frames.ts`). The TUI
 * keeps this shim so existing importers (`/activity` picker, status line,
 * channel, activity prefs) resolve the same names without moving; all preset
 * data (the pi-extension union, 35 presets) lives upstream.
 * @module dsh-tui/components/activityFrames
 */
import { type FramePreset } from 'dsh-working-activity/frames';
export type { FramePreset };
export declare const DEFAULT_PRESET = "moon8";
/**
 * Read compatibility for saved preferences; the picker only offers current
 * names. `claude` is a pre-rename preset id (kept upstream by
 * dsh-working-activity for its own history): saved choices normalize to the
 * moon8 default instead of rendering the retired brand preset.
 */
export declare function normalizeActivityPreset(name: string | undefined): string | undefined;
export declare const FRAME_PRESETS: Record<string, FramePreset>;
export declare const PRESET_NAMES: readonly string[];
export declare function isPresetName(name: string): boolean;
export declare function resolvePreset(name: string | undefined): FramePreset;
//# sourceMappingURL=activityFrames.d.ts.map