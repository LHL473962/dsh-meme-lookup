import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const raw = JSON.parse(readFileSync(P + 'comment_raw.json', 'utf8'))
const emotes = JSON.parse(readFileSync(P + 'comment_emotes.json', 'utf8'))
const rows = raw.map((r) => ({
  title: r.title,
  slug: 'cm:' + r.title,
  tags_raw: ['评论区高频'],
  bvid: (r.samples && r.samples[0]) || null,
  creator: null,
  provenance: 'missing',
  source: 'comment',
  count: r.count,
  tier: r.count >= 4 ? 'live' : 'slang',
  samples: r.samples || [],
}))
writeFileSync(P + 'lexicon_comment.json', JSON.stringify(rows, null, 0))
const em = emotes.map((e) => ({ code: '[' + e.name + ']', name: e.name, n: e.n }))
writeFileSync(P + 'emote_codes.json', JSON.stringify({ note: 'B站表情码使用频率，用来判语气；数字是扫描到的次数', codes: em }, null, 1))
const danmaku = JSON.parse(readFileSync(P + 'lexicon_danmaku.json', 'utf8'))
const all = JSON.parse(readFileSync(P + 'lexicon_all.json', 'utf8'))
console.log('词条库', all.length)
console.log('弹幕', danmaku.length)
console.log('评论', rows.length, '| live', rows.filter((r) => r.tier === 'live').length)
console.log('表情码', em.length)
console.log('合计（不含视频/口语）', all.length + danmaku.length + rows.length)