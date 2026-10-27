
import fs from 'node:fs'
const raw = JSON.parse(fs.readFileSync('danmaku_raw.json','utf8'))
const lex = JSON.parse(fs.readFileSync('lexicon_danmaku.json','utf8'))
const have = new Set(lex.map(e => e.title))
const SYS = /正在刷|正在看|弹幕飞过|空降|前排|打卡|hhh|233|awsl|正义必胜|笑死我了|还真是|懂你意思|学到了/i
const add = []
for (const row of raw) {
  let t, n
  if (Array.isArray(row)) { t = row[0]; n = row[1] }
  else if (row && typeof row === 'object') { t = row.phrase; n = row.n }
  if (typeof t !== 'string' || !(n >= 6)) continue
  const s = t.trim()
  if (s.length < 3 || s.length > 10) continue
  if (SYS.test(s)) continue
  if (have.has(s)) continue
  add.push({ title: s, slug: 'dm:2:' + s, tags_raw: ['弹幕高频'], bvid: null, creator: null, provenance: 'missing', source: 'danmaku', tier: 'slang' })
  have.add(s)
}
fs.writeFileSync('lexicon_danmaku.json', JSON.stringify(lex.concat(add)))
console.log('原', lex.length, '新增', add.length, '合计', lex.length + add.length)
console.log('样例', add.slice(0, 12).map(x => x.title).join(' / '))
