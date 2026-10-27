const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
async function j(u) { const r = await fetch(u, { headers: UA }); return r.json() }
for (const u of ['https://api.bilibili.com/x/web-interface/popular?ps=20&pn=1',
                 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=1&type=all']) {
  try {
    const d = await j(u)
    const list = (d.data && (d.data.list || d.data.archives)) || []
    console.log(u.split('?')[0], '| code', d.code, '| list', list.length, '| first', list[0]?.title?.slice(0, 16), list[0]?.bvid)
  } catch (e) { console.log(u, 'ERR', e.message) }
}
