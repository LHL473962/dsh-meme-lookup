import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
copyFileSync(P, P + '.good2')
let s = readFileSync(P, 'utf8')
const before = s.length
if (!s.includes('OCR 会把汉字用空格隔开')) {
  s = s.replace(
    "        const o = ocrImage(p)\n        const text = o.text || ''",
    "        const o = ocrImage(p)\n        // OCR 会把汉字用空格隔开，先并回来再识别\n        const text = (o.text || '').replace(/(?<=[\\p{Script=Han}]) (?=[\\p{Script=Han}])/gu, '')",
  )
}
writeFileSync(P, s)
console.log('before', before, 'after', s.length)
