/**
 * Agent-preset resolution across upstream prerelease lines.
 *
 * Legacy rc.2 exports `resolveSessionPreset` and ships `code`; the 0.1.2 line
 * replaces the helper with a projection definition and renames that preset to `ptc`.
 * Keeping both compatibility decisions here prevents composition and channel
 * code from acquiring prerelease-specific branches.
 */
import type { Context } from '@deepseek-ai/cordis';
/** One roster entry, as returned by `agentPresets.list()`/`resolve()`. */
export interface AgentPresetInfo {
    readonly id: string;
    readonly trust: 'system' | 'user';
    readonly name?: string;
    readonly description?: string;
    /** Present when the preset cannot compose a session (human-readable). */
    readonly broken?: string;
}
/** The `ctx.agentPresets` service surface dsh-tui consumes. */
export interface AgentPresetsLike {
    readonly defaultId: string;
    list(): Promise<readonly AgentPresetInfo[]>;
    resolve(id?: string): Promise<AgentPresetInfo>;
    mount(agentCtx: Context, id?: string): Promise<AgentPresetInfo>;
    recompose(agentCtx: Context, id: string): Promise<AgentPresetInfo>;
    /** Read one service from the agent's own scope chain (preset realms). */
    serviceFor?(agent: {
        ctx: Context;
    }, key: string): unknown;
}
/** The mounted preset roster, or undefined in a rosterless composition. */
export declare function rosterOf(ctx: Context): AgentPresetsLike | undefined;
/** Resolve the durable preset projection: newest selection wins over header. */
export declare function resolveRecordedPreset(session: {
    header: {
        agentPreset?: string;
    };
    events: readonly {
        type: string;
        data: unknown;
    }[];
}): string | undefined;
/**
 * Resolve an exact roster id first, then bridge the official rename in either
 * direction. A successful list is required before aliasing so roster I/O or
 * a broken exact preset can never be mistaken for an unknown id.
 */
export declare function resolveCompatiblePreset(presets: AgentPresetsLike, requested?: string): Promise<AgentPresetInfo>;
/**
 * The i18n dictionary id a roster preset's localized display text resolves
 * under. The 0.1.2 line renamed the official PTC preset `code` → `ptc`, but
 * the dictionary keys still use the legacy `code` id (`preset-name-code` /
 * `preset-desc-code`), so the `/preset` picker's display lookup must bridge
 * the roster id back. User-authored ids pass through untouched.
 */
export declare function presetDisplayId(id: string): string;
//# sourceMappingURL=preset-resolution.d.ts.map