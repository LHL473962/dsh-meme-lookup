const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
async function j(u) { const r = await fetch(u, { headers: UA }); return r.json() }
// 1) 排行榜
const rank = await j('https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all')
const list = (rank.data && rank.data.list) || []
console.log('ranking', list.length, '| first:', list[0]?.title?.slice(0, 20), list[0]?.bvid, 'aid', list[0]?.aid)
// 2) 取 cid
if (list[0]) {
  const v = await j('https://api.bilibili.com/x/web-interface/view?bvid=' + list[0].bvid)
  const cid = v.data?.cid
  console.log('cid', cid, '| views', v.data?.stat?.view)
  // 3) 弹幕 XML
  const r = await fetch('https://comment.bilibili.com/' + cid + '.xml', { headers: UA })
  const buf = await r.arrayBuffer()
  const txt = new TextDecoder('utf-8').decode(buf)
  const m = txt.match(/<d p="[^"]*">([^<]*)<\/d>/g) || []
  console.log('danmaku raw', r.status, '| items', m.length)
  console.log('sample:', m.slice(0, 3).map((x) => x.replace(/<[^>]+>/g, '')).join(' | '))
  // 4) 评论
  const c = await j('https://api.bilibili.com/x/v2/reply?type=1&oid=' + v.data.aid + '&sort=2&ps=20&pn=1')
  const reps = (c.data && c.data.replies) || []
  console.log('comments', reps.length, '| sample:', reps[0]?.content?.message?.slice(0, 30))
}
