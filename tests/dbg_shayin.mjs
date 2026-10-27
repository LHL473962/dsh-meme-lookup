import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const coach = c.find((t) => t.name === 'meme_coach')
for (const t of ['啥阴', '这啥阴间东西', '太阴间了']) {
  const r = await chat.execute({ text: t })
  console.log('[chat]', t, '→ 梗:', (r.memes || []).map((m) => m.canonical).join(',') || '无', '| 规避:', (r.evasion || []).map((e) => e.canonical).join(',') || '无', '| 语境:', r.context && r.context.type)
}
const r2 = await coach.execute({ text: '啥阴' })
console.log('[coach] 啥阴 →', r2.verdict, '|', r2.provenance, '|', r2.meme && r2.meme.title)
