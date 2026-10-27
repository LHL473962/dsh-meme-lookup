/**
 * MCP elicitation ↔ questionnaire, backend-neutral and pure: the shapes in
 * are the MCP specification's (`mode`, `requestedSchema`, `url`, the server
 * name), the shapes out are the Agent Domain's (`QuestionItemView[]` for a
 * `question.request`, an `accept` / `decline` result with its `content`).
 * A backend keeps only the wiring (park the ask, answer its own protocol,
 * withdraw on abort); every rule of how a form is asked lives here, so two
 * backends never disagree on it.
 *
 *  - form mode: one question per field of the requested JSON schema, in
 *    declaration order — an enum is a choice list (`enumNames` / `oneOf`
 *    titles as labels), a boolean yes / no, a multi-select array
 *    checkboxes, a string / number / anything else the free-text row with a
 *    constraint hint; optional fields can be skipped; a last question sends
 *    or declines. Answers are validated against each field's constraints:
 *    an invalid answer asks that field again (and only the invalid ones),
 *    saying why; valid ones become typed content;
 *  - URL mode: one accept / decline question carrying the link (rendered
 *    as an OSC 8 hyperlink where the terminal supports one), plus the
 *    notice texts a backend shows around it.
 *
 * The option labels of a flow are fixed when it is first asked: answers
 * are matched against the very strings the panel showed, so a language
 * switch meanwhile cannot turn a valid answer into a mismatch.
 *
 * **Locale-free (B-3)**: this module writes no copy of its own. Every string
 * it puts on screen comes from the {@link ElicitationText} the caller hands
 * over — one snapshot per flow, taken in the backend's own language through
 * `BackendHost.locale()`. A backend's text is its own (D2); the host
 * dictionary is not readable from here.
 *
 * Backend-neutral (`verify:boundary`): no vendor types, no I/O, no host
 * module — the module lives in `src/backends/shared/` because the two
 * backends are its only callers.
 */
import type { QuestionAnswers } from '../../agent/capabilities.js';
import type { QuestionItemView } from '../../agent/events.js';
/** Every string this flow puts on screen, in one language, as the caller's
 *  own dictionary holds it. Values may carry `{{name}}` placeholders: this
 *  module fills them from the values of the call. */
export interface ElicitationText {
    /** The label that skips an optional field. */
    readonly skip: string;
    readonly skipDesc: string;
    readonly yes: string;
    readonly no: string;
    /** The last question's two options. */
    readonly send: string;
    readonly sendDesc: string;
    readonly decline: string;
    readonly declineDesc: string;
    readonly confirm: string;
    /** `{{title}}` = the field's title. */
    readonly optional: string;
    /** `{{reason}}` = the reason the field is asked again. */
    readonly invalid: string;
    readonly invalidChoice: string;
    readonly invalidRequired: string;
    readonly invalidNumber: string;
    readonly invalidInteger: string;
    /** `{{min}}` / `{{max}}` / `{{n}}`. */
    readonly invalidMin: string;
    readonly invalidMax: string;
    readonly invalidMinLength: string;
    readonly invalidMaxLength: string;
    readonly invalidMinItems: string;
    readonly invalidMaxItems: string;
    readonly invalidJson: string;
    readonly invalidEmail: string;
    readonly invalidUri: string;
    readonly invalidDate: string;
    readonly invalidDateTime: string;
    readonly invalidPattern: string;
    readonly kindInteger: string;
    readonly kindNumber: string;
    /** `{{kind}}` / `{{min}}` / `{{max}}`. */
    readonly hintRange: string;
    readonly hintMin: string;
    readonly hintMax: string;
    readonly hintJson: string;
    /** `{{format}}` = the declared string format (email, date, …). */
    readonly hintFormat: string;
    readonly urlAccept: string;
    readonly urlAcceptDesc: string;
    /** `{{server}}` = the MCP server's name. */
    readonly urlQuestion: string;
    readonly urlDetail: string;
    /** `{{server}}` + `{{url}}`. */
    readonly urlNotice: string;
    readonly urlComplete: string;
    readonly urlMissing: string;
    /** `{{server}}` + `{{mode}}`. */
    readonly unsupported: string;
}
/** A JSON object as read from an untyped schema. */
type Rec = Readonly<Record<string, unknown>>;
/** A form value the MCP result carries. */
export type ElicitationValue = string | number | boolean | string[];
/** One field of a form elicitation, as the panel asks it. */
export interface FormField {
    readonly key: string;
    readonly title: string;
    readonly description?: string;
    readonly required: boolean;
    readonly kind: 'choice' | 'boolean' | 'multi' | 'text' | 'number' | 'integer' | 'json';
    /** Choice / multi options: the label shown and the value sent. */
    readonly choices?: readonly {
        readonly label: string;
        readonly value: string;
    }[];
    readonly schema: Rec;
}
/** The fields of a requested schema, in declaration order. */
export declare function formFields(schema: unknown): FormField[];
/** Validate one typed value against its field; the value or the reason. */
export declare function parseFieldText(field: FormField, text: string, elicit: ElicitationText): {
    readonly value: ElicitationValue;
} | {
    readonly error: string;
};
/** A field's question (with the reason it is asked again, if any). */
export declare function fieldQuestion(field: FormField, header: string, lead: string | undefined, error: string | undefined, elicit: ElicitationText): QuestionItemView;
/** One answered field: its value, `skip`, or why it is invalid. */
export declare function fieldValue(field: FormField, answer: QuestionAnswers['answers'][number] | undefined, elicit: ElicitationText): {
    readonly value: ElicitationValue;
} | {
    readonly skip: true;
} | {
    readonly error: string;
};
/** A short server label for the panel header chip. */
export declare function serverHeader(name: string): string;
/** The parts of an MCP elicitation request this module reads. */
export interface ElicitationRequestView {
    /** The MCP server's name (named in the confirmation and the notices). */
    readonly serverName: string;
    /** A friendlier name for the header chip, when the backend has one. */
    readonly displayName?: string;
    readonly title?: string;
    readonly message?: string;
    /** Form mode: the JSON schema of the requested content. */
    readonly requestedSchema?: unknown;
    /** URL mode: the page to open. */
    readonly url?: string;
}
/** What one answered round of a form decides. */
export type ElicitationFormStep = {
    readonly kind: 'accept';
    readonly content: Readonly<Record<string, ElicitationValue>>;
} | {
    readonly kind: 'decline';
}
/** Some answers were invalid: ask these questions next (only those fields). */
 | {
    readonly kind: 'reask';
    readonly questions: readonly QuestionItemView[];
};
/** One form elicitation as a questionnaire flow (state: the round so far). */
export interface ElicitationForm {
    /** The first ask: every field, then send / decline. */
    readonly questions: readonly QuestionItemView[];
    /** Fold the answers to the ask currently shown. */
    answer(answers: QuestionAnswers): ElicitationFormStep;
}
/**
 * A form elicitation flow: its first ask, then each answered round decides
 * accept (typed content), decline, or a re-ask of the invalid fields. The
 * send / decline choice is asked once, after the first round; a re-ask
 * keeps the values already accepted and replaces the re-asked ones.
 */
export declare function createElicitationForm(request: ElicitationRequestView, elicit: ElicitationText): ElicitationForm;
/** A URL elicitation as one accept / decline question carrying the link. */
export interface ElicitationUrlAsk {
    readonly questions: readonly QuestionItemView[];
    /** Whether the answers accept (the user opened the link); else decline. */
    accepted(answers: QuestionAnswers): boolean;
}
/** The URL-mode question; undefined when the request names no URL. */
export declare function createElicitationUrlAsk(request: ElicitationRequestView, elicit: ElicitationText): ElicitationUrlAsk | undefined;
/** The notice texts a backend shows around an elicitation. */
export declare function elicitationNotices(elicit: ElicitationText): {
    /** URL mode: the server asks the user to open a page. */
    urlOpen(server: string, url: string): string;
    /** URL mode: the server reported the flow done. */
    urlComplete(server: string): string;
    /** URL mode without a URL: declined. */
    urlMissing(server: string): string;
    /** A mode this client cannot render: declined. */
    unsupported(server: string, mode: string): string;
};
export {};
//# sourceMappingURL=elicitation.d.ts.map