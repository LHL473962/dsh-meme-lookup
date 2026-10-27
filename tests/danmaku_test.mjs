import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const t0 = Date.now()
for (const t of ['没绷住，这什么操作', '气笑了，又是这个报错', '还真是不出所料', '吓哭了']) {
  const r = await chat.execute({ text: t })
  console.log(t, '→', (r.memes || []).map((m) => m.canonical + '[' + m.tier + ']').join(',') || '-')
}
console.log('ms', Date.now() - t0)
