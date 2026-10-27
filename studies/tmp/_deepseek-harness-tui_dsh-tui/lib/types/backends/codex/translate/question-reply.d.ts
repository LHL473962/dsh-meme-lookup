export interface AsyncQuestionReply {
    readonly questionItemId: string;
    readonly question: string;
    readonly answer: string;
}
/** Only complete envelopes are interpreted; ordinary user text stays literal. */
export declare function parseQuestionReply(text: string): readonly AsyncQuestionReply[] | undefined;
export declare function displayQuestionReply(replies: readonly AsyncQuestionReply[]): string;
/** Bound model-authored framing to Codex's 512-byte budget, keeping Unicode whole. */
export declare function questionReplyText(questionItemId: string, title: string, answer: string): string;
//# sourceMappingURL=question-reply.d.ts.map