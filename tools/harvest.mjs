// 按白名单抓候选：黑名单过滤 + 要求 source_video + 兜底去重
import { readFileSync, writeFileSync } from 'node:fs'
const API = 'https://cnmeme.wiki/api/v1/public'
const cfg = JSON.parse(readFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/lexicon_tags.json', 'utf8'))
const ALL = [...cfg.tiers.type, ...cfg.tiers.risk, ...cfg.tiers.daily]

const seen = new Map()
for (const tag of ALL) {
  for (const off of [0, 20, 40]) {
    try {
      const r = await fetch(API + '/memes?tag=' + encodeURIComponent(tag) + '&limit=20&offset=' + off, { headers: { accept: 'application/json' } })
      if (!r.ok) continue
      const d = await r.json()
      for (const it of d.items || []) {
        if (!it.slug || seen.has(it.slug)) continue
        const tagsRaw = (it.tags || []).filter((t) => !cfg.blacklist.includes(t))
        const src = it.source_video || {}
        const provenance = src.bvid && src.creator_name ? 'complete' : src.bvid ? 'partial' : 'missing'
        const days = it.updated_at ? Math.round((Date.now() - Date.parse(it.updated_at)) / 86400000) : null
        const tier = days === null ? 'missing' : days <= 90 ? 'live' : 'fading'
        seen.set(it.slug, { title: it.title, slug: it.slug, tags_raw: tagsRaw, provenance, tier, age_days: days, bvid: src.bvid || null, creator: src.creator_name || null })
      }
    } catch {}
  }
}
const rows = [...seen.values()]
writeFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/lexicon_auto.json', JSON.stringify(rows, null, 1))
const byProv = rows.reduce((a, r) => (a[r.provenance] = (a[r.provenance] || 0) + 1, a), {})
const byTier = rows.reduce((a, r) => (a[r.tier] = (a[r.tier] || 0) + 1, a), {})
console.log('total', rows.length, '| provenance', JSON.stringify(byProv), '| tier', JSON.stringify(byTier))
console.log('sample:', rows.slice(0, 5).map((r) => r.title + '/' + r.tier + '/' + r.provenance).join(' ; '))
