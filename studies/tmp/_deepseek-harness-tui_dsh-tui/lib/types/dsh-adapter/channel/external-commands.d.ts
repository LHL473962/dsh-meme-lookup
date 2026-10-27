import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { CommandRuntime } from '@deepseek-ai/dsh-commands';
import { type ComposerImages } from './composer-images.js';
import type { ComposerImageRef, ExternalCommandOutcome, MentionAttachments } from './types.js';
/** Plugin-command invocation has one owner: this module owns gates, image
 *  encoding and the settled draft-consumption outcome. */
export declare function createExternalCommandInvoker(ctx: Context, deps: {
    commandService: CommandRuntime | undefined;
    runtime: {
        mode: string;
        slices: readonly string[];
    };
    agent(): Agent;
    capture(): unknown;
    bindingCurrent(capture: unknown): boolean;
    allows(subject: {
        componentId: string;
        activationId?: string;
    }, permission: string, scope: string): boolean;
    composer: ComposerImages;
    attachments(): MentionAttachments | undefined;
    notify(text: string, options?: {
        color?: 'success' | 'error' | 'warning';
        timeoutMs?: number;
    }): void;
}): {
    invoke: (name: string, rawInput: string, imageRefs?: readonly ComposerImageRef[]) => Promise<ExternalCommandOutcome | undefined>;
    invokeText: (name: string, rawInput: string, imageRefs?: readonly ComposerImageRef[]) => Promise<string | undefined>;
};
//# sourceMappingURL=external-commands.d.ts.map