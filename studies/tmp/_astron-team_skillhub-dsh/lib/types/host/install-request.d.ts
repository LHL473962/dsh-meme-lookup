import { z } from 'zod';
export declare const installRequest: z.ZodObject<{
    detailToken: z.ZodString;
    targetToken: z.ZodString;
    requestKey: z.ZodUUID;
    hostInstanceId: z.ZodUUID;
    mode: z.ZodEnum<{
        new: "new";
        retry: "retry";
    }>;
    initiatedFrom: z.ZodEnum<{
        plaza: "plaza";
        conversation: "conversation";
    }>;
}, z.core.$strict>;
export declare const operationQuery: z.ZodObject<{
    operationId: z.ZodUUID;
    hostInstanceId: z.ZodUUID;
}, z.core.$strict>;
export declare const executePlanRequest: z.ZodObject<{
    planId: z.ZodUUID;
    requestKey: z.ZodUUID;
}, z.core.$strict>;
