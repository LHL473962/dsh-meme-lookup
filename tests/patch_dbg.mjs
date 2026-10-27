import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.bak4')
let s = readFileSync(P + 'index.js', 'utf8')
s = s.replace("      if (a === 'get') return { ok: true, settings: cur }", "      if (a === 'get') return { ok: true, settings: cur, path: String(SETTINGS_FILE) }")
s = s.replace("        try { writeFileSync(SETTINGS_FILE, JSON.stringify(cur, null, 2)) } catch {}", "        writeFileSync(SETTINGS_FILE, JSON.stringify(cur, null, 2))")
writeFileSync(P + 'index.js', s)
console.log('patched')
