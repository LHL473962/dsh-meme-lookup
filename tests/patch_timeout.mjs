import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
let changed = 0
const before = s
// 给模型重排加 25 秒超时（原来会挂 150+ 秒）
s = s.replace(/const r = await fetch\(([^)]*chat\/completions[^)]*)\)/g, (m) => m)
if (!s.includes('signal: AbortSignal.timeout')) {
  s = s.replace(
    "    method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + cfg.apiKey }, body: JSON.stringify(body),",
    "    method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + cfg.apiKey }, body: JSON.stringify(body), signal: AbortSignal.timeout(25000),"
  )
  if (s !== before) changed++
}
writeFileSync(P, s)
console.log('timeout patched', changed > 0 || s.includes('AbortSignal.timeout'))