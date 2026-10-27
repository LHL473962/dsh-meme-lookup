import { readFileSync } from 'node:fs'
const bduss = readFileSync('C:/Users/a1599/.dsh/private/tieba_bduss.txt', 'utf8').trim()
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36', 'accept-language': 'zh-CN,zh;q=0.9', referer: 'https://tieba.baidu.com/' }
for (const bar of ['抗压背锅吧', '孙笑川吧', '显卡吧']) {
  const u = 'https://tieba.baidu.com/f?kw=' + encodeURIComponent(bar) + '&ie=utf-8'
  try {
    const r = await fetch(u, { headers: { ...UA, cookie: 'BDUSS=' + bduss } })
    const t = await r.text()
    const blocked = /百度安全验证|请完成下方验证/.test(t)
    const links = new Set([...t.matchAll(/\/p\/(\d{6,})/g)].map(m => m[1]))
    console.log(bar, '| status', r.status, '| blocked', blocked, '| threads', links.size, '| len', t.length)
  } catch (e) { console.log(bar, 'ERR', e.message.slice(0, 60)) }
  await new Promise(s => setTimeout(s, 1500))
}