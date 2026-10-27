// 60 插件结构剖析：每个插件出 profile
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const ROOT = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/tmp/'
const walk = (d, out = []) => {
  for (const n of readdirSync(d)) {
    if (n === 'node_modules' || n === '.git') continue
    const p = join(d, n)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (/\.(js|mjs|cjs|json|yml|md)$/.test(n)) out.push({ p, size: s.size })
  }
  return out
}
const profiles = []
for (const dir of readdirSync(ROOT)) {
  const d = join(ROOT, dir)
  if (!statSync(d).isDirectory()) continue
  const files = walk(d)
  const js = files.filter((f) => /\.(js|mjs|cjs)$/.test(f.p))
  const code = js.map((f) => { try { return readFileSync(f.p, 'utf8') } catch { return '' } })
  const all = code.join('\n')
  const main = files.filter((f) => /(^|\/)(index|main|host)\.(js|mjs)$/.test(f.p)).sort((a, b) => b.size - a.size)[0]
  const head = main ? readFileSync(main.p, 'utf8').slice(0, 4000) : ''
  const pkg = (() => { try { return JSON.parse(readFileSync(join(d, 'package.json'), 'utf8')) } catch { return {} } })()
  profiles.push({
    dir,
    name: pkg.name || dir,
    version: pkg.version || '',
    files: files.length,
    jsFiles: js.length,
    loc: all.split('\n').length,
    tools: (all.match(/defineTool\(|ctx\.tools\.register\(/g) || []).length,
    routes: (all.match(/webServer\.register\(/g) || []).length,
    slots: (all.match(/settings\.section/g) || []).length,
    effects: (all.match(/ctx\.effect\(/g) || []).length,
    tryCatch: (all.match(/try \{/g) || []).length,
    envKeys: [...new Set([...all.matchAll(/process\.env\.([A-Z_]+)/g)].map((m) => m[1]))].slice(0, 8),
    comments: (head.match(/^\/\//gm) || []).length,
    head: head.split('\n').slice(0, 12).join('\n'),
  })
}
profiles.sort((a, b) => b.loc - a.loc)
writeFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/studies/profiles.json', JSON.stringify(profiles, null, 1))
console.log('profiles', profiles.length)
for (const p of profiles.slice(0, 15)) console.log([p.name.slice(0, 28).padEnd(28), 'loc', String(p.loc).padStart(6), 'tools', String(p.tools).padStart(3), 'routes', p.routes, 'slots', p.slots, 'try', p.tryCatch].join(' | '))