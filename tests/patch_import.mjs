import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
let s = readFileSync(P + 'index.js', 'utf8')
s = s.replace("import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'",
              "import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'")
s = s.replace("      if (a === 'get') return { ok: true, settings: cur, path: String(SETTINGS_FILE) }",
              "      if (a === 'get') return { ok: true, settings: cur }")
writeFileSync(P + 'index.js', s)
console.log('fixed import')
