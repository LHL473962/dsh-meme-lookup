const API='https://cnmeme.wiki/api/v1/public'
async function q(url){ const r=await fetch(url,{headers:{accept:'application/json'}}); return r.json() }
// 1) 无参数列表是否可用
for (const u of ['/memes?limit=5','/memes?limit=5&offset=1000','/memes?tag=%E5%BD%A2%E5%BC%8F%E6%A2%97&limit=5']) {
  try { const d = await q(API+u); console.log(u, '→ items', (d.items||[]).length, '| has_more', d.has_more ?? '-', '| sample', (d.items||[])[0]?.title) } catch(e){ console.log(u,'ERR',e.message) }
}
