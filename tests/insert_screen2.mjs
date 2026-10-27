import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.good')
const lines = readFileSync(P + 'index.js', 'utf8').split('\n')
const marker = lines.findIndex((l) => l.includes('梗理解：抽帧'))
let close = -1
for (let i = marker - 1; i >= 0; i--) { if (lines[i].trim() === '}') { close = i; break } }
console.log('before lines', lines.length, '| marker', marker + 1, '| close', close + 1)
const tool = readFileSync(P + 'tests/screen_tool.txt', 'utf8').split('\n')
const out = [...lines.slice(0, close), ...tool, ...lines.slice(close)]
writeFileSync(P + 'index.js', out.join('\n'))
console.log('after lines', out.length)
