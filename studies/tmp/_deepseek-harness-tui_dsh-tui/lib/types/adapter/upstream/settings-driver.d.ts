/**
 * Upstream driver for the TUI settings-section capability.
 *
 * Settings sections are a register-class host extension. The driver performs
 * a reversible probe through the host-only settings facade: register a
 * uniquely named temporary section, list it, dispose it, then prove the same
 * namespace can be registered again (no residue).
 *
 * Publication is feature-level: register/list/section are live after the
 * reversible no-residue probe; subscribe stays degraded in P3 because the
 * probe does not own a real subscriber lifecycle.
 */
import type { CapabilityLifecycle } from '../kernel/lifecycle.js';
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
import { type TuiSettingsSectionsHost } from '../../dsh-adapter/settings-sections.js';
export declare function detectSettingsCapability(ctx: unknown): Detection;
export declare function verifySettingsLiveForHost(host: TuiSettingsSectionsHost | undefined): Promise<CapabilityLifecycle[]>;
export declare const settingsDriver: UpstreamDriver;
//# sourceMappingURL=settings-driver.d.ts.map