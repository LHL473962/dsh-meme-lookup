import { type HookSpeechCategory } from "@open-pets/agent-events";
import { type OpenPetsClient, type OpenPetsReaction } from "@open-pets/client";
import type { Context } from "@deepseek-ai/cordis";
export type DshEventName = "agent/status" | "agent/error" | "approval/request" | "agent/assistant-stream" | "tools/result";
export type DshAgentStatus = "running" | "idle";
export interface DshEventDecision {
    readonly reaction: OpenPetsReaction;
    readonly speechCategory: HookSpeechCategory;
}
export interface OpenPetsDshOptions {
    /** Master toggle to enable or disable OpenPets integration. Default: true. */
    readonly enabled?: boolean;
    readonly clientFactory?: () => OpenPetsClient;
    readonly schedule?: (work: () => Promise<void>) => void | Promise<void>;
    readonly random?: () => number;
    readonly now?: () => number;
    /** Minimum time between speech messages in milliseconds. Default: 1200. */
    readonly minSpeechIntervalMs?: number;
    /** Forward ⏵ status lines from assistant stream. Default: true. */
    readonly enableStatusLineStream?: boolean;
    /** Forward tool events. Default: true. */
    readonly enableToolEvents?: boolean;
    /** Announce when an approval request is waiting. Default: true. */
    readonly enableApprovalEvents?: boolean;
}
export interface OpenPetsDshRuntime {
    readonly handleStatus: (event: unknown) => void;
    readonly handleEvent: (eventName: DshEventName, event?: unknown) => void;
    readonly handleApproval: () => void;
    readonly handleStream: (payload: unknown) => void;
    readonly handleToolResult: (exec: unknown, result?: unknown) => void;
}
export type DshCordisApi = Pick<Context, "on">;
export declare function sanitizeStatusLine(text: string): string | null;
/**
 * Map only the categorical values defined by DSH. Event payloads are
 * deliberately not inspected or forwarded. For agent/status, only the
 * categorical `status` property is read from the event envelope.
 */
export declare function classifyDshEvent(eventName: DshEventName | string, event?: unknown): DshEventDecision | undefined;
export declare function createOpenPetsDshRuntime(options?: OpenPetsDshOptions): OpenPetsDshRuntime;
export declare function createOpenPetsDshClient(): OpenPetsClient;
/** Register the DSH listeners without taking ownership of their flow. */
export declare function registerDshListeners(cordis: DshCordisApi, options?: OpenPetsDshOptions): OpenPetsDshRuntime;
//# sourceMappingURL=runtime.d.ts.map