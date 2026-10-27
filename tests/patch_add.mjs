import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.bak5')
let s = readFileSync(P + 'index.js', 'utf8')
if (!s.includes('USER_LEX_FILE')) {
  s = s.replace('const SETTINGS_FILE =', "const USER_LEX_FILE = join(process.env.DSH_HOME || join(homedir2(), '.dsh'), 'meme-user-lexicon.json')\nconst SETTINGS_FILE =")
}
if (!s.includes("name: 'meme_add'")) {
  const marker = s.indexOf('梗理解：抽帧')
  const cut = s.lastIndexOf('\n}', s.lastIndexOf('\n', marker))
  s = s.slice(0, cut) + '\n' + readFileSync(P + 'tests/add_tool.txt', 'utf8') + s.slice(cut)
}
writeFileSync(P + 'index.js', s)
console.log('patched', s.length)