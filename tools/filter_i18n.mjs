import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/'
const man = JSON.parse(readFileSync(P + 'manifest.json', 'utf8'))
const out = []
let dropped = 0
for (const f of man) {
  let s = ''
  try { s = readFileSync(f.path, 'utf8') } catch { continue }
  const p = f.path.toLowerCase()
  const isDict = (/const zh = \{|const en = \{|const ja = \{/.test(s) && s.length > 3000)
  const isI18n = /(i18n|locale|messages|translations)/.test(p)
  if (isDict || isI18n) { dropped++; continue }
  out.push(f)
}
writeFileSync(P + 'manifest.json', JSON.stringify(out, null, 1))
console.log('留下', out.length, '| 丢弃字典/i18n', dropped, '|', Math.round(out.reduce((a,f)=>a+f.bytes,0)/1024/1024*10)/10, 'MB')