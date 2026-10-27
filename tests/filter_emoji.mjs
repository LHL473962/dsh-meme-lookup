import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const isHan = (s) => /[\u4e00-\u9fa5]/.test(String(s))
for (const f of ['lexicon_danmaku.json', 'lexicon_comment.json']) {
  const rows = JSON.parse(readFileSync(P + f, 'utf8'))
  const kept = rows.filter((r) => isHan(r.title))
  const dropped = rows.length - kept.length
  writeFileSync(P + f, JSON.stringify(kept, null, 0))
  console.log(f, '保留', kept.length, '| 去掉纯 emoji/符号', dropped)
}