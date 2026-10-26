import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const s = c.find((t) => t.name === 'meme_suggest')
for (const ctx of ['今天加班到现在，累死了', '这游戏队友太菜了']) {
  const t0 = Date.now()
  const r = await s.execute({ context: ctx, limit: 3 })
  console.log(ctx, '| reranked:', r.reranked, '|', (Date.now() - t0) + 'ms')
  for (const x of r.suggestions || []) console.log('   ', x.title, '|', x.why)
}
