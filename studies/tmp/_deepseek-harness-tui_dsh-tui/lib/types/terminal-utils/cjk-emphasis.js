/** Scripts whose prose does not space after punctuation. CJK punctuation
 * itself is excluded: a closer followed by punctuation is already
 * right-flanking per CommonMark, so the built-in tokenizer closes it. */
const AFTER_CLOSER = '[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF]';
/** `**body<punct>**` glued to the scripts above. The body excludes `*`
 * (triple runs stay with the built-in tokenizer), line breaks and
 * backticks (code-span straddling). */
const CJK_STRONG = new RegExp('^\\*\\*([^*\\n`]+?\\p{P})\\*\\*(?=' + AFTER_CLOSER + ')', 'u');
/** Tokenizer extensions for `marked.use({ extensions })`. */
export const CJK_EMPHASIS_EXTENSIONS = [
    {
        name: 'cjkStrong',
        level: 'inline',
        start: (source) => {
            const index = source.indexOf('**');
            return index >= 0 ? index : undefined;
        },
        tokenizer(src) {
            const match = CJK_STRONG.exec(src);
            if (match === null)
                return undefined;
            const text = match[1];
            return {
                type: 'strong',
                raw: match[0],
                text,
                tokens: this.lexer.inlineTokens(text, []),
            };
        },
    },
];
