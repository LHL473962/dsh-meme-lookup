import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const marker = 'return { ok: true, added: entry, total: list.length'
const i = s.indexOf(marker)
console.log('marker at', i)
if (i > 0 && !s.includes('别等重启')) {
  const ins = [
    '// 立刻进内存，别等重启',
    'const isPhraseNew = entry.sourceType === "自创"',
    'if (!AUTO_LEX.some((x) => x.title === title)) {',
    '  AUTO_LEX.push({ title, slug: "user:" + title, tags_raw: [isPhraseNew ? "私人用语" : "用户录入"], bvid: null, creator: entry.source || null, provenance: entry.sourceType === "有 BV" ? "partial" : "missing", source: "user", kind: isPhraseNew ? "phrase" : "meme", tier: isPhraseNew ? "slang" : "live" })',
    '}',
  ].join('\n')
  s = s.slice(0, i) + ins + '\n      ' + s.slice(i)
  writeFileSync(P, s)
  console.log('patched')
} else { console.log('skipped') }