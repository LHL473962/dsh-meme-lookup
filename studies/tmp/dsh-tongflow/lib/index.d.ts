import "tongflow";
import { Readable } from "node:stream";
import z from "@deepseek-ai/schemastery";
import { Context } from "@deepseek-ai/cordis";
//#region ../tongflow-studio/src/config.d.ts
interface StudioConfig {
  /** Studio data root (projects, venv, plugins, data); see `resolveStudioRoot` for the default. */
  studioRoot?: string;
  /** Python ≥ 3.10 used to create the studio venv; auto-detected when empty. */
  pythonPath?: string;
  /** pip requirement installed into the studio venv (e.g. `tongflow==0.3.0` or `-e /path/to/sdk`). */
  sdkSpec: string;
  /** Git organisation official plugins are cloned from. */
  pluginOrg: string;
  /** Plugin id → git URL overrides (community / private plugins). */
  pluginGitUrls: Record<string, string>;
  /** Environment passed to every plugin process (API keys, Modal tokens). Prefer credentials over literal values. */
  env: Record<string, string>;
  /** Upper bound on simultaneously running workflows. */
  maxConcurrentRuns: number;
  /** URL prefix the studio's HTTP routes mount under. */
  httpPrefix: string;
  /** UI locale for the embedded canvas (en / zh / ja / ko). */
  locale: string;
  /** Clone every official plugin at start so the canvas offers the full catalog (shallow clones; keys / deploys only at run time). */
  autoInstallOfficial: boolean;
}
//#endregion
//#region src/config.d.ts
/** The studio's own config; `studioRoot` defaults to `<DSH_HOME>/tongflow` here. */
type Config = StudioConfig;
declare const Config: z<Config>;
//#endregion
//#region src/index.d.ts
declare const name = "dsh-tongflow";
/** The tool registry and agent registry are the hard requirements; other seams attach when they mount. */
declare const inject: string[];
declare function apply(ctx: Context, config: Config): void;
//#endregion
export { Config, type Config as TongflowConfig, apply, inject, name };