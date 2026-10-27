import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
copyFileSync(P + 'index.js', P + 'index.js.bak3')
let s = readFileSync(P + 'index.js', 'utf8')
if (!s.includes('SETTINGS_FILE')) {
  s = s.replace('const HEAT_FILE =', "const SETTINGS_FILE = join(process.env.DSH_HOME || join(homedir2(), '.dsh'), 'meme-settings.json')\nconst HEAT_FILE =")
}
if (!s.includes('function loadSettings')) {
  s = s.replace('function replyPolicy(context, memes) {', [
    'function loadSettings() {',
    '  const def = { tendency: 1, density: 1, allowRisky: false, autoUpdate: true }',
    '  try { return { ...def, ...(JSON.parse(readFileSync(SETTINGS_FILE, "utf8")) || {}) } } catch { return def }',
    '}',
    '',
    'function replyPolicy(context, memes) {',
  ].join('\n'))
}
s = s.replace(
  "  if (t === '调侃') return { use_meme: real.length > 0, why: '对方在开玩笑，可以接一个梗，别超过一个', max: 1 }",
  [
    '  const st = loadSettings()',
    "  if (t === '调侃') return {",
    '    use_meme: real.length > 0 && st.density > 0 && st.tendency > 0,',
    "    why: st.tendency === 0 ? '你在稳重模式，先不玩梗' : '对方在开玩笑，最多接 ' + st.density + ' 个',",
    '    max: st.density,',
    '  }',
  ].join('\n'),
)
s = s.replace(
  "  return { use_meme: real.length > 0, why: '普通语气，最多一个轻梗', max: 1 }",
  "  return { use_meme: real.length > 0 && st.density > 0 && st.tendency > 0, why: '普通语气，最多 ' + st.density + ' 个轻梗', max: st.density }",
)
const marker = s.indexOf('梗理解：抽帧')
const cut = s.lastIndexOf('\n}', s.lastIndexOf('\n', marker))
const toolTxt = readFileSync(P + 'tests/settings_tool.txt', 'utf8')
s = s.slice(0, cut) + '\n' + toolTxt + s.slice(cut)
writeFileSync(P + 'index.js', s)
console.log('patched bytes', s.length)