import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
let lines = readFileSync(P + 'index.js', 'utf8').split('\n')
const idx = lines.findIndex((l) => l.trim() === "import { join } from 'node:path'")
console.log('join import at', idx + 1)
if (idx >= 0) {
  const need = []
  if (!lines.some((l) => l.includes('fileURLToPath'))) need.push("import { fileURLToPath } from 'node:url'")
  if (!lines.some((l) => l.includes('copyFileSync') && l.startsWith('import'))) need.push("import { copyFileSync } from 'node:fs'")
  lines.splice(idx + 1, 0, ...need)
  writeFileSync(P + 'index.js', lines.join('\n'))
  console.log('added', need.length)
}