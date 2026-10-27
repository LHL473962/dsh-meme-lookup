import type { TuiSettingsSection } from '../adapter/ports/channel-settings.js';
export type { TuiSettingsSection, TuiSettingsPage, TuiSettingsGroup, TuiSettingsField, TuiSettingsFieldKind, TuiSettingsFieldOption, TuiSettingsFieldWrite } from '../adapter/ports/channel-settings.js';
/**
 * Plugin settings-section extension seam for terminal front doors.
 *
 * The TUI owns the settings screen: rendering, staged editing, and the
 * revision-fenced `settings.mutate` writes. Optional plugins declare WHAT is
 * editable — a section over their settings namespace — without coupling the
 * TUI to them, mirroring the web front door's `settings.plugin.item` slot
 * (plugins ship cards; the host ships the chrome). Storage, validation and
 * layering stay with the dsh settings service; this registry is display
 * metadata only.
 */
import { Context, Service } from '@deepseek-ai/cordis';
/** Host-only settings-section controls used by the TUI bootstrap/channel. */
export interface TuiSettingsSectionsHost {
    register(section: TuiSettingsSection): () => void;
    list(): readonly TuiSettingsSection[];
    section(ns: string): TuiSettingsSection | undefined;
    subscribe(listener: () => void): () => void;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiSettingsSections: TuiSettingsSectionsRuntime;
    }
}
export declare const name = "dsh-tui-settings-sections";
/**
 * Small host-only registry; settings storage and validation remain owned by
 * the dsh settings service (`ctx.settings`).
 */
export declare class TuiSettingsSectionsRuntime extends Service {
    constructor(ctx: Context);
    register(section: TuiSettingsSection): () => void;
    /** Registered sections in registration order. */
    list(): readonly TuiSettingsSection[];
    /** The section registered for a namespace, if any. */
    section(ns: string): TuiSettingsSection | undefined;
    /**
     * Subscribe to register/unregister events so an open settings screen can
     * re-read the section list (a plugin (un)loading mid-session changes it).
     */
    subscribe(listener: () => void): () => void;
}
export declare function getHostSettingsSections(runtime: TuiSettingsSectionsRuntime | undefined): TuiSettingsSectionsHost | undefined;
export declare function getLocalSettingsSectionsHost(ctx?: Context): TuiSettingsSectionsHost;
/**
 * Register a host-owned section in whichever registry `/settings` reads, and
 * keep it there while the composition's `tuiSettingsSections` service comes
 * and goes.
 *
 * The channel prefers the service whenever it exists, while a registration
 * made before the service row activated lands in the in-package fallback —
 * profile rows activate concurrently (`EntryGroup.update` awaits all of
 * them), so "the service exists" is not a boot-order guarantee. A reloaded
 * service row also starts from an empty registry, stranding sections
 * registered in the previous instance. Either transition would leave the
 * section in the registry the screen no longer reads: it disappears from
 * /settings while other sections keep rendering. Both announce themselves
 * through `internal/service`; the replacement registration is taken before
 * the old one is released, so a failed move leaves the section where it was.
 */
export declare function trackHostSettingsSection(ctx: Context, section: TuiSettingsSection): () => void;
export default TuiSettingsSectionsRuntime;
//# sourceMappingURL=settings-sections.d.ts.map