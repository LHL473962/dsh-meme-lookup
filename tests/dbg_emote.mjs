const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
const u = 'https://api.bilibili.com/x/emote/user/panel/web?business=reply'
const r = await fetch(u, { headers: UA })
const d = await r.json()
console.log('code', d.code)
const packs = (d.data && d.data.packages) || []
console.log('packs', packs.length)
let n = 0
for (const p of packs.slice(0, 3)) console.log(' pack:', p.text, '| emotes', (p.emote||[]).length, '| sample', (p.emote||[])[0]?.text)
for (const p of packs) n += (p.emote || []).length
console.log('total emotes', n)
const first = (packs[0]?.emote || [])[0]
if (first) console.log('sample:', JSON.stringify({ text: first.text, url: first.url, size: first.size }))
