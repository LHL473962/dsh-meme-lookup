const API='https://cnmeme.wiki/api/v1/public'
async function s(q){const r=await fetch(API+'/memes?q='+encodeURIComponent(q)+'&limit=3',{headers:{accept:'application/json'}});return (await r.json()).items||[]}
for (const q of ['破防了','我真的会谢','yyds','大肥鱼','遥遥领先','鼠鼠我啊','某张来源不明的截图梗']) {
  const items = await s(q)
  console.log(q, '->', items.map(i=>i.title).join(' | ') || 'none')
}
