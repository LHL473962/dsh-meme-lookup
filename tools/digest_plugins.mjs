// 逐文件读：跨插件去重（同一份 vendored 代码只算一次），抽出每个插件的自有代码特征
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
const ROOT = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/tmp/'
const seen = new Map()
const digests = []
let totalFiles = 0, uniqueFiles = 0, skippedMin = 0, totalBytes = 0
const walk = (d, out = []) => {
  for (const n of readdirSync(d)) {
    if (n === 'node_modules' || n === '.git' || n === 'dist') continue
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
  const files = walk(d)
  const own = { dir, files: files.length, ownFiles: 0, ownBytes: 0, tools: [], routes: [], slots: [], env: [], deps: [], headers: [] }
  for (const f of files) {
    totalFiles++
    let s = ''
    try { s = readFileSync(f, 'utf8') } catch { continue }
    totalBytes += s.length
    const h = createHash('sha1').update(s).digest('hex')
    if (seen.has(h)) continue
    seen.set(h, f)
    uniqueFiles++
    // 跳过打包/压缩产物：平均行长过大
    const lines = s.split('\n')
    const avg = s.length / Math.max(lines.length, 1)
    if (avg > 300) { skippedMin++; continue }
    own.ownFiles++; own.ownBytes += s.length
    const head = lines.slice(0, 6).join(' ').replace(/\s+/g, ' ').slice(0, 120)
    if (/^\s*\/\//.test(lines[0] || '')) own.headers.push(head)
    for (const m of s.matchAll(/name:\s*['\"]([a-z][a-z0-9_]{2,30})['\"]/g)) if (/^[a-z]+_/.test(m[1])) own.tools.push(m[1])
    for (const m of s.matchAll(/path:\s*['\"](\/[a-zA-Z0-9_\-:/]+)['\"]/g)) own.routes.push(m[1])
    for (const m of s.matchAll(/slots\.inject\(\s*['\"]([\w.\-]+)['\"]/g)) own.slots.push(m[1])
    for (const m of s.matchAll(/process\.env\.([A-Z_]{3,})/g)) own.env.push(m[1])
    for (const m of s.matchAll(/from\s+['\"](@deepseek-ai\/[\w\-]+)['\"]/g)) own.deps.push(m[1])
  }
  own.tools = [...new Set(own.tools)].slice(0, 20)
  own.routes = [...new Set(own.routes)].slice(0, 12)
  own.slots = [...new Set(own.slots)]
  own.env = [...new Set(own.env)].slice(0, 10)
  own.deps = [...new Set(own.deps)]
  own.headers = own.headers.slice(0, 3)
  digests.push(own)
}
digests.sort((a, b) => b.ownBytes - a.ownBytes)
writeFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/studies/digests.json', JSON.stringify(digests, null, 1))
console.log('总js', totalFiles, '| 去重后', uniqueFiles, '| 跳过压缩', skippedMin, '| 总字节', Math.round(totalBytes/1024) + 'KB')
for (const d of digests.slice(0, 12)) console.log([d.dir.slice(0, 30).padEnd(30), 'own', String(d.ownFiles).padStart(3), 'tools', String(d.tools.length).padStart(2), 'routes', String(d.routes.length).padStart(2), 'slots', d.slots.length].join(' | '))