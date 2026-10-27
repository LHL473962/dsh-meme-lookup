// 弹幕+评论扫梗：抓热门视频的弹幕，统计重复出现的短句
import { writeFileSync } from 'node:fs'
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
const sleep = (ms) => new Promise((s) => setTimeout(s, ms))
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const count = new Map()   // 短语 → {n, bvids:Set}
const BAD = /^[0-9\s.]+$|^(哈哈+|hhh+|233+|awsl|前排|沙发|打卡|来了|第一|空降)$/i

function addPhrase(p, bvid) {
  const s = String(p).replace(/[\s\u3000]+/g, '').replace(/[，。！？、,.!?~～…]+$/g, '')
  if (s.length < 3 || s.length > 10) return
  if (BAD.test(s)) return
  if (/^[\d.]+$/.test(s)) return
  const cur = count.get(s) || { n: 0, bvids: new Set() }
  cur.n += 1; cur.bvids.add(bvid)
  count.set(s, cur)
}

let videos = 0
for (let pn = 1; pn <= 8; pn++) {
  let d
  try { d = await (await fetch('https://api.bilibili.com/x/web-interface/popular?ps=20&pn=' + pn, { headers: UA })).json() } catch { continue }
  const list = (d.data && d.data.list) || []
  for (const v of list) {
    try {
      const info = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + v.bvid, { headers: UA })).json()
      const cid = info.data && info.data.cid
      if (!cid) continue
      const xml = await (await fetch('https://comment.bilibili.com/' + cid + '.xml', { headers: UA })).text()
      const dm = [...xml.matchAll(/<d p="[^"]*">([^<]*)<\/d>/g)].map((m) => m[1])
      const local = new Map()
      for (const t of dm) {
        const s = t.replace(/[\s\u3000]+/g, '')
        if (s.length >= 3 && s.length <= 10) local.set(s, (local.get(s) || 0) + 1)
      }
      for (const [s, n] of local) if (n >= 3 || dm.length < 200) addPhrase(s, v.bvid)
      videos++
    } catch {}
    await sleep(350)
  }
  console.log('page', pn, 'videos', videos, 'phrases', count.size)
  writeFileSync(P + 'danmaku_raw.json', JSON.stringify([...count].map(([k, v]) => [k, v.n, [...v.bvids].slice(0, 3)])))
}
const rows = [...count.entries()]
  .map(([phrase, v]) => ({ phrase, n: v.n, samples: [...v.bvids].slice(0, 3) }))
  .sort((a, b) => b.n - a.n)
writeFileSync(P + 'danmaku_raw.json', JSON.stringify(rows))
console.log('TOTAL phrases', rows.length, '| videos', videos)
console.log('top:', rows.slice(0, 10).map((r) => r.phrase + '(' + r.n + ')').join(' '))
