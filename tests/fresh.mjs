import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const coach = c.find((t) => t.name === 'meme_coach')
for (const q of ['耗子尾汁', 'yyds', '尊嘟假嘟', '芭比Q']) {
  const r = await coach.execute({ text: q })
  console.log(q, '|', r.verdict, '|', JSON.stringify(r.freshness))
}
