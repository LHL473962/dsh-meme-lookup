import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes("name: 'meme_write'")) {
  const anchor = "  ctx.tools.register({\n    name: 'meme_settings'";
  const i = s.indexOf(anchor)
  if (i > 0) {
    s = s.slice(0, i) + readFileSync(P.replace('/index.js','/tests/write_tool.txt'), 'utf8') + s.slice(i)
    writeFileSync(P, s)
    console.log('inserted at', i)
  } else console.log('anchor missing')
} else console.log('exists')
console.log('balanced tail:', JSON.stringify(s.slice(-40)))