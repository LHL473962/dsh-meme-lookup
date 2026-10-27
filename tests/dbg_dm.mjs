const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
async function j(u) { const r = await fetch(u, { headers: UA }); return r.json() }
const pop = await j('https://api.bilibili.com/x/web-interface/popular?ps=5&pn=1')
for (const v of (pop.data.list || []).slice(0, 3)) {
  const d = await j('https://api.bilibili.com/x/web-interface/view?bvid=' + v.bvid)
  const cid = d.data?.cid, aid = d.data?.aid
  const xml = await (await fetch('https://comment.bilibili.com/' + cid + '.xml', { headers: UA })).text()
  const dm = [...xml.matchAll(/<d p="[^"]*">([^<]*)<\/d>/g)].map((m) => m[1])
  const c = await j('https://api.bilibili.com/x/v2/reply?type=1&oid=' + aid + '&sort=2&ps=20&pn=1')
  const reps = ((c.data && c.data.replies) || []).map((r) => r.content.message)
  console.log(v.title.slice(0, 14), '| dm', dm.length, '| comments', reps.length)
  console.log('  dm sample:', dm.slice(0, 5).join(' / '))
  console.log('  cm sample:', reps.slice(0, 2).map((s) => s.slice(0, 24)).join(' / '))
  await new Promise((s) => setTimeout(s, 600))
}
