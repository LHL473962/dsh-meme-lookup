/**
 * MCP elicitation and the CLI's user dialogs (`onElicitation` /
 * `onUserDialog`): the session's two other
 * human-in-the-loop callbacks. Every request becomes a structured ask the
 * shared QuestionStore renders (`question.request`), answered through the
 * session's `questions` capability, and settles into the shape the SDK
 * expects:
 *
 *  - form elicitation: the shared form flow (`src/backends/shared/elicitation.ts`:
 *    one question per field of the requested JSON schema, validated against
 *    the field's constraints, invalid answers asked again, optional fields
 *    skippable, a last question that sends or declines) settles as
 *    `{action:'accept', content}` / `{action:'decline'}`; a dismissed panel
 *    is `{action:'cancel'}`;
 *  - URL elicitation: a notice row naming the server and the URL, and the
 *    shared accept / decline question carrying the link;
 *    `system/elicitation_complete` for it closes the panel as accepted;
 *  - an elicitation mode this client cannot render is declined (with a
 *    notice);
 *  - the `refusal_fallback_prompt` dialog (the only kind declared in
 *    `supportedDialogKinds`): retry on the fallback model / cancel →
 *    `{behavior:'completed', result:'retry_fallback' | 'cancelled'}`; a
 *    dismissed panel is `{behavior:'cancelled'}` (the dialog's default); any
 *    other kind is answered `{behavior:'cancelled'}` at once.
 *
 * Signal-aware like the permission bridge: the SDK's abort (an interrupt,
 * the turn ending, `close()`) withdraws the panel (`question.settled`) and
 * answers cancel; dispose and reconnects settle everything as cancelled.
 * The callbacks never throw: a request this bridge cannot present is
 * declined (elicitation) or cancelled (dialog).
 */
import type { OnElicitation, OnUserDialog } from '@anthropic-ai/claude-agent-sdk';
import type { QuestionAnswers } from '../../agent/capabilities.js';
import type { AgentEvent } from '../../agent/events.js';
import { type ElicitationValue, type FormField } from '../shared/elicitation.js';
/** The dialog kinds this client renders (`supportedDialogKinds`). */
export declare const SUPPORTED_DIALOG_KINDS: readonly string[];
export { formFields, serverHeader, type ElicitationValue, type FormField } from '../shared/elicitation.js';
export declare const parseFieldText: (field: FormField, text: string) => {
    readonly value: ElicitationValue;
} | {
    readonly error: string;
};
export interface ClaudeDialogBridgeDeps {
    /** Deliver events to the channel (buffered until it subscribes). */
    emit(events: readonly AgentEvent[]): void;
    debug(message: string): void;
    /** The number of parked asks changed (session status). */
    onPendingChange?(count: number): void;
    /** The session is closing: new requests are refused at once. */
    closing(): boolean;
}
/** Create the bridge for one session. */
export declare function createClaudeDialogBridge(deps: ClaudeDialogBridgeDeps): {
    onElicitation: OnElicitation;
    onUserDialog: OnUserDialog;
    /** Whether an ask id is one of this bridge's (else the permission bridge's). */
    owns: (askId: string) => boolean;
    respond(askId: string, answers: QuestionAnswers): void;
    cancel(askId: string): void;
    /** `system/elicitation_complete`: the URL flow it names is done. */
    complete(server: string, elicitationId: string): void;
    readonly size: number;
    /** Withdraw everything (dispose, reconnect, a forced turn close). */
    settleAll(): void;
};
export type ClaudeDialogBridge = ReturnType<typeof createClaudeDialogBridge>;
//# sourceMappingURL=dialogs.d.ts.map