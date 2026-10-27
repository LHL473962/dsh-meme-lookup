// 全量：抓目录里所有带 npm 的包，统计 dsh 字段
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
const OUT = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/'
const cat = JSON.parse(readFileSync(OUT + 'catalog.json', 'utf8'))
const withNpm = cat.filter((p) => p.npm)
console.log('targets', withNpm.length)
const rows = []
const seen = new Set()
let done = 0
async function one(p) {
  if (seen.has(p.npm)) return null
  seen.add(p.npm)
  try {
    const r = await fetch('https://registry.npmjs.org/' + encodeURIComponent(p.npm) + '/latest', { headers: { 'user-agent': 'dsh-study' }, signal: AbortSignal.timeout(15000) })
    if (!r.ok) return { name: p.npm, status: r.status }
    const j = await r.json()
    return { name: p.npm, version: j.version, dsh: j.dsh || null, exports: j.exports ? Object.keys(j.exports).slice(0, 14) : null, engines: j.engines || null, main: j.main || null, keywords: (j.keywords || []).slice(0, 6), scripts: Object.keys(j.scripts || {}).slice(0, 8) }
  } catch (e) { return { name: p.npm, error: String(e.message).slice(0, 40) } }
}
for (let i = 0; i < withNpm.length; i += 16) {
  const res = await Promise.all(withNpm.slice(i, i + 16).map(one))
  for (const r of res) if (r) rows.push(r)
  done += 16
  if (done % 400 === 0) { writeFileSync(OUT + 'pkgs.json', JSON.stringify(rows)); console.log('done', done, 'rows', rows.length) }
}
writeFileSync(OUT + 'pkgs.json', JSON.stringify(rows))
console.log('FINAL rows', rows.length)