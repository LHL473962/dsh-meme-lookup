// 拉目录 + 抓 1000 个 npm 包的 package.json 元数据，统计 dsh 字段用法
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
const OUT = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/'
const cat = await (await fetch('https://awesome-dsh-plugin.com/plugins.json', { headers: { 'user-agent': 'dsh' } })).json()
const arr = Array.isArray(cat) ? cat : (cat.plugins || [])
writeFileSync(OUT + 'catalog.json', JSON.stringify(arr))
const withNpm = arr.filter((p) => p.npm)
console.log('catalog', arr.length, '| has npm', withNpm.length)
const pick = withNpm.slice(0, 1000)
const rows = []
let done = 0
async function one(p) {
  try {
    const r = await fetch('https://registry.npmjs.org/' + encodeURIComponent(p.npm) + '/latest', { headers: { 'user-agent': 'dsh' } })
    if (!r.ok) return null
    const j = await r.json()
    return { name: p.npm, version: j.version, dsh: j.dsh || null, exports: j.exports ? Object.keys(j.exports).slice(0, 12) : null, engines: j.engines || null, main: j.main || null, keywords: (j.keywords || []).slice(0, 6) }
  } catch { return null }
}
for (let i = 0; i < pick.length; i += 8) {
  const batch = pick.slice(i, i + 8)
  const res = await Promise.all(batch.map(one))
  for (const r of res) if (r) rows.push(r)
  done += batch.length
  if (done % 200 === 0) { writeFileSync(OUT + 'pkgs.json', JSON.stringify(rows)); console.log('done', done, 'got', rows.length) }
}
writeFileSync(OUT + 'pkgs.json', JSON.stringify(rows))
console.log('FINAL', rows.length)