import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/README.md'
let s = readFileSync(P, 'utf8')
if (!s.includes('evasion')) {
  s = s.replace('- 17 个 emoji 映射', [
    '- 8 组「避审脏话」映射（evasion.json）：尼玛→你妈、卧槽→我操、sbxs→傻逼、淦→干…',
    '  > 识别为主、不推；level 3 的脏话一律不接。换个写法不改变它是脏话。',
    '- 17 个 emoji 映射',
  ].join('\n'))
}
writeFileSync(P, s)
console.log('readme', s.includes('evasion'))