import type { Context } from '@deepseek-ai/cordis';
import { z } from 'zod';
import type { ConversationSearchContext } from './search-tool.js';
export declare const MANAGEMENT_TOOLS: {
    readonly availability: "astron_skillhub_check_availability";
    readonly list: "astron_skillhub_list_installed";
    readonly check: "astron_skillhub_check_update";
    readonly upgrade: "astron_skillhub_upgrade";
    readonly uninstall: "astron_skillhub_uninstall";
    readonly operation: "astron_skillhub_operation";
};
export type ManagementAction = keyof typeof MANAGEMENT_TOOLS;
export declare const managementRequests: {
    availability: z.ZodUnion<readonly [z.ZodObject<{
        sourceRevision: z.ZodString;
        itemKey: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strict>]>;
    list: z.ZodObject<{}, z.core.$strict>;
    check: z.ZodObject<{
        sourceRevision: z.ZodString;
        itemKey: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    upgrade: z.ZodObject<{
        sourceRevision: z.ZodString;
        itemKey: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    uninstall: z.ZodObject<{
        sourceRevision: z.ZodString;
        itemKey: z.ZodString;
    }, z.core.$strict>;
    operation: z.ZodObject<{
        operationId: z.ZodUUID;
        hostInstanceId: z.ZodUUID;
    }, z.core.$strict>;
};
export type ManagementRequest = {
    name?: string;
    sourceRevision?: string;
    itemKey?: string;
    version?: string;
    operationId?: string;
    hostInstanceId?: string;
};
export declare function registerManagementTools(tools: Pick<Context['tools'], 'get' | 'register'>, run: (action: ManagementAction, input: ManagementRequest, context: ConversationSearchContext, signal: AbortSignal) => Promise<object>): () => void;
