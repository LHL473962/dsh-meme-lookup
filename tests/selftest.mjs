// 自检：跑一轮确定性的检查，输出 PASS/FAIL 报告（给另一台机器上的 AI 用）
import { writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { apply } from '../index.js'

// 正式参数：--simulate=429|500|404|offline
// 只拦 cnmeme.wiki，用来复现 SKIP（429/500/offline）与 ENTRY_GONE（404）分支，不碰真实网络
const args = process.argv.slice(2)
const sim = (args.find((a) => a.startsWith('--simulate=')) || '').split('=')[1] || ''
if (sim) {
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, opts) => {
    if (String(url).includes('cnmeme.wiki')) {
      if (sim === 'offline') throw new Error('simulated offline')
      const status = sim === '429' ? 429 : sim === '500' ? 500 : sim === '404' ? 404 : Number(sim) || 429
      return { ok: false, status }
    }
    return realFetch(url, opts)
  }
}

// ENTRY_GONE：单次只 WARN，连续 N 天才 FAIL（词条真被删一次不该把 CI 打红）
const ENTRY_GONE_FAIL_DAYS = Math.max(1, Number((args.find((a) => a.startsWith('--entry-gone-streak=')) || '').split('=')[1]) || 3)
// 测试专用：模拟 404 也走真实连续计数（默认模拟不落盘，保证可重复）
const ENTRY_GONE_USE_STATE = args.includes('--entry-gone-use-state')
const SELFTEST_STATE = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'meme-selftest-state.json')
const pad2 = (n) => String(n).padStart(2, '0')
function dayKey(offset = 0) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
function readState() {
  try { return JSON.parse(readFileSync(SELFTEST_STATE, 'utf8')) || {} } catch { return {} }
}
function bumpEntryGoneStreak() {
  if (sim && !ENTRY_GONE_USE_STATE) return 1 // 模拟默认不落盘，保证可重复
  const st = readState()
  const keep = new Set(Array.isArray(st.entryGone) ? st.entryGone : [])
  keep.add(dayKey(0))
  let streak = 0
  while (keep.has(dayKey(-streak))) streak++
  const pruned = [...keep].filter((d) => d >= dayKey(-30)).sort()
  try { writeFileSync(SELFTEST_STATE, JSON.stringify({ ...st, entryGone: pruned }, null, 2)) } catch {}
  return streak
}
function resetEntryGone() {
  if (sim && !ENTRY_GONE_USE_STATE) return
  const st = readState()
  if (!st.entryGone) return
  delete st.entryGone
  try { writeFileSync(SELFTEST_STATE, JSON.stringify(st, null, 2)) } catch {}
}

const tools = []
apply({ tools: { register: (t) => tools.push(t) } })
const get = (n) => tools.find((t) => t.name === n)
const results = []
const add = (name, ok, detail) => results.push({ name, ok, detail })
const addSkip = (name, detail) => results.push({ name, ok: true, skipped: true, detail })
const addWarn = (name, detail) => results.push({ name, ok: true, warned: true, detail })

async function safe(name, fn) {
  try {
    const d = await fn()
    if (d && d.warn) addWarn(name, d.detail)
    else if (d && d.skip) addSkip(name, d.detail)
    else add(name, true, d)
  } catch (e) { add(name, false, String((e && e.message) || e)) }
}

// 1. 工具齐全
await safe('工具注册', async () => {
  const need = ['meme_lookup','meme_understand','meme_coach','meme_chat','meme_suggest','meme_screen','meme_emote','meme_settings','meme_add','meme_sync']
  const have = tools.map((t) => t.name)
  const miss = need.filter((n) => !have.includes(n))
  if (miss.length) throw new Error('缺工具: ' + miss.join(','))
  return have.length + ' 个工具'
})

// 2. emoji 变体
await safe('emoji 变体识别', async () => {
  const r = await get('meme_chat').execute({ text: '🧊🧊🧊 这操作' })
  const hit = (r.memes || []).some((m) => m.canonical === '冰冰冰')
  if (!hit) throw new Error('没识别出 冰冰冰: ' + JSON.stringify(r.memes))
  return '冰冰冰 OK'
})

// 3. 句式模板
await safe('句式模板识别', async () => {
  const r = await get('meme_chat').execute({ text: '我贷了笔大的，让你们能睡个好觉' })
  const hit = (r.memes || []).some((m) => String(m.canonical).includes('贷'))
  if (!hit) throw new Error('没识别出「贷笔大的」: ' + JSON.stringify(r.memes))
  return '贷笔大的 OK'
})

// 4. 不存在的梗不许编（上游不可用就 SKIP——「查不到」不能当成「不编造」的证据）
await safe('假梗不编造', async () => {
  const r = await get('meme_coach').execute({ text: '猫咪陀螺仪' })
  if (r && r.error) return { skip: true, detail: r.error + '，本轮跳过' }
  const verdict = String(r.verdict || '')
  const bad = /USABLE|USE_WITH_CARE/.test(verdict)
  if (bad) throw new Error('对假梗给出了 ' + verdict + '，可能编造')
  return '未给正面判定: ' + verdict
})

// 5. 已知梗有判定：限流/上游 SKIP；ENTRY_GONE 单次 WARN、连续 N 天 FAIL；UNKNOWN FAIL
await safe('已知梗判定', async () => {
  const r = await get('meme_coach').execute({ text: '芭比Q' })
  if (r && (r.error === 'RATE_LIMITED' || r.error === 'UPSTREAM_ERROR')) return { skip: true, detail: r.error + '，本轮跳过' }
  if (r && r.error === 'ENTRY_GONE') {
    const days = bumpEntryGoneStreak()
    if (days >= ENTRY_GONE_FAIL_DAYS) throw new Error(`词条详情 404 已连续 ${days} 天（数据变了，不是限流）: ${String(r.hint || '')}`)
    return { warn: true, detail: `ENTRY_GONE 第 ${days} 天（单次只 WARN，连续 ${ENTRY_GONE_FAIL_DAYS} 天才 FAIL）` }
  }
  if (!r.verdict) throw new Error('无 verdict' + (r && r.error ? '（' + r.error + '）' : ''))
  if (r.verdict === 'UNKNOWN') throw new Error('已知梗被判 UNKNOWN（非上游故障）: ' + String(r.reason || r.label || ''))
  resetEntryGone() // 详情正常，清零 ENTRY_GONE 连续计数
  return r.verdict + ' / 出处 ' + r.provenance
})

// 6. 设置往返
await safe('设置读写', async () => {
  await get('meme_settings').execute({ action: 'set', tendency: 0, density: 0 })
  const g = await get('meme_settings').execute({ action: 'get' })
  if (g.settings.tendency !== 0 || g.settings.density !== 0) throw new Error('没存上: ' + JSON.stringify(g.settings))
  const r = await get('meme_chat').execute({ text: '笑死我了，这操作' })
  if (r.policy && r.policy.use_meme === true) throw new Error('稳重模式还在玩梗')
  await get('meme_settings').execute({ action: 'set', tendency: 1, density: 1 })
  return '稳重模式生效'
})

// 7. 用户加梗能被识别
await safe('用户加梗生效', async () => {
  const mark = '自检梗' + Date.now().toString(36)
  await get('meme_add').execute({ title: mark, meaning: '自检用', usage: '测试' })
  const r = await get('meme_chat').execute({ text: mark })
  const hit = (r.memes || []).some((m) => m.canonical === mark)
  if (!hit) throw new Error('刚加完就认不出（可能没重载）')
  // 清理：别把自检条目留在用户词库里
  try {
    const { readFileSync: rf, writeFileSync: wf } = await import('node:fs')
    const { join } = await import('node:path')
    const { homedir } = await import('node:os')
    const p = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'meme-user-lexicon.json')
    const list = JSON.parse(rf(p, 'utf8')).filter((e) => e.title !== mark)
    wf(p, JSON.stringify(list, null, 2))
  } catch {}
  return mark + ' OK'
})

// 8. 面板服务：先验 apply 真的注册了 /api/meme-panel（设置页的数据源），再看独立面板在不在
await safe('面板服务', async () => {
  let route = null
  const fake = {
    tools: { register: () => {} },
    effect: (fn) => fn(),
    webServer: { register: (r) => { route = r } },
  }
  apply(fake)
  if (!route || route.path !== '/api/meme-panel') throw new Error('apply 没注册 /api/meme-panel 路由')
  let body = null
  const res = { writeHead: () => {}, end: (s) => { body = s } }
  await route.handler({ url: '/settings', method: 'GET', headers: {} }, res)
  const data = JSON.parse(body)
  if (typeof data.tendency !== 'number') throw new Error('路由返回不是设置: ' + String(body).slice(0, 120))
  try {
    const r = await fetch('http://127.0.0.1:8797/', { signal: AbortSignal.timeout(1500) })
    if (r.ok) return '路由 OK + 独立面板 HTTP ' + r.status
  } catch {}
  return '路由 OK（独立面板未启动，可选）'
})

// 学自 dsh-ops 的 verify-body-caps：不变量要有测试盯着
await safe('请求体上限覆盖', async () => {
  const { readFileSync: rf } = await import('node:fs')
  const { join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const here = fileURLToPath(new URL('..', import.meta.url))
  // 拆模块后读 body 的代码可能在 lib/ 里（还可能再分层）——递归扫全部 .js
  const files = [join(here, 'index.js')]
  const { readdirSync: rd } = await import('node:fs')
  const walk = (dir) => {
    for (const ent of rd(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name)
      if (ent.isDirectory()) walk(p)
      else if (ent.name.endsWith('.js')) files.push(p)
    }
  }
  try { walk(join(here, 'lib')) } catch {}
  let sites = 0
  const bad = []
  for (const file of files) {
    const src = rf(file, 'utf8')
    for (const m of src.matchAll(/for await \(const c of req\)/g)) {
      sites++
      if (!/32 \* 1024|MAX_BODY|maxBytes/.test(src.slice(m.index, m.index + 320))) bad.push(file + ':' + m.index)
    }
  }
  if (!sites) throw new Error('没找到读请求体的代码——不变量没人盯着了')
  if (bad.length) throw new Error(`${bad.length} 处读请求体没有字节上限: ${bad.join(', ')}`)
  return `${files.length} 个文件，${sites} 处都有上限`
})

// 学自 anysearch 的 version.js：版本常量必须与 package.json 一致
await safe('版本一致', async () => {
  const { readFileSync: rf } = await import('node:fs')
  const { join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const here = fileURLToPath(new URL('..', import.meta.url))
  const pkg = JSON.parse(rf(join(here, 'package.json'), 'utf8'))
  const mod = await import('../index.js')
  if (mod.VERSION !== pkg.version) throw new Error(`VERSION=${mod.VERSION} 与 package.json ${pkg.version} 不一致`)
  return mod.VERSION
})

// 学自 openwrite/writeIfChanged：内容不变就不该改写文件
await safe('设置写入幂等', async () => {
  const { statSync: st } = await import('node:fs')
  const { join } = await import('node:path')
  const { homedir } = await import('node:os')
  const p = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'meme-settings.json')
  await get('meme_settings').execute({ action: 'set', tendency: 1, density: 1 })
  const a = st(p).mtimeMs
  await new Promise((r) => setTimeout(r, 20))
  await get('meme_settings').execute({ action: 'set', tendency: 1, density: 1 })
  const b = st(p).mtimeMs
  if (a !== b) throw new Error('相同内容仍改写了文件')
  return '未改写'
})
// 学自 dsh-tools：参数必须是 JSON Schema，扁平 map 会被 provider 拒
await safe('工具 schema 合法', async () => {
  const bad = tools.filter((t) => !t.parameters || t.parameters.type !== 'object' || !t.parameters.properties)
  if (bad.length) throw new Error(`${bad.length} 个工具参数不是 object schema: ${bad.map((b) => b.name).join(',')}`)
  return `${tools.length} 个都是 object schema`
})
const pass = results.filter((r) => r.ok && !r.skipped && !r.warned).length
const fail = results.filter((r) => !r.ok).length
const skip = results.filter((r) => r.skipped).length
const warn = results.filter((r) => r.warned).length
const reportPath = args.find((a) => !a.startsWith('--')) || 'selftest-report.md'
const report = ['# 自检报告', '', '时间：' + new Date().toISOString(), '']
  .concat(sim ? ['模拟：--simulate=' + sim + '（只影响 cnmeme.wiki）', ''] : [])
  .concat(['通过 ' + pass + ' / 跳过 ' + skip + ' / 警告 ' + warn + ' / 失败 ' + fail, '', '| 检查 | 结果 | 说明 |', '|---|---|---|'])
  .concat(results.map((r) => '| ' + r.name + ' | ' + (r.warned ? 'WARN' : r.skipped ? 'SKIP' : r.ok ? 'PASS' : '**FAIL**') + ' | ' + String(r.detail).replace(/\|/g, '/').slice(0, 120) + ' |'))
  .join('\n')
console.log(report)
writeFileSync(reportPath, report, 'utf8')
process.exit(fail > 0 ? 1 : 0)