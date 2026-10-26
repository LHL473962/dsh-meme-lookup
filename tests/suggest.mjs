import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
console.log('tools:', c.map((t) => t.name).join(','))
const s = c.find((t) => t.name === 'meme_suggest')
if (!s) process.exit(1)
const r = await s.execute({ context: '今天加班到现在，累死了', limit: 3 })
console.log(JSON.stringify(r).slice(0, 700))
