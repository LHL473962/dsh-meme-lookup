import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const r = await chat.execute({ text: '乐乐，又来一遍' })
console.log(JSON.stringify(r.memes))
const r2 = await chat.execute({ text: '乐乐' })
console.log(JSON.stringify(r2.memes))
