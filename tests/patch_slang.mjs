import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('SLANG_FILE')) {
  const anchor = '// 人工复核（见微 2026-10-27）：覆盖自动档位'
  const block = [
    '// 口语/抽象补充（2026-10-27）：公开梗库不收这类词',
    "const SLANG_FILE = new URL('./slang.json', import.meta.url)",
    'try {',
    "  const raw = JSON.parse(readFileSync(SLANG_FILE, 'utf8'))",
    "  const have2 = new Set(AUTO_LEX.map((e) => e.title))",
    "  for (const it of (raw && raw.items) || []) {",
    '    if (!it.title || have2.has(it.title)) continue',
    '    AUTO_LEX.push({ title: it.title, slug: "slang:" + it.title, tags_raw: it.tags || [], bvid: null, creator: null, provenance: "missing", source: "slang", kind: it.tier, tier: it.tier || "slang", aliases: it.aliases || [], meaning: it.meaning || "" })',
    '    have2.add(it.title)',
    '  }',
    '} catch {}',
    '',
  ].join('\n')
  s = s.replace(anchor, block + anchor)
  writeFileSync(P, s)
  console.log('slang layer added')
}