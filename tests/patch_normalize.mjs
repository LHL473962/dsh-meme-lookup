import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/tools/panel.mjs'
let s = readFileSync(P, 'utf8')
if (!s.includes('function normalizeEntry')) {
  s = s.replace("const DEFAULT = {", [
    "function normalizeEntry(e) {",
    "  const source = String(e.source || '')",
    "  let sourceType = e.sourceType",
    "  if (!sourceType) {",
    "    if (/BV|av\\d|https?:/i.test(source)) sourceType = '有 BV'",
    "    else if (/自创|自己编/.test(source)) sourceType = '自创'",
    "    else sourceType = '出处不详'",
    "  }",
    "  const variants = Array.isArray(e.variants) ? e.variants : String(e.variants || '').split(',').map((x) => x.trim()).filter(Boolean)",
    "  const tone = Array.isArray(e.tone) ? e.tone : (e.tone ? [String(e.tone)] : [])",
    "  return { ...e, sourceType, variants, tone }",
    "}",
    "",
    "const DEFAULT = {",
  ].join('\n'))
}
s = s.replace("    const lex = readJson(LEX, [])", "    const lex = readJson(LEX, []).map(normalizeEntry)")
s = s.replace("    const list = readJson(LEX, [])\n    const idx = list.findIndex", "    const list = readJson(LEX, []).map(normalizeEntry)\n    const idx = list.findIndex")
s = s.replace("    const list = readJson(LEX, [])\n    const rm = list.splice(i, 1)", "    const list = readJson(LEX, []).map(normalizeEntry)\n    const rm = list.splice(i, 1)")
writeFileSync(P, s)
console.log('normalize added', s.includes('function normalizeEntry'))