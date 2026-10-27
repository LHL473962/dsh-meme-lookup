import { apply } from '../index.js'
import { readFileSync } from 'node:fs'
const all = JSON.parse(readFileSync('lexicon_all.json', 'utf8'))
const dm = JSON.parse(readFileSync('lexicon_danmaku.json', 'utf8'))
const tagCount = (t) => all.filter((e) => (e.tags_raw || []).includes(t)).length
console.log('tag 谐音梗:', tagCount('谐音梗'), '| 谐音:', tagCount('谐音'), '| 脏话:', tagCount('脏话'), '| 避审:', tagCount('规避'))
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
for (const t of ['尼玛这也能跑', '卧槽，真的假的', '我超，这也行', '淦，又崩了', '你🐴的', 'sbxs', '蚌埠住了', '离谱他妈给离谱开门']) {
  const r = await chat.execute({ text: t })
  console.log(t, '→', (r.memes || []).map((m) => m.canonical).join(',') || '(未识别)')
}
