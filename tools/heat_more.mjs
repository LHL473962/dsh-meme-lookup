// 给新条目补热度（只抓还没抓过的，限量）
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const all = JSON.parse(readFileSync(P + 'lexicon_all.json', 'utf8'))
const idx = existsSync(P + 'heat_index.json') ? JSON.parse(readFileSync(P + 'heat_index.json', 'utf8')) : {}
const TYPE = ['文字梗', '游戏梗', '图像梗', '视频梗', '音乐梗', '表情包', '网络迷因']
const todo = all
  .filter((e) => e.bvid && !idx[e.bvid])
  .filter((e) => (e.tags_raw || []).some((t) => TYPE.includes(t)))
  .slice(0, 1200)
console.log('todo', todo.length, '| have', Object.keys(idx).length)
const UA = { 'user-agent': 'Mozilla/5.0', accept: 'application/json' }
let done = 0
for (let i = 0; i < todo.length; i += 5) {
  const batch = todo.slice(i, i + 5)
  await Promise.all(batch.map(async (e) => {
    try {
      const r = await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + e.bvid, { headers: UA })
      const d = await r.json()
      if (d.code === 0 && d.data && d.data.stat) idx[e.bvid] = d.data.stat.view
    } catch {}
  }))
  done += batch.length
  if (done % 200 === 0) { writeFileSync(P + 'heat_index.json', JSON.stringify(idx)); console.log('done', done, 'indexed', Object.keys(idx).length) }
  await new Promise((s) => setTimeout(s, 350))
}
writeFileSync(P + 'heat_index.json', JSON.stringify(idx))
console.log('FINAL indexed', Object.keys(idx).length)
