import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes("name: 'meme_persona'")) {
  // 1) 常量
  const cAnchor = 'function loadSettings() {'
  const cBlock = [
    "const PERSONA_FILE = new URL('./personas.json', import.meta.url)",
    'function loadPersonas() {',
    "  try { return (JSON.parse(readFileSync(PERSONA_FILE, 'utf8')) || {}).items || [] } catch { return [] }",
    '}',
    'function currentPersona() {',
    "  const id = loadSettings().persona || 'steady'",
    "  return loadPersonas().find((p) => p.id === id) || { id: 'steady', name: '稳重', style: '克制', sample: '' }",
    '}',
    '',
    cAnchor,
  ].join(String.fromCharCode(10))
  s = s.replace(cAnchor, cBlock)
  // 2) 插工具（放在 meme_settings 前）
  const idx = s.indexOf("name: 'meme_settings'")
  const start = s.lastIndexOf('  ctx.tools.register({', idx)
  s = s.slice(0, start) + readFileSync(P.replace('/index.js','/tests/persona_tool.txt'), 'utf8') + s.slice(start)
  writeFileSync(P, s)
  console.log('persona layer added')
} else console.log('exists')