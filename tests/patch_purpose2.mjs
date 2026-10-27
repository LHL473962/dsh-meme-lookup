import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
s = s.replace("purpose = text.replace(/^.*?(让你们?|为了)/, '').trim()", "purpose = text.replace(/^.*?(让你们?|就?是为了|为了|也要)/, '').trim().replace(/^让/, '')")
s = s.replace("else purpose = purpose.replace(/^我(们)?(也要|要)?/, '').trim()", "else purpose = purpose.replace(/^我(们)?/, '').replace(/^大家/, '').trim()")
writeFileSync(P, s)
console.log('rules tightened')