import { readFileSync, writeFileSync } from 'node:fs'
const P = 'C:/Users/a1599/.dsh/meme-user-lexicon.json'
const a = JSON.parse(readFileSync(P, 'utf8'))
for (const e of a) {
  if (!e.sourceType) e.sourceType = /BV|av\d|https?:/i.test(String(e.source||'')) ? '有 BV' : (/自创|自己编/.test(String(e.source||'')) ? '自创' : '出处不详')
  if (!e.kind) e.kind = e.sourceType === '自创' ? 'phrase' : 'meme'
  if (!Array.isArray(e.variants)) e.variants = String(e.variants||'').split(',').map(x=>x.trim()).filter(Boolean)
}
writeFileSync(P, JSON.stringify(a, null, 2))
a.forEach(e=>console.log(e.title, '|', e.kind, '|', e.sourceType))