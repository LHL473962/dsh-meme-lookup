import { rec, str } from './narrow.js';
/** Parse one SendMessage tool call's input; undefined when unrecognizable. */
export function parseSendMessageInput(input) {
    const args = rec(input);
    if (args === undefined)
        return undefined;
    const to = str(args.to);
    const body = str(args.message) ?? str(args.text);
    if (to === undefined || to === '' || body === undefined || body === '')
        return undefined;
    return { to, text: body };
}
/** The observation of one call: state `issued`. `lane`
 *  names the sending subagent's delegating call id; on the main lane the
 *  sender is the parent itself (rendered from the absent `from`). */
export function sendMessageCallView(input) {
    return {
        messageId: input.callId,
        ...(input.lane === undefined ? {} : { from: input.lane }),
        to: input.input.to,
        via: 'parent-mediated',
        text: input.input.text,
        state: 'issued',
        sourceRef: input.callId,
        observedAt: input.observedAt,
    };
}
/** The states a structured result may explicitly name. */
const EXPLICIT_STATES = Object.freeze({
    delivered: 'delivered',
    held: 'held',
    refused: 'refused',
    expired: 'expired',
});
/**
 * The settled state of one SendMessage result: an explicit error is a
 * refusal fact; a structured `delivery`/`status` field naming a state
 * marks exactly that; any other shape — including a bare success — is
 * `unknown` (never a guessed delivery).
 */
export function sendMessageResultState(result) {
    if (result.isError)
        return 'refused';
    const structured = rec(result.structured);
    if (structured !== undefined) {
        for (const key of ['delivery', 'status']) {
            const named = EXPLICIT_STATES[str(structured[key]) ?? ''];
            if (named !== undefined)
                return named;
        }
    }
    return 'unknown';
}
/** The settlement observation of one call: the same durable identity (the
 *  parent tool call id); the fold advances the state and nothing else. */
export function sendMessageResultView(input) {
    return {
        messageId: input.callId,
        via: 'parent-mediated',
        text: '',
        state: input.state,
        sourceRef: input.callId,
        observedAt: input.observedAt,
    };
}
