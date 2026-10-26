import { apply } from '../index.js'
const c = []
apply({ tools: { register: (t) => c.push(t) } })
const coach = c.find((t) => t.name === 'meme_coach')
if (!coach) { console.log('NO_COACH'); process.exit(1) }

const a = await coach.execute({ text: '尼罗河二圣', scene: '开场第三秒用一下' })
console.log('A ok=', a.ok, '| verdict=', a.verdict)
console.log('   meme:', a.meme && a.meme.title, '| tags:', (a.meme && a.meme.tags || []).join(','), '| age:', a.age_days)
console.log('   advice:'); (a.advice || []).forEach((x) => console.log('    -', x))

const b = await coach.execute({ text: '我认了，这个梗说到根上了，本质上就是大家对热爱的表达', scene: '结尾升华' })
console.log('\nB ok=', b.ok, '| verdict=', b.verdict)
console.log('   鱼八股:', (b.fish_banned || []).map((f) => f.kind).join(','))

const cc = await coach.execute({ text: 'zzzz不存在的梗zzzz' })
console.log('\nC ok=', cc.ok, '| verdict=', cc.verdict, '|', cc.advice)
