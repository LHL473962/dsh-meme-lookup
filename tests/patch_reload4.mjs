import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
s = s.replace('        maybeReloadUserLex()\n        const evasionNow', '        const evasionNow')
s = s.replace('        const lexMemes = detectMemes(text)', '        maybeReloadUserLex()\n        const lexMemes = detectMemes(text)')
writeFileSync(P, s)
console.log('moved', s.indexOf('maybeReloadUserLex()\n        const lexMemes') > 0)