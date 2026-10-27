import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
let lines = readFileSync(P + 'index.js', 'utf8').split('\n')
const hasUrlImport = lines.some((l) => l.startsWith('import') && l.includes("node:url"))
console.log('has url import', hasUrlImport)
if (!hasUrlImport) {
  const idx = lines.findIndex((l) => l.trim() === "import { join } from 'node:path'")
  lines.splice(idx + 1, 0, "import { fileURLToPath } from 'node:url'")
  writeFileSync(P + 'index.js', lines.join('\n'))
  console.log('inserted at', idx + 1)
}