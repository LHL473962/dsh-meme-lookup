// 批量读 v2：按签名聚类，重复写法只留摘要，新写法全文读
import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/'
const man = JSON.parse(readFileSync(P + 'manifest.json', 'utf8'))
const ledger = JSON.parse(readFileSync(P + 'ledger.json', 'utf8'))
const done = new Set(ledger.done)
const sigs = new Map()
const budget = Number(process.argv[2] || 120000)
const CAP = 9000
const todo = man.filter((f) => !done.has(f.path))
let out = ''
let used = 0, readFull = 0, summarized = 0
for (const f of todo) {
  if (used >= budget) break
  let s = ''
  try { s = readFileSync(f.path, 'utf8') } catch { ledger.done.push(f.path); continue }
  const imports = [...s.matchAll(/from\s+['\"]([^'\"]+)['\"]/g)].map((m) => m[1]).sort().join(',')
  const exports = [...s.matchAll(/export\s+(?:const|function|class|default)\s+([A-Za-z0-9_$]+)/g)].map((m) => m[1]).sort().join(',')
  const sig = imports + '|' + exports + '|' + (s.split('\n')[0] || '').slice(0, 60)
  ledger.done.push(f.path)
  if (sigs.has(sig)) { summarized++; continue }
  sigs.set(sig, f.path)
  readFull++
  const chunk = s.slice(0, CAP)
  out += '\n===== ' + f.path.split('tmp\\').pop() + ' (' + Math.round(f.bytes / 1024) + 'KB' + (s.length > CAP ? ', 截断' : '') + ') =====\n' + chunk + '\n'
  used += chunk.length
}
writeFileSync(P + 'ledger.json', JSON.stringify(ledger))
console.log('本轮: 全文读', readFull, '| 同签名跳过', summarized, '| 字节', Math.round(used / 1024) + 'KB | 进度', ledger.done.length + '/' + man.length)
console.log(out.slice(0, budget + 3000))