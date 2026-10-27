import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
for (const t of ['我给你讲个冷笑话：为什么程序员分不清万圣节和圣诞节',
                 '有个冷知识，按住 Shift 再点就能绕过去',
                 '我打算梭哈一把，全压这个方案',
                 '我预判了他的预判，反将一军']) {
  const r = await chat.execute({ text: t })
  const s = r.self_reaction
  console.log(t.slice(0, 20) + '… → ' + (s ? s.scene + ' → 贴「' + s.character + '」' : '无'))
}
