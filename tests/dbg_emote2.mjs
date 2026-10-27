import { readFileSync, existsSync } from 'node:fs'
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
let cookieHeader = ''
const p = 'C:/Users/a1599/.dsh/private/bili_cookies.json'
if (existsSync(p)) {
  const c = JSON.parse(readFileSync(p, 'utf8'))
  const arr = Array.isArray(c) ? c : (c.cookies || [])
  cookieHeader = arr.map((x) => x.name + '=' + x.value).join('; ')
  console.log('cookies', arr.length)
}
const r = await fetch('https://api.bilibili.com/x/emote/user/panel/web?business=reply', { headers: { ...UA, cookie: cookieHeader } })
const d = await r.json()
const packs = (d.data && d.data.packages) || []
let n = 0
for (const p of packs) n += (p.emote || []).length
console.log('code', d.code, '| packs', packs.length, '| emotes', n)
const first = (packs[0]?.emote || [])[0]
if (first) console.log('sample', JSON.stringify({ text: first.text, url: first.url }).slice(0, 200))
