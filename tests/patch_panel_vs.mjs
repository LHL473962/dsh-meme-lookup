import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/tools/panel.mjs'
let s = readFileSync(P, 'utf8')
s = s.replace("      (e.variants && e.variants.length ? '<div class=\"m\">变体：' + esc(e.variants.join('、')) + '</div>' : '') +",
  "      (vs.length ? '<div class=\"m\">变体：' + esc(vs.join('、')) + '</div>' : '') +")
s = s.replace("  const items = (lex || []).map((e, i) => {",
  "  const items = (lex || []).map((e, i) => {\n    const vs = Array.isArray(e.variants) ? e.variants : String(e.variants || '').split(',').map((x) => x.trim()).filter(Boolean)")
s = s.replace("    const row = { ...e, addedAt",
  "    const vs = Array.isArray(e.variants) ? e.variants : String(e.variants || '').split(',').map((x) => x.trim()).filter(Boolean)\n    const row = { ...e, variants: vs, addedAt")
writeFileSync(P, s)
console.log('patched variants', s.includes('const vs'))