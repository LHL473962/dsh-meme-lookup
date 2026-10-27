import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const anchor = "const PY = process.env.DSH_FRAMES_PY || process.env.DSH_PY || 'python'"
if (s.includes(anchor)) {
  const block = [
    '// 选一个能用的 Python：环境变量 > 本机已知 venv > PATH 上的 python',
    'function resolvePython() {',
    '  const env = process.env.DSH_PY || process.env.DSH_FRAMES_PY || process.env.DSH_OCR_PYEXE',
    '  if (env && existsSync(env)) return env',
    '  const cands = [',
    "    'D:/Apps/dsh-soundcheck-src/engine/venv/Scripts/python.exe',",
    "    join(homedir2(), '.dsh', 'bili-humanism', 'venv-frames', 'Scripts', 'python.exe'),",
    '  ]',
    '  for (const c of cands) { try { if (existsSync(c)) return c } catch {} }',
    "  return 'python'",
    '}',
    '',
    'const PY = resolvePython()',
  ].join(String.fromCharCode(10))
  s = s.replace(anchor, block)
  s = s.replace("const OCR_PYEXE = process.env.DSH_OCR_PYEXE || process.env.DSH_PY || 'python'", "const OCR_PYEXE = PY")
  writeFileSync(P, s)
  console.log('python resolver added')
} else { console.log('anchor miss') }