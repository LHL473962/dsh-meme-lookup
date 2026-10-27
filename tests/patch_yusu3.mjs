import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const start = s.indexOf("        let purpose = ''")
const end = s.indexOf("const sacrificeLine =", start)
console.log('block', start, end)
if (start > 0 && end > start) {
  const neo = [
    '        // 只取「目的」那半句，两种模板：让你们 X / 只为了让 X',
    "        let purpose = text.split(/让你们|让你|为了让|为了|只为了/).pop().trim()",
    "        purpose = purpose.replace(/^[，,、\\s]+/, '').replace(/^(你们|大家|我)/, '')",
    "        while (purpose.startsWith('让') || purpose.startsWith('使')) purpose = purpose.slice(1)",
    "        const sacrificeLine = sacrifice ? ('我贷了笔大的，' + (/让你们|让你/.test(text) ? '让你们' + purpose : '只为了让' + purpose)) : null",
    '',
  ].join(String.fromCharCode(10))
  s = s.slice(0, start) + neo + s.slice(end)
  writeFileSync(P, s)
  console.log('purpose block rewritten')
}