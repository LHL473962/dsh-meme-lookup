import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
let s = readFileSync(P + 'index.js', 'utf8')
s = s.replace("    const isPhrase = e.kind === \"phrase\" || (e.kind === undefined && e.sourceType === \"自创\")",
  "    const isPhrase = e.kind ? e.kind === 'phrase' : (/自创|自己编/.test(String(e.source || '')) || e.sourceType === '自创')")
writeFileSync(P + 'index.js', s)
console.log('kind inference', s.includes('e.kind ? e.kind'))