import { readFileSync } from 'node:fs'
import { apply } from '../index.js'

const c = []
apply({ tools: { register: (t) => c.push(t) } })
const coach = c.find((t) => t.name === 'meme_coach')
const cases = JSON.parse(readFileSync(new URL('./coach_cases.json', import.meta.url), 'utf8'))

let pass = 0
const fails = []
for (const cs of cases) {
  const r = await coach.execute({ text: cs.input, scene: cs.scene || '' })
  const got = r.verdict || 'ERROR'
  const ok = got === cs.expected
  if (ok) pass++
  else fails.push({ input: cs.input, expected: cs.expected, got, why: cs.why, advice: (r.advice || [])[0] })
  console.log((ok ? 'PASS' : 'FAIL'), '|', cs.input, '| exp', cs.expected, '| got', got)
}
console.log('\nscore:', pass + '/' + cases.length, '(' + Math.round((pass / cases.length) * 100) + '%)')
if (fails.length) { console.log('\nfails:'); for (const f of fails) console.log(' -', f.input, '| exp', f.expected, '| got', f.got, '|', f.why) }
