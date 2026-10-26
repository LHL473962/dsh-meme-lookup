import { readFileSync } from 'node:fs'
const lex = JSON.parse(readFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/lexicon.json', 'utf8'))
const text = '乐乐'
const hits = lex.filter(([w]) => text.includes(w))
console.log('entries whose word appears:', JSON.stringify(hits))
console.log('sample lex entry keys:', JSON.stringify(lex.slice(0, 2)))
