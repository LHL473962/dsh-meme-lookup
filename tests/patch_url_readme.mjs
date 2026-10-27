import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/README.md'
let s = readFileSync(P, 'utf8')
if (!s.includes('github.com/LHL473962')) {
  s = s.replace('## 五个工具', '> 仓库：https://github.com/LHL473962/dsh-meme-lookup\n\n## 五个工具')
}
writeFileSync(P, s)
console.log('url line', s.includes('github.com/LHL473962'))