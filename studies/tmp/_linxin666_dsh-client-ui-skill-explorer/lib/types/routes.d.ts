/**
 * The /api/dsh-skill-explorer route family: list (grouped by source), read
 * (one skill's editable fields and body), set enabled (rewrites SKILL.md
 * frontmatter), set provider enabled (records a panel-local switch for a
 * plugin-provided skill, which has no writable path), create, update (rewrites
 * an existing SKILL.md in place), delete (move to .trash), import (batch-create
 * skills from a directory or a .zip archive) and health. Every route carries
 * the shared trust fence (loopback by default; a live
 * paired-device cookie is an extra allow
 * path when remote-web-ui is loaded) plus browser same-origin markers — the
 * write routes touch real skill files, so unpaired LAN clients must not reach
 * them, and read/update only touch paths a fresh scan resolves. Import is the
 * one creation surface that reads a source outside the skill roots (see
 * import.ts): it writes only new files under the chosen root and never
 * mutates an existing one.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
import { type CollectOptions } from './collect.ts';
/** Route paths (client bundle mirrors these literals; tests assert both sides). */
export declare const ROUTES: {
    readonly list: "/api/dsh-skill-explorer/list";
    readonly read: "/api/dsh-skill-explorer/read";
    readonly setEnabled: "/api/dsh-skill-explorer/set-enabled";
    readonly setProviderEnabled: "/api/dsh-skill-explorer/set-provider-enabled";
    readonly create: "/api/dsh-skill-explorer/create";
    readonly update: "/api/dsh-skill-explorer/update";
    readonly delete: "/api/dsh-skill-explorer/delete";
    readonly import: "/api/dsh-skill-explorer/import";
    readonly health: "/api/dsh-skill-explorer/health";
};
/** Route family dependencies (tests inject fakes). */
export interface SkillRoutesDeps {
    /** User dsh config root (~/.dsh). */
    dshHome: string;
    /** User agents config root (~/.agents). */
    agentsHome: string;
    /**
     * Extra custom skill roots. A resolver rather than a fixed list because the
     * host reads them off the live `skill-filesystem` loader rows, which a
     * profile reload can replace between requests.
     */
    customSkillDirs: string[] | (() => string[]);
    /** ctx.skills registry (snapshot). */
    registry: CollectOptions['registry'];
    /** Active session cwd list (project root base). */
    activeSessionCwds(): string[];
    /** Logger. */
    logger: {
        warn(error: unknown): void;
    };
}
/** Default process cwd fallback (overridable in tests). */
export declare const DEFAULT_CWD: () => string;
/**
 * Build every /api/dsh-skill-explorer route (exact paths).
 * @param ctx - host context; may expose remoteWebUiPairing.
 * @param deps - dshHome/agentsHome/registry/sessions.
 * @returns the route list for ctx.webServer.register.
 */
export declare function makeRoutes(ctx: Context, deps: SkillRoutesDeps): WebRoute[];
