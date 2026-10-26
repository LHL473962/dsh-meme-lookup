import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const cases = [
  '难崩，这也能报错',
  '乐乐，又来一遍',
  '傻福啊，我服了',
  'yyds 绝绝子',
  '这个方案我先摆烂了',
  '呵呵，真棒',
]
for (const t of cases) {
  const r = await chat.execute({ text: t })
  console.log('IN:', t, '| ctx:', r.context.type, '| is_meme:', r.is_meme, '| use:', r.policy.use_meme)
  console.log('   tiers:', JSON.stringify(r.meme_tiers))
}
