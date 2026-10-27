import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const old = '        const context = classifyContext(ctxText, memes)'
if (s.includes(old) && !s.includes('ctxRaw')) {
  const neo = [
    '        // 摘掉梗再判语境有时会误伤（「笑死，这也能崩」被当成情绪），原句也判一次',
    '        const ctxRaw = classifyContext(text, memes)',
    '        let context = classifyContext(ctxText, memes)',
    "        if (ctxRaw.type === '调侃' && context.type === '情绪') context = ctxRaw",
  ].join('\n')
  s = s.replace(old, neo)
  writeFileSync(P, s)
  console.log('context fix applied')
} else console.log('skip', s.includes('ctxRaw'))