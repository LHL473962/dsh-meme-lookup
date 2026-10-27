import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const oldLine = s.split('\n').find((l) => l.includes('const sacrificeLine ='))
console.log('old:', oldLine?.trim().slice(0, 80))
if (oldLine) {
  const neo = [
    '        let purpose = \'\'',
    "        if (sacrifice) {",
    "          purpose = text.replace(/^.*?(让你们?|为了)/, '').trim()",
    "          if (/看到/.test(purpose)) purpose = '都能' + purpose.slice(purpose.indexOf('看到'))",
    "          else purpose = purpose.replace(/^我(们)?(也要|要)?/, '').trim()",
    "          if (!purpose) purpose = '都能看到这期视频'",
    '        }',
    "        const sacrificeLine = sacrifice ? '我贷了笔大的，让你们' + purpose : null",
  ].join(String.fromCharCode(10))
  s = s.replace(oldLine, neo)
  writeFileSync(P, s)
  console.log('rewritten')
}