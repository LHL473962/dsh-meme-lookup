// 第二轮扫梗：更多热门 + 搜索近期视频，追加到 danmaku_raw.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
const sleep = (ms) => new Promise((s) => setTimeout(s, ms))
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const count = new Map()
if (existsSync(P + 'danmaku_raw.json')) {
  for (const r of JSON.parse(readFileSync(P + 'danmaku_raw.json', 'utf8'))) count.set(r.phrase, { n: r.n, bvids: new Set(r.samples || []) })
}
const BAD = /^(哈哈+|hhh+|233+|awsl|前排|沙发|打卡|来了|第一|空降)$/i
function add(p, bvid) {
  const s = String(p).replace(/[\s\u3000]+/g, '').replace(/[，。！？、,.!?~～…]+$/g, '')
  if (s.length < 3 || s.length > 10 || BAD.test(s) || /^[\d.]+$/.test(s)) return
  const cur = count.get(s) || { n: 0, bvids: new Set() }
  cur.n += 1; cur.bvids.add(bvid); count.set(s, cur)
}
let videos = 0
const bvids = new Set()
// 来源1：热门 9-20 页
for (let pn = 9; pn <= 20; pn++) {
  try {
    const d = await (await fetch('https://api.bilibili.com/x/web-interface/popular?ps=20&pn=' + pn, { headers: UA })).json()
    for (const v of (d.data && d.data.list) || []) bvids.add(v.bvid)
  } catch {}
}
// 来源2：搜索近期热词
for (const kw of ['直播回放', '搞笑', '整活', '游戏实况', '日常', '翻车']) {
  try {
    const d = await (await fetch('https://api.bilibili.com/x/web-interface/search/all/v2?keyword=' + encodeURIComponent(kw), { headers: UA })).json()
    const v = ((d.data && d.data.result) || []).find((x) => x.result_type === 'video')
    for (const it of (v && v.data) || []) if (it.bvid) bvids.add(it.bvid)
  } catch {}
}
console.log('targets', bvids.size)
for (const bvid of [...bvids].slice(0, 120)) {
  try {
    const info = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + bvid, { headers: UA })).json()
    const cid = info.data && info.data.cid
    if (!cid) continue
    const xml = await (await fetch('https://comment.bilibili.com/' + cid + '.xml', { headers: UA })).text()
    const dm = [...xml.matchAll(/<d p="[^"]*">([^<]*)<\/d>/g)].map((m) => m[1])
    const local = new Map()
    for (const t of dm) { const s = t.replace(/[\s\u3000]+/g, ''); if (s.length >= 3 && s.length <= 10) local.set(s, (local.get(s) || 0) + 1) }
    for (const [s, n] of local) if (n >= 3) add(s, bvid)
    videos++
  } catch {}
  await sleep(250)
  if (videos % 30 === 0) console.log('videos', videos, 'phrases', count.size)
}
const rows = [...count.entries()].map(([phrase, v]) => ({ phrase, n: v.n, samples: [...v.bvids].slice(0, 3) })).sort((a, b) => b.n - a.n)
writeFileSync(P + 'danmaku_raw.json', JSON.stringify(rows))
console.log('FINAL phrases', rows.length, '| new videos', videos)
console.log('top', rows.slice(0, 12).map((r) => r.phrase + '(' + r.n + ')').join(' '))
