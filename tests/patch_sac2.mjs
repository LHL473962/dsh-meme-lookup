import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const a = '          self_reaction: self,'
const i = s.indexOf(a)
console.log('anchor', i)
if (i > 0) {
  const rep = "          self_reaction: sacrifice ? { scene: '我付出代价，让你们得到', character: '宿傩', when: sacrificeLine } : self,"
  s = s.slice(0, i) + rep + s.slice(i + a.length)
  writeFileSync(P, s)
  console.log('override added')
}