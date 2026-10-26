import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')

const cases = [
  '这报错我查了三小时，笑死，我真是天才',
  '你帮我看下这个脚本为什么跑不起来，明天要交',
  '呵呵，真棒，又崩了',
  'yyds！这波操作 666',
  '今天好累，感觉什么都做不完😔',
  '这个梗你听说过吗，我一直没搞懂',
]
for (const t of cases) {
  const r = await chat.execute({ text: t })
  console.log('IN:', t)
  console.log('  ctx:', r.context.type, JSON.stringify(r.context.scores), '| memes:', r.memes.map((m) => m.span).join(',') || '-')
  console.log('  policy:', r.policy.use_meme, '|', r.policy.why)
  console.log()
}
