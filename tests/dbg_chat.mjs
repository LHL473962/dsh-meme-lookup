import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const chat = c.find((t) => t.name === 'meme_chat')
const r = await chat.execute({ text: '没绷住，这什么操作' })
console.log(JSON.stringify(r).slice(0, 600))
