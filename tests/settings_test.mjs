import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const st = c.find((t) => t.name === 'meme_settings')
const chat = c.find((t) => t.name === 'meme_chat')
console.log('get:', JSON.stringify((await st.execute({ action: 'get' })).settings))
console.log('set:', JSON.stringify((await st.execute({ action: 'set', tendency: 0, density: 0 })).settings))
const r = await chat.execute({ text: '笑死我了，这操作' })
console.log('稳重模式 policy:', r.policy.use_meme, '|', r.policy.why)
await st.execute({ action: 'set', tendency: 2, density: 2 })
const r2 = await chat.execute({ text: '笑死我了，这操作' })
console.log('活泛模式 policy:', r2.policy.use_meme, '|', r2.policy.why, '| max', r2.policy.max)
await st.execute({ action: 'set', tendency: 1, density: 1 })
