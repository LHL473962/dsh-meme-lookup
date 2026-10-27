// 过滤自动生成物：类型声明、locale 表、纯 re-export 桶文件
import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/manifest.json'
const man = JSON.parse(readFileSync(P, 'utf8'))
const out = []
const skipped = { types: 0, locale: 0, barrel: 0 }
for (const f of man) {
  const p = f.path.replace(/\\/g, '/')
  if (/\/types\//.test(p) || /\.d\.ts$/.test(p)) { skipped.types++; continue }
  if (/\/locale\//.test(p)) { skipped.locale++; continue }
  const s = readFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/studies/tmp/' + f.plugin + '/' + p.split(f.plugin + '/')[1], 'utf8').slice(0, 400)
  if (/^(export \* from|export \{ )/.test(s.trim()) && s.split('\n').length < 8) { skipped.barrel++; continue }
  out.push(f)
}
writeFileSync(P, JSON.stringify(out, null, 1))
const bytes = out.reduce((a, f) => a + f.bytes, 0)
console.log('留下', out.length, '个文件 |', Math.round(bytes/1024/1024*10)/10, 'MB | 约', Math.round(bytes/3.5/1e6*10)/10, 'M tokens')
console.log('跳过: 类型声明', skipped.types, '| locale', skipped.locale, '| 桶文件', skipped.barrel)