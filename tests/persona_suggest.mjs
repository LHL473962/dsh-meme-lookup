import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('persona: currentPersona()')) { console.log('none'); process.exit(0) }
const cnt = (s.match(/persona: currentPersona\(\)/g) || []).length
if (cnt < 3) {
  const a = "          reranked: true, note: '模型重排过；只抛对方大概率认识的梗'"
  const b = "          note: '只抛对方大概率认识的梗；冷门不出现在这里'"
  if (s.includes(b)) s = s.replace(b, "          note: '只抛对方大概率认识的梗；冷门不出现在这里',\n          persona: currentPersona()")
  writeFileSync(P, s)
  console.log('suggest persona added, count now', (s.match(/persona: currentPersona\(\)/g)||[]).length)
} else console.log('already', cnt)