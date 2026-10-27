import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('BANKS_FILE')) {
  const anchor = 'function loadPersonas() {'
  const block = [
    "const BANKS_FILE = new URL('./persona_banks.json', import.meta.url)",
    'function personaBank(id) {',
    "  try { const j = JSON.parse(readFileSync(BANKS_FILE, 'utf8')); const it = (j.items || []).find((x) => x.id === id); return it ? it.lines : [] } catch { return [] }",
    '}',
    '',
    anchor,
  ].join(String.fromCharCode(10))
  s = s.replace(anchor, block)
}
// chat 输出带台词参考
if (!s.includes('persona_lines')) {
  const a = '          persona: currentPersona(),'
  const i = s.indexOf(a)
  s = s.slice(0, i) + "          persona: currentPersona(),\n          persona_lines: personaBank(currentPersona().id).slice(0, 4)," + s.slice(i + a.length)
}
writeFileSync(P, s)
console.log('bank wired')