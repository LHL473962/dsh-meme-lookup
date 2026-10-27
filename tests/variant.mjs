import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
for (const t of ['🧊🧊🧊，这操作', '冰冰冰，绝了', '大肥🐟 又来了', '芭比q了', '我笑死']) {
  const r = await chat.execute({ text: t })
  console.log(t, '→', (r.memes || []).map((m) => m.canonical + '[' + (m.source || m.tier) + ']').join(' + ') || '-', '| is_meme', r.is_meme)
}
