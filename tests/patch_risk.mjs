import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('风险：侮辱性')) {
  const marker = 'if (fresh.label === \'stale\') advice.push'
  const i = s.indexOf(marker)
  console.log('advice marker', i)
  if (i > 0) {
    const ins = [
      'const ev = detectEvasion(w + " " + (r && r.meme && r.meme.title ? r.meme.title : ""))',
      'if (ev.some((x) => x.level >= 2)) advice.push("风险：侮辱性/脏话类，别当玩笑甩（" + ev.map((x) => x.canonical).join("、") + "）")',
    ].join('\n      ')
    s = s.slice(0, i) + ins + '\n      ' + s.slice(i)
    writeFileSync(P, s)
    console.log('coach risk added')
  }
} else { console.log('already') }