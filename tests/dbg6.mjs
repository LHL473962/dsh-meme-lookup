import { readFileSync } from 'node:fs'
const lex = JSON.parse(readFileSync(new URL('./lexicon.json', import.meta.url), 'utf8'))
console.log('total', lex.length)
const two = lex.filter((x) => x[0].length > 1)
console.log('multi-char entries:', two.map((x) => x[0]).join(','))
const t = '乐乐'
console.log('text codepoints:', [...t].map((c) => c.codePointAt(0).toString(16)).join(' '))
const e = two.find((x) => x[0] === t)
console.log('found 乐乐 entry?', !!e, e && [...e[0]].map((c) => c.codePointAt(0).toString(16)).join(' '))
console.log('indexOf:', t.indexOf('乐乐'))
