import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const lines = readFileSync(P + 'index.js', 'utf8').split('\n')
if (lines.some((l) => l.includes('meme_suggest'))) { console.log('already inserted'); process.exit(0) }
const tool = readFileSync(P + 'tests/suggest_tool.txt', 'utf8').split('\n')
const marker = lines.findIndex((l) => l.includes('梗理解：抽帧'))
console.log('marker line:', marker + 1)
if (marker < 0) process.exit(1)
let close = -1
for (let i = marker - 1; i >= 0; i--) { if (lines[i].trim() === '}') { close = i; break } }
console.log('close line:', close + 1)
lines.splice(close, 0, ...tool)
writeFileSync(P + 'index.js', lines.join('\n'))
console.log('inserted')
