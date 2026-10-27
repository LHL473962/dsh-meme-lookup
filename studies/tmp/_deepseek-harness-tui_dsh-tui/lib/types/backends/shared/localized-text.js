/** Substitute `{{name}}` with the values of this call; a name the caller did
 *  not supply is left verbatim, so a typo stays visible on screen instead of
 *  turning into a blank (the rule `t()` applies). */
export function fillTemplate(template, params) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, name) => name in params ? String(params[name]) : match);
}
// CLDR-backed and built into Node: zh always selects `other` (the language has
// no grammatical number), en selects `one` exactly at 1.
const pluralRules = {
    zh: new Intl.PluralRules('zh'),
    en: new Intl.PluralRules('en'),
};
/**
 * The text of one entry in `locale`, with the `count` parameter choosing the
 * plural form (a non-finite or absent `count` reads as 0, i.e. `other`).
 * Undefined when the entry has no text in that language.
 */
export function pickLocalizedText(text, locale, params) {
    if (text === undefined || typeof text === 'string')
        return text;
    const count = Number(params.count);
    const category = pluralRules[locale].select(Number.isFinite(count) ? count : 0);
    return category === 'one' ? text.one : text.other;
}
