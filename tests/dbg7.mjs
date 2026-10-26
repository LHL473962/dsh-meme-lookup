import { readFileSync } from 'node:fs'
const lex = JSON.parse(readFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/lexicon.json', 'utf8'))
const text = '乐乐'
const found = []
const seen = new Set()
for (const [word, canonical, tier] of lex) {
  let idx = text.indexOf(word)
  while (idx >= 0) {
    if (!seen.has(canonical + idx)) {
      seen.add(canonical + idx)
      found.push({ span: word, canonical, tier, at: idx })
    }
    idx = text.indexOf(word, idx + 1)
  }
}
found.sort((a, b) => b.span.length - a.span.length)
const kept = []
for (const f of found) {
  const end = f.at + f.span.length
  if (!kept.some((k) => f.at < k.at + k.span.length && end > k.at)) kept.push(f)
}
console.log(JSON.stringify(kept))
console.log('lex has 乐乐:', lex.some((x) => x[0] === '乐乐'))
