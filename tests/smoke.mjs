import { apply } from '../index.js'
const t0 = Date.now()
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const coach = c.find((t) => t.name === 'meme_coach')
const cases = ['🧊🧊🧊 我打算梭哈一把', '大肥🐟 又来了', '今天加班累死了']
for (const t of cases) {
  const r = await chat.execute({ text: t })
  console.log(t, '→', (r.memes || []).map((x) => x.canonical).join(',') || '-', '| self:', r.self_reaction && r.self_reaction.character)
}
const r2 = await coach.execute({ text: '尼罗河二圣' })
console.log('coach:', r2.verdict, r2.provenance, '| ms total', Date.now() - t0)
