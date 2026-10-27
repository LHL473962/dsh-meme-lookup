// 贴吧只读采集：只 GET 帖子页，不登录发言、不点赞、不回帖
// 用法：TIEBA_BDUSS=xxx node tools/harvest_tieba.mjs --bars 抗压背锅吧,孙笑川吧 --threads 20
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
const HOME = process.env.DSH_HOME || join(homedir(), '.dsh')

function getBduss() {
  if (process.env.TIEBA_BDUSS) return process.env.TIEBA_BDUSS.trim()
  const f = join(HOME, 'private', 'tieba_bduss.txt')
  if (existsSync(f)) return readFileSync(f, 'utf8').trim()
  return ''
}
function arg(name, def) {
  const i = process.argv.indexOf('--' + name)
  return i > 0 ? process.argv[i + 1] : def
}
const sleep = (ms) => new Promise((s) => setTimeout(s, ms))
const UA = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'accept-language': 'zh-CN,zh;q=0.9',
  referer: 'https://tieba.baidu.com/',
}
const HIT = /就这|急了|什么成分|典|孝|绷|建议|谁问|差不多得了|放尊重|逆天|图样|说人话|证据|你最好|没人关心|难绷|得寸进尺|收收味|味太冲|很急|急死|可笑|破防|摆烂|抽象|乐|闹麻|带派|乐子|哥们|属实/
const bduss = getBduss()
if (!bduss) {
  console.log('没有 BDUSS。取法：贴吧网页登录后，F12 → Application → Cookies → tieba.baidu.com → 复制 BDUSS')
  console.log('然后：TIEBA_BDUSS=<值> node tools/harvest_tieba.mjs --bars 抗压背锅吧 --threads 20')
  process.exit(2)
}
const cookie = 'BDUSS=' + bduss
const bars = String(arg('bars', '抗压背锅吧')).split(',').map((s) => s.trim()).filter(Boolean)
const maxThreads = Number(arg('threads', '20'))
const out = []
let fetched = 0

for (const bar of bars) {
  for (let pn = 0; pn < 2; pn++) {
    const listUrl = 'https://tieba.baidu.com/f?kw=' + encodeURIComponent(bar) + '&ie=utf-8&pn=' + pn * 50
    let html = ''
    try {
      const r = await fetch(listUrl, { headers: { ...UA, cookie } })
      html = await r.text()
      if (r.status !== 200 || /百度安全验证/.test(html)) { console.log('被拦：', bar, r.status); break }
    } catch (e) { console.log('列表失败', e.message.slice(0, 60)); break }
    const links = [...new Set([...html.matchAll(/\/p\/(\d{6,})/g)].map((m) => m[1]))].slice(0, maxThreads)
    console.log(bar, 'page', pn + 1, 'threads', links.length)
    for (const tid of links) {
      if (fetched >= maxThreads * bars.length) break
      try {
        const r = await fetch('https://tieba.baidu.com/p/' + tid, { headers: { ...UA, cookie } })
        const t = await r.text()
        if (r.status !== 200 || /百度安全验证/.test(t)) continue
        const posts = [...t.matchAll(/<div[^>]*class="[^"]*d_post_content[^"]*"[^>]*>([\s\S]*?)<\/div>/g)]
          .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ''))
        for (const p of posts) {
          for (const seg of p.split(/[，。！？,.!?~～]/)) {
            if (seg.length < 2 || seg.length > 14) continue
            if (!HIT.test(seg)) continue
            out.push({ line: seg, tid, bar })
          }
        }
        fetched++
      } catch {}
      await sleep(1200)
    }
  }
}
// 计数
const map = new Map()
for (const o of out) map.set(o.line, (map.get(o.line) || 0) + 1)
const rows = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 200).map(([line, n]) => ({ line, n }))
writeFileSync(P + 'tieba_lines.json', JSON.stringify(rows, null, 1))
console.log('帖数', fetched, '| 抓到句子', out.length, '| 去重', rows.length)
console.log('top:', rows.slice(0, 12).map((r) => r.line + '(' + r.n + ')').join(' '))
