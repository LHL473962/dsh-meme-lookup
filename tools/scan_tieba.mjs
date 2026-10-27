// 贴吧味道句库：用 B站搜「贴吧老哥/怼人」类视频，扫评论里的短句
import { readFileSync, writeFileSync } from 'node:fs'
const c = JSON.parse(readFileSync('C:/Users/a1599/.dsh/private/bili_cookies.json', 'utf8'))
const arr = Array.isArray(c) ? c : (c.cookies || [])
const cookie = arr.map((x) => x.name + '=' + x.value).join('; ')
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/', cookie }
const sleep = (ms) => new Promise((s) => setTimeout(s, ms))
const HIT = /就这|急了|什么成分|典|孝|绷|建议|谁问|差不多得了|放尊重|逆天|图样|说人话|证据|你最好|没人关心|难绷|认错|得寸进尺/
const count = new Map()
const bvids = new Set()
for (const kw of ['贴吧老哥', '怼人', '嘴臭', '阴阳怪气', '评论区的攻击性']) {
  try {
    const d = await (await fetch('https://api.bilibili.com/x/web-interface/search/all/v2?keyword=' + encodeURIComponent(kw), { headers: UA })).json()
    const v = ((d.data && d.data.result) || []).find((x) => x.result_type === 'video')
    for (const it of (v && v.data) || []) if (it.bvid) bvids.add(it.bvid)
  } catch {}
  await sleep(300)
}
console.log('targets', bvids.size)
for (const bvid of [...bvids].slice(0, 14)) {
  try {
    const info = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + bvid, { headers: UA })).json()
    const aid = info.data && info.data.aid
    if (!aid) continue
    for (const pn of [1, 2]) {
      const r = await (await fetch('https://api.bilibili.com/x/v2/reply?type=1&oid=' + aid + '&sort=2&ps=20&pn=' + pn, { headers: UA })).json()
      for (const rep of ((r.data && r.data.replies) || [])) {
        const msg = String((rep.content && rep.content.message) || '').replace(/\[[^\]]{1,6}\]/g, '').replace(/\s+/g, '')
        for (const seg of msg.split(/[，。！？,.!?~～]/)) {
          if (seg.length < 2 || seg.length > 10) continue
          if (!HIT.test(seg)) continue
          count.set(seg, (count.get(seg) || 0) + 1)
        }
      }
      await sleep(150)
    }
  } catch {}
  await sleep(200)
}
const rows = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60)
writeFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/tieba_lines.json', JSON.stringify(rows.map(([line, n]) => ({ line, n })), null, 1))
console.log('collected', rows.length, '| top:', rows.slice(0, 10).map(([l, n]) => l + '(' + n + ')').join(' '))
