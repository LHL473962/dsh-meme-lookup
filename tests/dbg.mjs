import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const tool = c.find((t) => t.name === 'meme_understand')
const img = await tool.execute({ path: 'D:/bili_frames/giab/g03.jpg' })
console.log(JSON.stringify(img).slice(0, 600))
