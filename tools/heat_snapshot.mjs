// 离线热力图：抓 lexicon_auto 里每条的 B 站播放量，存 heat_index.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const auto = JSON.parse(readFileSync(P + 'lexicon_auto.json', 'utf8'))
const out = existsSync(P + 'heat_index.json') ? JSON.parse(readFileSync(P + 'heat_index.json', 'utf8')) : {}
const todo = auto.filter((e) => e.bvid && !out[e.bvid])
console.log('total', auto.length, '| todo', todo.length)

const UA = { 'user-agent': 'Mozilla/5.0', accept: 'application/json' }
let done = 0
for (let i = 0; i < todo.length; i += 5) {
  const batch = todo.slice(i, i + 5)
  await Promise.all(batch.map(async (e) => {
    try {
      const r = await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + e.bvid, { headers: UA })
      const d = await r.json()
      if (d.code === 0 && d.data && d.data.stat) out[e.bvid] = d.data.stat.view
    } catch {}
  }))
  done += batch.length
  if (done % 100 === 0) {
    writeFileSync(P + 'heat_index.json', JSON.stringify(out, null, 0))
    console.log('progress', done)
  }
  await new Promise((s) => setTimeout(s, 400))
}
writeFileSync(P + 'heat_index.json', JSON.stringify(out, null, 0))
console.log('saved', Object.keys(out).length)
