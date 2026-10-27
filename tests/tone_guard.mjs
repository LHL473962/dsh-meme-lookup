import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const old = [
  "            infoClauses.length ? '有 ' + infoClauses.length + ' 句是需要正面回答的信息' : '',",
  '          ].filter(Boolean),',
].join('\n')
const neo = [
  "            infoClauses.length ? '有 ' + infoClauses.length + ' 句是需要正面回答的信息' : '',",
  "            '别用「好的/确实/你说得对」开场；先给反应再给立场',",
  '          ].filter(Boolean),',
].join('\n')
if (s.includes(old) && !s.includes('别用「好的')) {
  s = s.replace(old, neo)
  writeFileSync(P, s)
  console.log('tone guard added')
} else console.log('skip', s.includes('别用「好的'))