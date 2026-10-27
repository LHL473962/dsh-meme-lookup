/**
 * Upstream drivers for the TUI extension seams.
 *
 * Each driver is a per-capability adapter over a legacy host-only facade:
 * status, shortcuts, renderers, themes, toast, and command trees. All
 * register/subscribe probes use a unique temporary id, verify visibility,
 * dispose, then prove the same id is again available (no residue). Read-only
 * drivers only issue host-internal reads.
 */
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
export declare function detectStatusCapability(ctx: unknown): Detection;
export declare function detectShortcutsCapability(ctx: unknown): Detection;
export declare function detectRenderersCapability(ctx: unknown): Detection;
export declare function detectThemesCapability(ctx: unknown): Detection;
export declare function detectToastCapability(ctx: unknown): Detection;
export declare function detectCommandTreesCapability(ctx: unknown): Detection;
export declare const statusDriver: UpstreamDriver;
export declare const shortcutsDriver: UpstreamDriver;
export declare const renderersDriver: UpstreamDriver;
export declare const themesDriver: UpstreamDriver;
export declare const toastDriver: UpstreamDriver;
export declare const commandTreesDriver: UpstreamDriver;
//# sourceMappingURL=extensions-driver.d.ts.map