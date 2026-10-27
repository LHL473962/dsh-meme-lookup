import type { Context } from '@deepseek-ai/cordis';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'skillhub.catalog': {
            kind: 'single';
            scope: 'session-maybe';
        };
    }
}
export declare const inject: string[];
/** Register the native catalog and configuration surfaces. */
export declare function apply(ctx: Context): Promise<() => Promise<void>>;
