import { apply } from '../index.js'
const captured = []
apply({ tools: { register: (t) => captured.push(t) } })
const tool = captured[0]
let fail = 0
const cases = [
  ['search 梁子变祖器', { q: '梁子变祖器', limit: 2 }, (r) => r.ok && r.count > 0],
  ['detail 梁子变祖器', { slug: '梁子变祖器' }, (r) => r.ok && !!r.title && !!r.source_video?.bvid],
  ['tag 动物梗', { tag: '动物梗', limit: 2 }, (r) => r.ok && r.count > 0],
  ['tag+q', { q: '二圣', tag: '动物梗', limit: 2 }, (r) => r.ok],
  ['empty', {}, (r) => !r.ok && r.error === 'EMPTY_QUERY'],
  ['no-result', { q: 'zzzz不存在的词zzzz', limit: 2 }, (r) => r.ok && r.count === 0],
  ['limit clamp', { q: 'DeepSeek', limit: 999 }, (r) => r.ok && r.count <= 20],
]
for (const [label, args, check] of cases) {
  const r = await tool.execute(args)
  const pass = check(r)
  if (!pass) fail++
  console.log((pass ? 'PASS' : 'FAIL'), '|', label, '| ok=' + r.ok, '| mode=' + (r.mode || '-'), '| count=' + (r.count ?? '-'), r.error ? '| ' + r.error : '')
}
console.log(fail === 0 ? 'ALL PASS (' + cases.length + ')' : 'FAILURES: ' + fail)
process.exit(fail ? 1 : 0)
