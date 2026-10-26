import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
for (const t of ['我贷了笔大的，让你们能睡个好觉', '这不是脚本，这是艺术品', '你说得对，但是这个报错还在', '笑死我了，又崩了']) {
  const r = await chat.execute({ text: t })
  console.log(t, '→', (r.memes || []).map((m) => m.canonical + '[' + (m.kind || m.tier) + ']').join(' + ') || '-', '| is_meme', r.is_meme)
}
