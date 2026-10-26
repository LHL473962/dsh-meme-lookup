import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const coach = c.find((t) => t.name === 'meme_coach')
for (const q of ['老登', '摆烂文学', '眼里有光', '唱反调', '尼罗河二圣']) {
  const r = await coach.execute({ text: q })
  console.log(q, '|', r.verdict, '| kind:', (r.meme && r.meme.kind) || '-', '| label:', r.label || '-', '| src:', r.tier_source || '-')
}
