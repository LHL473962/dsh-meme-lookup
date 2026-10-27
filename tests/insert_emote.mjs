import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.bak2')
const lines = readFileSync(P + 'index.js', 'utf8').split('\n')
const marker = lines.findIndex((l) => l.includes('梗理解：抽帧'))
let close = -1
for (let i = marker - 1; i >= 0; i--) { if (lines[i].trim() === '}') { close = i; break } }
const tool = readFileSync(P + 'tests/emote_tool.txt', 'utf8').split('\n')
const out = [...lines.slice(0, close), ...tool, ...lines.slice(close)]
writeFileSync(P + 'index.js', out.join('\n'))
console.log('lines', lines.length, '->', out.length)
