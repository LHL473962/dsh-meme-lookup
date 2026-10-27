import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('EVASION_FILE')) {
  const a = s.indexOf("const VARIANT_FILE")
  const block = [
    "const EVASION_FILE = new URL('./evasion.json', import.meta.url)",
    "let EVASION = []",
    "try { EVASION = (JSON.parse(readFileSync(EVASION_FILE, 'utf8')) || {}).items || [] } catch {}",
    "",
    "function detectEvasion(text) {",
    "  const hits = []",
    "  const v = normalizeVariant(text)",
    "  for (const it of EVASION) {",
    "    for (const w of it.variants || []) {",
    "      const nw = normalizeVariant(w)",
    "      if (nw && v.includes(nw)) { hits.push({ canonical: it.canonical, matched: w, level: it.level, note: it.note }); break }",
    "    }",
    "  }",
    "  return hits",
    "}",
    "",
  ].join('\n')
  s = s.slice(0, a) + block + s.slice(a)
  console.log('evasion layer added')
}
if (!s.includes('evasion: detectEvasion')) {
  s = s.replace("          self_reaction:", "          evasion: detectEvasion(text),\n          self_reaction:")
}
writeFileSync(P, s)
console.log('done', s.includes('detectEvasion(text)'))