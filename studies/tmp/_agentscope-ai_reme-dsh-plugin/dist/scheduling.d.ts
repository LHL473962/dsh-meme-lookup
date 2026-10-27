import type { ReMeMessage } from "./reme/types.js";
/** Check the daily cron syntax without searching for its next occurrence. */
export declare function validateDailyCron(cron: string): void;
/** Resolve the next occurrence of ReMe's deliberately narrow daily cron form. */
export declare function nextDailyRun(cron: string, timezone: string, now?: Date): Date;
/** Return the latest message date in the ReMe workspace timezone. */
export declare function messagesDay(messages: ReadonlyArray<Pick<ReMeMessage, "created_at">>, timezone: string): string;
/** Format an instant as a workspace-local calendar date. */
export declare function dateInTimezone(date: Date, timezone: string): string;
/** Validate an IANA timezone without maintaining a second timezone catalog. */
export declare function validTimezone(value: unknown): value is string;
//# sourceMappingURL=scheduling.d.ts.map