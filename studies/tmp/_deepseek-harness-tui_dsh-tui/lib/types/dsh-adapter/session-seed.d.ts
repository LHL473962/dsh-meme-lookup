/** Whether an inherited cut contains no human message or started turn. */
export declare function holdsNoConversation(events: readonly unknown[]): boolean;
export interface PolicyFact {
    readonly type: string;
    readonly data: unknown;
}
/** Last value of each policy fact, ordered by its last occurrence in the cut. */
export declare function latestPolicyFacts(events: readonly unknown[]): readonly PolicyFact[];
/** Replay after creation: appending during setup prevents the fresh-session gate from arming. */
export declare function replayPolicyFacts(session: unknown, facts: readonly PolicyFact[]): void;
//# sourceMappingURL=session-seed.d.ts.map