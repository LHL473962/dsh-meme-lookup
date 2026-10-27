/**
 * Browser-half entry for the dsh-skill-explorer plugin — runs inside the dsh web GUI.
 *
 * Registers the skill-explorer locale dictionaries and mounts the panel as a
 * native center-column page: a row in the shell's own sidebar panel list and a
 * keyed `main` page, both through the official slot seats. Failure policy:
 * registration problems are logged, never thrown — the web shell fails the
 * whole boot when a plugin apply throws, and an external plugin must not take
 * the GUI down.
 *
 * Export discipline (packages/client rule): the /client surface carries what
 * cordis loading needs plus types only — all value exports stay internal.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type SkillExplorerKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** skill-explorer surface copy. */
        'dsh-skill-explorer': SkillExplorerKey;
    }
}
/** Required services (fiber inject waiting — the runtime must be up first). */
export declare const inject: string[];
/** Type-only surface (export discipline: no value exports beyond the plugin contract). */
export type { SkillPanelProps } from './panel/SkillPanel.tsx';
export type { SkillExplorerKey } from './locales.ts';
export type { SkillApi } from './api.ts';
/**
 * Mount the skill center surfaces.
 * @param ctx - client root context (locale service).
 */
export declare function apply(ctx: ClientContext): void;
