import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const CFG = join(HOME, 'meme-settings.json')
const LEX = join(HOME, 'meme-user-lexicon.json')
const PORT = Number(process.env.MEME_PANEL_PORT || 8797)
const readJson = (p, d) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return d } }
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2))
function normalizeEntry(e) {
  const source = String(e.source || '')
  let sourceType = e.sourceType
  if (!sourceType) {
    if (/BV|av\d|https?:/i.test(source)) sourceType = '有 BV'
    else if (/自创|自己编/.test(source)) sourceType = '自创'
    else sourceType = '出处不详'
  }
  const variants = Array.isArray(e.variants) ? e.variants : String(e.variants || '').split(',').map((x) => x.trim()).filter(Boolean)
  const tone = Array.isArray(e.tone) ? e.tone : (e.tone ? [String(e.tone)] : [])
  return { ...e, sourceType, variants, tone }
}

const DEFAULT = { tendency: 1, density: 1, allowRisky: false, autoUpdate: true }
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))

const CSS = [
  ':root{--bg:#161B26;--card:#1E2A3C;--line:#2A3A52;--text:#E2E8F0;--sub:#94A3B8;--accent:#7C6BFF;--danger:#FF5252}',
  '*{box-sizing:border-box}body{margin:0;background:#0B0F16;color:var(--text);font:14px/1.6 "Microsoft YaHei",system-ui}',
  '.wrap{width:420px;margin:24px auto;padding:0 16px}',
  'h2{font-size:15px;margin:0 0 12px;color:var(--sub);font-weight:400}',
  '.card{background:var(--card);border-radius:12px;padding:16px;margin-bottom:12px}',
  '.seg{display:flex;background:#121826;border-radius:10px;padding:4px;gap:4px}',
  '.seg button{flex:1;height:32px;border:0;border-radius:8px;background:transparent;color:var(--sub);font:inherit;cursor:pointer}',
  '.seg button.on{background:var(--accent);color:#fff}',
  '.row{display:flex;align-items:center;justify-content:space-between;height:40px;margin-top:8px}',
  '.sw{width:36px;height:20px;border-radius:10px;background:#2A3A52;position:relative;cursor:pointer;flex:none}',
  '.sw.on{background:var(--accent)}.sw i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.15s}',
  '.sw.on i{left:18px}',
  'label{display:block;color:var(--sub);font-size:12px;margin:10px 0 4px}',
  'label b{color:var(--danger);font-weight:400}',
  'input,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:6px;color:var(--text);padding:6px 8px;font:inherit;height:34px}',
  'textarea{height:64px;resize:vertical}input:focus,textarea:focus{outline:0;border-color:var(--accent)}',
  '.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}',
  '.tag{padding:4px 10px;border-radius:14px;border:1px solid var(--line);color:var(--sub);cursor:pointer;font-size:12px}',
  '.tag.on{border-color:var(--accent);color:#fff;background:rgba(124,107,255,.18)}',
  'details{margin-top:10px}summary{cursor:pointer;color:var(--sub);font-size:12px}',
  '.actions{display:flex;gap:8px;margin-top:14px}',
  '.btn{flex:1;height:36px;border-radius:8px;border:0;font:inherit;cursor:pointer}',
  '.ghost{background:transparent;color:var(--sub);border:1px solid var(--line)}',
  '.primary{background:var(--accent);color:#fff}',
  '.err{color:var(--danger);font-size:12px;margin-top:4px;display:none}',
  '.item{border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin-top:8px;background:#141B27}',
  '.item .t{font-size:13px;color:var(--text)}',
  '.item .m{font-size:12px;color:var(--sub);margin-top:2px;white-space:pre-wrap}',
  '.item .bar{display:flex;gap:8px;margin-top:6px}',
  '.mini{font-size:12px;padding:2px 10px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--sub);cursor:pointer}',
  '.badge{font-size:11px;padding:1px 8px;border-radius:10px;margin-left:6px}',
  '.priv{background:#243247;color:#9FB3D1}.pub{background:#2A2340;color:#C4B5FD}',
].join('\n')

const HTML = [
  '<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>梗插件面板</title><style>'+CSS+'</style></head><body><div class="wrap">',
  '<h2>玩梗开关</h2><div class="card">',
  '<label>玩梗倾向</label><div class="seg" id="tend">',
  '<button data-v="0" class="{{T0}}">稳重</button><button data-v="1" class="{{T1}}">正常</button><button data-v="2" class="{{T2}}">活泛</button></div>',
  '<label>玩梗浓度</label><div class="seg" id="dens">',
  '<button data-v="0" class="{{D0}}">0 关</button><button data-v="1" class="{{D1}}">1 克制</button><button data-v="2" class="{{D2}}">2 适中</button><button data-v="3" class="{{D3}}">3 放飞</button></div>',
  '<div class="row"><span>允许「慎用」级梗</span><div class="sw {{RISKY}}" id="risky"><i></i></div></div>',
  '<div class="row"><span>允许自动更新词库</span><div class="sw {{AUTO}}" id="auto"><i></i></div></div>',
  '</div>',
  '<h2>手动加梗</h2><div class="card">',
  '<label>梗名 <b>*</b></label><input id="title" placeholder="例：脑子下班了">',
  '<label>条目类型</label><div class="seg" id="kind"><button data-v="meme" class="on">网络梗</button><button data-v="phrase">私人用语</button></div>',
  '<label>这梗哪来的 <b>*</b></label>',
  '<div class="tags" id="srcs"><span class="tag" data-v="自创">自己编的</span><span class="tag" data-v="出处不详">出处不详</span><span class="tag" data-v="有 BV">有 BV/链接</span></div>',
  '<input id="source" placeholder="选了「有 BV」再填 BV 号；其他情况可留空">',
  '<label>含义与场景 <b>*</b>（大白话：什么意思、什么时候用）</label><textarea id="meaning" placeholder="例：下班了但嘴还在吐槽，用来自嘲"></textarea>',
  '<label>语气倾向（可选，可多选，不确定就不选）</label><div class="tags" id="tones">',
  '<span class="tag" data-v="搞笑">搞笑</span><span class="tag" data-v="嘲讽">嘲讽</span><span class="tag" data-v="自黑">自黑</span><span class="tag" data-v="赞叹">赞叹</span><span class="tag" data-v="不确定">不确定</span></div>',
  '<details><summary>+ 补充（选填）</summary>',
  '<label>别用场景</label><input id="avoid" placeholder="例：正式场合别用">',
  '<label>示例句</label><input id="example" placeholder="例：先别庆功，跑一下">',
  '<label>变体（逗号分隔）</label><input id="variants" placeholder="🧊🧊🧊, 冰冰冰">',
  '</details>',
  '<div class="err" id="err"></div>',
  '<div class="actions"><button class="btn ghost" id="cancel">清空</button><button class="btn primary" id="save">保存到私人库</button></div>',
  '<label style="margin-top:12px">可见范围</label><div class="seg" id="vis"><button data-v="private" class="on">仅自己</button><button data-v="public">申请公开</button></div>',
  '</div>',
  '<h2>我加的梗（{{COUNT}}）</h2><div class="card">{{LEX}}</div>',
  '</div><script>',
  'const st={tendency:{{TT}},density:{{DD}},allowRisky:{{RR}},autoUpdate:{{AA}}};',
  'const pick=(id,key)=>{document.querySelectorAll("#"+id+" button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#"+id+" button").forEach(x=>x.classList.remove("on"));b.classList.add("on");st[key]=Number(b.dataset.v);persist()})};',
  'pick("tend","tendency");pick("dens","density");',
  'document.getElementById("risky").onclick=e=>{e.currentTarget.classList.toggle("on");st.allowRisky=e.currentTarget.classList.contains("on");persist()};',
  'document.getElementById("auto").onclick=e=>{e.currentTarget.classList.toggle("on");st.autoUpdate=e.currentTarget.classList.contains("on");persist()};',
  'async function persist(){await fetch("/api/settings",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(st)})}',
  'let src="";document.querySelectorAll("#srcs .tag").forEach(t=>t.onclick=()=>{document.querySelectorAll("#srcs .tag").forEach(x=>x.classList.remove("on"));src=t.dataset.v;t.classList.add("on")});',
  'const tones=new Set();document.querySelectorAll("#tones .tag").forEach(t=>t.onclick=()=>{t.classList.toggle("on");t.classList.contains("on")?tones.add(t.dataset.v):tones.delete(t.dataset.v)});',
  'let kind="meme";document.querySelectorAll("#kind button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#kind button").forEach(x=>x.classList.remove("on"));b.classList.add("on");kind=b.dataset.v});',
  'let vis="private";document.querySelectorAll("#vis button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#vis button").forEach(x=>x.classList.remove("on"));b.classList.add("on");vis=b.dataset.v});',
  'const $=id=>document.getElementById(id);',
  'window.editItem=function(i){const d=window.__LEX[i];$("title").value=d.title||"";$("source").value=d.source||"";$("meaning").value=d.meaning||"";$("avoid").value=d.avoid||"";$("example").value=d.example||"";$("variants").value=(d.variants||[]).join(", ");src=d.sourceType||"";document.querySelectorAll("#srcs .tag").forEach(t=>t.classList.toggle("on",t.dataset.v===src));tones.clear();(d.tone||[]).forEach(v=>{tones.add(v);document.querySelectorAll("#tones .tag").forEach(t=>{if(t.dataset.v===v)t.classList.add("on")})});window.scrollTo(0,0)};',
  'window.delItem=async function(i){if(!confirm("删掉这条？"))return;await fetch("/api/userlex?id="+encodeURIComponent(i),{method:"DELETE"});location.reload()};',
  '$("cancel").onclick=()=>location.reload();',
  '$("save").onclick=async()=>{',
  '  const title=$("title").value.trim(), meaning=$("meaning").value.trim(), err=$("err");',
  '  const source=$("source").value.trim();',
  '  let srcType=src; if(!srcType){srcType=source?"有 BV":"出处不详"}',
  '  if(!title||!meaning){err.textContent="梗名和含义要填";err.style.display="block";return}',
  '  if(srcType==="有 BV"&&!source){err.textContent="选了「有 BV」就把 BV 号填上";err.style.display="block";return}',
  '  err.style.display="none";',
  '  const body={kind,title,meaning,source,sourceType:srcType,tone:[...tones],avoid:$("avoid").value,example:$("example").value,variants:$("variants").value,visibility:vis};',
  '  const r=await fetch("/api/userlex",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});',
  '  if(r.ok){location.reload()}else{err.textContent="保存失败";err.style.display="block"}',
  '};',
  '</script></body></html>',
].join('')

function render(s, lex) {
  const on = (v, t) => (v === t ? 'on' : '')
  const items = (lex || []).map((e, i) => {
    const vs = Array.isArray(e.variants) ? e.variants : String(e.variants || '').split(',').map((x) => x.trim()).filter(Boolean)
    const badge = e.visibility === 'public' ? '<span class="badge pub">申请公开·' + (e.review || 'pending') + '</span>' : '<span class="badge priv">仅自己</span>'
    return '<div class="item"><div class="t">' + esc(e.title) + (e.kind === 'phrase' ? '<span class="badge priv">私人用语</span>' : '') + badge + '</div>' +
      '<div class="m">' + esc(e.meaning) + '</div>' +
      '<div class="m">来源：' + esc(e.sourceType || (e.source ? '有 BV' : '出处不详')) + (e.source ? ' · ' + esc(e.source) : '') + (e.tone && e.tone.length ? ' · 语气：' + esc(e.tone.join('/')) : '') + '</div>' +
      (e.avoid ? '<div class="m">别用：' + esc(e.avoid) + '</div>' : '') +
      (e.example ? '<div class="m">例句：' + esc(e.example) + '</div>' : '') +
      (vs.length ? '<div class="m">变体：' + esc(vs.join('、')) + '</div>' : '') +
      '<div class="bar"><button class="mini" onclick="editItem(' + i + ')">编辑</button><button class="mini" onclick="delItem(' + i + ')">删除</button></div></div>'
  }).join('')
  return HTML
    .replace('{{T0}}', on(s.tendency,0)).replace('{{T1}}', on(s.tendency,1)).replace('{{T2}}', on(s.tendency,2))
    .replace('{{D0}}', on(s.density,0)).replace('{{D1}}', on(s.density,1)).replace('{{D2}}', on(s.density,2)).replace('{{D3}}', on(s.density,3))
    .replace('{{RISKY}}', s.allowRisky ? 'on' : '').replace('{{AUTO}}', s.autoUpdate ? 'on' : '')
    .replace('{{TT}}', s.tendency).replace('{{DD}}', s.density).replace('{{RR}}', s.allowRisky).replace('{{AA}}', s.autoUpdate)
    .replace('{{COUNT}}', (lex || []).length)
    .replace('{{LEX}}', items || '<div class="m">还没有</div>')
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  if (req.method === 'GET' && url.pathname === '/') {
    const s = { ...DEFAULT, ...readJson(CFG, {}) }
    const lex = readJson(LEX, []).map(normalizeEntry)
    const html = render(s, lex).replace('</script></body>', 'window.__LEX=' + JSON.stringify(lex).replace(/</g, '\\u003c') + ';</script></body>')
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    return res.end(html)
  }
  if (url.pathname === '/api/settings' && req.method === 'POST') {
    let body=''; for await (const c of req) body += c
    writeJson(CFG, { ...DEFAULT, ...JSON.parse(body || '{}') })
    res.writeHead(200, {'content-type':'application/json'}); return res.end('{"ok":true}')
  }
  if (url.pathname === '/api/userlex' && req.method === 'DELETE') {
    const i = Number(url.searchParams.get('id'))
    const list = readJson(LEX, []).map(normalizeEntry)
    const rm = list.splice(i, 1)
    writeJson(LEX, list)
    res.writeHead(200, {'content-type':'application/json'}); return res.end(JSON.stringify({ ok: true, removed: rm[0] && rm[0].title }))
  }
  if (url.pathname === '/api/userlex' && req.method === 'POST') {
    let body=''; for await (const c of req) body += c
    const e = JSON.parse(body || '{}')
    const list = readJson(LEX, []).map(normalizeEntry)
    const idx = list.findIndex((x) => x.title === e.title)
    const vs = Array.isArray(e.variants) ? e.variants : String(e.variants || '').split(',').map((x) => x.trim()).filter(Boolean)
    const row = { ...e, variants: vs, addedAt: new Date().toISOString(), review: e.visibility === 'public' ? 'pending' : 'private' }
    if (idx >= 0) list[idx] = row; else list.push(row)
    writeJson(LEX, list)
    res.writeHead(200, {'content-type':'application/json'}); return res.end(JSON.stringify({ ok: true, updated: idx >= 0 }))
  }
  res.writeHead(404); res.end('not found')
}).listen(PORT, '127.0.0.1', () => console.log('panel http://127.0.0.1:' + PORT))