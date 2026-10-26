import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const tool = c.find((t) => t.name === 'meme_understand')
const t0 = Date.now()
const r = await tool.execute({ bv: 'BV18Rnb6DEwJ', frames: 4 })
console.log('ok', r.ok, '| took', r.took_ms, 'ms | chars', r.text_chars)
console.log('kw', JSON.stringify(r.keywords))
console.log('evidence', (r.evidence || []).length)
console.log('cands', (r.candidates || []).map((x) => x.title + ':' + x.score).join(' ; '))
