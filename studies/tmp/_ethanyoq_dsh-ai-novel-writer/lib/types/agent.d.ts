/** Agent-scoped novel tools and their native approval policy. */
import type { Context } from '@deepseek-ai/cordis';
import type { PreToolDecision, ToolDefinition } from '@deepseek-ai/dsh-tools';
import z from '@deepseek-ai/schemastery';
import type { NovelApplyRequest } from './types.ts';
/** Deployment bounds for the model-facing novel tools. */
export interface Config {
    readonly assetBytes?: number;
    readonly workingSetBytes?: number;
    readonly queryMatches?: number;
}
/** Fail-loud validation and defaults for deployment-varying tool bounds. */
export declare const Config: z<Config>;
/**
 * Render one proposed mutation as a deterministic Harness diff card.
 *
 * @param request Initialization or one-asset replacement proposed by the model.
 * @returns A presentation containing the affected project-relative location and complete final text.
 */
export declare function presentNovelChange(request: NovelApplyRequest): {
    card: "diff";
    title: string;
    diffs: {
        path: string;
        oldText: null;
        newText: string;
    }[];
    locations: {
        path: string;
    }[];
};
/**
 * Require native approval for the mutation tool and delegate every other tool decision.
 *
 * @param exec Tool execution identity.
 * @param next Remaining scoped approval listeners.
 * @returns An approval request for `novel_apply_change`, otherwise the delegated decision.
 */
export declare function novelApprovalGate(exec: Pick<{
    name: string;
}, 'name'>, next: () => Promise<PreToolDecision>): Promise<PreToolDecision>;
/**
 * Construct the two model-visible novel tool definitions.
 *
 * @param config Deployment-specific read, write, working-set, and query limits.
 * @returns The read tool followed by the approval-gated single-asset mutation tool.
 */
export declare function createNovelToolDefinitions(config?: Config): readonly [ToolDefinition, ToolDefinition];
/** Stable Cordis plugin name. */
export declare const name = "dsh-ai-novel-writer-agent";
/** Required host services for agent lookup, scoped tools, prompt projection, and policy. */
export declare const inject: string[];
/**
 * Register the two domain tools and their mandatory one-shot approval policy.
 *
 * @param ctx Agent preset scope that owns registrations and lifecycle cleanup.
 * @param config Deployment-specific read, write, working-set, and query limits.
 * @returns Nothing.
 */
export declare function apply(ctx: Context, config?: Config): void;
