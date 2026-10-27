import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
let n = 0
// chat 输出带人格
const a1 = '          self_reaction: scenes.length ?'
if (!s.includes('persona: currentPersona()')) {
  const i = s.indexOf('          self_reaction: scenes.length ?')
  if (i > 0) { s = s.slice(0, i) + '          persona: currentPersona(),\n' + s.slice(i); n++ }
}
// write 输出带人格
const a2 = '          self_reaction: sacrifice ?'
if (!s.includes("persona: currentPersona() }")) {
  const j = s.indexOf(a2)
  if (j > 0) { s = s.slice(0, j) + '          persona: currentPersona(),\n' + s.slice(j); n++ }
}
writeFileSync(P, s)
console.log('patched', n)