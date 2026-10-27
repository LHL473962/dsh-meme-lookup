import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
const marker = 'const policy = replyPolicy(context, memes)'
const i = s.indexOf(marker)
console.log('marker', i)
if (i > 0 && !s.includes('level >= 3')) {
  const ins = [
    '// 脏话类（含避审写法）不接',
    'if (policy && policy.use_meme && evasionNow.some((e) => e.level >= 3)) {',
    '  policy.use_meme = false',
    '  policy.why = "脏话类（避审写法也算脏话），别接"',
    '  policy.max = 0',
    '}',
  ].join('\n')
  s = s.slice(0, i + marker.length) + '\n' + ins + s.slice(i + marker.length)
  s = s.replace('const policy = replyPolicy(context, memes)', 'const evasionNow = detectEvasion(text)\n        const policy = replyPolicy(context, memes)')
  writeFileSync(P, s)
  console.log('policy patched')
} else { console.log('skip') }