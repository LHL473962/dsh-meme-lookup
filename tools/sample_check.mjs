// 抽检：两套来源各 15 条，按知止四问判
import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const all = JSON.parse(readFileSync(P + 'lexicon_all.json', 'utf8'))
const dm = JSON.parse(readFileSync(P + 'lexicon_danmaku.json', 'utf8'))
const heat = JSON.parse(readFileSync(P + 'heat_index.json', 'utf8'))
const cfg = JSON.parse(readFileSync('C:/Users/a1599/.dsh/meme-suggest.json', 'utf8'))

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1])
const sampleA = shuffle(all).slice(0, 15).map((e) => ({ from: '库', title: e.title, bvid: e.bvid, tags: e.tags_raw, prov: e.provenance, view: heat[e.bvid] || 0 }))
const sampleB = shuffle(dm).slice(0, 15).map((e) => ({ from: '弹幕', title: e.title, count: e.count }))

async function askModel(items) {
  const list = items.map((x, i) => (i + 1) + '. [' + x.from + '] ' + x.title).join('\n')
  const body = {
    model: cfg.model,
    messages: [
      { role: 'system', content: '你是中文网络用语审校。只输出 JSON 数组，不要解释。' },
      { role: 'user', content: '判断下面每个条目是不是「真正的网络梗」：能说出它被使用的语境（什么时候会有人说它），且不是普通词汇/语气助词碎片。\n' + list + '\n输出：[{"i":1,"is_meme":true/false,"why":"8字内"}]' },
    ],
    max_completion_tokens: 1500,
  }
  const r = await fetch(cfg.baseURL.replace(/\/$/, '') + '/chat/completions', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + cfg.apiKey }, body: JSON.stringify(body),
  })
  const d = await r.json()
  const text = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || ''
  const m = text.match(/\[[\s\S]*\]/)
  return m ? JSON.parse(m[0]) : []
}

const items = sampleA.concat(sampleB)
const verdict = await askModel(items)
const byIdx = new Map(verdict.map((v) => [v.i, v]))
const rows = items.map((x, i) => {
  const v = byIdx.get(i + 1) || {}
  const hasSource = x.from === '库' ? x.prov === 'complete' : false
  const inUse = x.from === '库' ? (x.view > 100000) : (x.count >= 15)
  return { ...x, isMeme: !!v.is_meme, why: v.why || '', hasSource, inUse }
})
writeFileSync(P + 'tests/sample_check.json', JSON.stringify(rows, null, 1))

const stat = (arr, name) => {
  const n = arr.length, m = arr.filter((r) => r.isMeme).length
  const src = arr.filter((r) => r.hasSource).length
  console.log(name, '| 判定为梗', m + '/' + n, '| 有完整出处', src + '/' + n)
}
stat(rows.filter((r) => r.from === '库'), '词条库')
stat(rows.filter((r) => r.from === '弹幕'), '弹幕')
console.log('--- 逐条 ---')
for (const r of rows) console.log(r.from, '|', r.title, '|', r.isMeme ? '梗' : '非梗', '|', r.why)
