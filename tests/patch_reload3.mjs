import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const i = s.lastIndexOf('loadUserLexicon()')
console.log('last call at', i)
const block = [
  '',
  'let _userLexMtime = 0',
  'function maybeReloadUserLex() {',
  '  try {',
  '    const st = statSync(USER_LEX_FILE)',
  '    if (st.mtimeMs !== _userLexMtime) { _userLexMtime = st.mtimeMs; loadUserLexicon() }',
  '  } catch {}',
  '}',
].join('\n')
s = s.slice(0, i + 'loadUserLexicon()'.length) + block + s.slice(i + 'loadUserLexicon()'.length)
s = s.replace("import { spawnSync } from 'node:child_process'", "import { spawnSync } from 'node:child_process'\nimport { statSync } from 'node:fs'")
if (!s.includes('maybeReloadUserLex()\n        const evasionNow')) {
  s = s.replace('const evasionNow = detectEvasion(text)', 'maybeReloadUserLex()\n        const evasionNow = detectEvasion(text)')
}
writeFileSync(P, s)
console.log('patched ok')