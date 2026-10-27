// 梗插件面板：本地 HTTP 服务，360px 版式（澄怀方案）+ 见微字段
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
const DEFAULT = { tendency: 1, density: 1, allowRisky: false, autoUpdate: true }

const HTML = String.raw`<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>梗插件面板</title><style>
:root{--bg:#161B26;--card:#1E2A3C;--line:#2A3A52;--text:#E2E8F0;--sub:#94A3B8;--accent:#7C6BFF;--danger:#FF5252}
*{box-sizing:border-box}body{margin:0;background:#0B0F16;color:var(--text);font:14px/1.6 'Microsoft YaHei',system-ui}
.wrap{width:392px;margin:24px auto;padding:0 16px}
h2{font-size:15px;margin:0 0 12px;color:var(--sub);font-weight:400;letter-spacing:.04em}
.card{background:var(--card);border-radius:12px;padding:16px;margin-bottom:12px}
.seg{display:flex;background:#121826;border-radius:10px;padding:4px;gap:4px}
.seg button{flex:1;height:32px;border:0;border-radius:8px;background:transparent;color:var(--sub);font:inherit;cursor:pointer}
.seg button.on{background:var(--accent);color:#fff}
.row{display:flex;align-items:center;justify-content:space-between;height:40px;margin-top:8px}
.sw{width:36px;height:20px;border-radius:10px;background:#2A3A52;position:relative;cursor:pointer}
.sw.on{background:var(--accent)}
.sw i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.15s}
.sw.on i{left:18px}
label{display:block;color:var(--sub);font-size:12px;margin:10px 0 4px}
input,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:6px;color:var(--text);padding:6px 8px;font:inherit;height:34px}
textarea{height:64px;resize:vertical}
input:focus,textarea:focus{outline:0;border-color:var(--accent)}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{padding:4px 10px;border-radius:14px;border:1px solid var(--line);color:var(--sub);cursor:pointer;font-size:12px}
.tag.on{border-color:var(--accent);color:#fff;background:rgba(124,107,255,.18)}
details{margin-top:10px}summary{cursor:pointer;color:var(--sub);font-size:12px}
.actions{display:flex;gap:8px;margin-top:14px}
.btn{flex:1;height:36px;border-radius:8px;border:0;font:inherit;cursor:pointer}
.ghost{background:transparent;color:var(--sub);border:1px solid var(--line)}
.primary{background:var(--accent);color:#fff}
.err{color:var(--danger);font-size:12px;margin-top:4px;display:none}
.lex{margin-top:8px;max-height:120px;overflow:auto}
.lex div{font-size:12px;color:var(--sub);border-bottom:1px dashed var(--line);padding:4px 0}
</style></head><body><div class="wrap">
<h2>玩梗开关</h2><div class="card">
  <label>玩梗倾向</label><div class="seg" id="tend">
    <button data-v="0" class="{{T0}}">稳重</button><button data-v="1" class="{{T1}}">正常</button><button data-v="2" class="{{T2}}">活泛</button>
  </div>
  <label>玩梗浓度</label><div class="seg" id="dens">
    <button data-v="0" class="{{D0}}">0 关</button><button data-v="1" class="{{D1}}">1 克制</button><button data-v="2" class="{{D2}}">2 适中</button><button data-v="3" class="{{D3}}">3 放飞</button>
  </div>
  <div class="row"><span>允许「慎用」级梗</span><div class="sw {{RISKY}}" id="risky"><i></i></div></div>
  <div class="row"><span>允许自动更新词库</span><div class="sw {{AUTO}}" id="auto"><i></i></div></div>
</div>
<h2>手动加梗</h2><div class="card">
  <label>梗名 *</label><input id="title" placeholder="例：笑死">
  <label>出处 / BV / 作者 *</label><input id="source" placeholder="没出处就写：无出处常用语">
  <label>含义与场景 *（大白话：什么意思、什么时候用）</label><textarea id="meaning" placeholder="例：别人说错话、你觉得很离谱时用"></textarea>
  <label>语气倾向</label><div class="tags" id="tones">
    <span class="tag" data-v="搞笑">搞笑</span><span class="tag" data-v="嘲讽">嘲讽</span><span class="tag" data-v="自黑">自黑</span><span class="tag" data-v="赞叹">赞叹</span><span class="tag" data-v="不确定">不确定</span>
  </div>
  <details><summary>+ 补充高级规则（选填）</summary>
    <label>别用场景</label><input id="avoid" placeholder="例：严肃场合别用">
    <label>示例句</label><input id="example" placeholder="例：这也能崩，笑死">
    <label>变体（逗号分隔）</label><input id="variants" placeholder="🧊🧊🧊, 冰冰冰">
  </details>
  <div class="err" id="err"></div>
  <div class="actions"><button class="btn ghost" onclick="location.reload()">取消</button><button class="btn primary" id="save">保存到私人库</button></div>
  <label style="margin-top:12px">可见范围</label><div class="seg" id="vis"><button data-v="private" class="on">仅自己</button><button data-v="public">申请公开</button></div>
  <div class="lex">{{LEX}}</div>
</div></div>
<script>
const st={tendency:{{TT}},density:{{DD}},allowRisky:{{RR}},autoUpdate:{{AA}}};
const pick=(id,key)=>{document.querySelectorAll('#'+id+' button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.remove('on'));b.classList.add('on');st[key]=Number(b.dataset.v);persist()})};
pick('tend','tendency');pick('dens','density');
document.getElementById('risky').onclick=e=>{e.currentTarget.classList.toggle('on');st.allowRisky=e.currentTarget.classList.contains('on');persist()};
document.getElementById('auto').onclick=e=>{e.currentTarget.classList.toggle('on');st.autoUpdate=e.currentTarget.classList.contains('on');persist()};
async function persist(){await fetch('/api/settings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(st)})}
const tones=new Set();document.querySelectorAll('#tones .tag').forEach(t=>t.onclick=()=>{t.classList.toggle('on');t.classList.contains('on')?tones.add(t.dataset.v):tones.delete(t.dataset.v)});
let vis='private';document.querySelectorAll('#vis button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#vis button').forEach(x=>x.classList.remove('on'));b.classList.add('on');vis=b.dataset.v});
document.getElementById('save').onclick=async()=>{
  const title=document.getElementById('title').value.trim();
  const source=document.getElementById('source').value.trim();
  const meaning=document.getElementById('meaning').value.trim();
  const err=document.getElementById('err');
  if(!title||!source||!meaning){err.textContent='梗名、出处、含义与场景都要填';err.style.display='block';return}
  err.style.display='none';
  const body={title,source,meaning,tone:[...tones],avoid:document.getElementById('avoid').value,example:document.getElementById('example').value,variants:document.getElementById('variants').value,visibility:vis};
  const r=await fetch('/api/userlex',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  if(r.ok){location.reload()}else{err.textContent='保存失败';err.style.display='block'}
};
</script></body></html>`

function render(s, lex) {
  const on = (v, t) => (v === t ? 'on' : '')
  return HTML
    .replace('{{T0}}', on(s.tendency,0)).replace('{{T1}}', on(s.tendency,1)).replace('{{T2}}', on(s.tendency,2))
    .replace('{{D0}}', on(s.density,0)).replace('{{D1}}', on(s.density,1)).replace('{{D2}}', on(s.density,2)).replace('{{D3}}', on(s.density,3))
    .replace('{{RISKY}}', s.allowRisky ? 'on' : '').replace('{{AUTO}}', s.autoUpdate ? 'on' : '')
    .replace('{{TT}}', s.tendency).replace('{{DD}}', s.density).replace('{{RR}}', s.allowRisky).replace('{{AA}}', s.autoUpdate)
    .replace('{{LEX}}', (lex||[]).slice(-6).map(e=>'<div>'+e.title+' —— '+(e.meaning||'').slice(0,18)+'</div>').join(''))
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  if (req.method === 'GET' && url.pathname === '/') {
    const s = { ...DEFAULT, ...readJson(CFG, {}) }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    return res.end(render(s, readJson(LEX, [])))
  }
  if (url.pathname === '/api/settings' && req.method === 'POST') {
    let body=''; for await (const c of req) body += c
    writeJson(CFG, { ...DEFAULT, ...JSON.parse(body || '{}') })
    res.writeHead(200, {'content-type':'application/json'}); return res.end('{"ok":true}')
  }
  if (url.pathname === '/api/userlex' && req.method === 'POST') {
    let body=''; for await (const c of req) body += c
    const e = JSON.parse(body || '{}')
    const list = readJson(LEX, [])
    list.push({ ...e, addedAt: new Date().toISOString(), review: e.visibility === 'public' ? 'pending' : 'private' })
    writeJson(LEX, list)
    res.writeHead(200, {'content-type':'application/json'}); return res.end('{"ok":true}')
  }
  res.writeHead(404); res.end('not found')
}).listen(PORT, '127.0.0.1', () => console.log('panel http://127.0.0.1:' + PORT))