// 视频来源：标题/标签/分区里的高频词
import { readFileSync, writeFileSync } from 'node:fs'
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
const sleep = (ms) => new Promise((s) => setTimeout(s, ms))
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const tags = new Map()
const words = new Map()
const STOP = /^(视频|合集|第.期|全集|高清|完整版|免费|官方)$/
let n = 0
for (let pn = 1; pn <= 10; pn++) {
  try {
    const d = await (await fetch('https://api.bilibili.com/x/web-interface/popular?ps=20&pn=' + pn, { headers: UA })).json()
    for (const v of (d.data && d.data.list) || []) {
      n++
      for (const t of v.tname ? [v.tname] : []) tags.set(t, (tags.get(t) || 0) + 1)
      for (const t of v.rcmd_reason ? [] : []) {}
      const title = String(v.title || '')
      for (const m of title.matchAll(/[\u4e00-\u9fa5]{2,6}/g)) {
        const w = m[0]
        if (STOP.test(w)) continue
        words.set(w, (words.get(w) || 0) + 1)
      }
      for (const st of v.staff || []) {}
    }
  } catch {}
  await sleep(300)
}
const tagRows = [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60).map(([title, count]) => ({ title, count, source: 'video-tag' }))
const wordRows = [...words.entries()].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]).slice(0, 400).map(([title, count]) => ({ title, count, source: 'video-title' }))
writeFileSync(P + 'video_raw.json', JSON.stringify({ tags: tagRows, words: wordRows }))
console.log('videos', n, '| tags', tagRows.length, '| words', wordRows.length)
console.log('tags:', tagRows.slice(0, 8).map((t) => t.title + '(' + t.count + ')').join(' '))
console.log('words:', wordRows.slice(0, 8).map((t) => t.title + '(' + t.count + ')').join(' '))
