import { writeFileSync } from 'node:fs'
const API = 'https://cnmeme.wiki/api/v1/public'
const TAGS = ['动物梗', '图像梗', '文字梗', '短视频梗', '表情包', 'AI梗', '游戏梗', '谐音梗', '网络用语', '科技']
const seen = new Map()
for (const tag of TAGS) {
  for (const off of [0, 20]) {
    const url = API + '/memes?tag=' + encodeURIComponent(tag) + '&limit=20&offset=' + off
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' } })
      const d = await r.json()
      for (const it of d.items || []) {
        if (!seen.has(it.slug)) seen.set(it.slug, { title: it.title, slug: it.slug, tags: it.tags })
      }
    } catch {}
  }
}
const rows = [...seen.values()]
console.log('collected', rows.length)
writeFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/lexicon_candidates.json', JSON.stringify(rows, null, 1))
console.log(rows.slice(0, 8).map((x) => x.title).join(' / '))
