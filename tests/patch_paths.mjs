import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const old = [
  "const PY = process.env.DSH_FRAMES_PY || 'C:/Users/a1599/.dsh/bili-humanism/venv-frames/Scripts/python.exe'",
  "const OCR_PY = process.env.DSH_OCR_PY || 'C:/Users/a1599/.dsh/input/ocr_win.py'",
  "const OCR_PYEXE = process.env.DSH_OCR_PYEXE || 'D:/Apps/dsh-soundcheck-src/engine/venv/Scripts/python.exe'",
].join('\n')
const neo = [
  "const _pkgDir = fileURLToPath(new URL('.', import.meta.url))",
  "const PY = process.env.DSH_FRAMES_PY || process.env.DSH_PY || 'python'",
  "const OCR_PY = process.env.DSH_OCR_PY || join(_pkgDir, 'tools', 'ocr_win.py')",
  "const OCR_PYEXE = process.env.DSH_OCR_PYEXE || process.env.DSH_PY || 'python'",
].join('\n')
if (s.includes(old)) { s = s.replace(old, neo); console.log('paths patched') } else { console.log('anchor miss') }
s = s.replace("process.env.DSH_EMOTE_PY || 'D:/VoiceData/house/plugins/dsh-meme-lookup/tools/emote_match.py'", "process.env.DSH_EMOTE_PY || join(_pkgDir, 'tools', 'emote_match.py')")
writeFileSync(P, s)
console.log('done', s.includes('_pkgDir'))