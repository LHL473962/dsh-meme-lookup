import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const call = '\nloadUserLexicon()\n'
const i = s.indexOf(call)
console.log('call site', i)
if (i < 0) throw new Error('no call site')
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
s = s.slice(0, i + call.length) + block + '\n' + s.slice(i + call.length)
s = s.replace("import { spawnSync } from 'node:child_process'", "import { spawnSync } from 'node:child_process'\nimport { statSync } from 'node:fs'")
s = s.replace('const evasionNow = detectEvasion(text)', 'maybeReloadUserLex()\n        const evasionNow = detectEvasion(text)')
writeFileSync(P, s)
console.log('patched')