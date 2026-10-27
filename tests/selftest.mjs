// 自检：跑一轮确定性的检查，输出 PASS/FAIL 报告（给另一台机器上的 AI 用）
import { writeFileSync } from 'node:fs'
import { apply } from '../index.js'

const tools = []
apply({ tools: { register: (t) => tools.push(t) } })
const get = (n) => tools.find((t) => t.name === n)
const results = []
const add = (name, ok, detail) => results.push({ name, ok, detail })

async function safe(name, fn) {
  try { const d = await fn(); add(name, true, d) } catch (e) { add(name, false, String((e && e.message) || e)) }
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

// 4. 不存在的梗不许编
await safe('假梗不编造', async () => {
  const r = await get('meme_coach').execute({ text: '猫咪陀螺仪' })
  const verdict = String(r.verdict || '')
  const bad = /USABLE|USE_WITH_CARE/.test(verdict)
  if (bad) throw new Error('对假梗给出了 ' + verdict + '，可能编造')
  return '未给正面判定: ' + verdict
})

// 5. 已知梗有判定
await safe('已知梗判定', async () => {
  const r = await get('meme_coach').execute({ text: '芭比Q' })
  if (!r.verdict) throw new Error('无 verdict')
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
  return mark + ' OK'
})

// 8. 面板服务（可选）
await safe('面板服务', async () => {
  const r = await fetch('http://127.0.0.1:8797/', { signal: AbortSignal.timeout(1500) })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return 'HTTP ' + r.status
})

const pass = results.filter((r) => r.ok).length
const fail = results.length - pass
const report = ['# 自检报告', '', '时间：' + new Date().toISOString(), '', '通过 ' + pass + ' / 失败 ' + fail, '', '| 检查 | 结果 | 说明 |', '|---|---|---|']
  .concat(results.map((r) => '| ' + r.name + ' | ' + (r.ok ? 'PASS' : '**FAIL**') + ' | ' + String(r.detail).replace(/\|/g, '/').slice(0, 120) + ' |'))
  .join('\n')
console.log(report)
writeFileSync(process.argv[2] || 'selftest-report.md', report, 'utf8')
process.exit(fail > 0 ? 1 : 0)