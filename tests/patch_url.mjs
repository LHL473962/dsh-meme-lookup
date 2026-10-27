import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
let s = readFileSync(P + 'index.js', 'utf8')
if (!s.includes('fileURLToPath')) {
  s = s.replace("import { join } from 'node:path'", "import { join } from 'node:path'\nimport { fileURLToPath } from 'node:url'")
}
writeFileSync(P + 'index.js', s)
console.log('import added', s.includes('fileURLToPath'))