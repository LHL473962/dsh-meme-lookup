import { readFileSync } from 'node:fs'
const c = JSON.parse(readFileSync('C:/Users/a1599/.dsh/private/bili_cookies.json', 'utf8'))
const arr = Array.isArray(c) ? c : (c.cookies || [])
const cookie = arr.map((x) => x.name + '=' + x.value).join('; ')
const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/', cookie }
const pop = await (await fetch('https://api.bilibili.com/x/web-interface/popular?ps=3&pn=1', { headers: UA })).json()
for (const v of (pop.data.list || []).slice(0, 2)) {
  const info = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + v.bvid, { headers: UA })).json()
  const aid = info.data.aid
  for (const pn of [1, 2]) {
    const r = await (await fetch('https://api.bilibili.com/x/v2/reply?type=1&oid=' + aid + '&sort=2&ps=20&pn=' + pn, { headers: UA })).json()
    const reps = (r.data && r.data.replies) || []
    console.log(v.bvid, 'pn' + pn, 'code', r.code, '| replies', reps.length, '| total', r.data && r.data.page && r.data.page.count)
    if (reps[0]) console.log('  sample:', reps[0].content.message.slice(0, 40), '| likes', reps[0].like)
  }
  await new Promise((s) => setTimeout(s, 500))
}
