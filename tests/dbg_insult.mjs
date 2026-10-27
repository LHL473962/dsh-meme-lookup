import { apply } from '../index.js'
import { readFileSync } from 'node:fs'
const all = JSON.parse(readFileSync('lexicon_all.json', 'utf8'))
const dm = JSON.parse(readFileSync('lexicon_danmaku.json', 'utf8'))
const words = ['好似', '傻福', '你冯', '飞八分钱', '好死', '傻逼', '牛逼']
for (const w of words) {
  const inAll = all.filter((e) => String(e.title).includes(w)).length
  const inDm = dm.filter((e) => String(e.title).includes(w)).length
  console.log(w, '| 词条库', inAll, '| 弹幕', inDm)
}
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const coach = c.find((t) => t.name === 'meme_coach')
for (const t of ['好似，开香槟咯', '傻福这词', '你冯的', '飞八分钱']) {
  const r = await chat.execute({ text: t })
  console.log(t, '→', (r.memes || []).map((m) => m.canonical).join(',') || '(未识别)', '| evasion', (r.evasion || []).map((e) => e.canonical).join(',') || '-')
}
const r2 = await coach.execute({ text: '飞八分钱' })
console.log('coach 飞八分钱:', r2.verdict, '|', r2.provenance)
