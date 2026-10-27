import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const t = c.find((x) => x.name === 'meme_emote')
const t0 = Date.now()
const r = await t.execute({ path: 'D:/VoiceData/out/comment_test2.png' })
console.log('ms', Date.now() - t0, '| matches', JSON.stringify(r.matches))
