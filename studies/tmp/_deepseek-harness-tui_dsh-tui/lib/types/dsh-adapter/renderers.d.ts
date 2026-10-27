/**
 * Custom session-entry renderers — pi's `pi.registerMessageRenderer`. A
 * plugin that appends its own log-only session events (`session.append(
 * 'my-plugin/event', payload)`) registers a renderer mapping the payload to
 * plain TEXT rows; the channel then projects those events into the
 * transcript on the live stream and on replay (resume/rewind), exactly like
 * its built-in projection of `activity/status` or `agent-preset/selected`.
 *
 * Renderers are text-only by design: the full-React surface is the scenes
 * seam (`ctx.tuiScenes`, with the host-React contract); transcript rows are
 * shared with replay paths where a crash mid-replay would corrupt the whole
 * screen, so a renderer never receives React and its output is sanitized
 * (control chars stripped, lines preview-clipped like `pushLocal` output).
 *
 * Registration rules (untrusted-input discipline):
 *
 * - The type must look like `plugin/event` (kebab, one slash) — this is the
 *   same shape the session-log strict registry expects plugins to register.
 * - Core vocabulary is off-limits: a renderer can never shadow a built-in
 *   event type's projection (locals win, same as commands).
 * - A renderer that throws is skipped for THAT event and logged once per
 *   type — replay must survive a buggy plugin.
 */
import { Context, Service } from '@deepseek-ai/cordis';
/** What a renderer returns: an optional title row plus body lines. */
export interface TuiEntryRenderResult {
    /** Short heading (rendered as a notice row); omit for a body-only entry. */
    title?: string;
    /** Body rows, oldest-to-newest reading order. */
    lines: readonly string[];
}
export type TuiEntryRenderer = (payload: unknown) => TuiEntryRenderResult | undefined;
/** Host-only transcript projection path. Plugins can register a renderer but
 * cannot invoke an arbitrary registered renderer on demand. */
export interface TuiRendererHost {
    register(type: string, renderer: TuiEntryRenderer): () => void;
    render(type: string, payload: unknown): TuiEntryRenderResult | undefined;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiRenderers: TuiRendererRuntime;
    }
}
/** `ctx.tuiRenderers` — custom session-entry text renderers. */
export declare class TuiRendererRuntime extends Service {
    constructor(ctx: Context);
    /**
     * Map a log-only session event type to transcript rows. Returns the
     * dispose function (caller scopes it with `ctx.effect`, same contract as
     * `tuiScenes`). Refusals warn instead of throwing. The optional trailing
     * `identity` (the plugin's own ctx) only feeds the effect ledger's
     * pluginId — omitting it records `undeclared` (C-060).
     */
    register(type: string, renderer: TuiEntryRenderer, identity?: Context): () => void;
}
export declare function getHostRenderers(runtime: TuiRendererRuntime | undefined): TuiRendererHost | undefined;
export default TuiRendererRuntime;
//# sourceMappingURL=renderers.d.ts.map