import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const anchor = "  // 自动词表（含人工复核档位）：标题直接出现在句子里才算"
if (!s.includes('别名命中（slug 词条的 aliases 字段）')) {
  const block = [
    '  // 别名命中（slug 词条的 aliases 字段）：口语词靠别名才认得出来',
    '  for (const e of AUTO_LEX) {',
    '    if (!Array.isArray(e.aliases) || !e.aliases.length) continue',
    '    for (const al of e.aliases) {',
    '      const a = String(al || "")',
    '      if (a.length < 2 || !text.includes(a)) continue',
    '      const key = "al:" + e.title + ":" + a',
    '      if (seen.has(key)) continue',
    '      seen.add(key)',
    '      found.push({ span: a, canonical: e.title, tier: e.tier || "slang", at: text.indexOf(a), confidence: "high", source: "alias", slug: e.slug })',
    '    }',
    '  }',
    '',
  ].join('\n')
  s = s.replace(anchor, block + anchor)
  writeFileSync(P, s)
  console.log('alias matching added')
}