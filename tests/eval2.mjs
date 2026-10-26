import { readFileSync, writeFileSync } from 'node:fs'
import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const coach = c.find((t) => t.name === 'meme_coach')
const cases = JSON.parse(readFileSync(new URL('./coach_cases.json', import.meta.url), 'utf8'))
const rows = []
for (const cs of cases) {
  const r = await coach.execute({ text: cs.input, scene: cs.scene || '' })
  rows.push({ input: cs.input, expected: cs.expected, got: r.verdict, db: (r.meme && r.meme.title) || null, why: cs.why })
}
writeFileSync(new URL('./eval_result.json', import.meta.url), JSON.stringify(rows, null, 2))
const pass = rows.filter((x) => x.expected === x.got).length
console.log('score', pass + '/' + rows.length)
console.log('db-hit-rate', rows.filter((x) => x.db).length + '/' + rows.length)
