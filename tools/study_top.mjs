// 学完：按 star 取前 60 个，下载 tarball，抽 manifest + 主文件特征
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
const OUT = 'D:/VoiceData/house/plugins/dsh-meme-lookup/studies/'
const cat = JSON.parse(readFileSync(OUT + 'catalog.json', 'utf8'))
const top = cat.filter((p) => p.npm).sort((a, b) => Number(b.stars || 0) - Number(a.stars || 0)).slice(0, 60)
console.log('top targets', top.length, '| star sum', top.reduce((s, p) => s + Number(p.stars || 0), 0))
const tmp = OUT + 'tmp'
rmSync(tmp, { recursive: true, force: true })
mkdirSync(tmp, { recursive: true })
const rows = []
for (const p of top) {
  const name = p.npm
  try {
    const r = await fetch('https://registry.npmjs.org/' + encodeURIComponent(name) + '/latest', { headers: { 'user-agent': 'dsh-study' } })
    if (!r.ok) { rows.push({ name, stars: p.stars, err: 'latest ' + r.status }); continue }
    const j = await r.json()
    const tgz = j.dist && j.dist.tarball
    const dir = tmp + '/' + name.replace(/[@/]/g, '_')
    mkdirSync(dir, { recursive: true })
    execSync('curl -sL "' + tgz + '" | tar xz -C "' + dir + '" --strip-components=1', { shell: 'bash', timeout: 60000 })
    const pkg = JSON.parse(readFileSync(dir + '/package.json', 'utf8'))
    const main = pkg.main || 'index.js'
    let head = ''
    try { head = readFileSync(dir + '/' + main, 'utf8').slice(0, 20000) } catch {}
    let libFiles = 0
    try { libFiles = readdirSync(dir + '/lib').length } catch {}
    rows.push({
      name, stars: p.stars, version: pkg.version,
      redLines: Array.isArray(pkg.capabilityRedLines) ? pkg.capabilityRedLines.length : 0,
      hasIcon: Boolean(pkg.exports && Object.keys(pkg.exports).some((k) => k === './icon')),
      hasLocale: Boolean(pkg.exports && Object.keys(pkg.exports).some((k) => k.includes('locale'))),
      hasSelfupdate: /selfupdate/.test(head) || existsSync(dir + '/lib/selfupdate.mjs'),
      usesDefineTool: /defineTool/.test(head),
      usesCtxTools: /ctx\.tools\.register/.test(head),
      toolCount: (head.match(/name:\s*['\"][a-z0-9_]+['\"]/g) || []).length,
      libFiles,
      compat: Boolean(pkg.dsh && pkg.dsh.compatibility),
      client: Boolean(pkg.dsh && pkg.dsh.client),
      desc: String((pkg.description || '')).slice(0, 60),
    })
    console.log('ok', name, 'tools~', (head.match(/name:\s*['\"][a-z0-9_]+['\"]/g) || []).length)
  } catch (e) { rows.push({ name, stars: p.stars, err: String(e.message).slice(0, 50) }) }
}
writeFileSync(OUT + 'top50.json', JSON.stringify(rows, null, 1))
console.log('FINAL', rows.length, '| ok', rows.filter((r) => !r.err).length)