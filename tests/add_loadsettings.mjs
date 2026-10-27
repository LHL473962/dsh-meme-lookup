import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('function loadSettings')) {
  const anchor = 'function keywords(text, n = 10) {'
  const block = [
    'function loadSettings() {',
    "  const def = { tendency: 1, density: 1, allowRisky: false, autoUpdate: true }",
    "  try { return { ...def, ...(JSON.parse(readFileSyncSafe(SETTINGS_FILE)) || {}) } } catch { return def }",
    '}',
    '',
  ].join(String.fromCharCode(10))
  const i = s.indexOf(anchor)
  s = s.slice(0, i) + block + s.slice(i)
  writeFileSync(P, s)
  console.log('loadSettings added at', i)
} else console.log('exists')