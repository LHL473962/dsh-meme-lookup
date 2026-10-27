// 评论区扫描：热门视频的评论 + 楼中楼，提取高频短句与表情码
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const c = JSON.parse(readFileSync('C:/Users/a1599/.dsh/private/bili_cookies.json', 'utf8'))
const arr = Array.isArray(c) ? c : (c.cookies || [])
const cookie = arr.map((x) => x.name + '=' + x.value).join('; ')
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/', cookie }
const sleep = (ms) => new Promise((s) => setTimeout(s, ms))
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const phrases = new Map()
const emotes = new Map()
const BAD = /^(哈哈+|hhh+|233+|前排|沙发|打卡|来了|第一|空降|支持|好耶)$/i

function addPhrase(raw, bvid) {
  if (!raw) return
  const s = String(raw).replace(/\[[^\]]{1,6}\]/g, '').replace(/[\s\u3000]+/g, '').trim()
  if (s.length < 3 || s.length > 14) return
  if (BAD.test(s) || /^[\d.]+$/.test(s)) return
  const cur = phrases.get(s) || { n: 0, bvids: new Set() }
  cur.n++; cur.bvids.add(bvid); phrases.set(s, cur)
}
function addEmote(raw) {
  for (const m of String(raw).matchAll(/\[([^\]\n]{1,6})\]/g)) {
    const k = m[1]
    emotes.set(k, (emotes.get(k) || 0) + 1)
  }
}

const bvids = new Set()
for (let pn = 1; pn <= 12; pn++) {
  try {
    const d = await (await fetch('https://api.bilibili.com/x/web-interface/popular?ps=20&pn=' + pn, { headers: UA })).json()
    for (const v of (d.data && d.data.list) || []) bvids.add(v.bvid)
  } catch {}
  await sleep(250)
}
console.log('targets', bvids.size)
let videos = 0
for (const bvid of [...bvids].slice(0, 220)) {
  try {
    const info = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + bvid, { headers: UA })).json()
    const aid = info.data && info.data.aid
    if (!aid) continue
    for (const pn of [1, 2, 3]) {
      const r = await (await fetch('https://api.bilibili.com/x/v2/reply?type=1&oid=' + aid + '&sort=2&ps=20&pn=' + pn, { headers: UA })).json()
      const reps = (r.data && r.data.replies) || []
      for (const rep of reps) {
        addPhrase(rep.content && rep.content.message, bvid)
        addEmote(rep.content && rep.content.message)
        if (rep.rcount > 0 && rep.rpid && pn === 1) {
          const rr = await (await fetch('https://api.bilibili.com/x/v2/reply/reply?type=1&oid=' + aid + '&root=' + rep.rpid + '&ps=20&pn=1', { headers: UA })).json()
          for (const sub of (rr.data && rr.data.replies) || []) {
            addPhrase(sub.content && sub.content.message, bvid)
            addEmote(sub.content && sub.content.message)
          }
          await sleep(120)
        }
      }
      await sleep(120)
    }
    videos++
  } catch {}
  await sleep(150)
  if (videos % 40 === 0) console.log('videos', videos, 'phrases', phrases.size, 'emotes', emotes.size)
}
const rows = [...phrases.entries()].map(([title, v]) => ({ title, count: v.n, samples: [...v.bvids].slice(0, 3), source: 'comment' }))
  .filter((r) => r.count >= 2)
  .sort((a, b) => b.count - a.count)
const emoteRows = [...emotes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 300).map(([name, n]) => ({ name, n }))
writeFileSync(P + 'comment_raw.json', JSON.stringify(rows))
writeFileSync(P + 'comment_emotes.json', JSON.stringify(emoteRows))
console.log('FINAL phrases', rows.length, '| emotes', emoteRows.length, '| videos', videos)
console.log('top:', rows.slice(0, 10).map((r) => r.title + '(' + r.count + ')').join(' '))
console.log('emotes:', emoteRows.slice(0, 8).map((e) => e.name + '(' + e.n + ')').join(' '))
