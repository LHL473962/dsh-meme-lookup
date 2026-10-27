import type { ContentBlock } from '@deepseek-ai/dsh-llm';
/** 0.1.7 puts tool output on the message; older logs wrap it in one block. */
export declare function toolResultPayload(message: {
    readonly content?: readonly ContentBlock[];
    readonly isError?: boolean;
} | undefined): {
    content: readonly ContentBlock[];
    isError: boolean;
};
/** Tool-call ids one message answers: 0.1.7 tool-role messages, or older result blocks. */
export declare function answeredToolCallIds(message: {
    readonly role: string;
    readonly toolCallId?: string;
    readonly content: readonly ContentBlock[];
}): string[];
/** Preserve old checkpoints while recognizing the V4 producer-owned source. */
export declare function isCompactionCheckpointSource(source: {
    kind: string;
    plugin?: string;
}): boolean;
//# sourceMappingURL=messages.d.ts.map