import { apply } from '../index.js'
import { existsSync, readFileSync } from 'node:fs'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const st = c.find((t) => t.name === 'meme_settings')
await st.execute({ action: 'set', tendency: 0, density: 0 })
const p = 'C:/Users/a1599/.dsh/meme-settings.json'
console.log('exists', existsSync(p), existsSync(p) ? readFileSync(p, 'utf8') : '')
console.log('get', JSON.stringify((await st.execute({ action: 'get' })).settings))
