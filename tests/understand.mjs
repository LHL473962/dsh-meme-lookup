import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const tool = c.find((t) => t.name === 'meme_understand')
if (!tool) { console.log('NO_TOOL'); process.exit(1) }

const img = await tool.execute({ path: 'D:/bili_frames/giab/g03.jpg' })
console.log('--- image ---', img.ok, '| kw:', (img.keywords||[]).join(','), '| chars:', img.text_chars)
console.log('candidates:', (img.candidates||[]).map(x=>x.title+':'+x.score).join(' ; '))

const txt = await tool.execute({ text: '这个梗叫尼罗河二圣，是网友对河马和尼罗鳄的调侃称呼' })
console.log('--- text ---', txt.ok, '| kw:', (txt.keywords||[]).join(','))
console.log('candidates:', (txt.candidates||[]).map(x=>x.title+':'+x.score).join(' ; '))
