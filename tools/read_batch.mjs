import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/'
const man = JSON.parse(readFileSync(P + 'manifest.json', 'utf8'))
const ledger = JSON.parse(readFileSync(P + 'ledger.json', 'utf8'))
const budget = Number(process.argv[2] || 50000)
const PER = 12000
ledger.done = []
const done = new Set()
const todo = man.filter((f) => !done.has(f.path))
const counts = new Map()
for (const f of todo) counts.set(f.plugin, (counts.get(f.plugin) || 0) + 1)
todo.sort((a, b) => (counts.get(a.plugin) - counts.get(b.plugin)) || a.bytes - b.bytes)
let used = 0
const batch = []
for (const f of todo) { if (used >= budget) break; batch.push(f); used += Math.min(f.bytes, PER) }
let out = ''
for (const f of batch) {
  let s = ''
  try { s = readFileSync(f.path, 'utf8') } catch (e) { s = '/* READ-FAIL ' + e.code + ' */' }
  out += '\n===== ' + (f.path.split('tmp').pop() || f.path) + ' (' + Math.round(f.bytes / 1024) + 'KB) =====\n' + s.slice(0, PER) + '\n'
  ledger.done.push(f.path)
}
writeFileSync(P + 'ledger.json', JSON.stringify(ledger))
console.log('BATCH', batch.length, '| 字节', Math.round(used / 1024), 'KB | 进度', ledger.done.length + '/' + man.length)
console.log(out.slice(0, budget + 3000))