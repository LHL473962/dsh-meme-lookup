import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const s = c.find((t) => t.name === 'meme_suggest')
for (const ctx of ['今天加班到现在，累死了', '这游戏队友太菜了', 'AI 又乱写代码', '随便聊聊天气']) {
  const r = await s.execute({ context: ctx, limit: 3 })
  console.log(ctx, '→', (r.suggestions || []).map((x) => x.title + '(' + x.heat + ')').join(' / '))
}
