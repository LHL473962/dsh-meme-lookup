import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.bak6')
let s = readFileSync(P + 'index.js', 'utf8')
if (!s.includes('pluginDir')) {
  s = s.replace("const USER_LEX_FILE =", "const pluginDir = fileURLToPath(new URL('.', import.meta.url))\nconst USER_LEX_FILE =")
}
if (!s.includes("name: 'meme_sync'")) {
  const marker = s.indexOf('梗理解：抽帧')
  const cut = s.lastIndexOf('\n}', s.lastIndexOf('\n', marker))
  s = s.slice(0, cut) + '\n' + readFileSync(P + 'tests/sync_tool.txt', 'utf8') + s.slice(cut)
}
writeFileSync(P + 'index.js', s)
console.log('patched', s.length)