// 全库抓取（断点续传 + 503 退避）
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const API = 'https://cnmeme.wiki/api/v1/public'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/lexicon_all.json'
const out = new Map()
if (existsSync(P)) for (const r of JSON.parse(readFileSync(P, 'utf8'))) out.set(r.slug, r)
let offset = out.size
let guard = 0
const sleep = (ms) => new Promise((s) => setTimeout(s, ms))
while (guard++ < 500) {
  let d = null
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(API + '/memes?limit=20&offset=' + offset, { headers: { accept: 'application/json' } })
      if (r.status === 503 || r.status === 429) { await sleep(2000 * (attempt + 1)); continue }
      if (!r.ok) { console.log('http', r.status, 'at', offset); break }
      d = await r.json(); break
    } catch { await sleep(1500 * (attempt + 1)) }
  }
  if (!d) { console.log('give up at', offset); break }
  const items = d.items || []
  for (const it of items) {
    if (!it.slug) continue
    const src = it.source_video || {}
    out.set(it.slug, {
      title: it.title, slug: it.slug, tags_raw: it.tags || [],
      bvid: src.bvid || null, creator: src.creator_name || null,
      updated_at: it.updated_at || null,
      provenance: src.bvid && src.creator_name ? 'complete' : src.bvid ? 'partial' : 'missing',
    })
  }
  offset += 20
  if (!d.has_more) { console.log('reached end'); break }
  if (guard % 25 === 0) { writeFileSync(P, JSON.stringify([...out.values()], null, 0)); console.log('offset', offset, 'collected', out.size) }
  await sleep(120)
}
const rows = [...out.values()]
writeFileSync(P, JSON.stringify(rows, null, 0))
console.log('TOTAL', rows.length)
