
// 热词采集：B站搜索热词 + 微博热搜 → hot_terms.json（每日快照，保留 7 天）
import fs from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
const out = { at: new Date().toISOString(), bili: [], weibo: [] }

try {
  const r = await fetch('https://s.search.bilibili.com/main/hotword', { headers: UA })
  const d = await r.json()
  for (const it of d.list || []) {
    const w = String(it.show_name || it.keyword || '').trim()
    if (w) out.bili.push(w)
  }
} catch (e) { out.biliError = String(e.message || e) }

try {
  const r = await fetch('https://weibo.com/ajax/side/hotSearch', { headers: { 'user-agent': UA['user-agent'], referer: 'https://weibo.com/' } })
  const d = await r.json()
  for (const it of (d.data && d.data.realtime) || []) {
    const w = String(it.note || it.word || '').trim()
    if (w) out.weibo.push(w)
  }
} catch (e) { out.weiboError = String(e.message || e) }

fs.writeFileSync(P + 'hot_terms.json', JSON.stringify(out, null, 1))
const histP = P + 'hot_history.json'
let hist = []
try { hist = JSON.parse(fs.readFileSync(histP, 'utf8')) } catch {}
hist.push({ at: out.at, bili: out.bili.length, weibo: out.weibo.length })
fs.writeFileSync(histP, JSON.stringify(hist.slice(-30), null, 1))
console.log('bili', out.bili.length, '| weibo', out.weibo.length)
console.log('bili 样例:', out.bili.slice(0, 5).join(' / '))
console.log('weibo 样例:', out.weibo.slice(0, 5).join(' / '))
