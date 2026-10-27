import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const s = c.find((t) => t.name === 'meme_screen')
const r = await s.execute({ path: 'D:/VoiceData/out/comment_test.png' })
console.log('ok', r.ok, '| chars', r.chars)
console.log('memes:', (r.memes || []).map((m) => m.canonical + '[' + m.source + ']').join(' , '))
console.log('scenes:', (r.scenes || []).map((x) => x.name + '→' + x.reaction).join(' , '))
