import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
const c = JSON.parse(readFileSync('C:/Users/a1599/.dsh/private/bili_cookies.json', 'utf8'))
const arr = Array.isArray(c) ? c : (c.cookies || [])
const cookie = arr.map((x) => x.name + '=' + x.value).join('; ')
const r = await fetch('https://api.bilibili.com/x/emote/user/panel/web?business=reply', { headers: { ...UA, cookie } })
const d = await r.json()
const all = []
for (const p of (d.data && d.data.packages) || []) for (const e of p.emote || []) all.push({ text: e.text, url: e.url })
console.log('emotes', all.length)
const dir = 'D:/VoiceData/house/plugins/dsh-meme-lookup/emotes'
mkdirSync(dir, { recursive: true })
let ok = 0, fail = 0
for (const e of all) {
  const name = e.text.replace(/[\[\]\\/:*?"<>|]/g, '').trim() || ('emote' + ok)
  const path = dir + '/' + name + '.png'
  if (existsSync(path)) { ok++; continue }
  try {
    const img = await fetch(e.url, { headers: UA })
    if (!img.ok) { fail++; continue }
    const buf = Buffer.from(await img.arrayBuffer())
    writeFileSync(path, buf)
    ok++
  } catch { fail++ }
  if (ok % 50 === 0) console.log('downloaded', ok)
  await new Promise((s) => setTimeout(s, 60))
}
console.log('OK', ok, 'FAIL', fail)
