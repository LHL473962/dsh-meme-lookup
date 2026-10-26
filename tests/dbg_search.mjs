const UA = { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' }
for (const kw of ['梁子变祖器', 'yyds', '大肥鱼']) {
  const url = 'https://api.bilibili.com/x/web-interface/search/all/v2?keyword=' + encodeURIComponent(kw)
  const r = await fetch(url, { headers: UA })
  const d = await r.json()
  const items = (d.data && d.data.result) || []
  const video = items.find((x) => x.result_type === 'video')
  const n = video ? (video.data || []).length : 0
  const dates = video ? (video.data || []).map((v) => v.pubdate).filter(Boolean).sort((a, b) => b - a).slice(0, 3) : []
  console.log(kw, '| code', d.code, '| videos', n, '| newest', dates.map((t) => new Date(t * 1000).toISOString().slice(0, 10)).join(','))
}
