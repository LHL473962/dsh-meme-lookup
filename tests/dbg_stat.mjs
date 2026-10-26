// 测试 B站 stat 接口
const r = await fetch('https://api.bilibili.com/x/web-interface/view?bvid=BV1NBnU6PEzy', { headers: { 'user-agent': 'Mozilla/5.0' } })
const d = await r.json()
console.log(d.code, d.data && d.data.stat && JSON.stringify({view: d.data.stat.view, like: d.data.stat.like, danmaku: d.data.stat.danmaku}))
