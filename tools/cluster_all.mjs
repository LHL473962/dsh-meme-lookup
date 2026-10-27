// 全量扫描 + 聚类：每个签名只留代表，其余记录特征（覆盖全部文件）
import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/'
const man = JSON.parse(readFileSync(P + 'manifest.json', 'utf8'))
const clusters = new Map()
const skipped = []
for (const f of man) {
  let s = ''
  try { s = readFileSync(f.path, 'utf8') } catch { skipped.push(f.path); continue }
  const imports = [...s.matchAll(/from\s+['\"]([^'\"]+)['\"]/g)].map((m) => m[1]).sort().join(',')
  const exports = [...s.matchAll(/export\s+(?:const|function|class|default)\s+([A-Za-z0-9_$]+)/g)].map((m) => m[1]).sort().join(',')
  const tools = [...s.matchAll(/name:\s*['\"]([a-z][a-z0-9_]{2,30})['\"]/g)].map((m) => m[1]).filter((x) => /^[a-z]+_/.test(x))
  const routes = [...s.matchAll(/path:\s*['\"](\/[\w\-/.]+)['\"]/g)].map((m) => m[1])
  const slots = [...s.matchAll(/slots\.inject\(\s*['\"]([\w.\-]+)['\"]/g)].map((m) => m[1])
  const head = s.split('\n').slice(0, 8).join(' ').replace(/\s+/g, ' ').slice(0, 160)
  const sig = [imports, exports, tools.slice(0, 3).join(','), slots.join(',')].join('|')
  const cur = clusters.get(sig) || { count: 0, files: [], sample: null, head, tools: [...new Set(tools)].slice(0, 6), routes: [...new Set(routes)].slice(0, 4), slots: [...new Set(slots)], bytes: 0 }
  cur.count++
  cur.files.push(f.path.split('tmp\\').pop())
  cur.bytes += f.bytes
  if (!cur.sample) cur.sample = f.path
  clusters.set(sig, cur)
}
const list = [...clusters.values()].sort((a, b) => b.bytes - a.bytes)
writeFileSync(P + 'clusters.json', JSON.stringify(list, null, 1))
console.log('文件', man.length, '| 读失败', skipped.length, '| 聚类', list.length)
console.log('每类平均文件', Math.round(man.length / list.length * 10) / 10)
console.log('前 8 类（含字节）：')
for (const c of list.slice(0, 8)) console.log(' -', c.count + '个文件', Math.round(c.bytes/1024) + 'KB', '| tools', c.tools.join(','), '| slots', c.slots.join(',') || '-')