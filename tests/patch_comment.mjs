import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('COMMENT_FILE')) {
  const anchor = "// 弹幕高频短语（2026-10-27 扫 160 条热门视频得来）"
  const block = [
    '// 评论区高频（2026-10-27 扫 220 个视频的评论 + 楼中楼）',
    "const COMMENT_FILE = new URL('./lexicon_comment.json', import.meta.url)",
    'try {',
    "  const rows = JSON.parse(readFileSync(COMMENT_FILE, 'utf8'))",
    "  const have4 = new Set(AUTO_LEX.map((e) => e.title))",
    '  if (Array.isArray(rows)) for (const e of rows) {',
    "    if (!e || !e.title || have4.has(e.title)) continue",
    '    AUTO_LEX.push(e); have4.add(e.title)',
    '  }',
    '} catch {}',
    '',
  ].join('\n')
  s = s.replace(anchor, block + anchor)
  writeFileSync(P, s)
  console.log('comment layer added')
}