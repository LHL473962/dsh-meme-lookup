// 建清单：区分 自有 / vendor / 压缩，给每个文件排学习顺序
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
const ROOT = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/tmp/'
const seen = new Map()
const files = []
const walk = (d, out = []) => {
  for (const n of readdirSync(d)) {
    if (n === 'node_modules' || n === '.git') continue
    const p = join(d, n)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (/\.(js|mjs|cjs)$/.test(n)) out.push(p)
  }
  return out
}
for (const dir of readdirSync(ROOT)) {
  const d = join(ROOT, dir)
  if (!statSync(d).isDirectory()) continue
  for (const f of walk(d)) {
    let s = ''
    try { s = readFileSync(f, 'utf8') } catch { continue }
    const h = createHash('sha1').update(s).digest('hex')
    if (seen.has(h)) { files.push({ plugin: dir, path: f.replace(ROOT, ''), bytes: s.length, dup: seen.get(h) }); continue }
    seen.set(h, f.replace(ROOT, ''))
    const lines = s.split('\n')
    const avg = s.length / Math.max(lines.length, 1)
    const vendored = /\/(vendor|third_party|vendor\/)/.test(f) || /node_modules/.test(f)
    const minified = avg > 300 || s.length > 400000
    files.push({ plugin: dir, path: f.replace(ROOT, ''), bytes: s.length, lines: lines.length, dup: null, vendored, minified })
  }
}
const uniq = files.filter((f) => !f.dup)
const learn = uniq.filter((f) => !f.vendored && !f.minified)
writeFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/studies/manifest.json', JSON.stringify(learn, null, 1))
const bytes = learn.reduce((s, f) => s + f.bytes, 0)
console.log('总文件', files.length, '| 唯一', uniq.length, '| 要学', learn.length)
console.log('要学字节', Math.round(bytes/1024/1024*10)/10, 'MB | 约', Math.round(bytes/3.5/1e6*10)/10, 'M tokens')
const byPlugin = {}
for (const f of learn) byPlugin[f.plugin] = (byPlugin[f.plugin] || 0) + 1
console.log('插件数', Object.keys(byPlugin).length, '| 最多前5:', Object.entries(byPlugin).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k.slice(0,18)+':'+v).join(' '))