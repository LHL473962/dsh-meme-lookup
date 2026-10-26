import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const tool = c.find((t) => t.name === 'meme_understand')
const r = await tool.execute({ path: 'D:/bili_frames/giab/g03.jpg' })
console.log('chars', r.text_chars)
console.log('sample JSON:', JSON.stringify((r.text_sample || '').slice(0, 120)))
console.log('kw', JSON.stringify(r.keywords))
