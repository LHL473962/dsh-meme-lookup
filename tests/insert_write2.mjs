import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes("name: 'meme_write'")) {
  const idx = s.indexOf("name: 'meme_settings'")
  const start = s.lastIndexOf('  ctx.tools.register({', idx)
  console.log('start', start, 'idx', idx)
  if (start > 0) {
    s = s.slice(0, start) + readFileSync(P.replace('/index.js','/tests/write_tool.txt'), 'utf8') + s.slice(start)
    writeFileSync(P, s)
    console.log('inserted')
  }
} else console.log('exists')