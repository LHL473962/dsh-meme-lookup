import { fillTemplate } from './localized-text.js';
/** Substitute the values of this call into a template of {@link ElicitationText}
 *  (one rule for every backend: `shared/localized-text.ts`). */
const fill = fillTemplate;
const rec = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined;
const str = (value) => typeof value === 'string' ? value : undefined;
const num = (value) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
/** The choice list of an enum schema (`enum` + `enumNames`, or `oneOf` /
 *  `anyOf` const + title). Labels are made unique. */
function choicesOf(schema) {
    if (schema === undefined)
        return undefined;
    const raw = [];
    if (Array.isArray(schema.enum)) {
        const names = Array.isArray(schema.enumNames) ? schema.enumNames : [];
        schema.enum.forEach((value, index) => {
            if (typeof value !== 'string')
                return;
            raw.push({ label: str(names[index]) ?? value, value });
        });
    }
    else {
        const list = Array.isArray(schema.oneOf) ? schema.oneOf : Array.isArray(schema.anyOf) ? schema.anyOf : undefined;
        if (list === undefined)
            return undefined;
        for (const item of list) {
            const value = str(rec(item)?.const);
            if (value === undefined)
                continue;
            raw.push({ label: str(rec(item)?.title) ?? value, value });
        }
    }
    if (raw.length === 0)
        return undefined;
    const seen = new Set();
    return raw.map(choice => {
        let label = choice.label === '' ? choice.value : choice.label;
        while (seen.has(label))
            label = `${label} (${choice.value})`;
        seen.add(label);
        return { label, value: choice.value };
    });
}
/** The fields of a requested schema, in declaration order. */
export function formFields(schema) {
    const root = rec(schema);
    const properties = rec(root?.properties);
    if (properties === undefined)
        return [];
    const required = new Set(Array.isArray(root?.required) ? root.required.filter((key) => typeof key === 'string') : []);
    return Object.entries(properties).map(([key, raw]) => {
        const field = rec(raw) ?? {};
        const type = str(field.type);
        const base = {
            key,
            title: str(field.title)?.trim() || key,
            ...(str(field.description)?.trim() ? { description: str(field.description).trim() } : {}),
            required: required.has(key),
            schema: field,
        };
        if (type === 'boolean')
            return { ...base, kind: 'boolean' };
        if (type === 'array') {
            const choices = choicesOf(rec(field.items));
            return choices === undefined ? { ...base, kind: 'json' } : { ...base, kind: 'multi', choices };
        }
        if (type === 'number' || type === 'integer')
            return { ...base, kind: type };
        const choices = choicesOf(field);
        if (choices !== undefined)
            return { ...base, kind: 'choice', choices };
        return { ...base, kind: type === 'string' || type === undefined ? 'text' : 'json' };
    });
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/u;
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/u;
/**
 * A real calendar day (leap years counted). `Date.parse` cannot judge an
 * RFC3339 date: it rolls impossible days such as 2024-02-31 over into March
 * instead of refusing them (and rejects legal leap seconds), so the fields
 * of the captured groups are checked for real.
 */
function calendarDay(year, month, day) {
    if (month < 1 || month > 12 || day < 1)
        return false;
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const length = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    return day <= length;
}
/** Validate one typed value against its field; the value or the reason. */
export function parseFieldText(field, text, elicit) {
    const schema = field.schema;
    if (field.kind === 'number' || field.kind === 'integer') {
        const value = Number(text);
        if (text.trim() === '' || !Number.isFinite(value))
            return { error: elicit.invalidNumber };
        if (field.kind === 'integer' && !Number.isInteger(value))
            return { error: elicit.invalidInteger };
        const min = num(schema.minimum);
        const max = num(schema.maximum);
        if (min !== undefined && value < min)
            return { error: fill(elicit.invalidMin, { min }) };
        if (max !== undefined && value > max)
            return { error: fill(elicit.invalidMax, { max }) };
        return { value };
    }
    if (field.kind === 'json') {
        let value;
        try {
            value = JSON.parse(text);
        }
        catch {
            return { error: elicit.invalidJson };
        }
        const type = str(schema.type);
        const fits = type === 'array'
            ? Array.isArray(value) && value.every(item => typeof item === 'string')
            : type === 'object' ? false : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
        // An MCP form value is a string, number, boolean or string array.
        if (!fits)
            return { error: elicit.invalidJson };
        return { value: value };
    }
    const length = [...text].length;
    const minLength = num(schema.minLength);
    const maxLength = num(schema.maxLength);
    if (minLength !== undefined && length < minLength)
        return { error: fill(elicit.invalidMinLength, { n: minLength }) };
    if (maxLength !== undefined && length > maxLength)
        return { error: fill(elicit.invalidMaxLength, { n: maxLength }) };
    switch (str(schema.format)) {
        case 'email':
            if (!EMAIL.test(text))
                return { error: elicit.invalidEmail };
            break;
        case 'uri':
            try {
                new URL(text);
            }
            catch {
                return { error: elicit.invalidUri };
            }
            break;
        case 'date': {
            const match = DATE.exec(text);
            if (match === null || !calendarDay(Number(match[1]), Number(match[2]), Number(match[3])))
                return { error: elicit.invalidDate };
            break;
        }
        case 'date-time': {
            // Full RFC3339: a real day, a clock within range (second 60 = a leap
            // second, accepted on syntax — whether the day really had one stays
            // the server's to check), and an explicit timezone (Z, z or ±HH:MM —
            // required, never the local-time fallback `Date.parse` implies).
            const match = DATE_TIME.exec(text);
            if (match === null
                || !calendarDay(Number(match[1]), Number(match[2]), Number(match[3]))
                || Number(match[4]) > 23 || Number(match[5]) > 59 || Number(match[6]) > 60
                || Number(match[7]) > 23 || Number(match[8]) > 59)
                return { error: elicit.invalidDateTime };
            break;
        }
        default:
            break;
    }
    const pattern = str(schema.pattern);
    if (pattern !== undefined) {
        let matches = true;
        try {
            matches = new RegExp(pattern, 'u').test(text);
        }
        catch {
            // A pattern this runtime cannot compile is the server's to check.
        }
        if (!matches)
            return { error: elicit.invalidPattern };
    }
    return { value: text };
}
/** A short constraint hint for a free-text field (shown under the question). */
function constraintHint(field, elicit) {
    const schema = field.schema;
    switch (field.kind) {
        case 'number':
        case 'integer': {
            const min = num(schema.minimum);
            const max = num(schema.maximum);
            const kind = field.kind === 'integer' ? elicit.kindInteger : elicit.kindNumber;
            if (min !== undefined && max !== undefined)
                return fill(elicit.hintRange, { kind, min, max });
            if (min !== undefined)
                return fill(elicit.hintMin, { kind, min });
            if (max !== undefined)
                return fill(elicit.hintMax, { kind, max });
            return kind;
        }
        case 'json':
            return elicit.hintJson;
        case 'text': {
            const format = str(schema.format);
            return format === undefined ? undefined : fill(elicit.hintFormat, { format });
        }
        default:
            return undefined;
    }
}
/** A field's question (with the reason it is asked again, if any). */
export function fieldQuestion(field, header, lead, error, elicit) {
    const skip = elicit.skip;
    const detail = [
        error === undefined ? undefined : fill(elicit.invalid, { reason: error }),
        lead,
        field.description,
        constraintHint(field, elicit),
    ].filter((line) => line !== undefined && line !== '').join('\n');
    const question = field.required ? field.title : fill(elicit.optional, { title: field.title });
    const optional = field.required ? [] : [{ label: skip, description: elicit.skipDesc }];
    const defaults = (labels) => labels.length === 0 ? {} : { defaultSelected: labels };
    const base = { question, header, ...(detail === '' ? {} : { detail }) };
    switch (field.kind) {
        case 'choice': {
            const fallback = str(field.schema.default);
            return { ...base, options: [...field.choices.map(choice => ({ label: choice.label })), ...optional], hideCustomInput: true, ...defaults(field.choices.filter(choice => choice.value === fallback).map(choice => choice.label)) };
        }
        case 'boolean': {
            const { yes, no } = elicit;
            const fallback = field.schema.default;
            return { ...base, options: [{ label: yes }, { label: no }, ...optional], hideCustomInput: true, ...defaults(fallback === true ? [yes] : fallback === false ? [no] : []) };
        }
        case 'multi': {
            const fallback = Array.isArray(field.schema.default) ? field.schema.default : [];
            return { ...base, options: [...field.choices.map(choice => ({ label: choice.label })), ...optional], multiSelect: true, hideCustomInput: true, ...defaults(field.choices.filter(choice => fallback.includes(choice.value)).map(choice => choice.label)) };
        }
        default:
            return { ...base, options: optional };
    }
}
/** One answered field: its value, `skip`, or why it is invalid. */
export function fieldValue(field, answer, elicit) {
    const selected = answer?.selected ?? [];
    const custom = answer?.custom?.trim() ?? '';
    const skip = elicit.skip;
    const skipped = selected.includes(skip);
    switch (field.kind) {
        case 'choice': {
            const choice = field.choices.find(item => item.label === selected[0]);
            if (choice !== undefined)
                return { value: choice.value };
            return skipped && !field.required ? { skip: true } : { error: elicit.invalidChoice };
        }
        case 'boolean':
            if (selected[0] === elicit.yes)
                return { value: true };
            if (selected[0] === elicit.no)
                return { value: false };
            return skipped && !field.required ? { skip: true } : { error: elicit.invalidChoice };
        case 'multi': {
            const values = field.choices.filter(choice => selected.includes(choice.label)).map(choice => choice.value);
            if (values.length === 0)
                return skipped && !field.required ? { skip: true } : { error: elicit.invalidChoice };
            const min = num(field.schema.minItems);
            const max = num(field.schema.maxItems);
            if (min !== undefined && values.length < min)
                return { error: fill(elicit.invalidMinItems, { n: min }) };
            if (max !== undefined && values.length > max)
                return { error: fill(elicit.invalidMaxItems, { n: max }) };
            return { value: values };
        }
        default:
            if (custom === '')
                return skipped && !field.required ? { skip: true } : { error: elicit.invalidRequired };
            return parseFieldText(field, custom, elicit);
    }
}
/** A short server label for the panel header chip. */
export function serverHeader(name) {
    const flat = name.replace(/\s+/gu, ' ').trim();
    return flat.length <= 24 ? flat : `${flat.slice(0, 23)}…`;
}
/**
 * A form elicitation flow: its first ask, then each answered round decides
 * accept (typed content), decline, or a re-ask of the invalid fields. The
 * send / decline choice is asked once, after the first round; a re-ask
 * keeps the values already accepted and replaces the re-asked ones.
 */
export function createElicitationForm(request, elicit) {
    const fields = formFields(request.requestedSchema);
    const header = serverHeader(request.displayName ?? request.serverName);
    const lead = [request.title, request.message].filter((line) => line !== undefined && line.trim() !== '').join('\n');
    const send = elicit.send;
    const decline = elicit.decline;
    const confirm = {
        question: fill(elicit.confirm, { server: request.serverName }),
        header,
        ...(fields.length === 0 && lead !== '' ? { detail: lead } : {}),
        options: [{ label: send, description: elicit.sendDesc }, { label: decline, description: elicit.declineDesc }],
        hideCustomInput: true,
    };
    const values = new Map();
    /** The fields the shown ask covers (all of them, then the invalid ones). */
    let asked = fields;
    let sending = false;
    return {
        questions: [...fields.map((field, index) => fieldQuestion(field, header, index === 0 ? lead : undefined, undefined, elicit)), confirm],
        answer: answers => {
            if (!sending) {
                const choice = answers.answers[asked.length]?.selected[0];
                if (choice !== send)
                    return { kind: 'decline' };
                sending = true;
            }
            const invalid = [];
            asked.forEach((field, index) => {
                const outcome = fieldValue(field, answers.answers[index], elicit);
                if ('error' in outcome)
                    invalid.push({ field, error: outcome.error });
                else if ('skip' in outcome)
                    values.delete(field.key);
                else
                    values.set(field.key, outcome.value);
            });
            if (invalid.length > 0) {
                asked = invalid.map(item => item.field);
                return { kind: 'reask', questions: invalid.map(item => fieldQuestion(item.field, header, undefined, item.error, elicit)) };
            }
            return { kind: 'accept', content: Object.fromEntries(values) };
        },
    };
}
/** The URL-mode question; undefined when the request names no URL. */
export function createElicitationUrlAsk(request, elicit) {
    const target = request.url;
    if (target === undefined || target.trim() === '')
        return undefined;
    const accept = elicit.urlAccept;
    const message = request.message ?? '';
    return {
        questions: [{
                question: message.trim() === '' ? fill(elicit.urlQuestion, { server: request.serverName }) : message,
                header: serverHeader(request.displayName ?? request.serverName),
                detail: elicit.urlDetail,
                link: target,
                options: [{ label: accept, description: elicit.urlAcceptDesc }, { label: elicit.decline, description: elicit.declineDesc }],
                hideCustomInput: true,
            }],
        accepted: answers => answers.answers[0]?.selected[0] === accept,
    };
}
/** The notice texts a backend shows around an elicitation. */
export function elicitationNotices(elicit) {
    return {
        urlOpen: (server, url) => fill(elicit.urlNotice, { server, url }),
        urlComplete: server => fill(elicit.urlComplete, { server }),
        urlMissing: server => fill(elicit.urlMissing, { server }),
        unsupported: (server, mode) => fill(elicit.unsupported, { server, mode }),
    };
}
