import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const cases = [
  '今天又被梁子变祖器了，难崩',
  '老登，这波操作我看不懂',
  '你有没有听说过尼罗河二圣',
  '帮我看看这个脚本为什么跑不起来',
  '摆烂文学又更新了',
]
for (const t of cases) {
  const r = await chat.execute({ text: t })
  const m = (r.memes || []).map((x) => x.span + '/' + x.tier).join(' ')
  console.log(t, '\n  ctx:', r.context.type, '| is_meme:', r.is_meme, '| use:', r.policy.use_meme, '|', m || '-')
}
