import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.bak')
const lines = readFileSync(P + 'index.js', 'utf8').split('\n')
if (lines.some((l) => l.includes("name: 'meme_screen'"))) { console.log('already has tool'); process.exit(0) }
const marker = lines.findIndex((l) => l.includes('梗理解：抽帧'))
console.log('marker line', marker + 1)
let close = -1
for (let i = marker - 1; i >= 0; i--) { if (lines[i].trim() === '}') { close = i; break } }
console.log('close line', close + 1, JSON.stringify(lines[close]))
const tool = readFileSync(P + 'tests/screen_tool.txt', 'utf8').split('\n')
lines.splice(close, 0, ...tool)
writeFileSync(P + 'index.js', lines.join('\n'))
console.log('inserted')
