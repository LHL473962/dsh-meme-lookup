import { readFileSync, writeFileSync, statSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
if (!s.includes('maybeReloadUserLex')) {
  const anchor = 'loadUserLexicon()'
  const i = s.indexOf(anchor)
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
  s = s.slice(0, i + anchor.length) + block + s.slice(i + anchor.length)
  // chat/coach 开头调用
  s = s.replace("const evasionNow = detectEvasion(text)", "maybeReloadUserLex()\n        const evasionNow = detectEvasion(text)")
  s = s.replace("import { spawnSync } from 'node:child_process'", "import { spawnSync } from 'node:child_process'\nimport { statSync } from 'node:fs'")
  writeFileSync(P, s)
  console.log('reload hook added')
} else { console.log('exists') }