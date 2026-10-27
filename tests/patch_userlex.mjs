import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.bak7')
let s = readFileSync(P + 'index.js', 'utf8')
if (!s.includes('loadUserLexicon')) {
  const anchor = "// 人工复核（见微 2026-10-27）：覆盖自动档位"
  const inject = [
    '// 用户自己录的条目（2026-10-27）：kind=meme 当梗，kind=phrase 当私人口癖',
    'function loadUserLexicon() {',
    '  let rows = []',
    '  try { rows = JSON.parse(readFileSync(USER_LEX_FILE, "utf8")) || [] } catch { return 0 }',
    '  const have = new Set(AUTO_LEX.map((e) => e.title))',
    '  let added = 0',
    '  for (const e of rows) {',
    '    if (!e || !e.title || have.has(e.title)) continue',
    '    const isPhrase = e.kind === "phrase" || (e.kind === undefined && e.sourceType === "自创")',
    '    AUTO_LEX.push({',
    '      title: e.title,',
    '      slug: "user:" + e.title,',
    '      tags_raw: [isPhrase ? "私人用语" : "用户录入"],',
    '      bvid: null,',
    '      creator: e.source || null,',
    '      provenance: e.sourceType === "有 BV" && e.source ? "partial" : "missing",',
    '      source: "user",',
    '      kind: isPhrase ? "phrase" : "meme",',
    '      tier: isPhrase ? "slang" : "live",',
    '      meaning: e.meaning || "",',
    '      avoid: e.avoid || "",',
    '    })',
    '    have.add(e.title); added++',
    '  }',
    '  return added',
    '}',
    'loadUserLexicon()',
    '',
  ].join('\n')
  s = s.replace(anchor, inject + anchor)
}
writeFileSync(P + 'index.js', s)
console.log('user lex loader', s.includes('loadUserLexicon'))