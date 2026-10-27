import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/tools/panel.mjs'
copyFileSync(P, P + '.bak')
let s = readFileSync(P, 'utf8')
if (!s.includes('id=\\"kind\\"')) {
  s = s.replace(
    "  '<label>这梗哪来的 <b>*</b></label>',"
    "  '<label>条目类型</label><div class=\\"seg\\" id=\\"kind\\"><button data-v=\\"meme\\" class=\\"on\\">网络梗</button><button data-v=\\"phrase\\">私人用语</button></div>'," +
    "  '\n  <label>这梗哪来的 <b>*</b></label>',"
  )
}
if (!s.includes('let kind=')) {
  s = s.replace("  'let vis=\"private\";", "  'let kind=\"meme\";document.querySelectorAll(\"#kind button\").forEach(b=>b.onclick=()=>{document.querySelectorAll(\"#kind button\").forEach(x=>x.classList.remove(\"on\"));b.classList.add(\"on\");kind=b.dataset.v});',\n  'let vis=\"private\";")
}
s = s.replace("const body={title,meaning,", "const body={kind,title,meaning,")
s = s.replace("'<div class=\"t\">' + esc(e.title) + badge", "'<div class=\"t\">' + esc(e.title) + (e.kind === 'phrase' ? '<span class=\"badge priv\">私人用语</span>' : '') + badge")
writeFileSync(P, s)
console.log('kind in panel', s.includes('let kind='), s.includes('id=\"kind\"'))